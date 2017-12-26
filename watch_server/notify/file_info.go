package notify

import (
	"time"
)

type fileInfo interface {
	Path() string
	Size() int64
	ModTime() time.Time
}
