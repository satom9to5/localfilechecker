export const find = (name, keys, callback) => {
  if (!keys) {
    callback(null)
    return
  }

  if (Array.isArray(keys) && keys.length == 0) {
    callback(null)
    return
  }

  const values = {
    name,
    keys,
  }

  chrome.runtime.sendMessage(values, (res) => {
    callback(res)
  })
}
