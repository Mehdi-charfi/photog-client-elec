import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import si from 'systeminformation'
import crypto from 'crypto'

// Configuration
log.transports.file.level = 'info'
autoUpdater.logger = log
const TARGET_FINGERPRINT = 'd354893dcef0254f86bbea6acab9d0fcc1e3a75b8432aaa9632dbe6d4ab411a2'

// Enhanced hardware fingerprint generation
async function getHardwareFingerprint(): Promise<string> {
  try {
    const [cpuData, diskData, networkData] = await Promise.all([
      si.cpu(),
      si.diskLayout(),
      si.networkInterfaces()
    ])

    const fingerprintSource = [
      cpuData.manufacturer,
      cpuData.brand,
      diskData[0]?.serialNum || 'unknown-disk',
      networkData[0]?.mac || 'unknown-mac'
    ].join('|')

    return crypto.createHash('sha256').update(fingerprintSource).digest('hex')
  } catch (error) {
    log.error('Hardware fingerprint error:', error)
    throw new Error('Failed to generate hardware fingerprint')
  }
}

// Application bootstrap
async function bootstrapApp(): Promise<void> {
  try {
    const fingerprint = await getHardwareFingerprint()
    log.info('Generated fingerprint:', fingerprint)

    if (fingerprint !== TARGET_FINGERPRINT) {
      dialog.showMessageBoxSync({
        type: 'error',
        title: 'Authorization Failed',
        message: 'This device is not authorized to run the application',
        // detail: `Expected: ${TARGET_FINGERPRINT}\nReceived: ${fingerprint}`
      })
      app.exit(1)
      return
    }

    // Proceed with app initialization
    app.whenReady().then(createWindow)
  } catch (error) {
    dialog.showMessageBoxSync({
      type: 'error',
      title: 'Initialization Error',
      message: 'Failed to initialize application',
      detail: error instanceof Error ? error.message : String(error)
    })
    app.exit(1)
  }
}

// Window management
let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    titleBarOverlay: {
      color: '#2e2c29',
      symbolColor: '#74b1be'
    },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Load app content
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Configure auto-updater
  autoUpdater.autoDownload = true
  autoUpdater.allowDowngrade = false
  setupAutoUpdater()
}

// Auto-updater configuration
function setupAutoUpdater(): void {
  autoUpdater.on('update-available', ({ version }) => {
    log.info('Update available:', version)
    mainWindow?.webContents.send('update-status', { status: 'available', version })
  })

  autoUpdater.on('update-downloaded', ({ version }) => {
    const response = dialog.showMessageBoxSync({
      type: 'info',
      title: 'Update Ready',
      message: `Version ${version} has been downloaded. Restart to install?`,
      buttons: ['Later', 'Restart Now']
    })
    if (response === 1) autoUpdater.quitAndInstall()
  })

  autoUpdater.on('error', (error) => {
    log.error('Update error:', error)
    mainWindow?.webContents.send('update-status', {
      status: 'error',
      error: error.message
    })
  })

  // Initial check after delay
  setTimeout(() => autoUpdater.checkForUpdatesAndNotify(), 10000)
}

// Start application
bootstrapApp()

// Lifecycle handlers
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (!mainWindow && app.isReady()) createWindow()
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// works perfectly the licence

// import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
// import { join } from 'path'
// import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import icon from '../../resources/icon.png?asset'
// import log from 'electron-log'
// import { autoUpdater } from 'electron-updater'
// import * as fs from 'fs'
// import * as crypto from 'crypto'
// import * as os from 'os'
// import * as path from 'path'

// // Enhanced logging setup
// log.transports.file.level = 'info'
// autoUpdater.logger = log
// log.info('Starting application...')

// // Configure auto-updater
// autoUpdater.autoDownload = true // Automatically download updates
// autoUpdater.allowDowngrade = false // Prevent downgrading
// autoUpdater.allowPrerelease = false // Ignore pre-release versions

// let mainWindow: BrowserWindow | null = null
// const LICENSE_FILE_PATH = path.join(app.getPath('userData'), 'license.dat')

// // Fixed encryption key and IV
// const ENCRYPTION_KEY = crypto.scryptSync('YourSecretAppKey123!', 'salt', 32)
// const ENCRYPTION_IV = crypto.randomBytes(16) // We'll store this with the license

