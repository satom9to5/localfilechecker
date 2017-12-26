import AttrsAction from 'content/models/action/AttrsAction'
import AppendAction from 'content/models/action/AppendAction'
import HoverAction from 'content/models/action/HoverAction'

const classes = {
  AttrsAction,
  AppendAction,
  HoverAction,
}

const createAction = (element, action) => {
  const actionClass = `${action.type.charAt(0).toUpperCase()}${action.type.slice(1)}Action`

  return new classes[actionClass](element, action.args)
}

export default createAction
