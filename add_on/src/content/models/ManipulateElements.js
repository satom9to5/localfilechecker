import ManipulateElement from 'content/models/ManipulateElement'

export default class ManipulateElements {
  constructor() {
    this.elements = {} 
  }

  gets(query) {
    return this.elements[query] || []
  }

  add(key, manipulate, element) {
    const { query } = manipulate
    const { _manipulateElement } = element

    if (_manipulateElement) {
      _manipulateElement.key = key
    } else {
      if (!(this.elements.hasOwnProperty(query))) {
        this.elements[query] = []
      }

      ManipulateElement.create(key, manipulate, element)
      this.elements[query].push(element)
    }
  }

  unsetAll() {
    Object.getOwnPropertyNames(this.elements).forEach(query => {
      this.elements[query]
        .filter(element => element.hasOwnProperty('_manipulateElement') && element._manipulateElement.visible())
        .forEach(element => {
          element._manipulateElement.unset()
        })
    })
  }
}
