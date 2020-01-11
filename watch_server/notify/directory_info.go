package notify

import (
	"errors"
	"fmt"
	"log"
	"regexp"
	"sync"
	"time"
	// outer
	"github.com/satom9to5/dirnotify"
	"github.com/satom9to5/fileinfo"
	// in project
	"watch_server/config"
)

type directoryInfo struct {
	Config config.Config
	regexp *regexp.Regexp
	psiMap pathsInfoMap
	root   *dirnotify.Root // dirnotify root
	// ticker
	removeTicker *time.Ticker
	// Mutex
	mu sync.Mutex
}

func NewDirectoryInfo(c config.Config) *directoryInfo {
	dirnotify.EnableDebug()
	root, err := dirnotify.CreateNodeTree(c.Directory)
	if err != nil {
		log.Println(err)
		return nil
	}

	di := &directoryInfo{
		Config: c,
		psiMap: pathsInfoMap{},
		root:   root,
	}

	di.regexp = di.Config.CompilePattern()
	di.walk() // regist pathsInfo on directory

	// start watching
	go func() {
		di.watch()
	}()

	return di
}

func (di *directoryInfo) get(key string) *pathsInfo {
	if psi, ok := di.psiMap[key]; ok {
		return psi
	} else {
		return nil
	}
}

func (di *directoryInfo) getMulti(keys []string) pathsInfoMap {
	psim := pathsInfoMap{}

	for _, key := range keys {
		if psi := di.get(key); psi != nil {
			psim[key] = psi
		}
	}

	return psim
}

func (di *directoryInfo) getAll() pathsInfoMap {
	return di.psiMap
}

// directory files append to psiMap
func (di *directoryInfo) walk() {
	if di.regexp == nil {
		return
	}

	di.mu.Lock()
	defer di.mu.Unlock()

	di.root.Walk(func(fi fileinfo.FileInfo) error {
		if fi.IsDir() {
			return nil
		}

		// append
		if _, _, err := di.addPath(fi); err != nil {
			log.Println(err)
		}

		return nil
	})
}

// watch directory (running in goroutine)
func (di *directoryInfo) watch() {
	di.root.Watch()

	di.removeTicker = time.NewTicker(2 * time.Second)

	defer func() {
		di.root.Close()
	}()

	// event listener
	for {
		select {
		case e := <-di.root.Ch:
			// file event
			di.updatePsiMap(e)
		case <-di.removeTicker.C:
		}
	}
}

func (di *directoryInfo) add(key string, fi fileInfo) (*pathInfo, *pathsInfo) {
	return di.psiMap.add(key, fi)
}

func (di *directoryInfo) addPath(fi fileInfo) (*pathInfo, *pathsInfo, error) {
	key, err := di.getPathKey(fi.Path())
	if err != nil {
		return nil, nil, err
	}

	pi, psi := di.add(key, fi)
	return pi, psi, nil
}

func (di *directoryInfo) remove(key, path string) (*pathInfo, *pathsInfo, error) {
	psi := di.psiMap.get(key)
	if psi == nil {
		return nil, nil, errors.New(fmt.Sprintf("key: %s not found.", key))
	}

	pi, psi := di.psiMap.remove(key, path)
	return pi, psi, nil
}

func (di *directoryInfo) rename(key string, fi fileInfo, beforePath string) (*pathInfo, *pathsInfo, error) {
	if beforePath == "" {
		return nil, nil, errors.New("beforePath is empty.")
	}

	psi := di.psiMap.get(key)
	if psi == nil {
		return nil, nil, errors.New(fmt.Sprintf("key: %s not found.", key))
	}

	pi, psi := di.psiMap.rename(key, fi, beforePath)
	return pi, psi, nil
}

// extract file key by file path
func (di *directoryInfo) getPathKey(path string) (string, error) {
	if di.regexp == nil {
		return "", errors.New("regexp is not set.")
	}

	matches := di.regexp.FindStringSubmatch(path)
	if matches != nil {
		return matches[di.Config.MatchNum], nil
	} else {
		return "", errors.New(fmt.Sprintf("key not found. path: %s", path))
	}
}

func (di *directoryInfo) getPathInfo(key, path string) (*pathInfo, *pathsInfo) {
	return di.psiMap.getPathInfo(key, path)
}

func (di *directoryInfo) updatePsiMap(e dirnotify.Event) error {
	var err error
	key, err := di.getPathKey(e.Path())
	if err != nil {
		return err
	}

	var fei FileEventInfo
	var pi *pathInfo

	fei = FileEventInfo{
		Name: di.Config.Name,
	}

	di.mu.Lock()
	defer di.mu.Unlock()

	switch true {
	case e.Op()&dirnotify.Create == dirnotify.Create:
		pi, fei.PathsInfo = di.add(key, e)

		fei.setPathInfo(pi)

		if len(fei.PathsInfo.Paths) == 1 {
			fei.Type = New
		} else {
			fei.Type = AppendPath
		}
	case e.Op()&dirnotify.Remove == dirnotify.Remove:
		pi, fei.PathsInfo, err = di.remove(key, e.Path())
		if err != nil {
			return err
		}

		fei.RemovePath = e.Path()

		if fei.PathsInfo == nil {
			fei.Type = Delete
		} else {
			fei.Type = RemovePath
		}
	case e.Op()&dirnotify.Rename == dirnotify.Rename:
		pi, fei.PathsInfo, err = di.rename(key, e, e.BeforePath())
		if err != nil {
			return err
		}

		fei.RemovePath = e.BeforePath()
		fei.Type = Rename
	case e.Op()&dirnotify.Write == dirnotify.Write:
		return nil
	case e.Op()&dirnotify.Chmod == dirnotify.Chmod:
		return nil
	case e.Op()&dirnotify.Move == dirnotify.Move:
		pi, fei.PathsInfo, err = di.rename(key, e, e.BeforePath())
		if err != nil {
			return err
		}

		fei.setPathInfo(pi)

		fei.Type = Move
		fei.RemovePath = e.BeforePath()
	case e.Op()&dirnotify.WriteComplete == dirnotify.WriteComplete:
		pi, fei.PathsInfo = di.getPathInfo(key, e.Path())
		if pi == nil || fei.PathsInfo == nil {
			return nil
		}

		pi.update(e)
		fei.setPathInfo(pi)

		fei.Type = WriteComplete
	}

	// send channel
	watchCh <- fei

	return nil
}
