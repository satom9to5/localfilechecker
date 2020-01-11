package exec

import (
	"syscall"
)

const (
	CREATE_BREAKAWAY_FROM_JOB = 0x01000000
)

func (c Cmd) Start() error {
	c.setFlag()

	return c.command.Start()
}

func (c *Cmd) setFlag() {
	if platform == "Firefox" {
		c.command.SysProcAttr = &syscall.SysProcAttr{
			CreationFlags: CREATE_BREAKAWAY_FROM_JOB | syscall.CREATE_NEW_PROCESS_GROUP,
		}
	}
}
