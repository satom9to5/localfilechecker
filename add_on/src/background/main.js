import { find } from 'background/libs/request'

const browser = window.chrome || window.browser

browser.runtime.onMessage.addListener((req, sender, callback) => {
  find(req)
  .then(res => {
    if (res.ok) {
      return res.json()
    } else {
      return null
    }
  })
  .then(json => callback(json))

  // for asynchronous
  return true
})

