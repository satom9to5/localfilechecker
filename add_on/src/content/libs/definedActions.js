import 'content/css/content.css'

const actions = {
  popup_info: (element, pathsInfo = null) => {
    return [
      {
        type: "attrs",
        args: [
          {
            style: {
              color: "red"
            }
          }
        ]
      },
      {
        type: "hover",
        args: [
          () => {
            const targetElement = popupElement()

            // get position of event element
            const elementBox = element.getBoundingClientRect()
            const windowView = element.ownerDocument.defaultView

            // set text
            targetElement.innerHTML     = `<p>${pathsInfo.getFilesString()}</p>`
            targetElement.style.display = 'block'

            // set position
            const targetElementBox   = targetElement.getBoundingClientRect()
            targetElement.style.top  = `${elementBox.top  + windowView.pageYOffset - targetElementBox.height - 15}px`
            targetElement.style.left = `${elementBox.left + windowView.pageXOffset}px`
          },
          () => {
            popupElement().style.display = 'none'
          }
        ]
      }
    ]
  },
  exist_icon: (element, pathsInfo = null) => {
    const fileExistElement     = document.createElement('span')
    fileExistElement.className = 'local_file_check__exist_icon'
    fileExistElement.innerHTML = 'File Exists'

    return [
      {
        type: "append",
        args: [
          fileExistElement
        ] 
      }
    ]
  },
}

const popupElementId = 'local_file_check_popup'
const popupElement = () => {
  const foundElement = document.getElementById(popupElementId)

  if (foundElement) {
    return foundElement
  }

  document.body.insertAdjacentHTML('beforeend', `<div id='${popupElementId}'></div>`)
  return document.getElementById(popupElementId)
}

export const actionTypes = Object.getOwnPropertyNames(actions)

const definedActions = (action, element, pathsInfo = null) => {
  if (actions.hasOwnProperty(action.type)) {
    // convert
    return actions[action.type](element, pathsInfo)
  }

  if (typeof action == 'array') {
    return action
  }

  return [action]
}

export default definedActions
