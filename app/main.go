package main

import (
	"flag"
	"os"
	"path/filepath"
	"regexp"
	// in project
	"app/logs"
	"app/message"
	nm "app/native_message"
)

func main() {
	req := message.NewRequestMessage()
	res := message.NewResponseMessage()

	var err error

	flag.Parse()

	// check go run command or compiled binary
	argsPath, _ := filepath.Abs(os.Args[0])
	re := regexp.MustCompile("go-build")
	isBinary := argsPath != "" && argsPath != "." && !re.MatchString(argsPath)

	// update setting for binary.
	if isBinary {
		argsDir := filepath.Dir(os.Args[0])
		logs.SetLogdir(argsDir + "/../../log")
		message.SetLogdir(argsDir + "/../../log")
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

		logger.Println("RequestMessage: " + req.String())

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

	if res.Success {
		logger.Println("Success!")
	} else {
		logger.Println(res.Message)
	}

	if err = nm.Send(res, os.Stdout); err != nil {
		logger.Println(err)
	}
}
