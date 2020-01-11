import ManipulateTargetActions from 'content/models/ManipulateTargetActions'

export default class ManipulateTarget {
  constructor(manipulateElement, target, type) {
    this.manipulateElement = manipulateElement
    this.target            = target
    this.type              = type

    this.targetActions     = []
  }

  set() {
    const { pathsInfo } = this.manipulateElement

    // unset old action
    this.targetActions.forEach(targetActions => targetActions.unset())

    // check when all MutationObserver events checked
    const selectorElements = this.selectElements()

    if (selectorElements.length == 0) {
      this.targetActions = []
      return
    }

    // set new action
    this.targetActions = selectorElements.map(element => new ManipulateTargetActions(element, this.target, pathsInfo))

    this.targetActions.forEach(targetAction => targetAction.set())
  }

  unset() {
    if (this.targetActions.length == 0) {
      return
    }

    // unset action
    this.targetActions.forEach(targetActions => targetActions.unset())

    this.targetActions = []
  }

  selectElements() {
    const { element } = this.manipulateElement

    if (!(this.target.hasOwnProperty('selector'))) {
      return [element]
    }

    switch (this.type) {
    case 'current':
      if (element.parentNode && 
          (
            (this.target.selector && element.parentNode.querySelector(this.target.selector) == element) || !this.target.selector
          )
        ) {
        return [element]
      } else {
        return []
      }
      break
    case 'parent':
      let elem = element.parentNode
      while (elem) {
        if ('matches' in elem && elem.matches(this.target.selector)) {
          return [elem]
        }

        elem = elem.parentNode
      }
      return []
      break
    case 'children':
      return Array.from(element.querySelectorAll(this.target.selector))
      break
    }
  }
}
