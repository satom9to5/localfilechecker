package main

import (
	"./logs"
	"./message"
	nm "./native_message"
	"flag"
	"os"
	"path"
	"path/filepath"
)

func main() {
	req := message.NewRequestMessage()
	res := message.NewResponseMessage()

	var err error

	flag.Parse()

	// check go run command or compiled binary
	curDir, _ := filepath.Abs(".")
	isBinary := curDir == path.Dir(os.Args[0])

	// update setting for binary.
	if isBinary {
		logs.SetLogdir("../../log")
		message.SetLogdir("../../log")
		message.SetIsBinary(isBinary)
	}

	logs.SetLog()
	logger := logs.GetLogger()

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
