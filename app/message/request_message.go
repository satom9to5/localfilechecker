package message

import (
	pf "../../pidfile"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
)

const (
	ServerStart = "start"
	ServerStop  = "stop"
)

var (
	pidfile, _ = filepath.Abs("../pid/watch_server.pid")
)

type RequestMessage struct {
	Type string `json:"type"`
	Port int    `json:"port"`
}

func (rm RequestMessage) String() string {
	return fmt.Sprintf("Type:%s, Port:%d", rm.Type, rm.Port)
}

func (rm *RequestMessage) Run() error {
	pf.SetPath(pidfile)

	switch rm.Type {
	case ServerStart:
		return rm.serverStart()
	case ServerStop:
		return rm.serverStop()
	}

	return nil
}

func (rm *RequestMessage) serverStart() error {
	var err error
	if rm.Port == 0 {
		return errors.New("Port is undefined.")
	}

	if rm.Port < 1024 || rm.Port > 65535 {
		return errors.New("cannot use well-known port.")
	}

	// Command Line Parameter
	command := ""
	params := []string{}

	switch os.Getenv("ENVIRONMENT") {
	default:
		command = "go"
		params = []string{"run", "../watch_server/main.go"}
	}

	// server runnning check
	if proc, err := GetProcess(); err == nil {
		return fmt.Errorf("Server is Running. pid:%d", proc.Pid)
	}

	params = append(params, "-p", strconv.Itoa(rm.Port))
	params = append(params, "-pidfile", pidfile)

	// Server Start
	cmd := exec.Command(command, params...)

	if err = cmd.Start(); err != nil {
		return err
	}

	return nil
}

func (rm *RequestMessage) serverStop() error {
	proc, err := GetProcess()
	if err != nil {
		return err
	}

	return proc.Signal(os.Interrupt)
}

func GetProcess() (*os.Process, error) {
	pid, err := pf.Read()
	if err != nil {
		return nil, err
	}

	return os.FindProcess(pid)
}
