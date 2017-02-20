package notify

type fileInfo struct {
	Key   string   `json:"key"`
	Paths []string `json:"paths"`
}

func (fi fileInfo) addPath(path string) {
	for _, fiPath := range fi.Paths {
		if fiPath == path {
			return
		}
	}

	fi.Paths = append(fi.Paths, path)
}

func (fi fileInfo) removePath(path string) {
	paths := []string{}

	for _, fiPath := range fi.Paths {
		if fiPath != path {
			paths = append(paths, fiPath)
		}
	}

	fi.Paths = paths
}
