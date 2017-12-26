const CHECK_DURATION = 1000 * 60 * 2 // 2minutes

const numberFormat = (num) => {
  const negative = num < 0 ? '-' : ''
  if (negative) {
    num = -num
  }

  num = String(num)

  const [ integer, decimal ] = num.split('.')

  const numStr = integer.split('').reverse().reduce((res, cur) => {
    if (res[res.length - 1].length == 3) {
      res = res.concat('')
    }

    let target = res[res.length - 1]

    if (target.length == 0) {
      res[res.length - 1] = cur
    } else {
      res[res.length - 1] = `${cur}${target}`
    }

    return res
  }, ['']).reverse().join(',')

  const dot = (decimal) ? '.' : ''

  return `${negative}${numStr}${dot}${decimal || ''}`
}

export class PathsInfo {
  constructor(key, paths = null) {
    this.key           = key
    this.paths         = paths
    this.lastQueryTime = null
  }

  updatePaths(paths, isPathsNotNull = false) {
    if (!isPathsNotNull || paths) {
      this.paths = paths
    }
  } 

  updateLastQueryTime() {
    if (!(this.isEnabled())) {
      this.lastQueryTime = new Date()  
    }
  }

  isEnabled() {
    return (this.lastQueryTime && (new Date()).getTime() - this.lastQueryTime.getTime() < CHECK_DURATION)
  }

  getFilesString() {
    if (!this.paths || this.paths.length == 0) {
      return "empty"
    }

    return this.paths.map(file => `${file.path} [${numberFormat(file.size)} bytes]`).join(", <br />")
  }
}

export class PathsInfoMap {
  constructor() {
    this.keys = {}
  }

  get(key) {
    if (this.keys.hasOwnProperty(key)) {
      return this.keys[key]
    } else {
      return null
    }
  }

  gets(keys = []) {
    return keys
      .map(key => this.get(key))
      .filter(pathsInfo => pathsInfo && pathsInfo.paths)
      .reduce((infos, pathsInfo) => {
        const { key } = pathsInfo

        infos[key] = pathsInfo

        return infos
      }, {})
  }

  set(key, paths = null, isPathsNotNull = false) {
    if (this.keys.hasOwnProperty(key)) {
       this.keys[key].updatePaths(paths, isPathsNotNull)   
    } else {
       this.keys[key] = new PathsInfo(key, paths)
    }

    this.keys[key].updateLastQueryTime()
  }

  sets(keys = [], fileInfos = {}, isPathsNotNull = true) {
    keys.forEach(key => {
      this.set(key, fileInfos.hasOwnProperty(key) ? fileInfos[key].paths : null, isPathsNotNull)
    })
  }

  updatesLastQueryTime(keys = [], isPathsNotNull = true) {
    keys.forEach(key => {
      this.set(key, null, isPathsNotNull)
    })
  }

  // extract keys for query
  extractTargetKeys(keys = []) {
    return keys.filter(key => (!(this.keys.hasOwnProperty(key)) || this.keys[key].isEnabled()))
  }
}

const pathsInfoMap = new PathsInfoMap()
export default pathsInfoMap
