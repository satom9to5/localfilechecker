class Storage {
  get(key) {
    return new Promise(resolve => {
      chrome.storage.local.get(key, data => {
        if (typeof key == "string") {
          resolve(data[key]) 
        } else {
          resolve(data) 
        }
      })
    })
  }

  set(value) {
    return new Promise(resolve => {
      chrome.storage.local.set(value, () => {
        resolve(value) 
      })
    })
  }

  clear() {
    return new Promise(resolve => {
      chrome.storage.local.clear(() => {
        resolve(null)
      })
    })
  }
}

const storage = new Storage()
Object.freeze(storage)

export default storage
