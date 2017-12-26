import React, { Component } from 'react'

import ActionConfig from 'preferences/components/ActionConfig'

import uniqueId from 'libs/uniqueId'

export default class ManipulateConfig extends Component {
  onChangeField(e) {
    const { value } = this.props // form value
    const { type, index } = this.props // other value
    const { changeManipulateConfig } = this.props // function

    changeManipulateConfig(type, index, Object.assign({}, value, {
      [e.target.name]: e.target.value
    }))
  }

  // called from child component.
  addActionConfig() {
    const { value } = this.props // form value
    const { type, index } = this.props // other value
    const { changeManipulateConfig } = this.props // function

    changeManipulateConfig(type, index, Object.assign({}, value, {
      actions: value.actions.concat({
        id: uniqueId(),
        type: "",
        action: "",
        args: [""],
      })
    }))
  }

  // called from child component.
  changeActionConfig(aIndex, action) {
    const { value } = this.props // form value
    const { type, index } = this.props // other value
    const { changeManipulateConfig } = this.props // function

    changeManipulateConfig(type, index, Object.assign({}, value, {
      actions: Object.assign([], value.actions, {
        [aIndex]: action
      }) 
    }))
  }

  // called from child component.
  removeActionConfig(id) {
    const { value } = this.props // form value
    const { type, index } = this.props // other value
    const { changeManipulateConfig } = this.props // function

    changeManipulateConfig(type, index, Object.assign({}, value, {
      actions: value.actions.filter(value => value.id != id) 
    }))
  }

  render() {
    const { value: { id, filter, query, actions } } = this.props
    const { type, index, disabled } = this.props
    const { removeManipulateConfig } = this.props

    return (
      <div className="form_section">
        <h4>{type} {index + 1}</h4>

        <div>
          <table>
            <tbody>
              <tr>
                <th>
                  <label htmlFor="query">query selector (jQuery selector)</label>
                </th>
                <td>
                  <input type="text" name={type == "current" ? "filter" : "query"} placeholder="span.title" value={query} disabled={disabled} onChange={::this.onChangeField} />
                </td>
              </tr>
            </tbody>
          </table>
    
          {actions.map((action, index) => 
            <ActionConfig
              value={action}
              disabled={disabled}
              index={index}
              key={action.id}
              changeActionConfig={::this.changeActionConfig}
              removeActionConfig={::this.removeActionConfig}
            />
          )}

          <button type="button" onClick={() => this.addActionConfig()}>Add action</button>
        </div>

        <button type="button" onClick={() => removeManipulateConfig(type, id)}>Delete {type} {index + 1}</button>
      </div>
    )
  }
}
