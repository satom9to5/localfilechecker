import React, { Component } from 'react'

import ServerConfig from 'preferences/components/ServerConfig'
import Sites from 'preferences/components/Sites'
import SiteConfig from 'preferences/components/SiteConfig'

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

    chrome.storage.local.remove(site.name, () => {
      chrome.storage.local.get(null, sites => {
        this.setState({
          sites
        })
      })
    })
  }

  backHome() {
    this.setState({
      view: null,
      editSite: null,
    })

    chrome.storage.local.get(null, sites => {
      this.setState({
        sites
      })
    })
  }

  componentWillMount() {
    this.setState({
      view: null,
      sites: {},
      editSite: null,
    })

    chrome.storage.local.get(null, sites => {
      this.setState({
        sites
      })
    })
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
