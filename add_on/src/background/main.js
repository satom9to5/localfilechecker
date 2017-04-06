import { find } from 'background/libs/request'

const browser = window.chrome || window.browser

const watchServerConf = {
  id: 'watchServerStatus',
  running: false,
  title: {
    start: 'Stop watch server',
    stop:  'Start watch server'
  },
  text: {
    start: 'Start',
    stop:  'Stop'
  }
}

const serverRunningCheck = (callback) => {
  browser.runtime.sendNativeMessage("local_file_check", {
    type: "running"
  }, response => {
    if (response && response.success) {
      updateMenu(true)
      callback(true)
    } else {
      callback(false)
    }
  })
}

browser.browserAction.setBadgeText({ text: "Stop" })
browser.browserAction.setBadgeBackgroundColor({ color: "#EE0000" })

serverRunningCheck(() => {
  browser.contextMenus.create({
    id: watchServerConf.id,
    type: 'normal',
    title: watchServerConf.title.stop,
    contexts: ['all'],
    onclick: (info) => {
      let contextMenuTitle = null
      let badgeText        = null
  
      if (watchServerConf.running) {
        serverRunningCheck(running => {
          if (running) {
            browser.runtime.sendNativeMessage("local_file_check", {
              type: "stop"
            }, response => {
              if (response && response.success) {
                updateMenu(false)
              }
            })
          } else {
            updateMenu(false)
          }
        })
      } else {
        browser.storage.local.get(null, sites => {
          if (!sites) {
            return
          }
  
          const configs = Object.getOwnPropertyNames(sites).map(name => {
            const site = sites[name]
  
            return {
              name: site.name,
              directory: site.file.directory,
              pattern: site.file.pattern,
              matchnum: site.file.matchnum,             
            }
          })
  
          browser.runtime.sendNativeMessage("local_file_check", {
            type: "start",
            configs
          }, response => {
            if (response && response.success) {
              updateMenu(true)
            }
          })
        })
      }
    }
  })
})

// Request to Server.
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
  .catch(err => {
    console.log(err)  
  })

  // for asynchronous
  return true
})

const updateMenu = (running) => {
  watchServerConf.running = running

  const stat = running ? 'start' : 'stop'

  browser.contextMenus.update(watchServerConf.id, {
    title: watchServerConf.title[stat]
  })

  browser.browserAction.setBadgeText({ text: watchServerConf.text[stat] })
}
