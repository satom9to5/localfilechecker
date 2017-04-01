package main

import (
	"./logs"
	"./message"
	nm "./native_message"
	"flag"
	"os"
)

func main() {
	req := &message.RequestMessage{}
	res := &message.ResponseMessage{
		Type:    "none",
		Success: false,
	}

	var err error

	flag.Parse()
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
