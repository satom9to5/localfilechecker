import $ from 'jquery'

import definedActions from 'content/libs/definedActions'

import 'content/css/content.css'

export default class ElementInfoMap {
  constructor() {
    this.maps = {}
  }

  add(key, element) {
    if (this.isDuplicate(key, element)) {
      return
    }

    if (!this.maps[key]) {
      this.maps[key] = new ElementInfo()
    }

    this.maps[key].add(element)
  }

  isDuplicate(key, element) {
    if (!this.maps[key]) {
      return false
    }

    return this.maps[key].isDuplicate(element)
  }
  
  getKeysPreQuery() {
    return Object.getOwnPropertyNames(this.maps).filter(key => !this.maps[key].queried)
  }
}

class ElementInfo {
  constructor() {
    this.elements = []
    this.paths = null
    this.queried = false
  }

  add(element) {
    this.elements.push(new ManipulateElement(element, this))
  }

  isDuplicate(element) {
    return this.elements.filter(target => target.element == element).length > 0
  }

  getFilesString() {
    if (!this.paths || this.paths.length == 0) {
      return "empty"
    }

    return this.paths.map(file => `${file.path} [${file.size} bytes]`).join(", <br />")
  }
}

class ManipulateElement {
  constructor(element, info) {
    this.element  = element
    this.info     = info
    this.currents = {}
    this.parents  = {}
    this.children = {}
  }

  manipulate(target, isDelete = false) {
    target.current.forEach(current => {
      if (isDelete) {
        this.deleteCurrent(current)
      } else {
        this.addCurrent(current)
      }
    })

    target.parents.forEach(parentConf => {
      if (isDelete) {
        this.deleteParent(parentConf)
      } else {
        this.addParent(parentConf)
      }
    })

    target.children.forEach(child => {
      if (isDelete) {
        this.deleteChild(child)
      } else {
        this.addChild(child)
      }
    })
  }

  addCurrent(current) {
    if (!current.actions) {
      return
    }

    const filter = current.filter

    if (filter && this.currents[filter]) {
      return
    }

    const $filterCurrent = filter ? $(this.element).filter(filter) : $(this.element)
    if (!$filterCurrent || $filterCurrent.length == 0) {
      return
    }

    const undoActions = this.doAction($filterCurrent, current)
    if (undoActions.legnth > 0 && filter && !this.currents.hasOwnProperty(filter)) {
      this.currents[filter] = undoActions
    }
  }

  deleteCurrent(current) {
    if (!current.filter || !current.actions) {
      return
    }

    const filter = current.filter

    const undoActions = this.currents[filter]
    if (this.currents.hasOwnProperty(filter)) {
      delete this.currents[filter]
    }

    this.undoAction(undoActions)
  }

  addParent(parentConf) {
    if (!parentConf.actions) {
      return
    }

    const query = parentConf.query

    if (query && this.parents[query]) {
      return
    }

    const $parentElements = $(this.element).parents(query)
    if (!$parentElements || $parentElements.length == 0) {
      return
    }

    const undoActions = this.doAction($parentElements, parentConf)
    if (undoActions.legnth > 0 && query && !this.parents.hasOwnProperty(query)) {
      this.parents[filter] = undoActions
    }
  }

  deleteParent(parentConf) {
    if (!parentConf.query || !parentConf.actions) {
      return
    }

    const query = parentConf.query

    const undoActions = this.parents[query]
    if (this.parents.hasOwnProperty(query)) {
      delete this.parents[query]
    }

    this.undoAction(undoActions)
  }


  addChild(child) {
    if (!child.actions) {
      return
    }

    const query = child.query

    if (query && this.children[query]) {
      return
    }

    const $childElements = $(this.element).find(query)
    if (!$childElements || $childElements.length == 0) {
      return
    }

    const undoActions = this.doAction($childElements, child)
    if (undoActions.legnth > 0 && query && !this.children.hasOwnProperty(query)) {
      this.children[query] = undoActions
    }
  }

  deleteChild(child) {
    if (!child.query || !child.actions) {
      return
    }

    const query  = child.query

    const undoActions = this.children[query]
    if (this.children.hasOwnProperty(query)) {
      delete this.children[query]
    }

    this.undoAction(undoActions)
  }

  doAction($element, manipulate) {
    if (!manipulate.actions || !Array.isArray(manipulate.actions) || manipulate.actions.length == 0) {
      return []
    }

    const actions = manipulate.actions.map(action => definedActions(action, this, $element)).reduce((arr, actions) => {
      arr = arr.concat(actions)

      return arr
    }, [])

    return actions.map(actionObject => {
      if (!actionObject.hasOwnProperty('action') || !actionObject.hasOwnProperty('args')) {
        return null
      }

      const { action, args } = actionObject

      const undoAction = {
        element: null,
        action,
      }

      switch (action) {
      case "append":
        const $actionedElement = $(...args)

        undoAction.element = $actionedElement
        undoAction.action  = "remove"

        $element[action]($actionedElement)

        return undoAction
        break
      case "addClass":
      case "removeClass":
        undoAction.element = $element
        undoAction.action  = action == "addClass" ? "removeClass" : "addClass"
        
        $element[action](...args)

        return undoAction
        break
      case "on":
      case "hover":
        undoAction.element = $element
        undoAction.action  = action

        $element[action](...args)

        return undoAction
        break
      default:
        if (args instanceof Object) {
          const undoArgs = {}

          Object.getOwnPropertyNames(args).forEach(key => {
            undoArgs[key] = $element[action](key)
          })

          undoAction.args = undoArgs
        } else {
          undoAction.args = args
        }

        undoAction.element = $element
        
        $element[action](...args)

        return undoAction
        break
      }
    }).filter(value => value)
  }

  undoAction(undoAction) {
    if (!undoAction || !undoAction.element || !undoAction.actions) {
      return
    }

    undoAction.actions.forEach(action => {
      if (action.hasOwnProperty('args')) {
        action.element[action.action](action.args)
      } else {
        action.element[action.action]()
      }
    })
  }
}
