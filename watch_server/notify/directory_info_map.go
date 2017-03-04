package notify

import (
	"errors"
	"fmt"
)

type directoryInfoMap map[string]directoryInfo

var (
	registedDirectoryInfo = directoryInfoMap{}
)

func AddDirectoryInfo(config Config) error {
	if config.Name == "" || config.Directory == "" || config.Pattern == "" {
		return errors.New("config is incorrect.")
	}

	if _, ok := registedDirectoryInfo[config.Name]; ok {
		return nil
	}

	if !config.IsExistDirectory() {
		return errors.New(fmt.Sprintf("%s is not directory", config.Directory))
	}

	registedDirectoryInfo[config.Name] = NewDirectoryInfo(config)

	return nil
}

func RemoveDirectoryInfo(name string) error {
	if v := registedDirectoryInfo.get(name); v != nil {
		delete(registedDirectoryInfo, name)
		return nil
	} else {
		return errors.New(fmt.Sprintf("%s is not exist.", name))
	}
}

func Get(name, key string) *fileInfo {
	fdi := registedDirectoryInfo.get(name)
	if fdi == nil {
		return nil
	}

	return fdi.get(key)
}

func GetMulti(name string, keys []string) fileInfoMap {
	fdi := registedDirectoryInfo.get(name)
	if fdi == nil {
		return nil
	}

	return fdi.getMulti(keys)
}

func GetAll(name string) fileInfoMap {
	fdi := registedDirectoryInfo.get(name)
	if fdi == nil {
		return nil
	}

	return fdi.getAll()
}

func (dim directoryInfoMap) get(name string) *directoryInfo {
	if fdi, ok := dim[name]; ok {
		return &fdi
	} else {
		return nil
	}
}
