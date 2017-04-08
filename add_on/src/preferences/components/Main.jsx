import React, { Component } from 'react'

import ServerConfig from 'preferences/components/ServerConfig'
import Sites from 'preferences/components/Sites'
import SiteConfig from 'preferences/components/SiteConfig'

import storage from 'libs/storage'

export default class Main extends Component {
  newSiteConfig() {
    this.setState({
      view: "newSiteConfig"
    })
  }

  editSiteConfig(site) {
    this.setState({
      view: "editSiteConfig",
      editSite: site,
    })
  }

  removeSiteConfig(e, site) {
    e.stopPropagation()

    if (!confirm("remove OK?")) {
      return
    }

    storage.get('sites').then(sites => {
      const newSites = sites
      delete newSites[site.name]

      return storage.set('sites', newSites)
    }).then(() => {
      this.setSites()
    })
  }

  clearConfig(e) {
    e.stopPropagation()

    if (!confirm("clear OK?")) {
      return
    }

    storage.clear().then(() => {
      this.setState({
        sites: {}  
      })
    })
  }

  backHome() {
    this.setState({
      view: null,
      editSite: null,
    })

    this.setSites()
  }

  setSites() {
    storage.get('sites').then(sites => {
      this.setState({
        sites: sites ? sites : {}
      })
    })
  }

  componentWillMount() {
    this.setState({
      view: null,
      sites: {},
      editSite: null,
    })

    this.setSites()
  }

  render() {
    const { view, sites, editSite } = this.state

    let component = null
    switch (view) {
    case "newSiteConfig":
      component = (
        <SiteConfig backHome={::this.backHome} />
      )
      break
    case "editSiteConfig":
      component = (
        <SiteConfig site={editSite} backHome={::this.backHome} />
      )
      break
    default:
      component = (
        <div>
          <h2>
            <div style={{ float: "right" }}>
              <button type="button" onClick={::this.clearConfig}>Clear</button>
            </div>
          </h2>

          <ServerConfig /> 
          <Sites
            sites={sites}
            newSiteConfig={::this.newSiteConfig}
            editSiteConfig={::this.editSiteConfig}
            removeSiteConfig={::this.removeSiteConfig}
          />
        </div>
      )
      break
    }

    return (
      <article>
        {component}
      </article>
    )
  }
}
