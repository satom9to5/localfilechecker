export default class AttrsAction {
  constructor(element, args = []) {
    this.element  = element
    this.args     = args[0]
    this.oldAttrs = null
  }

  set() {
    // get old attributes
    this.oldAttrs = this.getOldAttrs(this.args)
    // set attributes
    this.setAttrs(this.args)
  }

  unset() {
    if (!(this.oldAttrs)) {
      return
    }

    this.setAttrs(this.oldAttrs)
    this.oldAttrs = null
  }

  getOldAttrs(attrs = {}, element = this.element) {
    if (this.oldAttrs) {
      return this.oldAttrs
    }

    return Object.getOwnPropertyNames(attrs).reduce((obj, key) => {
      if (key in element) {
        if (element[key] instanceof Object) {
          obj[key] = this.getOldAttrs(attrs[key], element[key])
        } else {
          obj[key] = element[key]
        }
      }

      return obj
    }, {})
  }

  setAttrs(attrs = {}, element = this.element) {
    Object.getOwnPropertyNames(attrs)
      .filter(key => key in element)
      .forEach(key => {
        if (attrs[key] instanceof Object) {
          this.setAttrs(attrs[key], element[key])
        } else {
          element[key] = attrs[key]
        }
      })
  }
}