// // Function to generate a unique hardware ID
// function generateHardwareId(): string {
//   // Collect hardware information
//   const cpuInfo = os.cpus()[0]?.model || 'unknown'
//   const totalMemory = os.totalmem().toString()
//   const hostname = os.hostname()
//   const networkInterfaces = os.networkInterfaces()

//   // Get MAC address from first non-internal network interface
//   let macAddress = 'unknown'
//   for (const [, interfaces] of Object.entries(networkInterfaces)) {
//     if (interfaces) {
//       for (const iface of interfaces) {
//         if (!iface.internal) {
//           macAddress = iface.mac
//           break
//         }
//       }
//     }
//     if (macAddress !== 'unknown') break
//   }

//   // Hash the combined hardware information
//   const hardwareString = `${cpuInfo}|${totalMemory}|${hostname}|${macAddress}`
//   const hash = crypto.createHash('sha256').update(hardwareString).digest('hex')

//   return hash
// }

// // Function to check if the license is valid
// function checkLicense(): boolean {
//   try {
//     // Check if license file exists
//     if (!fs.existsSync(LICENSE_FILE_PATH)) {
//       log.info('License file not found')
//       return false
//     }

//     // Read license file
//     const licenseData = fs.readFileSync(LICENSE_FILE_PATH, 'utf-8').split('|')
//     if (licenseData.length !== 2) {
//       log.error('Invalid license format')
//       return false
//     }

//     const iv = Buffer.from(licenseData[0], 'hex')
//     const encryptedLicense = licenseData[1]

//     // Decrypt the license
//     const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
//     let decrypted = decipher.update(encryptedLicense, 'hex', 'utf8')
//     decrypted += decipher.final('utf8')

//     // Compare the hardware ID in the license with the current hardware ID
//     const currentHardwareId = generateHardwareId()
//     return decrypted === currentHardwareId
//   } catch (error) {
//     log.error('Error checking license:', error)
//     return false
//   }
// }

// // Function to generate and save a license
// function generateLicense(): boolean {
//   try {
//     const hardwareId = generateHardwareId()
//     const iv = crypto.randomBytes(16)

//     // Encrypt the hardware ID
//     const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
//     let encryptedLicense = cipher.update(hardwareId, 'utf8', 'hex')
//     encryptedLicense += cipher.final('hex')

//     // Save the IV and encrypted license to file
//     const licenseData = `${iv.toString('hex')}|${encryptedLicense}`
//     fs.writeFileSync(LICENSE_FILE_PATH, licenseData)

//     log.info('License generated successfully')
//     return true
//   } catch (error) {
//     log.error('Error generating license:', error)
//     return false
//   }
// }

// function createWindow(): void {
//   // Check license before creating window
//   const isLicensed = checkLicense()
//   if (!isLicensed) {
//     // If no valid license, show dialog to activate
//     dialog.showMessageBox({
//       type: 'question',
//       title: 'License Required',
//       message: 'This application is not licensed for this computer. Would you like to activate it now?',
//       buttons: ['Activate', 'Exit'],
//       defaultId: 0
//     }).then(({ response }) => {
//       if (response === 0) {
//         // User wants to activate
//         const success = generateLicense()
//         if (success) {
//           dialog.showMessageBox({
//             type: 'info',
//             title: 'Activation Successful',
//             message: 'The application has been activated for this computer. It will now start.',
//             buttons: ['OK']
//           }).then(() => {
//             // Continue with application startup
//             createMainWindow()
//           })
//         } else {
//           dialog.showMessageBox({
//             type: 'error',
//             title: 'Activation Failed',
//             message: 'Failed to activate the application. The application will now exit.',
//             buttons: ['OK']
//           }).then(() => {
//             app.quit()
//           })
//         }
//       } else {
//         // User chose to exit
//         app.quit()
//       }
//     })
//   } else {
//     // Continue with application startup
//     createMainWindow()
//   }
// }

