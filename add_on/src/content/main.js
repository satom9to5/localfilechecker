import $ from 'jquery'

import Targets from 'content/models/Targets'
import { find } from 'content/libs/message'

import sitesYml from 'config/sites.yml'

const settings = [
  Object.assign(sitesYml[0], {
    "file": {
      "directory": "G:/YouTube",
      "pattern": "^.*\\_([a-zA-Z0-9\\_-]{11})\\.[^\\.]+$",
      "matchnum": 1
    }
  })
]

const targets = new Targets()

const initPattern = (setting) => {
  setting.match.regexp = new RegExp(setting.match.pattern)
}

const findNode = (node) => {
  const targetKeys = {} // current check keys

  $(node).find(targetSetting.target.query).get().forEach(targetElement => {
    if (!targetElement || !targetElement[targetSetting.target.attr]) {
      return
    }

    const path = targetElement[targetSetting.target.attr].replace(targetElement.origin, '')
    const matches = path.match(targetSetting.match.regexp)
    if (!matches || matches.length == 0) {
      return
    }

    const matchKey = matches[targetSetting.match.matchnum]

    targets.add(matchKey, targetElement)
    targetKeys[matchKey] = matchKey
  })

  // query notify API
  find(targetSetting.name, targets.getKeysPreQuery(), fileInfos => {
    if (!fileInfos) {
      targetsManipulate(targetKeys)
      return
    }

    // check queried flag on request success.
    Object.getOwnPropertyNames(targets.maps).forEach(key => {
      targets.maps[key].queried = true
    })

    if (fileInfos.length == 0) {
      targetsManipulate(targetKeys)
      return
    }

    Object.getOwnPropertyNames(fileInfos).forEach(key => {
      if (!targets.maps.hasOwnProperty(key)) {
        return
      }  

      targets.maps[key].files = fileInfos[key].paths
    })

    targetsManipulate(targetKeys)
  })
}

const targetsManipulate = (targetKeys) => {
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
      targetSetting.target.current.forEach(current => {
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
      targetSetting.target.children.forEach(child => {
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

const addNodeInsertedListener = () => {
  document.body.addEventListener('DOMNodeInserted', e => {
    switch (e.target.nodeType) {
    case Node.ELEMENT_NODE:
      findNode(e.target)
      break
    }
  })
}

const targetSettings = settings.filter(setting => setting.host == location.origin)
const targetSetting = (targetSettings.length == 1) ? targetSettings[0] : null
if (targetSetting) {
  initPattern(targetSetting)
  findNode(document)
  addNodeInsertedListener() 
}
