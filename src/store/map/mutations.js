// import * as utils from 'src/libs/utils'

export function updateCenter (state, position) {
  if (!position) {
    state.center = [114.32, 30.575]
    return
  }
  state.center = position
}

export function updateFocusLine (state, lineId) {
  const zoomList = [12, 12, 13, 12, 13, 12, 12]
  state.lineId = lineId
  if (lineId) {
    state.scale = zoomList[lineId - 1]
    return
  }
  state.scale = 12
}
