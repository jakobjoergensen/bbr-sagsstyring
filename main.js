const { app, Menu, BrowserWindow, ipcMain, dialog, session } = require('electron')
const updater = require('./updater')
const { SQLConfig } = require('./sql-config')
const path = require('path')
const sql = require('mssql/msnodesqlv8')



const az = process.env['USERPROFILE'].split(path.sep)[2]
const loadUserQuery = `SELECT * FROM view_brugerAktuel WHERE az = '${az}'`
// const loadUserQuery = `SELECT * FROM view_brugerAktuelNy WHERE az = 'aztp006'` // karina
//const loadUserQuery = `SELECT * FROM view_brugerAktuel WHERE az = 'aztp009'` // janne az18982
//const loadUserQuery = `SELECT * FROM view_brugerAktuel WHERE az = 'az18982'` // bodil
// const loadUserQuery = `SELECT * FROM view_brugerAktuel WHERE az = 'azttj81'` // anette sonne

let mainWindow
let mainMenu = Menu.buildFromTemplate(require('./mainMenu'))

let pool

// Luk ordentlig ned
app.on('window-all-closed', () => {
  app.quit()
})

// START
app.on('ready', async () => {

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({ responseHeaders: `default-src * 'self'; style-src * 'self' 'unsafe-inline'` })
  })

  try {
    pool = await sql.connect(SQLConfig)
    const result = await pool.request()
      .query(loadUserQuery)

    if (result['recordsets'].length > 0) {

      // create main window
      mainWindow = new BrowserWindow({
        show: false,
        backgroundColor: '#ffffff',
        title: 'BBR-sagsstyring ' + app.getVersion(),
        width: 1400,
        height: 1000,
        webPreferences: {
          // devTools: false,
          devTools: true,
          allowRunningInsecureContent: false
        }
      })

      // Indlæs html i main window
      mainWindow.loadFile(`${__dirname}/renderer/index.html`)
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


  } catch (err) {

    console.log(err)

  }

})



// ipc listener - hent data om brugeren der er logget ind
ipcMain.on('get:bruger', async e => {
  try {
    const result = await pool.request().query(loadUserQuery)
    e.returnValue = result['recordsets'][0][0]
  } catch (err) {
    console.log(err)
  }
})


// ipc listener - hent data om alle brugere
ipcMain.on('get:brugere', async e => {
  try {
    const result = await pool.request().query('SELECT * FROM view_brugerAktuel WHERE setting_status <> 0 ORDER BY navn ASC')
    e.returnValue = result['recordsets'][0]
  } catch (err) {
    console.log(err)
  }
})
