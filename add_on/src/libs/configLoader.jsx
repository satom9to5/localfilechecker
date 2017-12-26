import sitesYml from 'config/sites.yml'

import uniqueId from 'libs/uniqueId'

class ConfigLoader {
  loadYml(name) {
    if (!name || name == "") {
      return null
    }

    const sites = sitesYml.filter(site => site.name == name)

    if (sites.length == 0) {
      return null
    }

    const site = sites[0]

    site.manipulates = site.manipulates.map(manipulate => {
      // unique id
      manipulate.id = uniqueId()

      // convert value & append id
      return Object.assign(manipulate,
        ["currents", "parents", "children"].reduce((obj, name) => {
          const targets = manipulate[name]

          if (!Array.isArray(targets) || targets.length == 0) {
            return obj
          }

          // targets = currents/parents/children array
          obj[name] = targets.map(target => Object.getOwnPropertyNames(target).reduce((conf, key) => {
            // convert Object to String
            conf[key] = this.convertValue(target[key])

            return conf 
          }, {})).map(target => {
            // unique id
            target.id = uniqueId()

            target.actions = target.actions.map(action => {
              action.id = uniqueId()

              return action
            })

            return target
          })

          return obj
        }, {})
      )
    })

    return site
  }

  convertValue(value) {
    switch (true) {
    case (Array.isArray(value)):
      return value.map(val => this.convertValue(val))

      break
    case (value instanceof Object):
      if (Object.getOwnPropertyNames(value).filter(key => {
         return (value[key] instanceof Object)
      }).length > 0) {
        return Object.getOwnPropertyNames(value).reduce((conf, key) => {
          conf[key] = this.convertValue(value[key])
          
          return conf
        }, {})
      } else {
        return value
      }

      break
    default:
      return value

      break
    }
  }
}

const configLoader = new ConfigLoader()
Object.freeze(configLoader)

export default configLoader
