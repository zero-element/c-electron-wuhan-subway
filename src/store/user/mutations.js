import * as _ from 'lodash'
// import { createCipheriv } from 'crypto'
// import { fromHexString } from 'src/libs/utils'

export function addHistory (state, item) {
  state.searchHistory.push(item)
  state.searchHistory = _.takeRight(state.searchHistory, 10)
  // const cipher = createCipheriv('aes-256-gcm', fromHexString(state.secretKey), Buffer.alloc(32, 0))
  // let crypted = cipher.update(JSON.stringify(state.searchHistory), 'utf8', 'hex')
  // crypted += cipher.final('hex')
  const crypted = btoa(unescape(encodeURIComponent(JSON.stringify(state.searchHistory))))
  window.localStorage.setItem(state.username + '_history', crypted)
}

export function updateSecretKey (state, secret) {
  state.secretKey = secret
}

export function updateUsername (state, username) {
  state.username = username
}
