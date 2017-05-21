import React, { Component } from 'react'

import ArgConfig from 'preferences/components/ArgConfig'

export default class ActionConfig extends Component {
  onChangeField(e) {
    const { value } = this.props // form value
    const { index } = this.props // other value
    const { changeTargetConfig } = this.props // function

    changeTargetConfig(index, Object.assign({}, value, {
      [e.target.name]: e.target.value 
    }))
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
    const { value: { id, action, args_type, args } } = this.props
    const { type, index } = this.props
    const { removeActionConfig } = this.props

    return (
      <div style={{ border: "solid 1px", padding: "5px" }}>
        <h4 style={{ backgroundColor: "#CCC" }}>Action {index + 1}</h4>

        <div>
          <table>
            <tbody>
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
                  <label htmlFor="args_type">use registed attrs of custom action (empty is custom)</label>
                </td>
                <td>
                  <input type="text" name="args_type" placeholder="" value={args_type} onChange={::this.onChangeField} />
                </td>
              </tr>
    
              {args.map((arg, index) => 
                <ArgConfig
                  arg={arg}
                  index={index}
                  key={index}
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
