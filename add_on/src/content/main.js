import ManipulateElements from 'content/models/ManipulateElements'

import { find, addTab } from 'content/libs/message'

import storage from 'libs/storage'
import settingLoad from 'libs/settingLoad'

import sitesYml from 'config/sites.yml'

const manipulateElements = new ManipulateElements()

// target url is matching match.pattern
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

const setManipulateElementsAndGetQueryKeys = (setting, records) => {
  const queryKeys = {} // found keys for query

  records.forEach(record => {
    const target = (record.type == "characterData" ? record.target.parentNode : record.target) || {}
    // record.target is text when type is characterData
    const { _manipulateElement } = target

    setting.manipulates.filter(manipulate => manipulate.observers.filter(observer => observer == record.type).length > 0).forEach(manipulate => {
      if (!(manipulate.hasOwnProperty('query')) || !(manipulate.hasOwnProperty('attributeName'))) {
        return
      }

      const { query, attributeName } = manipulate

      switch (record.type) {
      case "childList":
        // when url matching querySelectolAll() elements
        Array.from(target.querySelectorAll(query))
          .filter(element => attributeName in element && element[attributeName] && element[attributeName] != '')
          .forEach(element => setManipulateElements(queryKeys, element, manipulate, setting))

        break
      case "attributes":
        if (target.matches(query) && attributeName == record.attributeName) {
          setManipulateElements(queryKeys, target, manipulate, setting) 
        }

        break
      case "characterData":
        if (target.matches(query)) {
          setManipulateElements(queryKeys, target, manipulate, setting) 
        }

        break
      }
    })
  })

  return queryKeys
}

const setManipulateElements = (queryKeys, target, manipulate, setting) => {
  const matchKey = urlMatch(target, setting, manipulate)

  if (!matchKey) {
    return
  }

  // target is textNode
  if (!manipulateElements.add(matchKey, manipulate, target)) {
    return
  }

  if (!(queryKeys.hasOwnProperty(matchKey))) {
    queryKeys[matchKey] = []
  }

  queryKeys[matchKey].push(target)
}

const setObserver = (setting) => {
  const settingObserver = new MutationObserver((records, observer) => {
    const queryKeys = setManipulateElementsAndGetQueryKeys(setting, records)
    const queryKeyNames = Object.getOwnPropertyNames(queryKeys)

    //console.log(manipulateElements.manipulateElements.filter(manipulateElement => manipulateElement.visible()))

    if (queryKeyNames.length == 0) {
      return
    }

    // send notify API
    find(setting.name, queryKeyNames, pathsInfoMap => {
      queryKeyNames.forEach(key => {
        const isSet = pathsInfoMap.hasOwnProperty(key)

        queryKeys[key].filter(element => element.hasOwnProperty('_manipulateElement'))
          .forEach(element => {
            if (isSet && element._manipulateElement.key == key) {
              // manipulate currents/parents/children
              element._manipulateElement.set(pathsInfoMap[key])
            } else {
              element._manipulateElement.unset()
            }
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

