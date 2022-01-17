const { fn } = require('../functions')
const { ipcRenderer } = require('electron')

const { DBCtrl } = require('../db-ctrl')
const { UIRender } = require('../ui-render')
const { ItemCtrl } = require('../item-ctrl')
const { UICtrl } = require('../ui-ctrl')

const sql = require('mssql/msnodesqlv8')
const { SQLConfig } = require('../sql-config')

window.eval = global.eval = function() {
    throw new Error(`Sorry, this app does not support window.eval().`)
}

// Objekt der kommmer til at indeholde alle brugere
// - vi benytter nedenstående brugerobjekt som objekter i objektet
// let opfølgningssagerToggle
let bruger = {}
let brugere = []
const colors = ['', 'blue', 'green', 'amber', 'red']
const modalGemt = document.getElementById('modal-gemt')
const modalGemmer = document.getElementById('modal-gemmer')
const modalLoading = document.getElementById('modal-loading')

// Definer objektet for den pågældende bruger der er logget ind
function User(data) {
    this.ID = data.ID,
        this.az = data.az || '',
        this.navn = data.navn || '',
        this.settings = {
            overfør: {
                antalSager: data.setting_antalSager || 0,
                sagstype: data.setting_sagstype || 0
            },
            status: data.setting_status || 0,
            farvetema: data.setting_farvetema || 0,
            opstartsside: data.setting_opstartsside || 0
        }
}

// Indlæs data i brugerobjektet - main process forespørges via ipc
// indhentning af brugerdata sker i main process pga. brug af process.env hvor der efterspørges windows login username (principiel opdeling i main process)
// Vigtigt at det ikke er asynkront, da vi skal have brugeroplysningerne før alt andet
;
(() => {
    data = ipcRenderer.sendSync('get:bruger')
    bruger = new User(data)
})()

// Indlæs data for alle brugere i brugere-objektet - main process forespørges via ipc
;
(() => {
    brugereData = ipcRenderer.sendSync('get:brugere')

    brugereData.forEach(brugerData => {
        const nyBruger = new User(brugerData)
        brugere.push(nyBruger)
    })
})()







/* NAV CONTROLLOR ***********************************************************/
const NavCtrl = {

    init: () => {

        // Indlæs standardindstilling for antal sager der skal overføres
        UIRender.optionsOverførSager()

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


// Update counters/nav løbende
;
(function() {
    UIRender.updateCounters()
    setTimeout(arguments.callee, 5 * 60 * 1000) // min * sekunder * millisekunder = hver 10. minut
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