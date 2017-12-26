import definedActions from 'content/libs/definedActions'
import createAction from 'content/models/createAction'

export default class ManipulateTargetActions {
  constructor(element, target, pathsInfo) {
    this.actions = [].concat(...(target.actions.map(action => definedActions(action, element, pathsInfo))))
                     .map(action => createAction(element, action))
  }

  set() {
    this.actions.forEach(action => action.set())
  }

  unset() {
    this.actions.forEach(action => action.unset())
  }
}
