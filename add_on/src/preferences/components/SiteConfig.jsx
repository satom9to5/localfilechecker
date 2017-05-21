import React, { Component } from 'react'
import { toPath } from 'lodash'

import TargetConfig from 'preferences/components/TargetConfig'

import configLoader from 'libs/configLoader'
import getPlaceholder from 'libs/getPlaceholder'
import storage from 'libs/storage'
import uniqueId from 'libs/uniqueId'

import sitesYml from 'config/sites.yml'

const defaultTarget = {
  type: "",
  query: "",
  attr: "",
  current: [],
  parents: [],
  children: []
}

export default class SiteConfig extends Component {
  onChangeField(e) {
    const paths = toPath(e.target.name)

    const lastPath = paths[paths.length - 1]
    const nestPaths = paths.slice(0, -1)

    const prev = this.state
    const next = {}

    let prevVal = prev
    let nextVal = next

    nestPaths.forEach(path => {
      nextVal[path] = Object.assign({}, prevVal[path])

      prevVal = prevVal[path]
      nextVal = nextVal[path]
    })

    nextVal[lastPath] = e.target.value

    this.setState(next)
  }

  loadSitesYml(e) {
    const name = e.target.value
    if (name == "") {
      return
    }

    const config = configLoader.loadYml(name)
    if (!config || !(config instanceof Object)) {
      return
    }

    this.setState(config)
  }

  resetConfig() {
    const { original } = this.state

    this.setState({
      targets: Object.assign([], original.targets)
    })
  }

  // called from child component.
  addTargetConfig() {
    const { targets } = this.state

    this.setState({
      targets: targets.concat(Object.assign({}, defaultTarget, {id: uniqueId()}))
    })
  }

  // called from child component.
  changeTargetConfig(index, target) {
    const { targets } = this.state

    this.setState({
      targets: Object.assign([], targets, {
        [index]: target
      })
    })
  }

  // called from child component.
  removeTargetConfig(id) {
    const { targets } = this.state

    this.setState({
      targets: targets.filter(value => value.id != id)
    })
  }

  save() {
    const { backHome } = this.props // functions

    const { name } = this.state 

    if (!name) {
      backHome()
      return
    }

    const site = this.state
    delete site.original
    
    storage.get('sites').then(sites => {
      return storage.set({
        sites: Object.assign({}, sites, {[name]: site})
      })
    }).then(sites => {
      backHome()
    })
  }

  componentWillMount() {
    const { site } = this.props

    if (site) {
      this.setState(site)

      // load default config
      const config = configLoader.loadYml(site.name)
      if (!config || !(config instanceof Object)) {
        return
      }

      this.setState({
        original: config
      })
    } else {
      this.setState({
        name: "",
        host: "",
        match: {
          pattern: "",
          matchnum: ""
        },
        targets: [
          Object.assign({}, defaultTarget, {id: uniqueId()})
        ],
        file: {
          directory: "",
          pattern: "",
          matchnum: ""
        },
        original: null,
      })
    }
  }

  render() {
    const { backHome } = this.props // functions

    const { name, host, match, targets, file } = this.state
    const { original } = this.state

    const placeholder = sitesYml.filter(config => config.name == "youtube")[0]

    return (
      <section>
        <div>
          <h3 style={{ backgroundColor: "#CCC" }}>Base</h3>

          <div style={{ width: "100%", minHeight: "20px" }}>
            <div style={{ float: "right" }}>
              load templates:&nbsp;
              <select name="templates" onChange={::this.loadSitesYml}>
                <option value="">--</option>
                {sitesYml.map(site => 
                  <option value={site.name} key={site.name}>{site.name}</option>
                )}
              </select>
            </div>
          </div>

          <table>
            <tbody>
              <tr>
                <td>
                  <label htmlFor="name">name</label>
                </td>
                <td>
                  <input type="text" name="name" placeholder={placeholder.name} value={name} onChange={::this.onChangeField} />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="host">host</label>
                </td>
                <td>
                  <input type="url" name="host" placeholder={placeholder.host} value={host} onChange={::this.onChangeField} />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="match[pattern]">url match pattern</label>
                </td>
                <td>
                  <input type="text" name="match[pattern]" placeholder={placeholder.match.pattern} value={match.pattern} onChange={::this.onChangeField} />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="match[matchnum]">url matching capture num</label>
                </td>
                <td>
                  <input type="number" name="match[matchnum]" placeholder={placeholder.match.matchnum} value={match.matchnum} onChange={::this.onChangeField} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 style={{ backgroundColor: "#CCC" }}>Local Directory</h3>

          <table>
            <tbody>
              <tr>
                <td>
                  <label htmlFor="file[directory]">directory</label>
                </td>
                <td>
                  <input type="text" name="file[directory]" placeholder={getPlaceholder("file[directory]")} value={file.directory} onChange={::this.onChangeField} />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="file[pattern]">match pattern</label>
                </td>
                <td>
                  <input type="text" name="file[pattern]" placeholder={placeholder.file.pattern} value={file.pattern} onChange={::this.onChangeField} />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="file[matchnum]">matching capture num</label>
                </td>
                <td>
                  <input type="number" name="file[matchnum]" placeholder={placeholder.file.matchnum} value={file.matchnum} onChange={::this.onChangeField} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ border: "solid 1px", padding: "5px" }}>
          <h3 style={{ backgroundColor: "#CCC" }}>Manipulate DOM</h3>

          {original &&
            <div style={{ float: "right" }}>
              <button type="button" onClick={::this.resetConfig}>Reset Config</button>
            </div>
          }

          {targets.map((target, index) => 
            <TargetConfig
              value={target}
              index={index}
              key={target.id}
              changeTargetConfig={::this.changeTargetConfig}
              removeTargetConfig={::this.removeTargetConfig}
            />
          )}

          <button type="button" onClick={() => this.addTargetConfig()}>Add Target</button>
        </div>

        <button type="submit" onClick={::this.save}>Submit</button>
        <button type="button" onClick={backHome}>Cancel</button>
      </section>
    )
  }
}
