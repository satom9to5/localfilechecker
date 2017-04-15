// +build !windows

package exec

func (c Cmd) Start() error {
	return c.command.Start()
}
