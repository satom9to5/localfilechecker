package notify

import (
	"fmt"
)

type filesInfo struct {
	Key   string      `json:"key"`
	Paths []*pathInfo `json:"paths"`
}

func newFilesInfo(key string) *filesInfo {
	return &filesInfo{
		Key:   key,
		Paths: []*pathInfo{},
	}
}

func (fi filesInfo) String() string {
	result := fmt.Sprintf("Key:%s, Paths:[", fi.Key)

	for _, pi := range fi.Paths {
		result += pi.Path + " "
	}

	result += "]"

	return result
}

func (fi *filesInfo) getPathInfo(path string) *pathInfo {
	for _, pi := range fi.Paths {
		if path == pi.Path {
			return pi
		}
	}

	return nil
}

func (fi *filesInfo) add(path string) *pathInfo {
	for _, pi := range fi.Paths {
		if path == pi.Path {
			return pi
		}
	}

	pi := &pathInfo{
		Path: path,
		Size: 0,
	}

	fi.Paths = append(fi.Paths, pi)

	return pi
}

func (fi *filesInfo) removePath(path string) *pathInfo {
	paths := []*pathInfo{}
	targetPi := &pathInfo{}

	for _, pi := range fi.Paths {
		if path == pi.Path {
			targetPi = pi
		} else {
			paths = append(paths, pi)
		}
	}

	fi.Paths = paths

	return targetPi
}

func (fi *filesInfo) updatePath() []string {
	paths := []*pathInfo{}
	removePaths := []string{}

	for _, pi := range fi.Paths {
		if fileExist(pi.Path) {
			paths = append(paths, pi)
		} else {
			removePaths = append(removePaths, pi.Path)
		}
	}

	fi.Paths = paths

	return removePaths
}
