import React, { Component } from 'react'

import getPlaceholder from 'libs/getPlaceholder'

export default class ServerConfig extends Component {
  onChangeField(e) {
    this.setState({ 
      [e.target.name]: e.target.value
    })
  }

  componentWillMount() {
    this.setState({
       port: "4000",
       logPath: "",
    })
  }

  render() {
    const { port, logPath } = this.state

    return (
      <section>
        <h3>Server</h3>

        <table>
          <tbody>
            <tr>
              <td>
                <label htmlFor="port">listen port</label>
              </td>
              <td>
                <input type="number" name="port" placeholder="4000" value={port} onChange={::this.onChangeField} />
              </td>
            </tr>
      
            <tr>
              <td>
                <label htmlFor="logPath">log file path</label>
              </td>
              <td>
                <input type="text" name="log_path" placeholder={getPlaceholder("log_path")} value={logPath} onChange={::this.onChangeField} />
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    )
  }
}

