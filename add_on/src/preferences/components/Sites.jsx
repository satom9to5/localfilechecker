import React, { Component } from 'react'

export default class Sites extends Component {
  render() {
    const { sites } = this.props // values
    const { newSiteConfig, editSiteConfig, removeSiteConfig } = this.props // functions

    return (
      <section>
        <div style={{ width: "100%", minHeight: "20px" }}>
          <h2>
            Sites

            <div className="float_right">
              <button type="button" onClick={newSiteConfig}>New</button>
            </div>
          </h2>

          <table style={{ border: "solid 1px" }}>
            <tbody>
              <tr>
                <th>name</th>
                <th>host</th>
                <th>directory</th>
                <th></th>
              </tr>

              {Object.getOwnPropertyNames(sites).map(name => {
                const site = sites[name]

                return (
                  <tr key={site.name} onClick={() => editSiteConfig(site)}>
                    <td>{site.name}</td>
                    <td>{site.host}</td>
                    <td>{site.file.directory}</td>
                    <td><button type="button" onClick={(e) => removeSiteConfig(e, site)}>Remove</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    )
  }
}
