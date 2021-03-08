import { app, BrowserWindow, nativeTheme, screen } from 'electron'

const ffi = require('ffi-napi')
const ref = require('ref-napi')
const refArray = require('ref-array-napi')
const Struct = require('ref-struct-napi')

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) {
}

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  const size = screen.getPrimaryDisplay().workAreaSize
  const width = Math.min(parseInt(size.width * 0.65), 1500)
  const height = Math.min(parseInt(width * 0.7), 1050)
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    useContentSize: true,
    frame: false,
    minWidth: width,
    minHeight: height,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    }
  })

  mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  mainWindow.on('resize', () => {
    mainWindow.webContents.send('resize')
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

const dll = ffi.Library('c_subway_algorithm.dll', {
  init: ['void', []]
}) // TODO 补充接口
