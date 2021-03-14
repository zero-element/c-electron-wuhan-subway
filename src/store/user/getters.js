// import { createDecipheriv } from 'crypto'
// import { fromHexString } from 'src/libs/utils'

export function getHistory (state) {
  const rawString = localStorage.getItem(state.username + '_history')
  if (rawString) {
    // const decipher = createDecipheriv('aes-256-gcm', fromHexString(state.secretKey), Buffer.alloc(32, 0))
    // let decrypted = decipher.update(rawString, 'hex', 'utf8')
    // decrypted += decipher.final('utf-8')
    const decrypted = decodeURIComponent(escape(atob(decodeURIComponent(rawString))))
    return JSON.parse(decrypted)
  }
  return []
}
