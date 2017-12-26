import Message from 'libs/Message'

import pathsInfoMap from 'content/models/PathsInfoMap'

export const find = (name, keys, callback) => {
  if (!keys) {
    callback(null)
    return
  }

  if (Array.isArray(keys) && keys.length == 0) {
    callback(null)
    return
  }

  const queryKeys = pathsInfoMap.extractTargetKeys(keys)

  pathsInfoMap.updatesLastQueryTime(keys)

  const message = new Message("find", {
    name,
    keys: queryKeys,
  })

  // res == fileInfos
  chrome.runtime.sendMessage(message, (res) => {
    // update PathsInfoMap
    pathsInfoMap.sets(keys, res)

    callback(pathsInfoMap.gets(keys))
  })
}

export const addTab = (name) => {
  const message = new Message("addTab", name)

  chrome.runtime.sendMessage(message, (res) => {
    console.log(res)
  })
}
