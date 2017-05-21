import $ from 'jquery'

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
    this.files = null
    this.queried = false
  }

  add(element) {
    this.elements.push(new ManipulateElement(element))
  }

  isDuplicate(element) {
    return this.elements.filter(target => target.element == element).length > 0
  }
}

class ManipulateElement {
  constructor(element) {
    this.element  = element
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

    const $filterCurrent = $(this.element).filter(filter)
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

    const actions = this.getExecActions(manipulate)

    return actions.map(actionObject => {
      if (!actionObject.args_type && (!actionObject.args || !Array.isArray(actionObject.args) || actionObject.args.length == 0)) {
        return null
      }

      const { action, args_type, args } = actionObject

      const undoAction = {
        element: null,
        action,
      }

      switch (action.action) {
      case "append":
        const $actionedElement = $(...args)

        undoAction.element = $actionedElement
        undoAction.action  = "remove"

        $element[action]($actionedElement)

        return undoAction
        break
      case "on":
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

  getExecActions(manipulate) {
    const actions = manipulate.actions

    if (!manipulate.args_type) {
      return actions
    } 

    return actions
  }
}
