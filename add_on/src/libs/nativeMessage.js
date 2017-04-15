class NativeMessage {
  send(name, value) {
    return new Promise(resolve => {
      chrome.runtime.sendNativeMessage(name, value, response => {
        resolve(response) 
      })
    })
  }
}

const nativeMessage = new NativeMessage()
Object.freeze(nativeMessage)

export default nativeMessage
