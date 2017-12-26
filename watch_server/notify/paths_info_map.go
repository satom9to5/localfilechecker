package notify

type pathsInfoMap map[string]*pathsInfo

func (pim *pathsInfoMap) add(key string, fi fileInfo) (*pathInfo, *pathsInfo) {
	var psi *pathsInfo

	if psi = pim.get(key); psi != nil {
		pi := psi.add(fi)

		return pi, psi
	} else {
		psi := newPathsInfo(key)

		pi := psi.add(fi)
		(*pim)[key] = psi

		return pi, psi
	}
}

func (pim *pathsInfoMap) get(key string) *pathsInfo {
	psi, ok := (*pim)[key]
	if ok {
		return psi
	} else {
		return nil
	}
}

func (pim *pathsInfoMap) getPathInfo(key, path string) (*pathInfo, *pathsInfo) {
	psi := pim.get(key)
	if psi == nil {
		return nil, nil
	}

	return psi.getPathInfo(path), psi
}

// 2nd return value is not nii when fi.Paths > 0
func (pim *pathsInfoMap) remove(key, path string) (*pathInfo, *pathsInfo) {
	psi := pim.get(key)
	if psi == nil {
		return nil, nil
	}

	pi := psi.removePath(path)
	if len(psi.Paths) > 0 {
		return pi, psi
	}

	if len(psi.Paths) == 0 {
		delete(*pim, key)
	}

	return pi, nil
}

func (pim *pathsInfoMap) rename(key string, fi fileInfo, beforePath string) (*pathInfo, *pathsInfo) {
	// add new path
	pi, psi := pim.add(key, fi)
	// delete old path
	pim.remove(key, beforePath)

	return pi, psi
}
