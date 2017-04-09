import React, { Component } from 'react'

import getPlaceholder from 'libs/getPlaceholder'
import storage from 'libs/storage'

export default class ServerConfig extends Component {
  onChangeField(e) {
    this.setState({ 
      [e.target.name]: e.target.value
    })
  }

  save() {
    const { port, logpath, pidfile } = this.state


    storage.set({
      port,
      logpath,
      pidfile
    }).then(() => {
      const { backHome } = this.props

      backHome()
    })
  }

  componentWillMount() {
    const { port, logpath, pidfile } = this.props

    this.setState({
      port,
      logpath,
      pidfile
    })
  }

  render() {
    const { port, logpath, pidfile } = this.state // values
    const { backHome } = this.props // functions

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
                <label htmlFor="logpath">log file path</label>
              </td>
              <td>
                <input type="text" name="logpath" placeholder={getPlaceholder("log_path")} value={logpath} onChange={::this.onChangeField} />
              </td>
            </tr>

            <tr>
              <td>
                <label htmlFor="pidfile">pid file path</label>
              </td>
              <td>
                <input type="text" name="pidfile" placeholder={getPlaceholder("pidfile")} value={pidfile} onChange={::this.onChangeField} />
              </td>
            </tr>
          </tbody>
        </table>

        <button type="submit" onClick={::this.save}>Submit</button>
        <button type="button" onClick={backHome}>Cancel</button>
      </section>
    )
  }
}

