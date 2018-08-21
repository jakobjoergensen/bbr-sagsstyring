const { app, Menu, BrowserWindow, ipcMain, dialog } = require('electron')
const updater = require('./updater')
const { SQLConfig } = require('./sql-config')
const path = require('path')
const sql = require('msnodesqlv8')


const az = process.env['USERPROFILE'].split(path.sep)[2]
const loadUserQuery = `SELECT * FROM view_brugerAktuelNy WHERE az = '${az}'`
// const loadUserQuery = `SELECT * FROM view_brugerAktuel WHERE az = 'az18982'`

let mainWindow
let mainMenu = Menu.buildFromTemplate(require('./mainMenu'))


app.on('ready', () => {

  sql.query(SQLConfig.connectionString, loadUserQuery, (err, rows) => {
    
    if (rows.length > 0) {

      // create main window
      mainWindow = new BrowserWindow({
        show: false,
        backgroundColor: '#ffffff',
        title: 'BBR sagsstyring 2018.5',
        width: 1400,
        height: 1000
      })

      // Indlæs html i main window
      mainWindow.loadFile('renderer/index.html')
      mainWindow.maximize()
      mainWindow.once('ready-to-show', () => {
        mainWindow.show()
      })
      
      // Sæt programmenuen
      Menu.setApplicationMenu(mainMenu)

      // Check for updates
      setTimeout(updater.check, 2000)
    } else {

      // bruger ikke registreret i databasen
      dialog.showErrorBox('Bruger findes ikke', 'Du er ikke oprettet som bruger i BBR sagsstyringsdatabasen.\nProgrammet kan ikke åbnes.')
      app.quit()
    }
  })  
})



// ipc listener - hent data om brugeren der er logget ind
ipcMain.on('get:bruger', e => {
  sql.query(SQLConfig.connectionString, loadUserQuery, (err, rows) => {
    e.returnValue = rows[0]
  })
})


// ipc listener - hent data om alle brugere
ipcMain.on('get:brugere', e => {
  const query = 'SELECT * FROM view_brugerAktuel WHERE setting_status <> 0 ORDER BY navn ASC'

  sql.query(SQLConfig.connectionString, query, (err, rows) => {
    e.returnValue = rows
  })
})


// ipc listener - hent oplysninger om antal BBR notater
ipcMain.on('get:antalBBRnotater', e => {
  const query = 'SELECT sagID, COUNT(sagID) \'antalBBRnotater\' FROM view_bbrNotatNy GROUP BY sagID'
  sql.query(SQLConfig.connectionString, query, (err, rows) => {
    e.returnValue = rows
  })
})


function test() {
  console.log('test')
}