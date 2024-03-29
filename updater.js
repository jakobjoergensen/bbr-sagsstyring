// Modules
const { BrowserWindow, dialog, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')

// Enable logging
autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info'

// Disable auto downloading
autoUpdater.autoDownload = false

// Check for updates
exports.check = () => {


    // Start update check
    autoUpdater.checkForUpdates()

    // Listen for download (update) found
    autoUpdater.on('update-available', () => {

        // Track progress percent
        let downloadProgress = 0

        // Prompt user to update
        dialog.showMessageBox({
            type: 'info',
            title: 'Ny version tilgængelig',
            message: 'Der er en ny version af BBR-sagsstyring tilgængelig.',
            buttons: ['Opdatér nu']
        }, (buttonIndex) => {

            // If not 'Update' button, return
            if (buttonIndex !== 0)
                return

            // Else start download and show progress
            autoUpdater.downloadUpdate()

            // Create progress window
            let progressWindow = new BrowserWindow({
                width: 350,
                height: 45,
                useContentSize: true,
                autoHideMenuBar: true,
                maximizable: false,
                fullscreen: false,
                fullscreenable: false,
                resizable: false
            })

            progressWindow.loadURL(`file://${__dirname}/renderer/update-progress.html`)

            // Handle win close
            progressWindow.on('closed', () => progressWindow = null)

            // Listen for progress request from progress.html
            ipcMain.on('download-progress-request', e => {
                e.returnValue = downloadProgress
            })

            // Track download progress on autoupdater
            autoUpdater.on('download-progress', d => {
                downloadProgress = d.percent
                console.log('Progress: ' + d.percent)
            })

            // Listen for completed update download
            autoUpdater.on('update-downloaded', () => {

                // Close progressWindow
                if (progressWindow)
                    progressWindow.close()

                // Quit and install update
                autoUpdater.quitAndInstall()

            })
        })
    })
}