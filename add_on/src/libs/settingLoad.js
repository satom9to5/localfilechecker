import storage from 'libs/storage'
import configLoader from 'libs/configLoader'

// convert string to JSON
const convertArgs = (args) => {
  if (typeof args != "string") {
    return args
  }

  args = args.trim()

  switch (args.substr(0, 1)) {
    case '{':
      if (args.substr(-1) != '}') {
        return args
      } 

      return JSON.parse(args)
      break
    case '[':
      if (args.substr(-1) != ']') {
        return args
      } 

      return JSON.parse(args)
      break
    default:
      return args
      break
  }
}

const convertManipulates = (target) => {
  switch (true) {
  case (Array.isArray(target)):
    return target.map(val => convertManipulates(val))
    break
  case (target instanceof Object):
    return Object.getOwnPropertyNames(target).reduce((obj, name) => {
      obj[name] = convertManipulates(target[name])
     
      return obj
    }, {})

    break
  default:
    return convertArgs(target)
    break
  }
}

const initSetting = (setting) => {
  // use sites.yml setting
  if (!(setting.is_custom)) {
    const site = configLoader.loadYml(setting.name)

    if (site) {
      setting = Object.assign({}, site, { file: setting.file })
    }
  }

  setting.match.regexp = new RegExp(setting.match.pattern)

  setting.manipulates = setting.manipulates.map(manipulate => {
    manipulate.currents = convertManipulates(manipulate.currents)
    manipulate.parents  = convertManipulates(manipulate.parents)
    manipulate.children = convertManipulates(manipulate.children)
    
    return manipulate
  })

  return setting
}

const settingLoad = (callback) => {
  storage.get('sites').then(sites => {
    if (!sites || !(sites instanceof Object)) {
      return null
    }

    const targetNames = Object.getOwnPropertyNames(sites).filter(name => {
      return sites[name].host == location.origin
    })

    if (!targetNames || targetNames.length != 1) {
      return null
    }

    return sites[targetNames[0]]
  }).then(setting => {
    if (!setting) {
      callback(null)
      return
    }

    callback(initSetting(setting))
  })
}

export default settingLoad
