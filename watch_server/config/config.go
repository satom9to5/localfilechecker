package config

import (
	"fmt"
	"os"
	"regexp"
)

type Config struct {
	Name      string `json:"name"`
	Directory string `json:"directory"`
	Pattern   string `json:"pattern"`
	MatchNum  int    `json:"matchnum"`
}

func (c Config) String() string {
	return fmt.Sprintf("Name:%s, Directory:%s, Pattern:%s, MatchNum:%d", c.Name, c.Directory, c.Pattern, c.MatchNum)
}

func (c Config) CompilePattern() *regexp.Regexp {
	return regexp.MustCompile(c.Pattern)
}

func (c Config) IsExistDirectory() bool {
	fi, err := os.Stat(c.Directory)
	if err != nil {
		return false
	}

	return fi.IsDir()
}
