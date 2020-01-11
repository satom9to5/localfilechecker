package notify

import (
	"errors"
	"fmt"
	// in project
	"watch_server/config"
)

type directoryInfoMap map[string]*directoryInfo

var (
	registedDirectoryInfo = directoryInfoMap{}
)

func AddDirectoryInfo(config config.Config) error {
	if config.Name == "" || config.Directory == "" || config.Pattern == "" {
		return errors.New("config is incorrect.")
	}

	if _, ok := registedDirectoryInfo[config.Name]; ok {
		return nil
	}

	if !config.IsExistDirectory() {
		return errors.New(fmt.Sprintf("%s is not directory", config.Directory))
	}

	if di := NewDirectoryInfo(config); di != nil {
		registedDirectoryInfo[config.Name] = di
	}

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

func Get(name, key string) *pathsInfo {
	di := registedDirectoryInfo.get(name)
	if di == nil {
		return nil
	}

	return di.get(key)
}

func GetMulti(name string, keys []string) pathsInfoMap {
	di := registedDirectoryInfo.get(name)
	if di == nil {
		return nil
	}

	return di.getMulti(keys)
}

func GetAll(name string) pathsInfoMap {
	di := registedDirectoryInfo.get(name)
	if di == nil {
		return nil
	}

	return di.getAll()
}

func (dim directoryInfoMap) get(name string) *directoryInfo {
	if fdi, ok := dim[name]; ok {
		return fdi
	} else {
		return nil
	}
}

func GetDirectoryInfoSummaries() map[string]int {
	summaries := map[string]int{}

	for name, info := range registedDirectoryInfo {
		if info == nil {
			summaries[name] = 0
		} else {
			summaries[name] = len(info.psiMap)
		}
	}

	return summaries
}
