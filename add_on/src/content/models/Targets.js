import $ from 'jquery'

class Targets {
  constructor() {
    this.maps = {}
  }

  add(key, element) {
    if (this.isDuplicate(key, element)) {
      return
    }

    if (!this.maps[key]) {
      this.maps[key] = new Target()
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

// TODO 処理が終わればelementsから削除する
class Target {
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
    if (!current.action || !current.args) {
      return
    }

    const filter = current.filter
    const action = current.action
    const args   = current.args

    if (filter && this.currents[filter]) {
      return
    }

    const $filterCurrent = $(this.element).filter(filter)
    if (!$filterCurrent || $filterCurrent.length == 0) {
      return
    }

    const undoAction = this.doAction($filterCurrent, action, args)
    if (filter && !this.currents.hasOwnProperty(filter)) {
      this.currents[filter] = undoAction
    }
  }

  deleteCurrent(current) {
    if (!current.filter || !current.action) {
      return
    }

    const filter = current.filter
    const action = current.action

    const undoCurrent = this.currents[filter]
    if (this.currents.hasOwnProperty(filter)) {
      delete this.currents[filter]
    }

    this.undoAction(undoCurrent)
  }

  addChild(child) {
    if (!child.action || !child.args) {
      return
    }

    const query  = child.query
    const action = child.action
    const args   = child.args

    if (query && this.children[query]) {
      return
    }

    const $childElements = $(this.element).find(query)
    if (!$childElements || $childElements.length == 0) {
      return
    }

    const undoAction = this.doAction($childElements, action, args)
    if (query && !this.children.hasOwnProperty(query)) {
      this.children[query] = undoAction
    }
  }

  deleteChild(child) {
    if (!child.query || !child.action) {
      return
    }

    const query  = child.query
    const action = child.action

    const undoChild = this.children[query]
    if (this.children.hasOwnProperty(query)) {
      delete this.children[query]
    }

    this.undoAction(undoChild)
  }

  doAction($element, action, args) {
    const undoAction = {
      element: null,
      action,
    }

    switch (action) {
    case "append":
      const $actionedElement = $(args)
      undoAction.element = $actionedElement
      undoAction.action  = "remove"

      $element[action]($actionedElement)

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
      
      $element[action](args)

      return undoAction
      break
    }
  }

  undoAction(undoAction) {
    if (!undoAction || !undoAction.element || !undoAction.action) {
      return
    }

    if (undoAction.hasOwnProperty('args')) {
      undoAction.element[undoAction.action](undoAction.args)
    } else {
      undoAction.element[undoAction.action]()
    }
  }
}

export default Targets
