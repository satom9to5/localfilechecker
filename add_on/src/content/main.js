import $ from 'jquery'

import ElementInfoMap from 'content/models/ElementInfoMap'
import { find, addTab } from 'content/libs/message'

import storage from 'libs/storage'

import sitesYml from 'config/sites.yml'

const infoMap = new ElementInfoMap()

const convertArgs = (args) => {
  if (typeof args != "string") {
    return args
  }

  args = args.trim()

  switch (args.substr(0, 1)) {
    case '{':
      if (args.substr(-1) != '}') {
        return args
      } 

      return JSON.parse(args)
      break
    case '[':
      if (args.substr(-1) != ']') {
        return args
      } 

      return JSON.parse(args)
      break
    default:
      return args
      break
  }
}

const convertTarget = (target) => {
  switch (true) {
  case (Array.isArray(target)):
    return target.map(val => convertTarget(val))
    break
  case (target instanceof Object):
    return Object.getOwnPropertyNames(target).reduce((obj, name) => {
      obj[name] = convertTarget(target[name])
     
      return obj
    }, {})

    break
  default:
    return convertArgs(target)
    break
  }
}

const init = (setting) => {
  setting.match.regexp = new RegExp(setting.match.pattern)

  setting.targets = setting.targets.map(target => {
    target.current  = convertTarget(target.current)
    target.parents  = convertTarget(target.parents)
    target.children = convertTarget(target.children)
    
    return target
  })
}

const findNode = (node, setting) => {
  const queryKeys = {} // current check keys

  setting.targets.forEach(target => {
    $(node).find(target.query).get().forEach(targetElement => {
      if (!targetElement || !targetElement[target.attr]) {
        return
      }

      const path = targetElement[target.attr].replace(targetElement.origin, '')
      const matches = path.match(setting.match.regexp)
      if (!matches || matches.length == 0) {
        return
      }

      const matchKey = matches[setting.match.matchnum]

      infoMap.add(matchKey, targetElement)
      queryKeys[matchKey] = matchKey
    })
  })

  // query notify API
  find(setting.name, infoMap.getKeysPreQuery(), fileInfos => {
    if (!fileInfos) {
      targetsManipulate(queryKeys, setting)
      return
    }

    // check queried flag on request success.
    Object.getOwnPropertyNames(infoMap.maps).forEach(key => {
      infoMap.maps[key].queried = true
    })

    if (fileInfos.length == 0) {
      targetsManipulate(queryKeys, setting)
      return
    }

    Object.getOwnPropertyNames(fileInfos).forEach(key => {
      if (!infoMap.maps.hasOwnProperty(key)) {
        return
      }  

      infoMap.maps[key].files = fileInfos[key].paths
    })

    targetsManipulate(queryKeys, setting)
  })
}

const targetsManipulate = (queryKeys, setting, isDelete = false) => {
  Object.getOwnPropertyNames(queryKeys).forEach(key => {
    if (!infoMap.maps[key]) {
      return
    }

    const target = infoMap.maps[key]

    //if (!isDelete && (!target.files || !target.queried || target.elements.length == 0)) {
    if (!isDelete && (!target.files || target.elements.length == 0)) {
      return
    }

    // DOM manipulate
    target.elements.forEach(element => {
      setting.targets.forEach(target => {
        element.manipulate(target, isDelete)
      })
    })
  })
}

const addNodeInsertedListener = (setting) => {
  document.body.addEventListener('DOMNodeInserted', e => {
    switch (e.target.nodeType) {
    case Node.ELEMENT_NODE:
      findNode(e.target, setting)
      break
    }
  })
}

const addMessageListener = (setting) => {
  chrome.runtime.onMessage.addListener((req, sender, callback) => {
    if (!req.type || !req.files) {
      return
    }
  
    //console.log(req)
  
    const files = req.files
  
    if (!infoMap.maps.hasOwnProperty(files.key)) {
      return
    }

    infoMap.maps[files.key].files = files.paths

    const queryKeys = {[files.key]: files.key}
    targetsManipulate(queryKeys, setting, req.type == "Delete")
  })
}

(async () => {
  const sites = await storage.get('sites')

  if (!sites || !sites instanceof Object) {
    return null
  }

  const targetNames = Object.getOwnPropertyNames(sites).filter(name => {
    return sites[name].host == location.origin
  })

  if (!targetNames || targetNames.length != 1) {
    return null
  }

  return sites[targetNames[0]]
})().then(setting => {
  if (!setting) {
    return
  }

  init(setting)
  addTab(setting.name)
  findNode(document, setting)
  addNodeInsertedListener(setting)
  addMessageListener(setting)
})

