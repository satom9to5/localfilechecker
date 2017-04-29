let pt = null

const platform = () => {
  if (pt) {
    return pt
  }

  const ua = window.navigator.userAgent

  switch (true) {
  case (ua.indexOf("Chrome") >= 0):
    pt = "Chrome"
    break
  case (ua.indexOf("Firefox") >= 0):
    pt = "Firefox"
    break
  }
  
  return pt
}

export default platform
