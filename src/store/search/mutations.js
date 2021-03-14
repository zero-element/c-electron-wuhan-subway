export function updateStationName (state, name) {
  switch (state.focusInput) {
    case 1: {
      state.initStationName = name
      break
    }
    case 2:
      state.finalStationName = name
  }
}

export function updateFocusId (state, id) {
  state.focusInput = id
}

export function updateTime (state, sTime) {
  const timeArray = sTime.split(':')
  const timeInt = (parseInt(timeArray[0]) - 6) * 60 + parseInt(timeArray[1])
  state.numberTime = timeInt
}
