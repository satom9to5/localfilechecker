import { find, notify, health } from 'background/libs/request'
import { registTab } from 'background/libs/tabs'

import storage from 'libs/storage'
import nativeMessage from 'libs/nativeMessage'
import platform from 'libs/platform'

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

const serverRunningCheck = () => {
  return storage.get('pidfile')
  .then(pidfile => {
    return nativeMessage.send('local_file_check', {
      type: 'running',
      pidfile
    })
  })
  .then(response => {
    if (response && response.success) {
      // health check
      return health()
    } else {
      return null
    }
  }).then(res => {
    if (!res || !res.ok) {
      return false
    }

    updateMenu(true)
    notify() // connect websocket
    return true
  })
}

const watchServerMenuClickListener = info => {
  if (watchServerConf.running) {
    serverRunningCheck()
    .then(running => {
      if (running) {
        storage.get('pidfile')
        .then(pidfile => { 
          return nativeMessage.send('local_file_check', {
            type: "stop",
            pidfile
          })
        })
        .then(response => {
          if (response && response.success) {
            updateMenu(false)
          }
        })
      } else {
        updateMenu(false)
      }
    })
  } else {
    storage.get(['port', 'logpath', 'pidfile', 'sites'])
    .then(storage => {
      if (!storage || !storage.sites) {
        return
      }

      const { port, logpath, pidfile, sites } = storage

      const configs = Object.getOwnPropertyNames(sites).map(name => {
        const site = sites[name]
  
        return {
          name: site.name,
          directory: site.file.directory,
          pattern: site.file.pattern,
          matchnum: site.file.matchnum,             
        }
      })

      return nativeMessage.send('local_file_check', {
        type: "start",
        port: parseInt(port, 10),
        log: logpath,
        pidfile,
        platform: platform(),
        configs
      })
    })
    .then(response => {
      console.log(response)
      if (response && response.success) {
        updateMenu(true)

        // connect websocket when health ok
        const healthNotify = (wait = 1) => {
          health()
          .then(() => {
            notify() 
          }, () => {
            if (wait <= 16) {
              setTimeout(healthNotify, wait * 2)
            }
          })
        }
        healthNotify()
      }
    })
  }
}

chrome.browserAction.setBadgeText({ text: "Stop" })
chrome.browserAction.setBadgeBackgroundColor({ color: "#EE0000" })

chrome.contextMenus.create({
  id: watchServerConf.id,
  type: 'normal',
  title: watchServerConf.title.stop,
  contexts: ['browser_action'],
  onclick: watchServerMenuClickListener
})

// first check
serverRunningCheck()

// Request to Server.
chrome.runtime.onMessage.addListener((message, sender, callback) => {
  switch (message.type) {
  case "find":
    if (!watchServerConf.running) {
      return false
    }

    find(message.value)
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
    break
  case "addTab":
    registTab(message.value)
    callback(true)
    break
  }

  // for asynchronous
  return true
})

const updateMenu = (running) => {
  watchServerConf.running = running

  const stat = running ? 'start' : 'stop'

  chrome.contextMenus.update(watchServerConf.id, {
    title: watchServerConf.title[stat]
  })

  chrome.browserAction.setBadgeText({ text: watchServerConf.text[stat] })
}

