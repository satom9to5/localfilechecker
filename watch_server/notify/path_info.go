package notify

import (
	"fmt"
	"time"
)

type pathInfo struct {
	Path    string    `json:"path"`
	Size    int64     `json:"size"`
	ModTime time.Time `json:"mod_time"`
}

func NewPathInfo(fi fileInfo) *pathInfo {
	return &pathInfo{
		Path:    fi.Path(),
		Size:    fi.Size(),
		ModTime: fi.ModTime(),
	}
}

func (pi pathInfo) String() string {
	return fmt.Sprintf("Path:%s, Size:%d, ModTime:%s", pi.Path, pi.Size, pi.ModTime.String())
}

func (pi *pathInfo) update(fi fileInfo) {
	pi.Path = fi.Path()
	pi.Size = fi.Size()
	pi.ModTime = fi.ModTime()
}
