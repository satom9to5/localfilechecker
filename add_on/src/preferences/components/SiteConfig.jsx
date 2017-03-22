import React, { Component } from 'react'
import { toPath } from 'lodash'

import ManipulateConfig from 'preferences/components/ManipulateConfig'

import configLoader from 'libs/configLoader'
import getPlaceholder from 'libs/getPlaceholder'

import sitesYml from 'config/sites.yml'

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

  addManipulateConfig(type) {
    const { target } = this.state

    this.setState({
      target: Object.assign(target, {
        [type]: target[type].concat({
          id: Date.now(),
          filter: "",
          query: "",
          action: "",
          args: "",
        })  
      })
    })
  }

  changeManipulateConfig(type, index, key, value) {
    const { target } = this.state

    const manipulates = target[type]

    this.setState({
      target: Object.assign(target, {
        [type]: Object.assign(manipulates, {
          [index]: Object.assign(manipulates[index], {
            [key]: value
          })
        })
      })
    })
  }

  removeManipulateConfig(type, id) {
    const { target } = this.state

    this.setState({
      target: Object.assign(target, {
        [type]: target[type].filter(value => value.id != id)
      })
    })
  }

  save() {
    const { backHome } = this.props // functions

    const { name } = this.state 

    if (name) {
      chrome.storage.local.set({
        [name]: this.state      
      })
    }

    backHome()
  }

  componentWillMount() {
    const { site } = this.props

    if (site) {
      this.setState(site)
    } else {
      this.setState({
        name: "",
        host: "",
        match: {
          pattern: "",
          matchnum: ""
        },
        target: {
          type: "",
          query: "",
          attr: "",
          current: [],
          parents: [],
          children: []
        },
        file: {
          directory: "",
          pattern: "",
          matchnum: ""
        }
      })
    }
  }

  render() {
    const { backHome } = this.props // functions

    const { name, host, match, target, file } = this.state

    const placeholder = sitesYml.filter(config => config.name == "youtube")[0]

    return (
      <section>
        <div>
          <h3>Base</h3>

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
          <h3>Manipulate DOM</h3>

          <table>
            <tbody>
              <tr>
                <td>
                  <label htmlFor="target[query]">target html tag</label>
                </td>
                <td>
                  <input type="text" name="target[query]" placeholder={placeholder.target.query} value={target.query} onChange={::this.onChangeField} />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="target[attr]">target element attr</label>
                </td>
                <td>
                  <input type="text" name="target[attr]" placeholder={placeholder.target.attr} value={target.attr} onChange={::this.onChangeField} />
                </td>
              </tr>
            </tbody>
          </table>

          <div>
            <h4>target manipulate</h4>

            {target.current.map((currentConf, index) => 
               <ManipulateConfig
                 type="current"
                 value={currentConf}
                 changeManipulateConfig={::this.changeManipulateConfig}
                 removeManipulateConfig={::this.removeManipulateConfig}
                 index={index}
                 key={currentConf.id}
               />
            )}

            <button type="button" onClick={() => this.addManipulateConfig("current")}>add</button>
          </div>

          <div>
            <h4>target parents manipulate</h4>

            {target.parents.map((parentConf, index) =>
              <ManipulateConfig
                type="parents"
                value={parentConf}
                changeManipulateConfig={::this.changeManipulateConfig}
                removeManipulateConfig={::this.removeManipulateConfig}
                index={index}
                key={parentConf.id}
              />
            )}

            <button type="button" onClick={() => this.addManipulateConfig("parents")}>add</button>
          </div>

          <div>
            <h4>target children manipulate</h4>

            {target.children.map((childConf, index) => 
              <ManipulateConfig
                type="children"
                value={childConf}
                changeManipulateConfig={::this.changeManipulateConfig}
                removeManipulateConfig={::this.removeManipulateConfig}
                index={index}
                key={childConf.id}
              />
            )}

            <button type="button" onClick={() => this.addManipulateConfig("children")}>add</button>
          </div>
        </div>

        <div>
          <h3>Local Directory</h3>

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

          <button type="submit" onClick={::this.save}>Submit</button>
          <button type="button" onClick={backHome}>Cancel</button>
        </div>
      </section>
    )
  }
}