// function createMainWindow(): void {
//   // Create the browser window.
//   mainWindow = new BrowserWindow({
//     width: 900,
//     height: 670,
//     show: false,
//     autoHideMenuBar: true,
//     resizable: true,
//     fullscreenable: true,
//     titleBarOverlay: {
//       color: '#2e2c29',
//       symbolColor: '#74b1be'
//     },
//     backgroundColor: '#2e2c29',
//     ...(process.platform === 'linux' ? { icon } : {}),
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   mainWindow?.on('ready-to-show', () => {
//     mainWindow?.show()
//   })

//   mainWindow.webContents.setWindowOpenHandler((details) => {
//     shell.openExternal(details.url)
//     return { action: 'deny' }
//   })

//   // HMR for renderer base on electron-vite cli.
//   // Load the remote URL for development or the local html file for production.
//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
//   } else {
//     mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
//   }

//   // Check for updates once after a short delay
//   setTimeout(() => {
//     log.info('Performing update check on startup')
//     autoUpdater.checkForUpdatesAndNotify()
//   }, 10000)
// }

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {
//   // Set app user model id for windows
//   electronApp.setAppUserModelId('com.electron')

//   // Default open or close DevTools by F12 in development
//   // and ignore CommandOrControl + R in production.
//   // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
//   app.on('browser-window-created', (_, window) => {
//     optimizer.watchWindowShortcuts(window)
//   })

//   // Allow renderer to trigger update check manually if needed
//   ipcMain.on('check-for-updates', () => {
//     log.info('Manual update check requested')
//     autoUpdater.checkForUpdatesAndNotify()
//   })

//   // Add IPC for license management
//   ipcMain.on('check-license-status', (event) => {
//     const isLicensed = checkLicense()
//     event.reply('license-status', { isLicensed })
//   })

//   // IPC test
//   ipcMain.on('ping', () => console.log('pong'))

//   createWindow()

//   app.on('activate', function () {
//     // On macOS it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     if (BrowserWindow.getAllWindows().length === 0) createWindow()
//   })
// })

// // Auto-updater events with user feedback
// autoUpdater.on('checking-for-update', () => {
//   log.info('Checking for update...')
//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', { status: 'checking' })
//   }
// })

// autoUpdater.on('update-available', (info) => {
//   log.info('Update available:', info)
//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', {
//       status: 'available',
//       version: info?.version
//     })

//     dialog.showMessageBox({
//       type: 'info',
//       title: 'Update Available',
//       message: `A new version ${info?.version || ''} is available. Downloading now...`,
//       buttons: ['Ok']
//     })
//   }
// })

// autoUpdater.on('update-not-available', (info) => {
//   log.info('Update not available:', info)
//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', { status: 'not-available' })
//   }
// })

// autoUpdater.on('error', (err) => {
//   log.error('Error in auto-updater:', err)
//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', {
//       status: 'error',
//       error: err.toString()
//     })
//   }
// })

// autoUpdater.on('download-progress', (progressObj) => {
//   const percentDownloaded = Math.round(progressObj.percent)
//   log.info(`Download progress: ${percentDownloaded}%`)

//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', {
//       status: 'downloading',
//       percent: percentDownloaded
//     })

//     // Update progress in taskbar (Windows)
//     if (process.platform === 'win32') {
//       mainWindow.setProgressBar(progressObj.percent / 100)
//     }
//   }
// })

// autoUpdater.on('update-downloaded', (info) => {
//   log.info('Update downloaded:', info)

//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', {
//       status: 'downloaded',
//       version: info?.version
//     })

//     // Reset progress bar
//     if (process.platform === 'win32') {
//       mainWindow.setProgressBar(-1)
//     }

//     // Prompt user to install update
//     dialog
//       .showMessageBox(mainWindow, {
//         type: 'info',
//         title: 'Update Ready',
//         message: `Version ${info?.version || 'new'} has been downloaded. Would you like to install it now?`,
//         buttons: ['Install Later', 'Install Now'],
//         defaultId: 1
//       })
//       .then(({ response }) => {
//         if (response === 1) {
//           log.info('User approved update installation')
//           autoUpdater.quitAndInstall(false, true)
//         } else {
//           log.info('User postponed update installation')
//         }
//       })
//   }
// })

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and require them here.
// import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
// import { join } from 'path'
// import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import icon from '../../resources/icon.png?asset'
// import log from 'electron-log'
// import { autoUpdater } from 'electron-updater'
// import * as fs from 'fs'
// import * as crypto from 'crypto'
// import * as os from 'os'
// import * as path from 'path'

// // Enhanced logging setup
// log.transports.file.level = 'info'
// autoUpdater.logger = log
// log.info('Starting application...')

// // Configure auto-updater
// autoUpdater.autoDownload = true // Automatically download updates
// autoUpdater.allowDowngrade = false // Prevent downgrading
// autoUpdater.allowPrerelease = false // Ignore pre-release versions

// let mainWindow: BrowserWindow | null = null
// const LICENSE_FILE_PATH = path.join(app.getPath('userData'), 'license.dat')
// console.log(LICENSE_FILE_PATH)
// // Fixed encryption key
// const ENCRYPTION_KEY = crypto.scryptSync('YourSecretAppKey123!', 'salt', 32)

// // Function to generate a unique hardware ID
// function generateHardwareId(): string {
//   // Collect hardware information
//   const cpuInfo = os.cpus()[0]?.model || 'unknown'
//   const totalMemory = os.totalmem().toString()
//   const hostname = os.hostname()
//   const networkInterfaces = os.networkInterfaces()

//   // Get MAC address from first non-internal network interface
//   let macAddress = 'unknown'
//   for (const [, interfaces] of Object.entries(networkInterfaces)) {
//     if (interfaces) {
//       for (const iface of interfaces) {
//         if (!iface.internal) {
//           macAddress = iface.mac
//           break
//         }
//       }
//     }
//     if (macAddress !== 'unknown') break
//   }

//   // Hash the combined hardware information
//   const hardwareString = `${cpuInfo}|${totalMemory}|${hostname}|${macAddress}`
//   const hash = crypto.createHash('sha256').update(hardwareString).digest('hex')

//   return hash
// }

// // Function to check if the license is valid
// function checkLicense(): boolean {
//   try {
//     // Check if license file exists
//     if (!fs.existsSync(LICENSE_FILE_PATH)) {
//       log.info('License file not found')
//       return false
//     }

//     // Read license file
//     const licenseData = fs.readFileSync(LICENSE_FILE_PATH, 'utf-8').split('|')
//     if (licenseData.length !== 2) {
//       log.error('Invalid license format')
//       return false
//     }

//     const iv = Buffer.from(licenseData[0], 'hex')
//     const encryptedLicense = licenseData[1]

//     // Decrypt the license
//     const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
//     let decrypted = decipher.update(encryptedLicense, 'hex', 'utf8')
//     decrypted += decipher.final('utf8')

//     // Compare the hardware ID in the license with the current hardware ID
//     const currentHardwareId = generateHardwareId()
//     console.log('Current Hardware ID:', currentHardwareId)
//     console.log('Decrypted License:', decrypted)
//     return decrypted === currentHardwareId
//   } catch (error) {
//     log.error('Error checking license:', error)
//     return false
//   }
// }

// // Function to generate and save a license
// function generateLicense(): boolean {
//   try {
//     const hardwareId = generateHardwareId()
//     const iv = crypto.randomBytes(16)

//     // Encrypt the hardware ID
//     const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
//     let encryptedLicense = cipher.update(hardwareId, 'utf8', 'hex')
//     encryptedLicense += cipher.final('hex')

//     // Save the IV and encrypted license to file
//     const licenseData = `${iv.toString('hex')}|${encryptedLicense}`
//     fs.writeFileSync(LICENSE_FILE_PATH, licenseData)

//     log.info('License generated successfully')
//     return true
//   } catch (error) {
//     log.error('Error generating license:', error)
//     return false
//   }
// }

// function createWindow(): void {
//   // Check license before creating window
//   const isLicensed = checkLicense()
//   if (!isLicensed) {
//     // If no valid license, show dialog to activate
//     dialog.showMessageBox({
//       type: 'question',
//       title: 'License Required',
//       message: 'This application is not licensed for this computer. Would you like to activate it now?',
//       buttons: ['Activate', 'Exit'],
//       defaultId: 0
//     }).then(({ response }) => {
//       if (response === 0) {
//         // User wants to activate
//         const success = generateLicense()
//         if (success) {
//           dialog.showMessageBox({
//             type: 'info',
//             title: 'Activation Successful',
//             message: 'The application has been activated for this computer. It will now start.',
//             buttons: ['OK']
//           }).then(() => {
//             // Continue with application startup
//             createMainWindow()
//           })
//         } else {
//           dialog.showMessageBox({
//             type: 'error',
//             title: 'Activation Failed',
//             message: 'Failed to activate the application. The application will now exit.',
//             buttons: ['OK']
//           }).then(() => {
//             app.quit()
//           })
//         }
//       } else {
//         // User chose to exit
//         app.quit()
//       }
//     })
//   } else {
//     // Continue with application startup
//     createMainWindow()
//   }
// }

// function createMainWindow(): void {
//   // Create the browser window.
//   mainWindow = new BrowserWindow({
//     width: 900,
//     height: 670,
//     show: false,
//     autoHideMenuBar: true,
//     resizable: true,
//     fullscreenable: true,
//     titleBarOverlay: {
//       color: '#2e2c29',
//       symbolColor: '#74b1be'
//     },
//     backgroundColor: '#2e2c29',
//     ...(process.platform === 'linux' ? { icon } : {}),
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   mainWindow?.on('ready-to-show', () => {
//     mainWindow?.show()
//   })

//   mainWindow.webContents.setWindowOpenHandler((details) => {
//     shell.openExternal(details.url)
//     return { action: 'deny' }
//   })

//   // HMR for renderer base on electron-vite cli.
//   // Load the remote URL for development or the local html file for production.
//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
//   } else {
//     mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
//   }

//   // Check for updates once after a short delay
//   setTimeout(() => {
//     log.info('Performing update check on startup')
//     autoUpdater.checkForUpdatesAndNotify()
//   }, 10000)
// }

// // This method will be called when Electron has finished
// // initialization and is ready to create browser windows.
// // Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {
//   // Set app user model id for windows
//   electronApp.setAppUserModelId('com.electron')

//   // Default open or close DevTools by F12 in development
//   // and ignore CommandOrControl + R in production.
//   // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
//   app.on('browser-window-created', (_, window) => {
//     optimizer.watchWindowShortcuts(window)
//   })

//   // Allow renderer to trigger update check manually if needed
//   ipcMain.on('check-for-updates', () => {
//     log.info('Manual update check requested')
//     autoUpdater.checkForUpdatesAndNotify()
//   })

//   // Add IPC for license management
//   ipcMain.on('check-license-status', (event) => {
//     const isLicensed = checkLicense()
//     event.reply('license-status', { isLicensed })
//   })

//   // IPC test
//   ipcMain.on('ping', () => console.log('pong'))

//   createWindow()

//   app.on('activate', function () {
//     // On macOS it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     if (BrowserWindow.getAllWindows().length === 0) createWindow()
//   })
// })

// // Auto-updater events with user feedback
// autoUpdater.on('checking-for-update', () => {
//   log.info('Checking for update...')
//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', { status: 'checking' })
//   }
// })

// autoUpdater.on('update-available', (info) => {
//   log.info('Update available:', info)
//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', {
//       status: 'available',
//       version: info?.version
//     })

//     dialog.showMessageBox({
//       type: 'info',
//       title: 'Update Available',
//       message: `A new version ${info?.version || ''} is available. Downloading now...`,
//       buttons: ['Ok']
//     })
//   }
// })

// autoUpdater.on('update-not-available', (info) => {
//   log.info('Update not available:', info)
//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', { status: 'not-available' })
//   }
// })

// autoUpdater.on('error', (err) => {
//   log.error('Error in auto-updater:', err)
//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', {
//       status: 'error',
//       error: err.toString()
//     })
//   }
// })

// autoUpdater.on('download-progress', (progressObj) => {
//   const percentDownloaded = Math.round(progressObj.percent)
//   log.info(`Download progress: ${percentDownloaded}%`)

//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', {
//       status: 'downloading',
//       percent: percentDownloaded
//     })

//     // Update progress in taskbar (Windows)
//     if (process.platform === 'win32') {
//       mainWindow.setProgressBar(progressObj.percent / 100)
//     }
//   }
// })

// autoUpdater.on('update-downloaded', (info) => {
//   log.info('Update downloaded:', info)

//   if (mainWindow) {
//     mainWindow.webContents.send('update-status', {
//       status: 'downloaded',
//       version: info?.version
//     })

//     // Reset progress bar
//     if (process.platform === 'win32') {
//       mainWindow.setProgressBar(-1)
//     }

//     // Prompt user to install update
//     dialog
//       .showMessageBox(mainWindow, {
//         type: 'info',
//         title: 'Update Ready',
//         message: `Version ${info?.version || 'new'} has been downloaded. Would you like to install it now?`,
//         buttons: ['Install Later', 'Install Now'],
//         defaultId: 1
//       })
//       .then(({ response }) => {
//         if (response === 1) {
//           log.info('User approved update installation')
//           autoUpdater.quitAndInstall(false, true)
//         } else {
//           log.info('User postponed update installation')
//         }
//       })
//   }
// })

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })
