const tabs     = {}
const tabNames = {}

export const registTab = (name) => {
  chrome.tabs.getSelected(tab => {
    console.log(tab)
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      const name = tabNames[tabId] || null

      if (name && tabs[name] && tabs[name][tabId]) {
        delete tabs[name][tabId]
      }

      if (tabNames[tabId]) {
        delete tabNames[tabId]
      }
    })

    if (!tabs[name]) {
      tabs[name] = {}
    }
    tabs[name][tab.id] = tab
    tabNames[tab.id]   = name
  })
}

export const sendMessage = (eventInfo) => {
  const name = eventInfo.name
  if (!tabs[name]) {
    return
  }

  Object.getOwnPropertyNames(tabs[name]).forEach(tabId => {
    const tab = tabs[name][tabId]
    chrome.tabs.sendMessage(tab.id, eventInfo)
  })
}
