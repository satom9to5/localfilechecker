package notify

type filesInfoMap map[string]*filesInfo

func (fim *filesInfoMap) add(key, path string) (*filesInfo, *pathInfo) {
	var fi *filesInfo

	if fi = fim.get(key); fi != nil {
		pi := fi.add(path)

		return fi, pi
	} else {
		fi := newFilesInfo(key)

		pi := fi.add(path)
		(*fim)[key] = fi

		return fi, pi
	}
}

func (fim *filesInfoMap) get(key string) *filesInfo {
	fi, ok := (*fim)[key]
	if ok {
		return fi
	} else {
		return nil
	}
}

func (fim *filesInfoMap) getPathInfo(key, path string) (*filesInfo, *pathInfo) {
	fi := fim.get(key)
	if fi == nil {
		return nil, nil
	}

	return fi, fi.getPathInfo(path)
}

func (fim *filesInfoMap) remove(key, path string) *pathInfo {
	fi := fim.get(key)
	if fi == nil {
		return nil
	}

	pi := fi.removePath(path)
	if len(fi.Paths) > 0 {
		return pi
	}

	if len(fi.Paths) == 0 {
		delete(*fim, key)
	}

	return pi
}

func (fim *filesInfoMap) updatePath(key string) []string {
	fi := fim.get(key)
	if fi == nil {
		return []string{}
	}

	return fi.updatePath()
}
