const { fn } = require('./functions')
const { ipcRenderer } = require('electron')

const { DBCtrl } = require('./db-ctrl')
const { UIRender } = require('./ui-render')
const { ItemCtrl } = require('./item-ctrl')
const { UICtrl } = require('./ui-ctrl')



// Objekt der kommmer til at indeholde alle brugere
// - vi benytter nedenstående brugerobjekt som objekter i objektet

let antalBBRnotater = []
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

// Indlæs oplysninger om antal BBR notater
;(() => {
  data = ipcRenderer.sendSync('get:antalBBRnotater')

  data.forEach(d => {
    const row = {
      sagID: d.sagID,
      antalBBRnotater: d.antalBBRnotater
    }

    antalBBRnotater.push(row)
  })
  
})()






/* NAV CONTROLLOR ***********************************************************/
const NavCtrl = (() => {

  // Opdater nav counters hver 10. minut
  
  return {
    init: async () => {

      UIRender.renderProgressBar()

      // Skjul navbar midlertidig (så vi undgår grim lyserød navbar indtil farvetemaet er indlæst)
      document.getElementById('navbar').style.display = 'none'

      // Indlæs navigationselementer
      await UIRender.renderNav()
    
      // Aktiver dropdowns
      const dropdowns = document.querySelectorAll('.dropdown-trigger')
      M.Dropdown.init(dropdowns,{hover:true, coverTrigger: false})
      

      UIRender.optionsOverførSager()
      UIRender.updateColorTheme()
      UIRender.deleteProgressBar()

      // Vis navbar
      document.getElementById('navbar').style.display = 'block'

      UICtrl.listeInit(bruger.settings.opstartsside)
    }
  }
  
})()



// App init
NavCtrl.init()

let modal

document.addEventListener('DOMContentLoaded', () => {
  
  // Init Materialize modal
  modal = M.Modal.init(document.getElementById('modal-single-view'), {
    opacity: 0.5,
    inDuration: 100,
    outDuration: 100,
    preventScrolling: true,
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
  UIRender.renderNav()
  setTimeout(arguments.callee, 2 * 60 * 1000)
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