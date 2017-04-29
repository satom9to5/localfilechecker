package exec

import (
	"syscall"
)

const (
	CREATE_BREAKAWAY_FROM_JOB = 0x01000000
)

func (c Cmd) Start() error {
	if platform == "Firefox" {
		c.command.SysProcAttr = &syscall.SysProcAttr{
			CreationFlags: CREATE_BREAKAWAY_FROM_JOB,
		}
	}

	return c.command.Start()
}
