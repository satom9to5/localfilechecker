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
            action: "",
            args_type: "",
            args: [],
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
    const { index } = this.props // other value
    const { removeTargetConfig } = this.props // functions

    return (
      <div style={{ border: "solid 1px", padding: "5px" }}>
        <h4 style={{ backgroundColor: "#CCC" }}>Target {index + 1}</h4>

        <table>
          <tbody>
            <tr>
              <td>
                <label htmlFor="query">target html tag</label>
              </td>
              <td>
                <input type="text" name="query" placeholder="a" value={query} onChange={::this.onChangeField} />
              </td>
            </tr>

            <tr>
              <td>
                <label htmlFor="attr">target element attr</label>
              </td>
              <td>
                <input type="text" name="attr" placeholder="href" value={attr} onChange={::this.onChangeField} />
              </td>
            </tr>
          </tbody>
        </table>

        <div>
          <h4 style={{ backgroundColor: "#CCC" }}>target manipulate</h4>

          {current.map((currentConf, index) => 
             <ManipulateConfig
               type="current"
               value={currentConf}
               changeManipulateConfig={::this.changeManipulateConfig}
               removeManipulateConfig={::this.removeManipulateConfig}
               index={index}
               key={currentConf.id}
             />
          )}

          <button type="button" onClick={() => this.addManipulateConfig("current")}>Add current</button>
        </div>

        <div>
          <h4 style={{ backgroundColor: "#CCC" }}>target parents manipulate</h4>

          {parents.map((parentConf, index) =>
            <ManipulateConfig
              type="parents"
              value={parentConf}
              changeManipulateConfig={::this.changeManipulateConfig}
              removeManipulateConfig={::this.removeManipulateConfig}
              index={index}
              key={parentConf.id}
            />
          )}

          <button type="button" onClick={() => this.addManipulateConfig("parents")}>Add parents</button>
        </div>

        <div>
          <h4 style={{ backgroundColor: "#CCC" }}>target children manipulate</h4>

          {children.map((childConf, index) => 
            <ManipulateConfig
              type="children"
              value={childConf}
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
