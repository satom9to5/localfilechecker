package notify

type fileInfoMap map[string]fileInfo

func (fim fileInfoMap) add(key, path string) *fileInfo {
	var fi *fileInfo

	if fi = fim.get(key); fi != nil {
		fi.addPath(path)
	} else {
		fi := &fileInfo{
			Key:   key,
			Paths: []string{path},
		}

		fim[key] = *fi
	}

	return fi
}

func (fim fileInfoMap) get(key string) *fileInfo {
	fi, ok := fim[key]
	if ok {
		return &fi
	} else {
		return nil
	}
}

func (fim fileInfoMap) remove(key, path string) {
	fi := fim.get(key)
	if fi == nil {
		return
	}

	fi.removePath(path)

	if len(fi.Paths) == 0 {
		delete(fim, key)
	}
}
