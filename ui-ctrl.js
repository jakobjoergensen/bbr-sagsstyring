const { listeDef, currentSag } = require('./variables')
let { liste } = require('./variables')
const fs = require('fs')

const UICtrl = (() => {

  // EVENT LISTENERS

  

  // Listener for klik på settings
  document.getElementById('button-settings').addEventListener('click', async () => {
    await UICtrl.loadPageSettings()
  })

  // Listener for klik på dashboard/home
  document.getElementById('button-dashboard').addEventListener('click', async () => {
    await UICtrl.loadDashboard()
  })

  // Listener for overfør sager
  document.getElementById('overfør-sager').addEventListener('click', e => {
    const antal = document.getElementById('overfør-sager-antal').value
    const typeClicked = document.getElementsByName('overfør-sager-type')
    let type

    // Gennemløb radio
    for (let i = 0; i < typeClicked.length; i++) {

      // Er denne checkbox afkrydset?
      if (typeClicked[i].checked) {

        // hvis værdien er null (string), sæt color til null - dvs. ingen markering
        type = typeClicked[i].value === 'null' ? null : i + 1 // +1 fordi 1 = tilladelsessager, 2 = afslutnignssager

        // Vi har fundet den afkrydsede checkbox, stop med at lede videre
        break
      }
    }

    // 1 = tilladelsessager
    // 2 = afslutningssager
    let procedure
    let typeTekst

    if (type === 1) {
      procedure = 'opdaterSagBrugerTilladelsessager'
      typeTekst = 'tilladelsessag'
    }

    if (type === 2) {
      procedure = 'opdaterSagBrugerAfslutningssager'
      typeTekst = 'afslutningssag'
    }
      
    // check at alt er udfyldt
    if (antal > 0 && type !== null) {
      
      if (antal > 1)
        typeTekst += 'er'
      
      const params = [
        bruger.ID,
        antal
      ]

      DBCtrl.execStoredProcedure(procedure, params, (err, result, output) => {
        fn.saveHighlight(document.getElementById('card-overfør-sager'), `${output[1]} ${typeTekst} er overført til din liste.`)
      })
      
    }

  })

  // Listener for expand options
  document.getElementById('expand-options').addEventListener('click', e => {
    
    const currentIcon = e.target.textContent
    const options = document.getElementById('options-fixed')
    const content = document.getElementById('data-content')

    if (currentIcon === 'expand_less') {
      e.target.textContent = 'expand_more'
      options.classList.add('hide-options')
      content.classList.add('hide-options')
      options.classList.remove('show-options')
      content.classList.remove('show-options')
    }
    
    if (currentIcon === 'expand_more') {
      e.target.textContent = 'expand_less'
      options.classList.remove('hide-options')
      content.classList.remove('hide-options')
      options.classList.add('show-options')
      content.classList.add('show-options')
    }

    
  })

  // Listener for data-content
  document.getElementById('data-content').addEventListener('click', async e => {
  
    // Find sagID på den række der er blevet klikket på
    const target = e.target
    
    
    // Alt afhængig af om der er klikket på overførknappen eller rækken, skal ID i TR findes forskellige steder
    //         klik på række                                   || klik på overførknap                                                         || andet
    const id = target.parentElement.getAttribute('data-sagid') || target.parentElement.parentElement.parentElement.getAttribute('data-sagid') || null
    const actionClicked = target.parentElement.classList
    let action = ''

    if (actionClicked.contains('action-overfør-sag'))
      action = 'overfør-sag'
    

    // ÅBN SAG I MODAL VINDUE
    // hvis der findes et id, er det vis-knappen der er blevet klikket på
    if (id && action === '') {
      
      // Registrer sagsnummer !!!!!!!
      currentSag.sagID = id

      // Vis progress bar
      UIRender.renderProgressBar()

      // Hent data fra databasen
      const bbrNotater = await DBCtrl.getBBRNotater(id)
      const note = await DBCtrl.getNote(id)

      const sag = await DBCtrl.get('sag', id)
      if (bbrNotater)
        sag[0].BBRnotater = bbrNotater

      if (note)
        sag[0].note = note

      // Indlæs data i DOM elementer
      UIRender.renderSag(sag[0])

      // Åbn modal vindue
      modal.open()

      UIRender.deleteProgressBar()
    }
    

    // OVERFØR SAG TIL MIN LISTE
    if (id && action === 'overfør-sag') {
      
      UIRender.renderProgressBar()

      const params = [
        id,
        bruger.ID,
        bruger.ID
      ]

      DBCtrl.execStoredProcedure('opdaterSagBruger', params, async () => {
        UIRender.deleteProgressBar()
        M.toast({html: 'Sagen er overført til din liste' })

        // genindlæs liste
        await UICtrl.listeVisning()
        UICtrl.listeOptions()
        UIRender.renderNav()
      })
    }
  })


  
  // ******************** MODALVINDUE - VIS ENKELT SAG ***************************************
  // Listener for modal events: luk vinduet
  document.getElementById('modal-close').addEventListener('click', () => {
    modal.close()
  })

  // Hvem har sagen - save
  document.getElementById('hvem-har-sagen-save-button').addEventListener('click', () => {
    const instance = M.FormSelect.init(document.getElementById('hvem-har-sagen'))
    let overføresTilID = instance.getSelectedValues()[0]

    // hvis tilbage til gruppen, sæt value til null
    if (overføresTilID === 'tilbage-til-gruppen')
      overføresTilID = null

    // konverer til number
    if (typeof overføresTilID === 'string')
      overføresTilID = Number(overføresTilID)

    // hent object på den pågældende bruger fra vores "brugere"-array
    const overføresTil = brugere.find(x => x.ID === overføresTilID) || null

    const params = [
      currentSag.sagID,
      overføresTilID,
      bruger.ID
    ]

    
    DBCtrl.execStoredProcedure('opdaterSagBruger', params, async () => {
      fn.saveHighlight(document.getElementById('card-hvem-har-sagen'))
    
      if (overføresTil !== null) {
        M.toast({ html: 'Sagen overført til ' + overføresTil.navn })
      } else {
        M.toast({ html: 'Sagen er lagt tilbage til gruppen.'})
      }

      await UIRender.renderHvemHarSagen()
      UICtrl.listeInit(liste.selected)
      UIRender.renderNav()


    })

  })

  // Listener: læg sagen tilbage til gruppen
  document.getElementById('hvem-har-sagen-remove-button').addEventListener('click', () => {
    
    const params = [
      currentSag.sagID,
      null,
      bruger.ID
    ]

    DBCtrl.execStoredProcedure('opdaterSagBruger', params, async () => {
      fn.saveHighlight(document.getElementById('card-hvem-har-sagen'))
      M.toast({html: 'Sagen er lagt tilbage til gruppen.'})

      
      await UIRender.renderHvemHarSagen()
      UICtrl.listeInit(liste.selected)
      UIRender.renderNav()

    })
  })

  // Gem note
  document.getElementById('gem-note').addEventListener('click', () => {
    const tekst = document.getElementById('note').value

    const params = [
      currentSag.sagID,
      bruger.ID,
      tekst
    ]

    DBCtrl.execStoredProcedure('opdaterNote', params, async () => {
      fn.saveHighlight(document.getElementById('card-note'))

      const updatedNote = await DBCtrl.getNote(currentSag.sagID)
      document.getElementById('note-timestamp').textContent = fn.datoConvert(updatedNote.timestamp)
      document.getElementById('note-brugernavn').textContent = updatedNote.ændretAfBrugerNavn
    })    
  })

  // Gemme færdigbehandling af tilladelsessag
  document.getElementById('færdigbehandling-tilladelsessag').addEventListener('change', async e => {
    
    const value = document.getElementById('færdigbehandling-tilladelsessag').checked
    
    // sæt parameter til brug i stored procedure til enten 0 eller 1 alt afhængig af om der er afkrydset eller ej
    // begge afkrydsningsfelter skal sendes med til stored procedure
    const checked = value === true ? 1 : 0

    const params = [
      currentSag.sagID,
      bruger.ID,
      checked
    ]
    
    DBCtrl.execStoredProcedure('opdaterSagFærdigbehandlingTilladelse', params, async () => {
      const card = document.getElementById('card-færdigbehandling-tilladelse')
      fn.saveHighlight(card)

      const updatedSag = await DBCtrl.get('sag',currentSag.sagID)
      document.getElementById('færdigbehandlet-tilladelsessag-label').textContent = updatedSag[0].timestampFærdigbehandletTilladelse === null ? null : `${fn.datoConvert(updatedSag[0].timestampFærdigbehandletTilladelse)} ${updatedSag[0].færdigbehandletTilladelseBrugerNavn}`
      UIRender.renderNav()
    })
  })

  // Gemme færdigbehandling af afslutningssag
  document.getElementById('færdigbehandling-afslutningssag').addEventListener('change', async e => {

    const value = document.getElementById('færdigbehandling-afslutningssag').checked

    // sæt parameter til brug i stored procedure til enten 0 eller 1 alt afhængig af om der er afkrydset eller ej
    // begge afkrydsningsfelter skal sendes med til stored procedure
    const checked = value === true ? 1 : 0

    const params = [
      currentSag.sagID,
      bruger.ID,
      checked
    ]

    DBCtrl.execStoredProcedure('opdaterSagFærdigbehandlingAfslutning', params, async () => {
      const card = document.getElementById('card-færdigbehandling-afslutning')
      fn.saveHighlight(card)

      const updatedSag = await DBCtrl.get('sag', currentSag.sagID)
      document.getElementById('færdigbehandlet-afslutningssag-label').textContent = updatedSag[0].timestampFærdigbehandletAfslutning === null ? null : `${fn.datoConvert(updatedSag[0].timestampFærdigbehandletAfslutning)} ${updatedSag[0].færdigbehandletAfslutningBrugerNavn}`
      UIRender.renderNav()
    })
  })

  // Markering
  document.getElementById('markering').addEventListener('change', async e => {

    const radios = document.getElementsByName('color')
    
    // Gennemløb markeringscheckboxe
    for (let i=0; i < radios.length; i++) {

      // Er denne checkbox afkrydset?
      if (radios[i].checked) {
        
        // hvis værdien er null (string), sæt color til null - dvs. ingen markering
        const color = radios[i].value === 'null' ? null : radios[i].value
        
        // Definer parametere til stored procedure
        const params = [
          currentSag.sagID,
          bruger.ID,
          color
        ]

        // Kald stored procedure
        await DBCtrl.execStoredProcedure('opdaterMarkering', params, async () => {

          // Callback efter stored procedure er færdig
          await UICtrl.listeVisning()
          UICtrl.listeOptions()
        })
        
        // Vi har fundet den afkrydsede checkbox, stop med at lede videre
        break
      }
    }
  })
  
  
  // ******************* SKIFT SIDE ******************************************************************************************

  // mine sager
  document.getElementById('navMineSager').addEventListener('click', async e => {
    e.preventDefault()
    UICtrl.listeInit(0)

  })
  

  // Afventende sager - tilladelsessager
  document.getElementById('navIkkeTildeltTilladelse').addEventListener('click', async e => {
    e.preventDefault()
    UICtrl.listeInit(1)
  })


  // Afventende sager - afslutningssager
  document.getElementById('navIkkeTildeltAfsluttet').addEventListener('click', async e => {
    e.preventDefault()
    UICtrl.listeInit(2)
  })


  // Sager under behandling - tilladelsessager
  document.getElementById('navTildeltTilladelse').addEventListener('click', async e => {
    e.preventDefault()
    UICtrl.listeInit(3)
  })


  // Sager under behandling - afslutningssager
  document.getElementById('navTildeltAfsluttet').addEventListener('click', async e => {
    e.preventDefault()
    UICtrl.listeInit(4)
  })


  // Opfølgningsliste
  document.getElementById('navOpfølgningsliste').addEventListener('click', async e => {
    e.preventDefault()
    UICtrl.listeInit(5)
  })


  // ************************ SØGEBOKS ****************************************************************
  let searchDelay
  document.getElementById('search').addEventListener('keyup', e => {

    // Hvis der ikke er valgt en liste, gør intet
    if (liste.selected === null)
      return false

    // ... ellers gå vidre med søgning
    const inputValue = e.target.value

    if (searchDelay)
      clearTimeout(searchDelay)

    searchDelay = setTimeout(() => {
      // Registrer søgeord
      listeDef[liste.selected].searchString = inputValue
      // Fjern indhold fra gammel table
      UIRender.deleteChildren('tbody')

      // indlæs liste igen
      UIRender.renderListView()


    }, 500)
    
  })


  // ****************************************************************************************************************
  // ****************************************************************************************************************
  return {

    loadDashboard: async () => {
      const contentArea = document.getElementById('data-content')

      await fs.readFile(`${__dirname}/renderer/dashboard.html`, 'utf8', async (err, content) => {

        // Check for indlæsningsfejl
        if (err) {
          console.log(err)
          return
        }

        contentArea.innerHTML = content

        // DOM elements
        const tilladelsessager_today_dom = document.getElementById('tilladelsessager-today')
        const afslutningssager_today_dom = document.getElementById('afslutningssager-today')
        const tilladelsessager_week_dom = document.getElementById('tilladelsessager-week')
        const afslutningssager_week_dom = document.getElementById('afslutningssager-week')
        const tilladelsessager_month_dom = document.getElementById('tilladelsessager-month')
        const afslutningssager_month_dom = document.getElementById('afslutningssager-month')

        // Dags dato
        const today = new Date()


        // I dag
        tilladelsessager_today_dom.textContent = await getRows('tilladelsessager', fn.datoConvert(today, 'yyyy-mm-dd'), fn.datoConvert(today, 'yyyy-mm-dd'))
        afslutningssager_today_dom.textContent = await getRows('afslutningssager', fn.datoConvert(today, 'yyyy-mm-dd'), fn.datoConvert(today, 'yyyy-mm-dd'))
        
        // Denne uge
        tilladelsessager_week_dom.textContent = await getRows('tilladelsessager', fn.datoConvert(fn.getMonday(), 'yyyy-mm-dd'), fn.datoConvert(fn.getSunday(), 'yyyy-mm-dd'))
        afslutningssager_week_dom.textContent = await getRows('afslutningssager', fn.datoConvert(fn.getMonday(), 'yyyy-mm-dd'), fn.datoConvert(fn.getSunday(), 'yyyy-mm-dd'))

        // Denne måned
        tilladelsessager_month_dom.textContent = await getRows('tilladelsessager', fn.datoConvert(fn.getFirstDayOfMonth(), 'yyyy-mm-dd'), fn.datoConvert(fn.getLastDayOfMonth(), 'yyyy-mm-dd'))
        afslutningssager_month_dom.textContent = await getRows('afslutningssager', fn.datoConvert(fn.getFirstDayOfMonth(), 'yyyy-mm-dd'), fn.datoConvert(fn.getLastDayOfMonth(), 'yyyy-mm-dd'))
      })

      
      

      async function getRows(sagstype, datoMin, datoMax) {
        let sum = 0
        let rows

        if (sagstype === 'tilladelsessager')
          rows = await DBCtrl.getKPITilladelsessager(datoMin, datoMax)
          
        if (sagstype === 'afslutningssager')
          rows = await DBCtrl.getKPIAfslutningssager(datoMin, datoMax)

        if (rows) {
          rows.forEach(async row => {
            sum += row.antalSager
          })
        }

        return sum
      }
    },


    loadPageSettings: async () => {
      const contentArea = document.getElementById('data-content')

      await fs.readFile(`${__dirname}/renderer/settings.html`, 'utf8', (err, content) => {

        if (err) {
          console.log(err)
          return
        }

        contentArea.innerHTML = content
        
        // Indlæs data
        UIRender.renderSettings()

        const selectElements = document.querySelectorAll('select')
        M.FormSelect.init(selectElements)


        // Listener - farvetema GEM
        document.getElementById('farve-tema').addEventListener('change', async (e) => {
          const farveClicked = e.target.value

          // skriv ny værdi til databasen
          const params = [
            bruger.ID,
            bruger.ID,
            null, // az
            null, // navn
            null, // setting_antalSager
            null, // setting_status
            farveClicked,
            null, // setting_sagstype
            null // setting_opstartsside
          ]

          await DBCtrl.execStoredProcedure('opdaterBruger', params, () => {

            // Opdater brugerobjekt fra databasen
            const data = ipcRenderer.sendSync('get:bruger')
            bruger = new User(data)
            UIRender.updateColorTheme()

            fn.saveHighlight(document.getElementById('card-settings-generelt'))
          })
        })

        // Listener - navn GEM 
        let navnDelay
        document.getElementById('settings-bruger-navn').addEventListener('keyup', async e => {

          const inputValue = e.target.value

          if (navnDelay)
            clearTimeout(navnDelay)

          navnDelay = setTimeout(async () => {
            
            // skriv ny værdi til databasen
            const params = [
              bruger.ID,
              bruger.ID,
              null, // az
              inputValue, // navn
              null, // setting_antalSager
              null, // setting_status
              null, // setting_farvetema
              null, // setting_sagstype
              null // setting_opstartsside
            ]
           
            
            await DBCtrl.execStoredProcedure('opdaterBruger', params, () => {
              
              // Opdater brugerobjekt fra databasen
              const data = ipcRenderer.sendSync('get:bruger')
              bruger = new User(data)
              
              // fjern fokus fra tekstboks
              e.target.blur()
              
              fn.saveHighlight(document.getElementById('card-settings-brugernavn'))
            })

          }, 3500)
        
        })


        // Listener - antal sager GEM
        let antalSagerDelay
        document.getElementById('settings-antal-sager').addEventListener('keyup', async e => {

          const inputValue = e.target.value

          if (antalSagerDelay)
            clearTimeout(antalSagerDelay)

          antalSagerDelay = setTimeout(async () => {

            // skriv ny værdi til databasen
            const params = [
              bruger.ID,
              bruger.ID,
              null, // az
              null, // navn
              inputValue, // setting_antalSager
              null, // setting_status
              null, // setting_farvetema
              null, // setting_sagstype
              null // setting_opstartsside
            ]

            await DBCtrl.execStoredProcedure('opdaterBruger', params, () => {

              // Opdater brugerobjekt fra databasen
              const data = ipcRenderer.sendSync('get:bruger')
              bruger = new User(data)

              // Opdater felt i navbar
              document.getElementById('overfør-sager-antal').value = bruger.settings.overfør.antalSager
              M.updateTextFields()

              // fjern fokus fra tekstboks
              e.target.blur()

              fn.saveHighlight(document.getElementById('card-settings-overførelse'))
            })

          }, 3500)

        })


        // Listener - overfør til sagsstype - GEM
        document.getElementById('settings-default-overfør-type').addEventListener('change', async e => {
          const valg = Number(e.target.value)

          // skriv ny værdi til databasen
          const params = [
            bruger.ID,
            bruger.ID,
            null, // az
            null, // navn
            null, // setting_antalSager
            null, // setting_status
            null, // farvetema,
            valg, // setting_sagstype
            null // setting_opstartsside
          ]

          await DBCtrl.execStoredProcedure('opdaterBruger', params, () => {

            // Opdater brugerobjekt fra databasen
            const data = ipcRenderer.sendSync('get:bruger')
            bruger = new User(data)

            const sagstyper = document.getElementsByName('overfør-sager-type')

            // Opdater indstilling i navbar
            // Gennemløb radio
            for (let i = 0; i < sagstyper.length; i++) {
              
              if (i + 1 === valg) // +1 fordi 1 = tilladelsessager, 2 = afslutningssager
                sagstyper[i].checked = true

            }
            
            fn.saveHighlight(document.getElementById('card-settings-overførelse'))
          })
        })


        // Listener - opstartsside GEM
        document.getElementById('settings-load-startup').addEventListener('change', async e => {
          const valg = Number(e.target.value)

          // skriv ny værdi til databasen
          const params = [
            bruger.ID,
            bruger.ID,
            null, // az
            null, // navn
            null, // setting_antalSager
            null, // setting_status
            null, // farvetema,
            null, // setting_sagstype
            valg // setting_opstartsside
          ]

          await DBCtrl.execStoredProcedure('opdaterBruger', params, () => {

            // Opdater brugerobjekt fra databasen
            const data = ipcRenderer.sendSync('get:bruger')
            bruger = new User(data)
            fn.saveHighlight(document.getElementById('card-settings-generelt'))
          })
        })
      })

    },

    // ***********************************************************************************************************************
    listeInit: async (listeID) => {
      liste.selected = listeID
      UIRender.clearSearchBox()
      await UICtrl.listeVisning()
      UICtrl.listeOptions()
    },
    
    // ***********************************************************************************************************************
    // ***
    // Generel method som benyttes til at kalde methods på UIRender til visning af lister.
    // ***
    listeVisning: async () => {

      // Vis progress bar
      UIRender.renderProgressBar()

      // Fjern gammel table
      UIRender.deleteChildren('data-content')

      UIRender.renderListViewTable()
      UIRender.renderListViewHeadlines()

      // hent data
      liste.items = await DBCtrl.get(listeDef[liste.selected].listeNavn)

      // sæt value på toggle opfølgningssager
      document.getElementById('opfølgningssagerToggle').children[0].firstChild.nextSibling.checked = listeDef[liste.selected].toggle_opfølgningssager

      // Sorter array
      fn.setSortColumn(listeDef[liste.selected].sortColumn, true)
      liste.items.sort(fn.compare)

      // Opdater items-objekternes 'antalBBRnotater'-property, hvis der er noget
      for (let i = 0; i < liste.items.length; i++) {

        // Har sagen nogle BBR notater?
        const match = antalBBRnotater.find(x => x.sagID === liste.items[i].sagID)
        
        // Hvis der er et match, opdater item property 'antalBBRnotater'
        if (match !== undefined) {
          liste.items[i].antalBBRnotater = match.antalBBRnotater
        }
      }


      // indlæs liste
      UIRender.renderListView()

      // event listener på table headlines til brug for sortering af liste
      UICtrl.sorteringskolonner()


      // Fjern progress bar
      UIRender.deleteProgressBar()

    },


    // Etablering af options for lister - visning/skjul opfølgningssager m.m.
    listeOptions: () => {
      
      // Eventlistener på toggle
      document.getElementById('opfølgningssagerToggle').addEventListener('change', (e) => {

        // Register ny toggle value
        const toggle = document.getElementById('opfølgningssagerToggle').children[0].firstChild.nextSibling
        listeDef[liste.selected].toggle_opfølgningssager = toggle.checked

        // Fjern indhold fra gammel table
        UIRender.deleteChildren('tbody')

        // indlæs liste igen
        UIRender.renderListView()


      })
    },


    // Etablering af eventlistener på tabellens overskrifter, for at kunne
    // benytte disse til at sortere listevisningen ved klik på den pågældende overskrift
    sorteringskolonner: () => {

      // listener for klik på sorteringsoverskrifter
      document.getElementById('thead').addEventListener('click', e => {
        if (e.target.textContent) {
          const columnClicked = e.target.getAttribute('data-column-name')
          let text = e.target.firstChild.textContent

          // Fjern indhold fra gammel table
          UIRender.deleteChildren('tbody')

          // Fjern evt. sorteringsindikator fra gammel sorteringskolonne (før vi registrerer ny sorteringskolonne!)
          fn.sortIndicatorRemove()

          // Sorter array
          fn.setSortColumn(columnClicked, false)
          
          liste.items.sort(fn.compare)
          fn.sortIndicatorToggle(e.target)

          // indlæs liste igen
          UIRender.renderListView()

        }
      })
    }
    
  }
})()



module.exports = {
  UICtrl
}