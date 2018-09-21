module.exports = [
  {
    label: '&Filer',
    submenu: [
      {
        label: 'Indstillinger',
        accelerator: 'Ctrl+,',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('page:indstillinger')
        }
      },
      {
        label: 'Afslut',
        accelerator: 'Alt+F4',
        role: 'quit'
      }
    ]
  },
  {
    label: '&Rediger',
    submenu: [
      { label: 'Fortryd', role: 'undo' },
      { label: 'Gentag', role: 'redo' },
      { type: 'separator' },
      { label: 'Kopiér', role: 'copy' },
      { label: 'Klip', role: 'cut' },
      { type: 'separator' },
      { label: 'Sæt ind', role: 'paste' }
      // { role: 'toggleDevTools'},
      // { role: 'reload' }
    ]
  },
  {
    label: '&Vis',
    submenu: [
      {
        label: 'Mine sager',
        click: (menuItem, browserWindow, event) => {
         browserWindow.webContents.send('page:mine-sager')
        },
        accelerator: 'Ctrl+1'
      },
      { type: 'separator' },
      {
        label: 'Sager under behandling',
        submenu: [
          {
            label: 'Tilladelsessager',
            click: (menuItem, browserWindow, event) => {
              browserWindow.webContents.send('page:sager-under-behandling-tilladelsessager')
            },
            accelerator: 'Ctrl+2'
          },
          {
            label: 'Afslutningssager',
            click: (menuItem, browserWindow, event) => {
              browserWindow.webContents.send('page:sager-under-behandling-afslutningssager')
            },
            accelerator: 'Ctrl+3'
          }
          
        ]
      },
      {
        label: 'Afventende sager',
        submenu: [
          {
            label: 'Tilladelsessager',
            click: (menuItem, browserWindow, event) => {
              browserWindow.webContents.send('page:afventende-sager-tilladelsessager')
            },
            accelerator: 'Ctrl+4'
          },
          {
            label: 'Afslutningssager',
            click: (menuItem, browserWindow, event) => {
              browserWindow.webContents.send('page:afventende-sager-afslutningssager')
            },
            accelerator: 'Ctrl+5'
          }
        ]
      },
      { type: 'separator' },
      {
        label: 'Opfølgningsliste',
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('page:opfølgningsliste')
        },
        accelerator: 'Ctrl+6'
      }
    ]
  },
  {
    label: '&Hjælp'
  }
]