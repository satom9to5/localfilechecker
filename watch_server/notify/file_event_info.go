package notify

import (
	"fmt"
	"time"
)

type FileEventInfo struct {
	Type       string     `json:"type"`
	Name       string     `json:"name"` // Config.Name
	Path       string     `json:"path"`
	Size       int64      `json:"size"`
	ModTime    time.Time  `json:"mod_time"`
	RemovePath string     `json:"remove_path"` // for RemovePath / Move / Delete Event
	PathsInfo  *pathsInfo `json:"paths"`
}

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
)

var (
	watchCh = make(chan FileEventInfo, 1)
)

func (fei FileEventInfo) String() string {
	result := fmt.Sprintf("Type: %s, Name: %s, Path: %s, Size: %d, ModTime: %s", fei.Type, fei.Name, fei.Path, fei.Size, fei.ModTime.String())

	if fei.RemovePath != "" {
		result += ", RemovePath: " + fei.RemovePath
	}
	if fei.PathsInfo != nil {
		result += ", PathsInfo: [" + fei.PathsInfo.String() + "]"
	}

	return result
}

func (fei *FileEventInfo) setPathInfo(pi *pathInfo) {
	fei.Path = pi.Path
	fei.Size = pi.Size
	fei.ModTime = pi.ModTime
}

func GetWatchCh() <-chan FileEventInfo {
	return watchCh
}
