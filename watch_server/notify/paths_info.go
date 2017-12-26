package notify

import (
	"fmt"
	"strings"
)

type pathsInfo struct {
	Key   string      `json:"key"`
	Paths []*pathInfo `json:"paths"`
}

func newPathsInfo(key string) *pathsInfo {
	return &pathsInfo{
		Key:   key,
		Paths: []*pathInfo{},
	}
}

func (psi pathsInfo) String() string {
	result := fmt.Sprintf("Key:%s, Paths:[", psi.Key)

	paths := []string{}
	for _, pi := range psi.Paths {
		paths = append(paths, fmt.Sprintf("{%s}", pi.String()))
	}

	result += strings.Join(paths, ", ") + "]"

	return result
}

func (psi *pathsInfo) getPathInfo(path string) *pathInfo {
	for _, pi := range psi.Paths {
		if path == pi.Path {
			return pi
		}
	}

	return nil
}

func (psi *pathsInfo) add(fi fileInfo) *pathInfo {
	for _, pi := range psi.Paths {
		if fi.Path() == pi.Path {
			return pi
		}
	}

	pi := NewPathInfo(fi)

	psi.Paths = append(psi.Paths, pi)

	return pi
}

func (psi *pathsInfo) removePath(path string) *pathInfo {
	paths := []*pathInfo{}
	targetPi := &pathInfo{}

	for _, pi := range psi.Paths {
		if path == pi.Path {
			targetPi = pi
		} else {
			paths = append(paths, pi)
		}
	}

	psi.Paths = paths

	return targetPi
}
