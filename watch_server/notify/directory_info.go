package notify

import (
	"../config"
	"../flag"
	"errors"
	"fmt"
	"github.com/rjeczalik/notify"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sync"
	"time"
)

type directoryInfo struct {
	Config     config.Config
	regexp     *regexp.Regexp
	fiMap      filesInfoMap
	feQueue    FileEventInfos // from notify Event.
	writeQueue FileEventInfos // update file size check.
	// notify channel
	watchCh chan notify.EventInfo
	// ticker channel
	ticker     *time.Ticker
	walkTicker *time.Ticker
	// Mutex
	fimMu sync.Mutex
	feqMu sync.Mutex
	wqMu  sync.Mutex
	// WaitGroup
	fimWg sync.WaitGroup
}

func NewDirectoryInfo(c config.Config) *directoryInfo {
	di := &directoryInfo{
		Config:     c,
		fiMap:      filesInfoMap{},
		feQueue:    FileEventInfos{},
		writeQueue: FileEventInfos{},
		watchCh:    make(chan notify.EventInfo, 1),
		fimWg:      sync.WaitGroup{},
	}

	di.regexp = di.Config.CompilePattern()
	di.walk() // regist filesInfo on directory

	// start watching
	go func() {
		di.watch()
	}()

	return di
}

func (di *directoryInfo) get(key string) *filesInfo {
	if fi, ok := di.fiMap[key]; ok {
		return fi
	} else {
		return nil
	}
}

func (di *directoryInfo) getMulti(keys []string) filesInfoMap {
	fmi := filesInfoMap{}

	for _, key := range keys {
		if fi := di.get(key); fi != nil {
			fmi[key] = fi
		}
	}

	return fmi
}

func (di *directoryInfo) getAll() filesInfoMap {
	return di.fiMap
}

// directory files append to fiMap
func (di *directoryInfo) walk() {
	if di.regexp == nil {
		return
	}

	filepath.Walk(di.Config.Directory, func(path string, fi os.FileInfo, err error) error {
		// exclusion directory
		if fi.IsDir() {
			return nil
		}

		// append
		if _, pi, _ := di.addPath(path); pi != nil {
			pi.Size = fi.Size() // get file size.
		}

		return nil
	})
}

// watch directory (running in goroutine)
func (di *directoryInfo) watch() {
	// suffix[...] is resursive check
	if err := notify.Watch(di.Config.Directory+"/...", di.watchCh, notify.All); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	// create ticker
	di.ticker = time.NewTicker(1 * time.Second)
	di.walkTicker = time.NewTicker(300 * time.Second)

	defer func() {
		notify.Stop(di.watchCh)
		di.ticker.Stop()
	}()

	// event listener
	for {
		select {
		// file event
		case ei := <-di.watchCh:
			di.insertQueue(ei)
		// check queue & write complete
		case <-di.ticker.C:
			di.setFilesInfo()
			di.updateSize()
		// folder recheck
		case <-di.walkTicker.C:
			di.walk()
		}
	}
}

func (di *directoryInfo) add(key, path string) (*filesInfo, *pathInfo) {
	di.fimMu.Lock()
	defer di.fimMu.Unlock()

	return di.fiMap.add(key, path)
}

func (di *directoryInfo) addPath(path string) (*filesInfo, *pathInfo, error) {
	key, err := di.getPathKey(path)
	if err != nil {
		return nil, nil, err
	}

	fi, pi := di.add(key, path)
	return fi, pi, nil
}

func (di *directoryInfo) remove(key, path string) (*pathInfo, error) {
	fi := di.fiMap.get(key)
	if fi == nil {
		return nil, errors.New(fmt.Sprintf("key:%s not found.", key))
	}

	di.fimMu.Lock()
	defer di.fimMu.Unlock()

	pi := di.fiMap.remove(key, path)
	return pi, nil
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
		return "", errors.New("key not found.")
	}
}

func (di *directoryInfo) getPathInfo(key, path string) (*filesInfo, *pathInfo) {
	return di.fiMap.getPathInfo(key, path)
}

func (di *directoryInfo) updatePath(key string) []string {
	di.fimMu.Lock()
	defer di.fimMu.Unlock()

	return di.fiMap.updatePath(key)
}

/**
* Type Pattern
* New:        (none)          -> Create
* Rename:     len(Paths)      -> Rename
* AppendPath: len(Paths) > 0  -> Create
* RemovePath: len(Paths> > 0  -> Remove
* Delete:     len(Paths) == 1 -> Remove
*
* Move is create & remove (not ordered).
 */
