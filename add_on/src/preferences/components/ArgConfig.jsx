import React, { Component } from 'react'

export default class ArgConfig extends Component {
  onChangeField(e) {
    const { value } = this.props // form value
    const { index } = this.props // other value
    const { changeArgConfig } = this.props // function

    changeArgConfig(index, e.target.value)
  }

  render() {
    const { arg } = this.props
    const { type, index, disabled } = this.props
    const { removeArgConfig } = this.props

    return (
      <tr>
        <th>
          <label htmlFor="arg">attrs of action</label>
        </th>
        <td>
          <textarea name="arg" placeholder="{ color: red }" rows="20" cols="50" value={arg} disabled={disabled} onChange={::this.onChangeField} />

          <button type="button" onClick={() => removeArgConfig(index)}>Delete arg</button>
        </td>
      </tr>
    )
  }
}
