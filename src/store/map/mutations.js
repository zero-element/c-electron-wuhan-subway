// import * as utils from 'src/libs/utils'

export function updateFocusCenter (state, position) {
  state.showResult = false
  state.center = position
  state.scale = 14
}

export function updateFocusLine (state, lineId) {
  state.showResult = false
  const centerPosList = [
    [114.25, 30.63],
    [114.32, 30.63],
    [114.25, 30.595],
    [114.225, 30.575],
    [114.24, 30.585],
    [114.3, 30.51],
    [114.32, 30.56]]
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

export function updateResult (state, result) {
  state.result = Object.assign([], result)
  state.showResult = true
}
