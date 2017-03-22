import sitesYml from 'config/sites.yml'

class SiteConfig {
  loadYml(name) {
    if (!name || name == "") {
      return null
    }

    const sites = sitesYml.filter(site => site.name == name)

    if (sites.length == 0) {
      return null
    }

    const site = sites[0]
    let preId = null

    site.target = Object.assign(site.target, 
      ["current", "parents", "children"].reduce((target, name) => {
        const manipulates = site.target[name]

        if (!Array.isArray(manipulates) || manipulates.length == 0) {
          return target
        }

        target[name] = manipulates.map(manipulate => Object.getOwnPropertyNames(manipulate).reduce((conf, key)=> {
          // convert Object to String
          const val = manipulate[key]

          if (val instanceof Object) {
            conf[key] = JSON.stringify(val)
          } else {
            conf[key] = val
          }

          return conf 
        }, {})).map(manipulate => {
          // append unique id.
          let id = null
          do {
            id = Date.now()
          } while (id == preId)
          
          manipulate.id = preId = id

          return manipulate
        })

        return target
      }, {})
    )

    return site
  }
}

const siteConfig = new SiteConfig()
Object.freeze(siteConfig)

export default siteConfig
