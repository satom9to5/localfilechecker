package logs

import (
	"log"
	"os"
)

var (
	// for debug
	logdir      = "../log"
	logfilename = "debug.log"
	logger      = &log.Logger{}
)

func SetLog() {
	logpath := logdir + "/" + logfilename
	os.MkdirAll(logdir, os.FileMode(0755))
	logfile, _ := os.OpenFile(logpath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	logger = log.New(logfile, "", log.LstdFlags|log.Llongfile)
}

func GetLogger() *log.Logger {
	return logger
}

func SetLogdir(dir string) {
	logdir = dir
}
