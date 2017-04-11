import React, { Component } from 'react'

import ServerConfig from 'preferences/components/ServerConfig'
import Sites from 'preferences/components/Sites'
import SiteConfig from 'preferences/components/SiteConfig'

import storage from 'libs/storage'

export default class Main extends Component {
  editServerConfig() {
    this.setState({
      view: "editServerConfig"
    })
  }

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

  importConfig(e) {
    e.stopPropagation()

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result != "string") {
        return
      } 

      const conf = JSON.parse(reader.result)
      if (conf instanceof Object) {
        storage.set(conf).then(() => {
          this.setConfig()
        })
      }
    }

    reader.readAsText(e.target.files[0])
  }

  exportConfig() {
    storage.get(null).then(conf => {
      const blob = new Blob([ JSON.stringify(conf) ], { type: 'text/plain' })
      const a = document.createElement('a')
        
      a.href = window.URL.createObjectURL(blob)
      a.download = 'localfilecheck.json'
      a.click()
    })    
  }

  clearConfig(e) {
    e.stopPropagation()

    if (!confirm("clear OK?")) {
      return
    }

    storage.clear().then(() => {
      this.setConfig()
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

      return storage.set({
        sites: newSites
      })
    }).then(() => {
      this.setConfig()
    })
  }

  backHome() {
    this.setState({
      view: null,
      editSite: null,
    })

    this.setConfig()
  }

  setConfig() {
    storage.get(['port', 'logpath', 'pidfile', 'sites']).then(conf => {
      const { port, logpath, pidfile, sites } = conf

      this.setState({
        port: port || "4000",
        logpath,
        pidfile,
        sites: sites || {}
      })
    })
  }

  renderByView() {
    const { view, port, logpath, pidfile, sites, editSite } = this.state

    switch (view) {
    case "editServerConfig":
      return <ServerConfig
        port={port}
        logpath={logpath}
        pidfile={pidfile}
        backHome={::this.backHome}
      /> 
      break
    case "newSiteConfig":
      return <SiteConfig backHome={::this.backHome} />
      break
    case "editSiteConfig":
      return <SiteConfig site={editSite} backHome={::this.backHome} />
      break
    default:
      return (
        <div>
          <section>
            <div>
              Import: <input type="file" onChange={::this.importConfig} /><br />
              Export: <button type="button" onClick={::this.exportConfig}>Export</button><br />
              Clear: <button type="button" onClick={::this.clearConfig}>Clear</button>
            </div>
          </section>

          <section>
            <h2>
              Server
            </h2>

            <div>
              <span>listen port: </span>
              <span>{port}</span>
            </div>
            <div>
              <span>log file path: </span>
              <span>{logpath}</span>
            </div>
            <div>
              <span>pid file path: </span>
              <span>{pidfile}</span>
            </div>

              <button type="button" onClick={::this.editServerConfig}>Edit</button>
          </section>

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
  }

  componentWillMount() {
    this.setState({
      view: null,
      port: "4000",
      logpath: "",
      pidfile: "",
      sites: {},
      editSite: null,
    })

    this.setConfig()
  }

  render() {
    return (
      <article>
        {this.renderByView()}
      </article>
    )
  }
}
