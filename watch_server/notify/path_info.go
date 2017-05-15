package notify

import (
	"fmt"
	"os"
)

type pathInfo struct {
	Path string `json:"path"`
	Size int64  `json:"size"`
}

func (pi pathInfo) String() string {
	return fmt.Sprintf("Path:%s, Size:%d", pi.Path, pi.Size)
}

func (pi *pathInfo) updateSize() {
	pi.Size = getSize(pi.Path)
}

func getSize(path string) int64 {
	if fi, err := os.Stat(path); err == nil {
		return fi.Size()
	} else {
		return 0
	}
}
