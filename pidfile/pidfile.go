package pidfile

import (
	"bytes"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strconv"
)

var (
	pidfile         = flag.String("pidfile", "", "pidfile path")
	notPidfileError = errors.New("pidfile not configured.")
)

func GetPath() string {
	return *pidfile
}

func SetPath(path string) {
	*pidfile = path
}

func GetProcess() (*os.Process, error) {
	pid, err := Read()
	if err != nil {
		return nil, err
	}

	return os.FindProcess(pid)
}

func Read() (int, error) {
	if *pidfile == "" {
		return 0, notPidfileError

	}

	b, err := ioutil.ReadFile(*pidfile)
	if err != nil {
		return 0, err
	}

	pid, err := strconv.Atoi(string(bytes.TrimSpace(b)))
	if err != nil {
		return 0, fmt.Errorf("pidfile parse error from %s: %s", *pidfile, err)
	}

	return pid, nil
}

func Write() error {
	if *pidfile == "" {
		return notPidfileError
	}

	if err := os.MkdirAll(filepath.Dir(*pidfile), os.FileMode(0755)); err != nil {
		return err
	}

	file, err := os.Create(*pidfile)
	if err != nil {
		return fmt.Errorf("open pidfile error %s: %s", *pidfile, err)
	}
	defer file.Close()

	_, err = fmt.Fprintf(file, "%d", os.Getpid())

	return err
}

func Remove() error {
	if *pidfile == "" {
		return notPidfileError
	}

	return os.Remove(*pidfile)
}
