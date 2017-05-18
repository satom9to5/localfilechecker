import Message from 'libs/Message'

export const find = (name, keys, callback) => {
  if (!keys) {
    callback(null)
    return
  }

  if (Array.isArray(keys) && keys.length == 0) {
    callback(null)
    return
  }

  const message = new Message("find", {
    name,
    keys,
  })

  chrome.runtime.sendMessage(message, (res) => {
    callback(res)
  })
}

export const addTab = (name) => {
  const message = new Message("addTab", name)

  chrome.runtime.sendMessage(message, (res) => {
    console.log(res)
  })
}
