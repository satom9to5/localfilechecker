package notify

import (
	"errors"
	"fmt"
	"github.com/rjeczalik/notify"
	"log"
	"os"
	"path/filepath"
	"regexp"
)

type directoryInfo struct {
	Config
	Regexp      *regexp.Regexp
	FileInfoMap fileInfoMap
}

func NewDirectoryInfo(c Config) directoryInfo {
	di := directoryInfo{
		Config:      c,
		FileInfoMap: fileInfoMap{},
	}

	di.Regexp = di.Config.compilePattern()
	di.walk() // regist fileInfo on directory

	// start watching
	go func() {
		di.watch()
	}()

	return di
}

func (di directoryInfo) get(key string) *fileInfo {
	if fi, ok := di.FileInfoMap[key]; ok {
		return &fi
	} else {
		return nil
	}
}

func (di directoryInfo) getMulti(keys []string) fileInfoMap {
	fmi := fileInfoMap{}

	for _, key := range keys {
		if fi := di.get(key); fi != nil {
			fmi[key] = *fi
		}
	}

	return fmi
}

func (di directoryInfo) getAll() fileInfoMap {
	return di.FileInfoMap
}

// directory files append to FileInfoMap
func (di directoryInfo) walk() {
	if di.Regexp == nil {
		return
	}

	filepath.Walk(di.Config.Directory, func(path string, info os.FileInfo, err error) error {
		// exclusion directory
		if info.IsDir() {
			return nil
		}

		// append
		di.addPath(path)

		return nil
	})
}

// watch directory
func (di directoryInfo) watch() {
	ch := make(chan notify.EventInfo, 1)
	done := make(chan bool)

	// suffix[...] is resursive check
	if err := notify.Watch(di.Config.Directory+"/...", ch, notify.All); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	defer notify.Stop(ch)

	// event listener
	for {
		select {
		case ei := <-ch:
			di.update(ei)
		case <-done:
			fmt.Println("done")
		}
	}
}

func (di directoryInfo) add(key, path string) *fileInfo {
	return di.FileInfoMap.add(key, path)
}

func (di directoryInfo) addPath(path string) (*fileInfo, error) {
	key, err := di.getPathKey(path)
	if err != nil {
		return nil, err
	}

	return di.add(key, path), nil
}

func (di directoryInfo) remove(key, path string) error {
	fi := di.FileInfoMap.get(key)
	if fi == nil {
		return errors.New(fmt.Sprintf("key:%s not found.", key))
	}

	di.FileInfoMap.remove(key, path)

	return nil
}

// extract file key by file path
func (di directoryInfo) getPathKey(path string) (string, error) {
	if di.Regexp == nil {
		return "", errors.New("Regexp is not set.")
	}

	matches := di.Regexp.FindStringSubmatch(path)
	if matches != nil {
		return matches[di.Config.MatchNum], nil
	} else {
		return "", errors.New("key not found.")
	}
}

func (di directoryInfo) update(ei notify.EventInfo) error {
	// dispatch Create/Write/Remove notiry.EventInfo Event on file moving. (order is random.)
	path := ei.Path()
	key, err := di.getPathKey(path)
	if err != nil {
		return err
	}

	eventType := ""

	switch ei.Event() {
	case notify.Create:
		di.add(key, path)
		eventType = "create"
	case notify.Write:
		di.add(key, path)
		eventType = "write"
	case notify.Rename:
		di.add(key, path)
		eventType = "rename"
	case notify.Remove:
		di.remove(key, path)
		eventType = "remove"
	}

	log.Printf("%s: %s\n", eventType, path)

	return nil
}
