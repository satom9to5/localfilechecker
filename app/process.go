package main

import (
	"fmt"
	gops "github.com/mitchellh/go-ps"
)

func findProcess(name string) {
	processes, _ := gops.Processes()

	for _, ps := range processes {
		fmt.Println(ps)
	}
}
