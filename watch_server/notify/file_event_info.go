package notify

import (
	"fmt"
	"os"
	p "path"
	"strings"
)

type FileEventInfo struct {
	Type       string     `json:"type"`
	Name       string     `json:"name"` // Config.Name
	*pathInfo             // json key [path, size]
	RemovePath string     `json:"remove_path"` // for RemovePath / Move / Delete Event
	FilesInfo  *filesInfo `json:"files"`
	// exclude response
	flag     int    `json:"-"` // event flag
	key      string `json:"-"`
	fileName string `json:"-"` // fileName of path
}

type FileEventInfos []FileEventInfo

const (
	// Type
	New           = "New"
	Rename        = "Rename"
	AppendPath    = "AppendPath"
	RemovePath    = "RemovePath"
	Move          = "Move"
	Delete        = "Delete"
	Write         = "Write"
	WriteComplete = "WriteComplete"
	// flag
	createFlag = 0x1
	removeFlag = 0x2
	renameFlag = 0x4
	writeFlag  = 0x8
	moveFlag   = createFlag + removeFlag
)

var (
	watchCh = make(chan FileEventInfo, 1)
)

func (fei FileEventInfo) String() string {
	result := fmt.Sprintf("Type:%s, Name:%s", fei.Type, fei.Name)

	if fei.pathInfo != nil {
		result += ", " + fei.pathInfo.String()
	}
	if fei.RemovePath != "" {
		result += ", RemovePath:" + fei.RemovePath
	}
	if fei.FilesInfo != nil {
		result += ", " + fei.FilesInfo.String()
	}

	result += fmt.Sprintf(", flag:%d, key:%s, fileName:%s", fei.flag, fei.key, fei.fileName)

	return result
}

func (fei *FileEventInfo) setType() {
	switch true {
	case (fei.flag&moveFlag == moveFlag):
		fei.Type = Move
	case (fei.flag&createFlag == createFlag):
		if fei.FilesInfo == nil {
			fei.Type = New
		} else {
			fei.Type = AppendPath
		}
	case (fei.flag&removeFlag == removeFlag):
		if fei.FilesInfo != nil && len(fei.FilesInfo.Paths) > 0 {
			fei.Type = RemovePath
		} else {
			fei.Type = Delete
		}
	case (fei.flag&renameFlag == renameFlag):
		fei.Type = Rename
	case (fei.flag&writeFlag == writeFlag):
		fei.Type = Write
	}
}

func (feis *FileEventInfos) insert(eventFlag int, key, path, name string) {
	// for windows
	fileName := p.Base(strings.Replace(path, "\\", "/", -1))
	pi := &pathInfo{
		Path: path,
		Size: 0,
	}
	fei := FileEventInfo{
		Name:     name,
		pathInfo: pi,
		flag:     eventFlag,
		key:      key,
		fileName: fileName,
	}

	// merge events.
	for i, rFei := range *feis {
		if fileName != rFei.fileName {
			continue
		}

		// when same fileName
		switch eventFlag {
		case createFlag, writeFlag:
			// already registed.
			if path == rFei.pathInfo.Path {
				// register on write event
				rFei.flag |= createFlag | eventFlag
				(*feis)[i] = rFei

				return
			}

			// append path on remove event
			if rFei.flag&removeFlag == removeFlag {
				rFei.flag |= createFlag | eventFlag
				rFei.pathInfo.Path = path
				(*feis)[i] = rFei

				return
			}
		case removeFlag:
			// already registed.
			if path == rFei.RemovePath {
				rFei.flag |= removeFlag
				(*feis)[i] = rFei
				return
			}

			// append path on create/write event
			if rFei.flag&createFlag == createFlag || rFei.flag&writeFlag == writeFlag {
				rFei.flag |= removeFlag
				rFei.RemovePath = path
				(*feis)[i] = rFei

				return
			}
		}
	}

	switch eventFlag {
	case removeFlag:
		fei.RemovePath = path
		fei.pathInfo.Path = ""
	}

	*feis = append(*feis, fei)
}

func (feis *FileEventInfos) add(fei FileEventInfo) {
	for _, rFei := range *feis {
		if fei.pathInfo.Path == rFei.pathInfo.Path {
			return
		}
	}

	*feis = append(*feis, fei)
}

func (feis *FileEventInfos) remove(path string) {
	rFeis := &FileEventInfos{}

	for _, fei := range *feis {
		if path == fei.pathInfo.Path {
			continue
		}

		*rFeis = append(*rFeis, fei)
	}

	feis = rFeis
}

func fileExist(path string) bool {
	if _, err := os.Stat(path); err == nil {
		return true
	} else {
		return false
	}
}

func GetWatchCh() <-chan FileEventInfo {
	return watchCh
}
