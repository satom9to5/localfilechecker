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

    site.targets = site.targets.map(target => {
      // unique id
      target.id = uniqueId()

      // convert value & append id
      target = Object.assign(target,
        ["current", "parents", "children"].reduce((obj, name) => {
          const manipulates = target[name]

          if (!Array.isArray(manipulates) || manipulates.length == 0) {
            return obj
          }

          // manipulate = current/parents/children array
          obj[name] = manipulates.map(manipulate => Object.getOwnPropertyNames(manipulate).reduce((conf, key) => {
            // convert Object to String
            conf[key] = this.convertValue(manipulate[key])

            return conf 
          }, {})).map(manipulate => {
            // unique id
            manipulate.id = uniqueId()

            manipulate.actions = manipulate.actions.map(action => {
              action.id = uniqueId()

              return action
            })

            return manipulate
          })

          return obj
        }, {})
      )

      return target
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
        return JSON.stringify(value)
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