func (di *directoryInfo) insertQueue(ei notify.EventInfo) {
	// dispatch Create/Write/Remove notiry.EventInfo Event on file moving. (order is random.)
	path := ei.Path()
	key, err := di.getPathKey(path)
	if err != nil {
		log.Println(err.Error() + " path:" + path)
		return
	}

	eventFlag := 0
	switch ei.Event() {
	case notify.Create:
		eventFlag = createFlag
	case notify.Rename:
		eventFlag = renameFlag
	case notify.Remove:
		eventFlag = removeFlag
	case notify.Write:
		eventFlag = writeFlag
	default:
		return
	}

	di.fimWg.Add(1)

	di.feqMu.Lock()

	if flag.Debug() {
		log.Printf("flag:%d, path:%s\n", eventFlag, path)
	}

	di.feQueue.insert(eventFlag, key, path, di.Config.Name)

	// for add quque
	di.feqMu.Unlock()

	go func() {
		// wait other event.
		time.Sleep(time.Second)
		di.fimWg.Done()
	}()
}

func (di *directoryInfo) setFilesInfo() {
	if len(di.feQueue) == 0 {
		return
	}

	// wait queue add
	di.fimWg.Wait()

	di.feqMu.Lock()
	di.wqMu.Lock()
	defer di.feqMu.Unlock()
	defer di.wqMu.Unlock()

	var err error

	// update filesInfo.
	for _, fei := range di.feQueue {
		fei.FilesInfo = di.get(fei.key)

		// file exist check
		if fei.pathInfo.Path != "" {
			if fileExist(fei.pathInfo.Path) {
				// unset removeFlag
				if fei.pathInfo.Path == fei.RemovePath {
					fei.flag &= ^removeFlag
					fei.RemovePath = ""
				}

				// rescue craete event
				if fei.RemovePath != "" && fei.flag&createFlag != createFlag {
					fei.flag |= createFlag
				}
			} else {
				// change removeFlag
				fei.flag = removeFlag
				fei.RemovePath = fei.pathInfo.Path
				fei.pathInfo.Path = ""
			}
		}

		fei.setType()

		if flag.Debug() {
			log.Println("[queue] " + fei.String())
		}

		// immediately send or wait write complete.
		switch true {
		// immediately send patterns.
		case (fei.Type == New), (fei.Type == AppendPath):
			fei.FilesInfo, fei.pathInfo = di.add(fei.key, fei.pathInfo.Path)
			fei.RemovePath = ""

			if fei.FilesInfo != nil {
				di.writeQueue.add(fei)
			}
		case (fei.Type == Delete), (fei.Type == RemovePath):
			if _, err = di.remove(fei.key, fei.RemovePath); err != nil {
				continue
			}

			di.writeQueue.remove(fei.pathInfo.Path)

			// update Type
			fei.setType()
		// wait write complete patterns.
		case (fei.Type == Move):
			if fei.pathInfo.Path == fei.RemovePath {
				fei.RemovePath = ""
			} else {
				di.remove(fei.key, fei.RemovePath)
			}

			fei.FilesInfo, fei.pathInfo = di.add(fei.key, fei.pathInfo.Path)
			// wait write file.
			di.writeQueue.add(fei)

			continue
		case (fei.Type == Write):
			// Update size.
			fei.FilesInfo, fei.pathInfo = di.add(fei.key, fei.pathInfo.Path)
			fei.RemovePath = ""
			di.writeQueue.add(fei)

			continue
		// ignore patterns.
		case (fei.Type == Rename):
			log.Println("[rename] " + fei.String())
			// loop next.
			continue
		default:
			continue
		}

		// update path array
		di.updatePath(fei.FilesInfo.Key)

		// send channel.
		watchCh <- fei
	}

	// clear queue.
	di.feQueue = FileEventInfos{}
}

func (di *directoryInfo) updateSize() {
	if len(di.writeQueue) == 0 {
		return
	}

	di.wqMu.Lock()
	defer di.wqMu.Unlock()

	writeQueue := FileEventInfos{}
	sendFeis := FileEventInfos{}

	for _, fei := range di.writeQueue {
		preSize := fei.pathInfo.Size

		fei.pathInfo.updateSize()

		if preSize > 0 && preSize == fei.pathInfo.Size {
			if fei.Type != Move {
				fei.Type = WriteComplete
			}

			sendFeis = append(sendFeis, fei)
		} else {
			writeQueue = append(writeQueue, fei)
		}
	}

	// wait file remove
	time.Sleep(time.Second)

	// send channel
	for _, fei := range sendFeis {
		// update path array
		removePaths := di.updatePath(fei.FilesInfo.Key)

		watchCh <- fei
		// check noexist paths
		if len(removePaths) > 0 {
			feiType := RemovePath

			if len(fei.FilesInfo.Paths) == 0 {
				feiType = Delete
			}

			for _, path := range removePaths {
				rFei := FileEventInfo{
					Type:       feiType,
					Name:       di.Config.Name,
					pathInfo:   &pathInfo{},
					RemovePath: path,
					FilesInfo:  fei.FilesInfo,
				}

				watchCh <- rFei
			}
		}
	}

	// update writeQueue
	di.writeQueue = writeQueue
}
