export default class HoverAction {
  constructor(element, args = []) {
    this.element   = element
    this.enterFunc = args[0]
    this.leaveFunc = args[1] || args[0]
  }

  set() {
    if (typeof this.enterFunc == 'function') {
      this.element.addEventListener('mouseenter', this.enterFunc)
    }

    if (typeof this.leaveFunc == 'function') {
      this.element.addEventListener('mouseleave', this.leaveFunc)
    }
  }

  unset() {
    if (typeof this.enterFunc == 'function') {
      this.element.removeEventListener('mouseenter', this.enterFunc)
    }

    if (typeof this.leaveFunc == 'function') {
      this.element.removeEventListener('mouseleave', this.leaveFunc)
    }
  }
}
