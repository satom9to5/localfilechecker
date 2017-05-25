import $ from 'jquery'

const actions = {
  popup_info: (manipulateElement, $element) => {
    return [
      {
        action: "css",
        args: [
          {
            color: "red"
          }
        ]
      },
      {
        action: "hover",
        args: [
          () => {
            const $targetElement = popupElement()

            $targetElement.html(`<p>${manipulateElement.info.getFilesString()}</p>`)

            if ($targetElement.css('display') != 'none') {
              $targetElement.hide()
            } else {
              const offset = $(manipulateElement.element).offset()
              $targetElement.show().offset({
                 top: offset.top - $targetElement.height() - 15,
                 left: offset.left
              })
            }
          },
        ]
      }
    ]
  },
  exist_icon: (manipulateElement, $element) => {
    const fileExistElement = "<span class='localfilecheck__exist_icon'>File Exists</span>"

    return [
      {
        action: "append",
        args: [
          fileExistElement
        ] 
      }
    ]
  },
}

export const actionTypes = Object.getOwnPropertyNames(actions)

const definedActions = (targetAction, manipulateElement, $element) => {
  if (actions.hasOwnProperty(targetAction.type)) {
    return actions[targetAction.type](manipulateElement, $element)
  } else {
    return targetAction
  }
}

const addClassAction = (className) => {
  return {
    action: "addClass",
    args: [className],
  }
}

const popupElement = () => {
  let $element = $("#localfilecheck_popup") 

  if ($element.length == 0) {
    $element = $("<div id='localfilecheck_popup'></div>")
    $(body).append($element)
  }

  return $element
}

export default definedActions
