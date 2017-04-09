import $ from 'jquery'

import Targets from 'content/models/Targets'
import { find } from 'content/libs/message'

import storage from 'libs/storage'

import sitesYml from 'config/sites.yml'

const targets = new Targets()

const convertArgs = (args) => {
  if (typeof args != "string") {
    return args
  }

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

const init = (setting) => {
  setting.match.regexp    = new RegExp(setting.match.pattern)
  setting.target.current  = setting.target.current.map(target => Object.assign(target, { args: convertArgs(target.args) }))
  setting.target.parents  = setting.target.parents.map(target => Object.assign(target, { args: convertArgs(target.args) }))
  setting.target.children = setting.target.children.map(target => Object.assign(target, { args: convertArgs(target.args) }))
}

const findNode = (node, setting) => {
  const targetKeys = {} // current check keys

  $(node).find(setting.target.query).get().forEach(targetElement => {
    if (!targetElement || !targetElement[setting.target.attr]) {
      return
    }

    const path = targetElement[setting.target.attr].replace(targetElement.origin, '')
    const matches = path.match(setting.match.regexp)
    if (!matches || matches.length == 0) {
      return
    }

    const matchKey = matches[setting.match.matchnum]

    targets.add(matchKey, targetElement)
    targetKeys[matchKey] = matchKey
  })

  // query notify API
  find(setting.name, targets.getKeysPreQuery(), fileInfos => {
    if (!fileInfos) {
      targetsManipulate(targetKeys, setting)
      return
    }

    // check queried flag on request success.
    Object.getOwnPropertyNames(targets.maps).forEach(key => {
      targets.maps[key].queried = true
    })

    if (fileInfos.length == 0) {
      targetsManipulate(targetKeys, setting)
      return
    }

    Object.getOwnPropertyNames(fileInfos).forEach(key => {
      if (!targets.maps.hasOwnProperty(key)) {
        return
      }  

      targets.maps[key].files = fileInfos[key].paths
    })

    targetsManipulate(targetKeys, setting)
  })
}

const targetsManipulate = (targetKeys, setting) => {
  Object.getOwnPropertyNames(targetKeys).forEach(key => {
    if (!targets.maps[key]) {
      return
    }

    const target = targets.maps[key]

    if (!target.files || !target.queried || target.elements.length == 0) {
      return
    }

    // DOM manipulate
    target.elements.forEach(element => {
      // current
      setting.target.current.forEach(current => {
        if (!current.action || !current.args) {
          return
        }

        const $filterCurrent = $(element).filter(current.filter)
        if (!$filterCurrent || $filterCurrent.length == 0) {
          return
        }

        $filterCurrent[current.action](current.args)
      })

      // parent
      
      // children
      setting.target.children.forEach(child => {
        if (!child.action || !child.args) {
          return
        }

        const $childElements = $(element).find(child.query)
        if (!$childElements || $childElements.length == 0) {
          return
        }
	      
        $childElements[child.action](child.args)
      })
    })

    target.elements = []
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
  findNode(document, setting)
  addNodeInsertedListener(setting)
})
