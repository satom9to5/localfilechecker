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
    this.elements.push(element) 
  }

  isDuplicate(element) {
    return this.elements.filter(target => target == element).length > 0
  }
}

export default Targets
