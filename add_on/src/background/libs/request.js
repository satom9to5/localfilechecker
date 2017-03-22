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
