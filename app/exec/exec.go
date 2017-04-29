package exec

import (
	"os/exec"
)

var (
	platform = ""
)

type Cmd struct {
	command *exec.Cmd
}

func Command(name string, arg ...string) *Cmd {
	return &Cmd{
		command: exec.Command(name, arg...),
	}
}

func SetPlatform(pf string) {
	platform = pf
}
