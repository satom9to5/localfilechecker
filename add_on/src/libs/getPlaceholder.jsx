const getPlaceholder = (name) => {
  switch (navigator.platform) {
    case "Win32": 
      switch (name) {
        case "log_path":
          return "C:\\cachecheck\\log\\cachecheck.log"
        case "file[directory]":
          return "C:\\cachecheck\\downloads"
      }

      break
    default:
      switch (name) {
        case "log_path":
          return "/var/log/cachecheck.log"
        case "file[directory]":
          return "~/cachecheck/"
      }

      break
  }
}

export default getPlaceholder
