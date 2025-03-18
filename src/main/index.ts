import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'

// Enhanced logging setup
log.transports.file.level = 'info'
autoUpdater.logger = log
log.info('Starting application...')

// Configure auto-updater
autoUpdater.autoDownload = true // Automatically download updates
autoUpdater.allowDowngrade = false // Prevent downgrading
autoUpdater.allowPrerelease = false // Ignore pre-release versions

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    resizable: true,
    fullscreenable: true,
    titleBarOverlay: {
      color: '#2e2c29',
      symbolColor: '#74b1be'
    },
    backgroundColor: '#2e2c29',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow?.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Check for updates once after a short delay
  setTimeout(() => {
    log.info('Performing update check on startup')
    autoUpdater.checkForUpdatesAndNotify()
  }, 10000)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Allow renderer to trigger update check manually if needed
  ipcMain.on('check-for-updates', () => {
    log.info('Manual update check requested')
    autoUpdater.checkForUpdatesAndNotify()
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Auto-updater events with user feedback
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'checking' })
  }
})

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info)
  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      status: 'available',
      version: info?.version
    })

    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `A new version ${info?.version || ''} is available. Downloading now...`,
      buttons: ['Ok']
    })
  }
})

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info)
  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status: 'not-available' })
  }
})

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err)
  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      status: 'error',
      error: err.toString()
    })
  }
})

autoUpdater.on('download-progress', (progressObj) => {
  const percentDownloaded = Math.round(progressObj.percent)
  log.info(`Download progress: ${percentDownloaded}%`)

  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      status: 'downloading',
      percent: percentDownloaded
    })

    // Update progress in taskbar (Windows)
    if (process.platform === 'win32') {
      mainWindow.setProgressBar(progressObj.percent / 100)
    }
  }
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info)

  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      status: 'downloaded',
      version: info?.version
    })

    // Reset progress bar
    if (process.platform === 'win32') {
      mainWindow.setProgressBar(-1)
    }

    // Prompt user to install update
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info?.version || 'new'} has been downloaded. Would you like to install it now?`,
      buttons: ['Install Later', 'Install Now'],
      defaultId: 1
    }).then(({ response }) => {
      if (response === 1) {
        log.info('User approved update installation')
        autoUpdater.quitAndInstall(false, true)
      } else {
        log.info('User postponed update installation')
      }
    })
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.