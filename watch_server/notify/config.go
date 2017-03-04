package notify

import (
	"os"
	"regexp"
)

type Config struct {
	Name      string `json:"name"`
	Directory string `json:"directory"`
	Pattern   string `json:"pattern"`
	MatchNum  int    `json:"matchnum"`
}

func (c Config) compilePattern() *regexp.Regexp {
	return regexp.MustCompile(c.Pattern)
}

func (c Config) IsExistDirectory() bool {
	fi, err := os.Stat(c.Directory)
	if err != nil {
		return false
	}

	return fi.IsDir()
}
