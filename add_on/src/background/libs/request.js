import { sendMessage } from 'background/libs/tabs'

export const find = (params) => {
  if (Array.isArray(params.keys)) {
    return findMulti(params)
  } else {
    return findSingle(params)
  } 
}

const findSingle = (params) => {
  const { name, keys } = params

  return fetchServer("GET", `http://localhost:4000/${name}/$[keys}`) 
}

const findMulti = (params) => {
  const { name, keys } = params

  return fetchServer("POST", `http://localhost:4000/${name}`, keys) 
}

export const health = () => {
  return fetchServer("GET", "http://localhost:4000/health")
}

export const notify = () => {
  const socket = new WebSocket(`ws://localhost:4000/notify`)

  socket.addEventListener('open', event => {
    console.log('websocket opened.')
  })

  socket.addEventListener('message', event => {
    if (!event || !event.data) {
      return
    }

    const eventInfo = JSON.parse(event.data)
    sendMessage(eventInfo)
  })

  return true
}

const fetchServer = (method, url, values = null) => {
  const headers = new Headers({
    "Content-Type": "application/json"
  })

  const options = {
    method: method,
    headers: headers,
  }

  switch (method) {
    case "POST":
      options.body = JSON.stringify(values)
      break
  }

  return fetch(url, options)
}
