const { listeDef, currentSag } = require('./variables')
let { liste } = require('./variables')
const fs = require('fs')

const UICtrl = (() => {

  // EVENT LISTENERS

  

  // Listener for klik på settings
  document.getElementById('button-settings').addEventListener('click', () => {
    UICtrl.loadPageSettings()
  })

  // Listener for klik på dashboard/home
  document.getElementById('button-dashboard').addEventListener('click', () => {
    UICtrl.loadDashboard()
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
        ['brugerID', bruger.ID],
        ['antalSager', antal]
      ]

      const output = ['sp_output']

      // Vis progressbar
      UIRender.renderProgressBar()

      DBCtrl.execStoredProcedure(procedure, params, output)
        .then(response => {
          
          UIRender.deleteProgressBar()

          // Visuel feedback
          fn.saveHighlight(document.getElementById('card-overfør-sager'), `${response.output.sp_output} ${typeTekst} er overført til din liste.`)

          // genindlæs liste
          UICtrl.listeVisning()
          UIRender.updateCounters()

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
  document.getElementById('data-content').addEventListener('click', e => {
  
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

      // Hent sag fra DB
      DBCtrl.get('sag', id)
        .then(sag => sag)
        
        // Hent eventuelle BBR notater
        .then(sag => {
          
          return DBCtrl.getBBRNotater(id)

            .then(data => {
              if (data)
                sag[0].BBRnotater = data              
                
              return sag
            })
        })

        // Hent eventuel lokal note
        .then(sag => {
          return DBCtrl.getNote(id)

            .then(data => {
              if (data[0])
                sag[0].note = data[0]
                
              return sag
            })
        })

        // Indlæs data i DOM elementer
        .then(sag => {
          UIRender.renderSag(sag[0])
          modal.open()
          UIRender.deleteProgressBar()
        })
        .catch(error => { console.log(error) })
      
    }
    

    // OVERFØR SAG TIL MIN LISTE
    if (id && action === 'overfør-sag') {
      
      UIRender.renderProgressBar()

      const params = [
        ['sagID', Number(id)],
        ['brugerID', Number(bruger.ID)],
        ['ændretAfBrugerID', Number(bruger.ID)]
      ]

      DBCtrl.execStoredProcedure('opdaterSagBruger', params)
        .then(() => {
          UIRender.deleteProgressBar()
          M.toast({html: 'Sagen er overført til din liste' })
  
          // genindlæs liste
          UICtrl.listeVisning()
          UICtrl.listeOptions()
          UIRender.updateCounters()

        })
        .catch(error => { console.log(error) })
    }
  })


  
  // ******************** MODALVINDUE - VIS ENKELT SAG ***************************************
  // Listener for modal events: luk vinduet
  document.getElementById('modal-close').addEventListener('click', () => {
    modal.close()
  })


  // ---------------------------------------------------------------------------------------------
  // Listener: Hvem har sagen - save -------------------------------------------------------------
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
      ['sagID', Number(currentSag.sagID)],
      ['brugerID', Number(overføresTilID)],
      ['ændretAfBrugerID', Number(bruger.ID)]
    ]

    // kør stored procedure
    DBCtrl.execStoredProcedure('opdaterSagBruger', params)
      .then(() => {
        // visuel feedback
        fn.saveHighlight(document.getElementById('card-hvem-har-sagen'))
        
        // toast
        if (overføresTil !== null) {
          M.toast({ html: 'Sagen overført til ' + overføresTil.navn })
        } else {
          M.toast({ html: 'Sagen er lagt tilbage til gruppen.'})
        }
        
        UIRender.renderHvemHarSagen()
        UICtrl.listeInit(liste.selected)
        UIRender.updateCounters()

      })
      .catch(error => { console.log(error) })
  })

  
  // --------------------------------------------------------------------------------------------
  // Listener: læg sagen tilbage til gruppen ----------------------------------------------------
  document.getElementById('hvem-har-sagen-remove-button').addEventListener('click', () => {
    
    const params = [
      ['sagID', Number(currentSag.sagID)],
      ['brugerID', null],
      ['ændretAfBrugerID', Number(bruger.ID)]
    ]

    DBCtrl.execStoredProcedure('opdaterSagBruger', params)
      .then(() => {

        // Visuel feedback
        fn.saveHighlight(document.getElementById('card-hvem-har-sagen'))

        // Toast
        M.toast({html: 'Sagen er lagt tilbage til gruppen.'})
  
        
        UIRender.renderHvemHarSagen()
        UICtrl.listeInit(liste.selected)
        UIRender.updateCounters()

      })
      .catch(error => { console.log(error) })
  })

  // ---------------------------------------------------------------------------------------
  // Listener: Gem note ------------------------------------------------------------------------------
  document.getElementById('gem-note').addEventListener('click', () => {
    const tekst = document.getElementById('note').value

    const params = [
      ['sagID', Number(currentSag.sagID)],
      ['brugerID', Number(bruger.ID)],
      ['tekst', String(tekst)]
    ]

    DBCtrl.execStoredProcedure('opdaterNote', params)
      .then(() =>  {
        // Visuel feedback
        fn.saveHighlight(document.getElementById('card-note'))
        
        // Opdater DOM element med timestamp og navn på author
        DBCtrl.getNote(currentSag.sagID)
          .then(updatedNote => {
            document.getElementById('note-timestamp').textContent = fn.datoConvert(updatedNote.timestamp)
            document.getElementById('note-brugernavn').textContent = updatedNote.ændretAfBrugerNavn
          })
          .catch(error => { console.log(error) })
      })
  })


  // --------------------------------------------------------------------------------------------------------------
  // Listener: Gemme færdigbehandling af tilladelsessag -----------------------------------------------------------
  document.getElementById('færdigbehandling-tilladelsessag').addEventListener('change', () => {
    
    const value = document.getElementById('færdigbehandling-tilladelsessag').checked

    // sæt parameter til brug i stored procedure til enten 0 eller 1 alt afhængig af om der er afkrydset eller ej
    // begge afkrydsningsfelter skal sendes med til stored procedure
    const checked = value === true ? 1 : 0

    const params = [
      ['sagID', Number(currentSag.sagID)],
      ['brugerID', Number(bruger.ID)],
      ['checked', Number(checked)]
    ]
    
    DBCtrl.execStoredProcedure('opdaterSagFærdigbehandlingTilladelse', params)
      .then(() => {
        // Visuel feedback når færdigbehandlingen er gemt i DB
        const card = document.getElementById('card-færdigbehandling-tilladelse')
        fn.saveHighlight(card)

        // sagen lægges automatisk tilbage til gruppen i stored procedure, opdater derfor liste og counters
        UICtrl.listeInit(liste.selected)
        UIRender.updateCounters()
        
        // Hent den ændrede sag
        DBCtrl.get('sag',currentSag.sagID)
          .then(updatedSag => {
            // Timestamp og navn
            document.getElementById('færdigbehandlet-tilladelsessag-label').textContent = updatedSag[0].timestampFærdigbehandletTilladelse === null ? null : `${fn.datoConvert(updatedSag[0].timestampFærdigbehandletTilladelse)} ${updatedSag[0].færdigbehandletTilladelseBrugerNavn}`
          })
          .catch(error => { console.log(error) })
      })
  })

  // -------------------------------------------------------------------------------------------------------------
  // Gemme færdigbehandling af afslutningssag --------------------------------------------------------------------
  document.getElementById('færdigbehandling-afslutningssag').addEventListener('change', () => {

    const value = document.getElementById('færdigbehandling-afslutningssag').checked

    // sæt parameter til brug i stored procedure til enten 0 eller 1 alt afhængig af om der er afkrydset eller ej
    // begge afkrydsningsfelter skal sendes med til stored procedure
    const checked = value === true ? 1 : 0

    const params = [
      ['sagID', Number(currentSag.sagID)],
      ['brugerID', Number(bruger.ID)],
      ['checked', Number(checked)]
    ]

    DBCtrl.execStoredProcedure('opdaterSagFærdigbehandlingAfslutning', params)
      .then(() => {
        // Visuel feedback når færdigbehandlingen er gemt i DB
        const card = document.getElementById('card-færdigbehandling-afslutning')
        fn.saveHighlight(card)

        // sagen lægges automatisk tilbage til gruppen i stored procedure, opdater derfor liste og counters
        UICtrl.listeInit(liste.selected)
        UIRender.updateCounters()
        
        // Hent den ændrede sag
        DBCtrl.get('sag', currentSag.sagID)
          .then(updatedSag => {
            // Timestamp og navn
            document.getElementById('færdigbehandlet-afslutningssag-label').textContent = updatedSag[0].timestampFærdigbehandletAfslutning === null ? null : `${fn.datoConvert(updatedSag[0].timestampFærdigbehandletAfslutning)} ${updatedSag[0].færdigbehandletAfslutningBrugerNavn}`
          })
          .catch(error => { console.log(error) })
        
      })
  })

  // ----------------------------------------------------------------------------------------------------------
  // Markering ------------------------------------------------------------------------------------------------
  document.getElementById('markering').addEventListener('change', () => {

    const radios = document.getElementsByName('color')
    
    // Gennemløb markeringscheckboxe
    for (let i=0; i < radios.length; i++) {

      // Er denne checkbox afkrydset?
      if (radios[i].checked) {
        
        // hvis værdien er null (string), sæt color til null - dvs. ingen markering
        const color = radios[i].value === 'null' ? null : radios[i].value
        
        // Definer parametere til stored procedure
        const params = [
          ['sagID', Number(currentSag.sagID)],
          ['brugerID', Number(bruger.ID)],
          ['color', Number(color)]
        ]

        // Kald stored procedure
        DBCtrl.execStoredProcedure('opdaterMarkering', params)
          .then(() => {

            UICtrl.listeVisning()
            UICtrl.listeOptions()
          })
          .catch(error => { console.log(error) })
        
        // Vi har fundet den afkrydsede checkbox, stop med at lede videre
        break
      }
    }
  })
  
  
  // ******************* SKIFT SIDE ******************************************************************************************

  // mine sager
  document.getElementById('navMineSager').addEventListener('click', e => {
    e.preventDefault()
    UICtrl.listeInit(0)

  })
  

  // Afventende sager - tilladelsessager
  document.getElementById('navIkkeTildeltTilladelse').addEventListener('click', e => {
    e.preventDefault()
    UICtrl.listeInit(1)
  })


  // Afventende sager - afslutningssager
  document.getElementById('navIkkeTildeltAfsluttet').addEventListener('click', e => {
    e.preventDefault()
    UICtrl.listeInit(2)
  })


  // Sager under behandling - tilladelsessager
  document.getElementById('navTildeltTilladelse').addEventListener('click', e => {
    e.preventDefault()
    UICtrl.listeInit(3)
  })


  // Sager under behandling - afslutningssager
  document.getElementById('navTildeltAfsluttet').addEventListener('click', e => {
    e.preventDefault()
    UICtrl.listeInit(4)
  })


  // Opfølgningsliste
  document.getElementById('navOpfølgningsliste').addEventListener('click', e => {
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

    loadDashboard: () => {
      const contentArea = document.getElementById('data-content')

      fs.readFile(`${__dirname}/renderer/dashboard.html`, 'utf8', (err, content) => {

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
        getRows('tilladelsessager', fn.datoConvert(today, 'yyyy-mm-dd'), fn.datoConvert(today, 'yyyy-mm-dd'))
          .then(sum => {
            tilladelsessager_today_dom.textContent = sum
          })
          .catch(error => { console.log(error) })

        getRows('afslutningssager', fn.datoConvert(today, 'yyyy-mm-dd'), fn.datoConvert(today, 'yyyy-mm-dd'))
          .then(sum => {
            afslutningssager_today_dom.textContent = sum
          })
          .catch(error => { console.log(error) })
        

        // Denne uge
        getRows('tilladelsessager', fn.datoConvert(fn.getMonday(), 'yyyy-mm-dd'), fn.datoConvert(fn.getSunday(), 'yyyy-mm-dd'))
          .then(sum => {
            tilladelsessager_week_dom.textContent = sum
          })
          .catch(error => { console.log(error) })

        getRows('afslutningssager', fn.datoConvert(fn.getMonday(), 'yyyy-mm-dd'), fn.datoConvert(fn.getSunday(), 'yyyy-mm-dd'))
          .then(sum => {
            afslutningssager_week_dom.textContent = sum
          })
          .catch(error => { console.log(error) })


        // Denne måned
        getRows('tilladelsessager', fn.datoConvert(fn.getFirstDayOfMonth(), 'yyyy-mm-dd'), fn.datoConvert(fn.getLastDayOfMonth(), 'yyyy-mm-dd'))
          .then(sum => {
            tilladelsessager_month_dom.textContent = sum
          })

        getRows('afslutningssager', fn.datoConvert(fn.getFirstDayOfMonth(), 'yyyy-mm-dd'), fn.datoConvert(fn.getLastDayOfMonth(), 'yyyy-mm-dd'))
          .then(sum => {
            afslutningssager_month_dom.textContent = sum
          })
          .catch(error => { console.log(error) })
      })

      // Hent tal fra databasen
      const getRows = function(sagstype, datoMin, datoMax) {
        let sum = 0

        if (sagstype === 'tilladelsessager') {
          return DBCtrl.getKPITilladelsessager(datoMin, datoMax)
            .then(rows => {
              if (rows) {
                rows.forEach(row => {
                  sum += row.antalSager
                })
              }
              return sum
            })
            .catch(error => { console.log(error) })
        }
        
        if (sagstype === 'afslutningssager') {
          return DBCtrl.getKPIAfslutningssager(datoMin, datoMax)
            .then(rows => {
              if (rows) {
                rows.forEach(row => {
                  sum += row.antalSager
                })
              }
              return sum
            })
            .catch(error => { console.log(error) })
        }
      }
    },


    loadPageSettings: () => {
      const contentArea = document.getElementById('data-content')

      fs.readFile(`${__dirname}/renderer/settings.html`, 'utf8', (err, content) => {
  
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
        document.getElementById('farve-tema').addEventListener('change', e => {
          const farveClicked = e.target.value

          // skriv ny værdi til databasen
          const params = [
            ['brugerID', Number(bruger.ID)],
            ['brugerIDÆndretAf', Number(bruger.ID)],
            ['setting_farvetema', Number(farveClicked)]
          ]

          DBCtrl.execStoredProcedure('opdaterBruger', params)
            .then(() => {
              // Opdater brugerobjekt fra databasen
              const data = ipcRenderer.sendSync('get:bruger')
              bruger = new User(data)
              UIRender.updateColorTheme()
  
              // Visual feedback
              fn.saveHighlight(document.getElementById('card-settings-generelt'))
            })
            .catch(error => { console.log(error) })
        })
  

        // Listener - navn GEM 
        let navnDelay
        document.getElementById('settings-bruger-navn').addEventListener('keyup', e => {

          const inputValue = e.target.value

          if (navnDelay)
            clearTimeout(navnDelay)

          navnDelay = setTimeout(() => {
            
            // skriv ny værdi til databasen
            const params = [
              ['brugerID', Number(bruger.ID)],
              ['brugerIDÆndretAf', Number(bruger.ID)],
              ['navn', String(inputValue)]
            ]
            
            
            DBCtrl.execStoredProcedure('opdaterBruger', params)
              .then(() => {
                // Opdater brugerobjekt fra databasen
                const data = ipcRenderer.sendSync('get:bruger')
                bruger = new User(data)
                
                // fjern fokus fra tekstboks
                e.target.blur()
                
                // Visuel feedback
                fn.saveHighlight(document.getElementById('card-settings-brugernavn'))
              })
              .catch(error => { console.log(error) })
          }, 3500) 
        })
  
  
        // Listener - antal sager GEM
        let antalSagerDelay
        document.getElementById('settings-antal-sager').addEventListener('keyup', e => {

          const inputValue = e.target.value

          if (antalSagerDelay)
            clearTimeout(antalSagerDelay)

          antalSagerDelay = setTimeout(() => {

            // skriv ny værdi til databasen
            const params = [
              ['brugerID',Number(bruger.ID)],
              ['brugerIDÆndretAf',Number(bruger.ID)],
              ['setting_antalSager', Number(inputValue)]
            ]

            DBCtrl.execStoredProcedure('opdaterBruger', params)
              .then(() => {

                // Opdater brugerobjekt fra databasen
                const data = ipcRenderer.sendSync('get:bruger')
                bruger = new User(data)
  
                // Opdater felt i navbar
                document.getElementById('overfør-sager-antal').value = bruger.settings.overfør.antalSager
                M.updateTextFields()
  
                // fjern fokus fra tekstboks
                e.target.blur()
  
                // Visuel feedback
                fn.saveHighlight(document.getElementById('card-settings-overførelse'))
              })
              .catch(error => { console.log(error) })
          }, 3500)

        })
  
  
        // Listener - overfør til sagsstype - GEM
        document.getElementById('settings-default-overfør-type').addEventListener('change', e => {
          const valg = Number(e.target.value)

          // skriv ny værdi til databasen
          const params = [
            ['brugerID',Number(bruger.ID)],
            ['brugerIDÆndretAf', Number(bruger.ID)],
            ['setting_sagstype', Number(valg)]
          ]

          DBCtrl.execStoredProcedure('opdaterBruger', params)
            .then(() => {
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
              
              // Visuel feedback
              fn.saveHighlight(document.getElementById('card-settings-overførelse'))
            })
            .catch(error => { console.log(error) })
        })
  
  
        // Listener - opstartsside GEM
        document.getElementById('settings-load-startup').addEventListener('change', e => {
          const valg = Number(e.target.value)

          // skriv ny værdi til databasen
          const params = [
            ['brugerID', Number(bruger.ID)],
            ['brugerIDÆndretAf',Number(bruger.ID)],
            ['setting_opstartsside', Number(valg)]
          ]

          DBCtrl.execStoredProcedure('opdaterBruger', params)
            .then(() => {
              // Opdater brugerobjekt fra databasen
              const data = ipcRenderer.sendSync('get:bruger')
              bruger = new User(data)

              // Visuel feedback
              fn.saveHighlight(document.getElementById('card-settings-generelt'))

            })
        })
     
      })
    },

    // ***********************************************************************************************************************
    listeInit: (listeID) => {
      liste.selected = listeID
      UIRender.clearSearchBox()
      UICtrl.listeVisning()
      UICtrl.listeOptions()
    },
    
    // ***********************************************************************************************************************
    // ***
    // Generel method som benyttes til at kalde methods på UIRender til visning af lister.
    // ***
    listeVisning: () => {

      // Vis progress bar
      UIRender.renderProgressBar()

      // Fjern gammel table
      UIRender.deleteChildren('data-content')

      UIRender.renderListViewTable()
      UIRender.renderListViewHeadlines()

      // hent data
      DBCtrl.get(listeDef[liste.selected].listeNavn)
        .then(result => {
          
          liste.items = result
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
        })


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