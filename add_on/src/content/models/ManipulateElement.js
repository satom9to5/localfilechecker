import ManipulateTarget from 'content/models/ManipulateTarget'

export default class ManipulateElement {
  static create(key, manipulate, element) {
    const manipulateElement = new ManipulateElement(key, manipulate, element)

    if (manipulateElement.isEnable()) {
      Object.defineProperties(element, {
        _manipulateElement: {
          value: manipulateElement,
          writable: true,
        }
      })
    }

    return manipulateElement
  }

  constructor(key, manipulate, element) {
    this.key        = key
    this.manipulate = manipulate
    this.element    = element
    this.pathsInfo  = null 

    this.manipulateTargets = {
      currents: this.createManipulateTargets(manipulate.currents, 'current'),
      parents:  this.createManipulateTargets(manipulate.parents,  'parent'),
      children: this.createManipulateTargets(manipulate.children, 'children'),
    }
  }

  // targets == (currents/parents/children)
  createManipulateTargets(targets = [], type) {
    return targets.map(target => new ManipulateTarget(this, target, type))
  }

  isLiving() {
    return (this.element && document.body.contains(this.element))
  }

  visible() {
    return !!(this.element.offsetWidth || this.element.offsetHeight || this.element.getClientRects().length)
  }

  isEnable() {
    const { currents, parents, children } = this.manipulateTargets

    return (currents.length > 0 || parents.length > 0 || children.length > 0)
  }

  set(pathsInfo) {
    this.pathsInfo = pathsInfo

    const { currents, parents, children } = this.manipulateTargets

    ;[currents, parents, children].forEach(targets => {
      targets.forEach(target => target.set())
    })
  }

  unset() {
    this.pathsInfo = null

    const { currents, parents, children } = this.manipulateTargets

    ;[currents, parents, children].forEach(targets => {
      targets.forEach(target => target.unset())
    })
  }
}
