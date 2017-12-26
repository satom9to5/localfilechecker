import ManipulateElements from 'content/models/ManipulateElements'

import { find, addTab } from 'content/libs/message'

import storage from 'libs/storage'
import settingLoad from 'libs/settingLoad'

import sitesYml from 'config/sites.yml'

const manipulateElements = new ManipulateElements()

const urlMatch = (element, setting, manipulate) => {
  if (!(setting.match) || !(setting.match.regexp) || !(setting.match.matchnum)) {
    return null
  }

  if (!(manipulate.attributeName in element) || typeof element[manipulate.attributeName] != 'string') {
    return null
  }

  const path = element[manipulate.attributeName].replace(location.origin, '') 
  const matches = path.match(setting.match.regexp)
  if (!matches || matches.length == 0) {
    return null
  }

  return matches[setting.match.matchnum]
}

const getQueryKeys = (setting, records) => {
  const queryKeys = {} // found keys for query

  records.forEach(record => {
    const target = (record.type == "characterData" ? record.target.parentNode : record.target) || {}
    // record.target is text when type is characterData
    const { localName, _manipulateElement } = target

    setting.manipulates.filter(manipulate => manipulate.observers.filter(observer => observer == record.type).length > 0).forEach(manipulate => {
      if (!(manipulate.hasOwnProperty('query')) || !(manipulate.hasOwnProperty('attributeName'))) {
        return
      }

      const { query, attributeName } = manipulate

      let matchKey = null

      switch (record.type) {
      case "childList":
        Array.from(target.querySelectorAll(query)).forEach(element => {
          if (!(attributeName in element) || element[attributeName] == '') {
            return
          }

          matchKey = urlMatch(element, setting, manipulate)
          
          if (!matchKey) {
            return
          }

          manipulateElements.add(matchKey, manipulate, element)

          if (!(queryKeys.hasOwnProperty(matchKey))) {
            queryKeys[matchKey] = []
          }

          queryKeys[matchKey].push(element)
        })

        break
      case "attributes":
        if (query != localName || attributeName != record.attributeName) {
          return
        }

        if (_manipulateElement) {
          _manipulateElement.unset()
        }

        // other movie link on ytd-watch OR current node update
        matchKey = urlMatch(target, setting, manipulate)
        
        if (!matchKey) {
          return
        }

        manipulateElements.add(matchKey, manipulate, target)

        if (!(queryKeys.hasOwnProperty(matchKey))) {
          queryKeys[matchKey] = []
        }

        queryKeys[matchKey].push(target)
        break
      case "characterData":
        if (query != localName) {
          return
        }

        if (_manipulateElement) {
          _manipulateElement.unset()
        }

        // other movie link on ytd-watch OR current node update
        matchKey = urlMatch(target, setting, manipulate)
        
        if (!matchKey) {
          return
        }

        // target is textNode
        manipulateElements.add(matchKey, manipulate, target)

        if (!(queryKeys.hasOwnProperty(matchKey))) {
          queryKeys[matchKey] = []
        }

        queryKeys[matchKey].push(target)
        break
      }
    })
  })

  return queryKeys
}

const setObserver = (setting) => {
  const settingObserver = new MutationObserver((records, observer) => {
    const queryKeys = getQueryKeys(setting, records)

    //console.log(manipulateElements.manipulateElements.filter(manipulateElement => manipulateElement.visible()))

    if (Object.getOwnPropertyNames(queryKeys).length == 0) {
      return
    }

    // send notify API
    find(setting.name, Object.getOwnPropertyNames(queryKeys), pathsInfoMap => {
      //console.log(fileInfos)
      Object.getOwnPropertyNames(pathsInfoMap)
        .filter(key => queryKeys.hasOwnProperty(key))
        .forEach(key => {
          const elements = queryKeys[key]

          elements.filter(element => element.hasOwnProperty('_manipulateElement') && element._manipulateElement.key == key)
            .forEach(element => {
              // manipulate currents/parents/children
              element._manipulateElement.set(pathsInfoMap[key])
            })
        })
    })
  })

  const options = {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true
  }

  settingObserver.observe(document.body, options)
}

const addMessageListener = (setting) => {
  chrome.runtime.onMessage.addListener((req, sender, callback) => {
    if (!req.type || !req.paths) {
      return
    }
  
    const paths = req.paths
  
    if (!infoMap.maps.hasOwnProperty(paths.key)) {
      return
    }

    infoMap.maps[paths.key].paths = paths.paths

    const queryKeys = {[paths.key]: paths.key}
    //targetsManipulate(queryKeys, setting, req.type == "Delete")
  })
}

settingLoad(setting => {
  addTab(setting.name)
  //findNode(document, setting)
  setObserver(setting)
  addMessageListener(setting)
})

