const { fn } = require('../functions')
const { ipcRenderer } = require('electron')

const { DBCtrl } = require('../db-ctrl')
const { UIRender } = require('../ui-render')
const { ItemCtrl } = require('../item-ctrl')
const { UICtrl } = require('../ui-ctrl')

const sql = require('mssql/msnodesqlv8')
const { SQLConfig } = require('../sql-config')

window.eval = global.eval = function () {
  throw new Error(`Sorry, this app does not support window.eval().`)
}

// Objekt der kommmer til at indeholde alle brugere
// - vi benytter nedenstående brugerobjekt som objekter i objektet
let opfølgningssagerToggle
let bruger = {}
let brugere = []

// Definer objektet for den pågældende bruger der er logget ind
function User(data) {
  this.ID = data.brugerID,
  this.az = data.az,
  this.navn = data.navn,
  this.settings = {
    overfør: {
      antalSager: data.setting_antalSager,
      sagstype: data.setting_sagstype
    },
    status: data.setting_status,
    farvetema: data.setting_farvetema,
    opstartsside: data.setting_opstartsside
  }
}

// Indlæs data i brugerobjektet - main process forespørges via ipc
// indhentning af brugerdata sker i main process pga. brug af process.env hvor der efterspørges windows login username (principiel opdeling i main process)
// Vigtigt at det ikke er asynkront, da vi skal have brugeroplysningerne før alt andet
;(() => {
  data = ipcRenderer.sendSync('get:bruger')
  bruger = new User(data)
})()

// Indlæs data for alle brugere i brugere-objektet - main process forespørges via ipc
;(() => {
  brugereData = ipcRenderer.sendSync('get:brugere')
  
  brugereData.forEach(brugerData => {
    const nyBruger = new User(brugerData)      
    brugere.push(nyBruger)
  })
})()







/* NAV CONTROLLOR ***********************************************************/
const NavCtrl = {
  
  init: () => {

    // vis progressbar
    // UIRender.renderProgressBar()

    // Skjul navbar midlertidig indtil farvetemaet er indlæst
    document.getElementById('navbar').style.display = 'none'

    // Indlæs navigationselementer
    UIRender.renderNav()
    
    // Aktiver dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-trigger')
    M.Dropdown.init(dropdowns,{
      hover: true,
      coverTrigger: false
    })
    
    
    // Vis navbar
    document.getElementById('navbar').style.display = 'block'
    
    // Indlæs standardindstilling for antal sager der skal overføres
    UIRender.optionsOverførSager()
    
    // Indlæs farvetemaet
    UIRender.updateColorTheme()
    
    
    // åbn startside
    UICtrl.listeInit(bruger.settings.opstartsside)
    
    // sæt test border
    if (SQLConfig.database === 'BBRsagsstyring_Test') {
      document.getElementsByTagName('body')[0].classList.add('test')
    }
    }
  }



// App init
NavCtrl.init()

let modal

document.addEventListener('DOMContentLoaded', () => {
  
  // Init Materialize modal
  modal = M.Modal.init(document.getElementById('modal-single-view'), {
    opacity: 0.5,
    inDuration: 100,
    outDuration: 100,
    preventScrolling: false,
    dismissible: true
  })

  // Init tooltips
  const elems_tooltips = document.querySelectorAll('.tooltipped')
  M.Tooltip.init(elems_tooltips, {
    enterDelay: 1000,
    exitDelay: 250
  })

})



// Update counters/nav løbende
;(function() {
  UIRender.updateCounters()
  setTimeout(arguments.callee, 10 * 60 * 1000) // min * sekunder * millisekunder = hver 10. minut
})()


ipcRenderer.on('page:mine-sager', () => {
  UICtrl.listeInit(0)
})

ipcRenderer.on('page:sager-under-behandling-tilladelsessager', () => {
  UICtrl.listeInit(3)
})

ipcRenderer.on('page:sager-under-behandling-afslutningssager', () => {
  UICtrl.listeInit(4)
})

ipcRenderer.on('page:afventende-sager-tilladelsessager', () => {
  UICtrl.listeInit(1)
})

ipcRenderer.on('page:afventende-sager-afslutningssager', () => {
  UICtrl.listeInit(2)
})

ipcRenderer.on('page:opfølgningsliste', () => {
  UICtrl.listeInit(5)
})

ipcRenderer.on('page:indstillinger', () => {
  UICtrl.loadPageSettings()
})