import React, { Component } from 'react'

class ManipulateConfig extends Component {
  onChangeField(e) {
    const { type, index } = this.props
    const { changeManipulateConfig } = this.props

    changeManipulateConfig(type, index, e.target.name, e.target.value)
  }

  render() {
    const { value: { id, filter, query, action, args } } = this.props
    const { type, index } = this.props
    const { removeManipulateConfig } = this.props

    return (
      <div style={{ border: "solid 1px" }}>
        <h4>No.{index + 1}</h4>

        <table>
          <tbody>
            <tr>
              <td>
                <label htmlFor="query">query selector (jQuery selector)</label>
              </td>
              <td>
                {type == "current" ?
                  <input type="text" name="filter" placeholder="span.title" value={filter} onChange={::this.onChangeField} />
                :
                  <input type="text" name="query" placeholder="span.title" value={query} onChange={::this.onChangeField} />
                }
              </td>
            </tr>
    
            <tr>
              <td>
                <label htmlFor="action">action (jQuery function)</label>
              </td>
              <td>
                <input type="text" name="action" placeholder="css" value={action} onChange={::this.onChangeField} />
              </td>
            </tr>
    
            <tr>
              <td>
                <label htmlFor="args">attrs of action</label>
              </td>
              <td>
                <textarea name="args" placeholder="{ color: red }" rows="20" cols="50" value={args} onChange={::this.onChangeField} />
              </td>
            </tr>
          </tbody>
        </table>

        <button type="button" onClick={() => removeManipulateConfig(type, id)}>Delete</button>
      </div>
    )
  }
}

export default ManipulateConfig
