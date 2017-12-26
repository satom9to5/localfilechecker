import React, { Component } from 'react'

import ManipulateConfig from 'preferences/components/ManipulateConfig'

import uniqueId from 'libs/uniqueId'

export default class TargetConfig extends Component {
  onChangeField(e) {
    const { value } = this.props // form value
    const { index } = this.props // other value
    const { changeTargetConfig } = this.props // function

    changeTargetConfig(index, Object.assign({}, value, {
      [e.target.name]: e.target.value 
    }))
  }

  // called from child component.
  addManipulateConfig(type) {
    const { value } = this.props // form value
    const { index } = this.props // other value
    const { changeTargetConfig } = this.props // function

    if (!value.hasOwnProperty(type)) {
      return
    }

    const manipulates = value[type]

    changeTargetConfig(index, Object.assign({}, value, {
      [type]: manipulates.concat({
        id: uniqueId(),
        filter: "",
        query: "",
        actions: [
          {
            id: uniqueId(),
            type: "",
            action: "",
            args: [""],
          }
        ]
      })
    })) 
  }

  // called from child component.
  changeManipulateConfig(type, mIndex, manipulate) {
    const { value } = this.props // form value
    const { index } = this.props // other value
    const { changeTargetConfig } = this.props // function

    if (!value.hasOwnProperty(type)) {
      return
    }

    const manipulates = value[type]

    changeTargetConfig(index, Object.assign({}, value, {
      [type]: Object.assign([], manipulates, {
        [mIndex]: manipulate
      })
    }))
  }

  // called from child component.
  removeManipulateConfig(type, id) {
    const { value } = this.props // form value
    const { index } = this.props // other value
    const { changeTargetConfig } = this.props // function

    if (!value.hasOwnProperty(type)) {
      return
    }

    const manipulates = value[type]

    changeTargetConfig(index, Object.assign({}, value, {
      [type]: manipulates.filter(value => value.id != id)
    }))
  }

  render() {
    const { value: { id, query, attr, current, parents, children } } = this.props // form value
    const { index, disabled } = this.props // other value
    const { removeTargetConfig } = this.props // functions

    return (
      <div className="form_section">
        <h4>Target {index + 1}</h4>

        <table style={{ marginBottom: '8px' }}>
          <tbody>
            <tr>
              <th>
                <label htmlFor="query">target html tag</label>
              </th>
              <td>
                <input type="text" name="query" placeholder="a" value={query} disabled={disabled} onChange={::this.onChangeField} />
              </td>
            </tr>

            <tr>
              <th>
                <label htmlFor="attr">target element attr</label>
              </th>
              <td>
                <input type="text" name="attr" placeholder="href" value={attr} disabled={disabled} onChange={::this.onChangeField} />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="form_section">
          <h4>target manipulate</h4>

          {current.map((currentConf, index) => 
             <ManipulateConfig
               type="current"
               value={currentConf}
               disabled={disabled}
               changeManipulateConfig={::this.changeManipulateConfig}
               removeManipulateConfig={::this.removeManipulateConfig}
               index={index}
               key={currentConf.id}
             />
          )}

          <button type="button" onClick={() => this.addManipulateConfig("current")}>Add current</button>
        </div>

        <div className="form_section">
          <h4>target parents manipulate</h4>

          {parents.map((parentConf, index) =>
            <ManipulateConfig
              type="parents"
              value={parentConf}
              disabled={disabled}
              changeManipulateConfig={::this.changeManipulateConfig}
              removeManipulateConfig={::this.removeManipulateConfig}
              index={index}
              key={parentConf.id}
            />
          )}

          <button type="button" onClick={() => this.addManipulateConfig("parents")}>Add parents</button>
        </div>

        <div className="form_section">
          <h4>target children manipulate</h4>

          {children.map((childConf, index) => 
            <ManipulateConfig
              type="children"
              value={childConf}
              disabled={disabled}
              changeManipulateConfig={::this.changeManipulateConfig}
              removeManipulateConfig={::this.removeManipulateConfig}
              index={index}
              key={childConf.id}
            />
          )}

          <button type="button" onClick={() => this.addManipulateConfig("children")}>Add children</button>
        </div>

        <button type="button" onClick={() => removeTargetConfig(id)}>Delete Target {index + 1}</button>
      </div>
    )
  }
}
