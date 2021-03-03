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
