package notify

import (
	"errors"
	"fmt"
)

type categorizedDirectoryInfo map[string]directoryInfo

var (
	registedDirectoryInfo = categorizedDirectoryInfo{}
)

func AddDirectoryInfo(config Config) error {
	if config.Category == "" || config.Directory == "" || config.Pattern == "" {
		return errors.New("config is incorrect.")
	}

	if _, ok := registedDirectoryInfo[config.Category]; ok {
		return nil
	}

	if !config.IsExistDirectory() {
		return errors.New(fmt.Sprintf("%s is not directory", config.Directory))
	}

	registedDirectoryInfo[config.Category] = NewDirectoryInfo(config)

	return nil
}

func RemoveDirectoryInfo(category string) error {
	if v := registedDirectoryInfo.get(category); v != nil {
		delete(registedDirectoryInfo, category)
		return nil
	} else {
		return errors.New(fmt.Sprintf("%s is not exist.", category))
	}
}

func Get(category, key string) *fileInfo {
	fdi := registedDirectoryInfo.get(category)
	if fdi == nil {
		return nil
	}

	return fdi.get(key)
}

func GetMulti(category string, keys []string) fileInfoMap {
	fdi := registedDirectoryInfo.get(category)
	if fdi == nil {
		return nil
	}

	return fdi.getMulti(keys)
}

func GetAll(category string) fileInfoMap {
	fdi := registedDirectoryInfo.get(category)
	if fdi == nil {
		return nil
	}

	return fdi.getAll()
}

func (cfi categorizedDirectoryInfo) get(category string) *directoryInfo {
	if fdi, ok := cfi[category]; ok {
		return &fdi
	} else {
		return nil
	}
}
