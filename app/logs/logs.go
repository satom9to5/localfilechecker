package logs

import (
	"log"
	"os"
	"path/filepath"
)

var (
	// for debug
	logpath = "../log/debug.log"
	logger  = &log.Logger{}
)

func SetLog() {
	os.MkdirAll(filepath.Dir(logpath), os.FileMode(0755))
	logfile, _ := os.OpenFile(logpath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	logger = log.New(logfile, "", log.LstdFlags|log.Llongfile)
}

func GetLogger() *log.Logger {
	return logger
}
