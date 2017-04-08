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

  set(key, value) {
    const setValue = {[key]: value}

    return new Promise(resolve => {
      chrome.storage.local.set(setValue, () => {
        resolve(setValue) 
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
