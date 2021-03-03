// import * as utils from 'src/libs/utils'

export function updateFocusCenter (state, position) {
  state.center = position
  state.scale = 14
}

export function updateFocusLine (state, lineId) {
  const centerPosList = [
    [114.32, 30.63],
    [114.4, 30.63],
    [114.28, 30.595],
    [114.30, 30.575],
    [114.28, 30.585],
    [114.35, 30.51],
    [114.37, 30.56]]
  const zoomList = [12, 12, 13, 12, 13, 12, 12]
  state.lineId = lineId
  if (lineId) {
    state.scale = zoomList[lineId - 1]
    state.center = centerPosList[lineId - 1]
    return
  }
  state.scale = 12
  state.center = [114.25, 30.575]
}
