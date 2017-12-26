import React, { Component } from 'react'

import ArgConfig from 'preferences/components/ArgConfig'

import { actionTypes } from 'content/libs/definedActions'

import enableActionsYml from 'config/enable_actions.yml'

export default class ActionConfig extends Component {
  onChangeField(e) {
    const { value } = this.props // form value
    const { index } = this.props // other value
    const { changeActionConfig } = this.props // function

    changeActionConfig(index, Object.assign({}, value, {
      [e.target.name]: e.target.value 
    }))
  }

  onTypeChange(e) {
    const { value } = this.props // form value
    const { index } = this.props // other value
    const { changeActionConfig } = this.props // function

    const changedValue = {
      type: e.target.value
    }

    if (changedValue.type != "" && value.args.length == 0) {
      changedValue.args = [""]
    }

    changeActionConfig(index, Object.assign({}, value, changedValue))
  }

  // called from child component.
  addArgConfig() {
    const { value } = this.props // form value
    const { type, index } = this.props // other value
    const { changeActionConfig } = this.props // function

    changeActionConfig(index, Object.assign({}, value, {
      args: value.args.concat("")
    }))
  }

  // called from child component.
  changeArgConfig(aIndex, arg) {
    const { value } = this.props // form value
    const { type, index } = this.props // other value
    const { changeActionConfig } = this.props // function

    changeActionConfig(index, Object.assign({}, value, {
      args: Object.assign([], value.args, {
        [aIndex]: arg
      })
    }))
  }

  // called from child component.
  removeArgConfig(aIndex) {
    const { value } = this.props // form value
    const { type, index } = this.props // other value
    const { changeActionConfig } = this.props // function

    changeActionConfig(index, Object.assign({}, value, {
      args: value.args.filter((value, index) => index != aIndex)
    }))
  }

  render() {
    const { value: { id, type, action, args } } = this.props // form value
    const { index, disabled } = this.props // other value
    const { removeActionConfig } = this.props // functions

    return (
      <div className="form_section">
        <h4>Action {index + 1}</h4>

        <div>
          <table>
            <tbody>
              <tr>
                <th>
                  <label htmlFor="type">use registed attrs of custom action (empty is custom)</label>
                </th>
                <td>
                  <select name="type" value={type} disabled={disabled} onChange={::this.onTypeChange}>
                    <option value="">--</option>
                    {actionTypes.map(actionType =>
                      <option value={actionType} key={actionType}>{actionType}</option>
                    )}
                  </select>
                </td>
              </tr>

              {type == "" &&
              <tr>
                <th>
                  <label htmlFor="action">action (jQuery function)</label>
                </th>
                <td>
                  <select name="action" value={action} disabled={disabled} onChange={::this.onChangeField}>
                    <option value="">--</option>
                    {enableActionsYml.map(enableAction =>
                      <option value={enableAction} key={enableAction}>{enableAction}</option>
                    )}
                  </select>
                </td>
              </tr>
              }
    
              {type == "" && args.map((arg, index) => 
                <ArgConfig
                  arg={arg}
                  index={index}
                  key={index}
                  disabled={disabled}
                  changeArgConfig={::this.changeArgConfig}
                  removeArgConfig={::this.removeArgConfig} 
                />
              )}
            </tbody>
          </table>

          <button type="button" onClick={() => this.addArgConfig()}>Add arg</button>
        </div>

        <button type="button" onClick={() => removeActionConfig(type, id)}>Delete action {index + 1}</button>
      </div>
    )
  }
}
