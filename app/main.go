package main

import (
	"./message"
	nm "./native_message"
	"flag"
	"log"
	"os"
	"path/filepath"
)

var (
	// for debug
	logpath = "../log/debug.log"
	logger  = &log.Logger{}
)

func main() {
	req := &message.RequestMessage{}
	res := &message.ResponseMessage{
		Type:    "none",
		Success: false,
	}

	var err error

	flag.Parse()
	setLog()

	for {
		if err = nm.Receive(req, os.Stdin); err != nil {
			logger.Println(err)
			res.Message = err.Error()
			break
		}

		res.Type = req.Type

		err = req.Run()
		if err != nil {
			logger.Println(err)
			res.Message = err.Error()
			break
		}

		res.Success = true
		break
	}

	if err = nm.Send(res, os.Stdout); err != nil {
		logger.Println(err)
	}
}

func setLog() {
	os.MkdirAll(filepath.Dir(logpath), os.FileMode(0755))
	logfile, _ := os.OpenFile(logpath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	logger = log.New(logfile, "", log.LstdFlags|log.Llongfile)
}
