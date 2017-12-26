export default class AppendAction {
  constructor(element, args = []) {
    this.element        = element
    this.args           = args
    this.appendElements = []
  }

  set() {
    this.appendElements = this.args.map(appendElement => {
      return this.element.parentNode.insertBefore(appendElement, this.element)
    })
  }

  unset() {
    this.appendElements.forEach(appendElement => this.element.parentNode.removeChild(appendElement))

    this.appendElements = []
  }
}
