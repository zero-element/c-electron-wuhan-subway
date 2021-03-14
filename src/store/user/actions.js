import { createHmac } from 'crypto'
import { LOGINKEY, STORAGEKEY } from 'src/libs/utils'

function getHMAC (passwd, salt) {
  const hmac = createHmac('sha256', salt)
  hmac.update(passwd)
  return hmac.digest('hex')
}

export function login ({
  state,
  commit
}, {
  username,
  passwd
}) {
  const loginSecret = getHMAC(passwd, LOGINKEY)
  const trueSecret = window.localStorage.getItem(username + '_login')
  return new Promise((resolve, reject) => {
    if (loginSecret === trueSecret) {
      commit('updateSecretKey', getHMAC(passwd, STORAGEKEY))
      commit('updateUsername', username)
      resolve()
    } else {
      reject('密码错误')
    }
  })
}

export function register ({ state }, {
  username,
  passwd
}) {
  const rawSecret = window.localStorage.getItem(username + '_login')
  return new Promise((resolve, reject) => {
    if (rawSecret) {
      reject('用户已存在')
    } else if (username.length === 0 || passwd.length === 0) {
      reject('用户名或密码不能为空')
    } else {
      const loginSecret = getHMAC(passwd, LOGINKEY)
      window.localStorage.setItem(username + '_login', loginSecret)
      resolve()
    }
  })
}
