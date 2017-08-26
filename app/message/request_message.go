package message

import (
	pf "../../pidfile"
	"../../watch_server/config"
	"../exec"
	"../logs"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
)

const (
	ServerStart = "start"
	ServerStop  = "stop"
	Running     = "running"

	defaultPort = 4000
)

var (
	logdir      = "../log"
	logfilename = "watch_server.log"
	pidfile, _  = filepath.Abs("../pid/watch_server.pid")
	isBinary    = false
	errorCheck  = flag.Bool("error_check", false, "error check mode")
)

type RequestMessage struct {
	Type     string          `json:"type"`
	Port     int             `json:"port"`
	Log      string          `json:"log"`
	Pidfile  string          `json:"pidfile"`
	Platform string          `json:"platform"`
	Configs  []config.Config `json:"configs"`
}

func NewRequestMessage() *RequestMessage {
	return &RequestMessage{
		Port: defaultPort,
	}
}

func (rm RequestMessage) String() string {
	return fmt.Sprintf("Type:%s, Port:%d, Configs:%s", rm.Type, rm.Port, rm.Configs)
}

func (rm *RequestMessage) Run() error {
	if rm.Pidfile != "" {
		pf.SetPath(rm.Pidfile)
	} else {
		pf.SetPath(pidfile)
	}

	switch rm.Type {
	case ServerStart:
		return rm.serverStart()
	case ServerStop:
		return rm.serverStop()
	case Running:
		return rm.running()
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

	// server runnning check
	if proc, err := GetProcess(); err == nil {
		return fmt.Errorf("Server is Running. pid:%d", proc.Pid)
	}

	// Command Line Parameter
	command := ""
	params := []string{}

	curDir, err := os.Getwd()
	if err != nil {
		return err
	}

	sep := string(os.PathSeparator)

	if isBinary {
		command = strings.Join([]string{curDir, "..", "..", "watch_server", "bin", filepath.Base(os.Args[0])}, sep)
	} else {
		command = "go"
		params = append(
			params,
			"run",
			strings.Join([]string{curDir, "..", "watch_server", "main.go"}, sep),
			"-debug",
		)
	}

	params = append(params, "-port", strconv.Itoa(rm.Port))

	if rm.Pidfile != "" {
		params = append(params, "-pidfile", rm.Pidfile)
	} else {
		params = append(params, "-pidfile", pidfile)
	}

	var logpath string
	if rm.Log != "" {
		logpath, err = filepath.Abs(rm.Log)
	} else {
		logpath, err = filepath.Abs(logdir + "/" + logfilename)
	}

	if err != nil {
		return err
	}

	params = append(params, "-log", logpath)

	if len(rm.Configs) > 0 {
		configsJson, err := json.Marshal(rm.Configs)
		if err != nil {
			return err
		}

		logs.GetLogger().Println(string(configsJson))
		params = append(params, "-conf", string(configsJson))
	}

	logs.GetLogger().Println(command, params)

	var stderr io.ReadCloser

	// Server Start
	exec.SetPlatform(rm.Platform)
	cmd := exec.Command(command, params...)
	if *errorCheck {
		stderr, _ = cmd.Command().StderrPipe()
	}
	if err = cmd.Start(); err != nil {
		return err
	}

	// Error Check
	if *errorCheck && stderr != nil {
		errBytes, err := ioutil.ReadAll(stderr)
		if err != nil {
			return err
		}
		if errBytes != nil {
			return errors.New(string(errBytes))
		}
	}

	return nil
}

func (rm *RequestMessage) serverStop() error {
	proc, err := GetProcess()
	if err != nil {
		return err
	}

	switch runtime.GOOS {
	case "windows":
		// because cannot use Signal, remove pidfile here.
		pf.Remove()
		return proc.Kill()
	default:
		return proc.Signal(os.Interrupt)
	}
}

func (rm *RequestMessage) running() error {
	// server runnning check
	_, err := GetProcess()

	return err
}

func GetProcess() (*os.Process, error) {
	pid, err := pf.Read()
	if err != nil {
		return nil, err
	}

	return os.FindProcess(pid)
}

func SetLogdir(dir string) {
	logdir = dir
}

func SetIsBinary(flag bool) {
	isBinary = flag
}
