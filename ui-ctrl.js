const { listeDef, currentSag } = require('./variables')
let { liste } = require('./variables')
const fs = require('fs')
const { UIRender } = require('./ui-render')
const { fn } = require('./functions')

const UICtrl = (() => {

    // EVENT LISTENERS
    function hentSag(id) {

        // Hent sag fra DB
        return DBCtrl.get('sag', id)
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

        // Hent array med færdigbehandlede tilladelse for den pågældende sag
        // (der kan i princippet være flere, da en sag i BBR fordeles til de individuelle entiteter SOM SELVSTÆNDIGE SAGER MED SAMME SAGSNUMMER!)      
        .then(sag => {
            return DBCtrl.getFærdigbehandlingerTilladelse(id)
                .then(data => {
                    if (data)
                        sag[0].færdigbehandletTilladelse = data

                    return sag
                })
        })

        // Hent array med færdigbehandlede afslutningssager for den pågældende sag
        // (der kan i princippet være flere, da en sag i BBR fordeles til de individuelle entiteter SOM SELVSTÆNDIGE SAGER MED SAMME SAGSNUMMER!)      
        .then(sag => {
            return DBCtrl.getFærdigbehandlingerAfsluttet(id)

            .then(data => {
                if (data)
                    sag[0].færdigbehandletAfsluttet = data

                return sag
            })
        })

        // Hent array med færdigbehandlede afslutningssager for den pågældende sag
        // (der kan i princippet være flere, da en sag i BBR fordeles til de individuelle entiteter SOM SELVSTÆNDIGE SAGER MED SAMME SAGSNUMMER!)      
        .then(sag => {
                return DBCtrl.getFærdigbehandlingerPåbegyndelsesdato(id)

                .then(data => {
                    if (data)
                        sag[0].færdigbehandletPåbegyndelsesdato = data

                    return sag
                })
            })
            .then(sag => {
                const contentArea = document.getElementById('data-content')

                fs.readFile(`${__dirname}/renderer/sag.html`, 'utf8', (err, content) => {

                    if (err) {
                        console.log(err)
                        return
                    }

                    contentArea.innerHTML = content

                    document.getElementById('hvem-har-sagen-save-button').addEventListener('click', () => {
                        let overføresTilID = document.getElementById('hvem-har-sagen').value

                        // hvis tilbage til gruppen, sæt value til null
                        if (overføresTilID === 'tilbage-til-gruppen') {
                            overføresTilID = null
                        }

                        // konverer til number
                        if (typeof overføresTilID === 'string') {
                            overføresTilID = Number(overføresTilID)
                        }

                        console.log(`Overfører sag #${currentSag.sagID} til brugerId #${overføresTilID}`)

                        const params = [
                            ['sagId', Number(currentSag.sagID)],
                            ['brugerId', Number(overføresTilID)],
                        ]

                        // kør stored procedure
                        DBCtrl.execStoredProcedure('opdaterSagBruger', params)
                            .then(() => {
                                console.log("Overført")

                                UIRender.renderHvemHarSagen()
                                    // UICtrl.listeInit(liste.selected)
                                UIRender.updateCounters()

                            })
                            .catch(error => { console.log(error) })
                    })


                    // --------------------------------------------------------------------------------------------
                    // Listener: læg sagen tilbage til gruppen ----------------------------------------------------
                    document.getElementById('hvem-har-sagen-remove-button').addEventListener('click', () => {
                        console.log(`Fjerner bruger fra sag #${currentSag.sagID}`)

                        const params = [
                            ['sagId', Number(currentSag.sagID)],
                            ['brugerId', null],
                        ]

                        DBCtrl.execStoredProcedure('opdaterSagBruger', params)
                            .then(() => {
                                console.log("Fjernet")

                                UIRender.renderHvemHarSagen()
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
                            .then(() => {

                                // Opdater DOM element med timestamp og navn på author
                                DBCtrl.getNote(currentSag.sagID)
                                    .then(updatedNote => {
                                        document.getElementById('note-timestamp').textContent = fn.datoTidConvert(updatedNote[0].timestamp)
                                        document.getElementById('note-brugernavn').textContent = updatedNote[0].BrugerNavn
                                    })
                                    .catch(error => { console.log(error) })
                            })
                    })


                    // --------------------------------------------------------------------------------------------------------------
                    // Listener: Gemme færdigbehandling af tilladelsessag -----------------------------------------------------------
                    document.getElementById('færdigbehandling-tilladelsessag').addEventListener('click', () => {

                        console.log(`Gemmer færdigbehandling af tilladelsessag for sag #${currentSag.sagID} bruger #${bruger.ID}`)
                        const params = [
                            ['sagId', Number(currentSag.sagID)],
                            ['brugerId', Number(bruger.ID)]
                        ]

                        DBCtrl.execStoredProcedure('opdaterSagFærdigbehandlingTilladelse', params)
                            .then(() => {
                                console.log('Gemt')

                                // Hent den ændrede sag
                                DBCtrl.getFærdigbehandlingerTilladelse(currentSag.sagID)
                                    .then(() => {
                                        hentSag(currentSag.sagID)
                                        UIRender.updateCounters()
                                    })
                                    .catch(error => { console.log(error) })


                            })
                    })

                    // -------------------------------------------------------------------------------------------------------------
                    // Gemme færdigbehandling af afslutningssag --------------------------------------------------------------------
                    document.getElementById('færdigbehandling-afslutningssag').addEventListener('click', () => {

                        console.log(`Gemmer færdigbehandling af afslutningssag for sag #${currentSag.sagID} bruger #${bruger.ID}`)

                        // sæt parameter til brug i stored procedure til 1
                        const params = [
                            ['sagId', Number(currentSag.sagID)],
                            ['brugerId', Number(bruger.ID)]
                        ]

                        DBCtrl.execStoredProcedure('opdaterSagFærdigbehandlingAfsluttet', params)
                            .then(() => {

                                // Hent den ændrede sag
                                DBCtrl.getFærdigbehandlingerAfsluttet(currentSag.sagID)
                                    .then(() => {
                                        hentSag(currentSag.sagID)
                                        UIRender.updateCounters()
                                    })
                                    .catch(error => { console.log(error) })
                            })
                    })


                    // -------------------------------------------------------------------------------------------------------------
                    // Gemme færdigbehandling af påbegyndelsesdato  --------------------------------------------------------------------
                    document.getElementById('færdigbehandling-påbegyndelsesdato').addEventListener('click', () => {

                        console.log(`Gemmer færdigbehandling af påbegyndelsesdato for sag #${currentSag.sagID} bruger #${bruger.ID}`)

                        const params = [
                            ['sagId', Number(currentSag.sagID)],
                            ['brugerId', Number(bruger.ID)]
                        ]

                        DBCtrl.execStoredProcedure('opdaterSagFærdigbehandlingPåbegyndelse', params)
                            .then(() => {

                                // Hent den ændrede sag
                                DBCtrl.getFærdigbehandlingerPåbegyndelsesdato(currentSag.sagID)
                                    .then(() => {
                                        hentSag(currentSag.sagID)
                                        UIRender.updateCounters()
                                    })
                                    .catch(error => { console.log(error) })
                            })
                    })

                    // ----------------------------------------------------------------------------------------------------------
                    // Markering ------------------------------------------------------------------------------------------------
                    document.getElementById('markering').addEventListener('change', () => {

                        const radios = document.getElementsByName('color')

                        // Gennemløb markeringscheckboxe
                        for (let i = 0; i < radios.length; i++) {

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

                                        // UICtrl.listeVisning()
                                        // UICtrl.listeOptions()
                                    })
                                    .catch(error => { console.log(error) })

                                // const markeringBorder = document.getElementById('markering-border')
                                // markeringBorder.classList.remove(...markeringBorder.classList)

                                // if (color !== null) {
                                //     markeringBorder.classList.add('lighten-1')
                                //     markeringBorder.classList.add(colors[Number(color)])
                                // }


                                // Vi har fundet den afkrydsede checkbox, stop med at lede videre
                                break
                            }
                        }

                    })

                    // Udfylder felter i UI
                    UIRender.renderSag(sag[0])
                        // modal.open()
                        // UIRender.deleteProgressBar()
                })
            })
            .catch(error => { console.log(error) })
    }


    // Listener for klik på settings
    document.getElementById('button-settings').addEventListener('click', () => {
        UICtrl.loadPageSettings()
    })

    // Listener for klik på dashboard/home
    // document.getElementById('button-dashboard').addEventListener('click', () => {
    //     UICtrl.loadDashboard()
    // })

    // Listener for overfør sager
    document.getElementById('overfør-sager').addEventListener('click', e => {
        const antal = document.getElementById('overfør-sager-antal').value
        const sagstype = document.getElementById('overfør-sager-type').value
        let procedure

        if (sagstype === '1') {
            procedure = 'opdaterSagBrugerTilladelsessager'
        }

        if (sagstype === '2') {
            procedure = 'opdaterSagBrugerAfslutningssager'
        }

        // check at alt er udfyldt
        if (antal > 0 && sagstype !== null) {

            const params = [
                ['brugerID', bruger.ID],
                ['antalSager', antal]
            ]

            const output = ['sp_output']

            DBCtrl.execStoredProcedure(procedure, params, output)
                .then(() => {

                    // genindlæs liste
                    UICtrl.listeVisning()
                    UIRender.updateCounters()

                })
        }

    })


    // Listener for data-content
    document.getElementById('data-content').addEventListener('click', e => {

        // Find sagID på den række der er blevet klikket på
        const target = e.target



        // Alt afhængig af om der er klikket på overførknappen eller rækken, skal ID i TR findes forskellige steder
        //         klik på række                                   || klik på overførknap                                                         || andet
        const id = target.parentElement.getAttribute('data-sagid') || target.parentElement.parentElement.getAttribute('data-sagid') || null
        const actionClicked = target.classList
        console.log(id + ' ' + actionClicked)
        let action = ''

        if (actionClicked.contains('action-overfør-sag')) {
            action = 'overfør-sag'
        }


        // ÅBN SAG
        if (id && action === '') {

            // Registrer sagsnummer !!!!!!!
            currentSag.sagID = id
            hentSag(id)
        }


        // OVERFØR SAG TIL MIN LISTE
        if (id && action === 'overfør-sag') {

            const params = [
                ['sagID', Number(id)],
                ['brugerID', Number(bruger.ID)],
            ]

            DBCtrl.execStoredProcedure('opdaterSagBruger', params)
                .then(() => {

                    // genindlæs liste
                    UICtrl.listeInit(liste.selected, '')
                        // UICtrl.listeVisning()
                    UIRender.updateCounters()

                })
                .catch(error => { console.log(error) })
        }
    })



    // ******************** MODALVINDUE - VIS ENKELT SAG ***************************************
    // Listener for modal events: luk vinduet
    // document.getElementById('modal-close').addEventListener('click', () => {
    //     modal.close()
    // })


    // ---------------------------------------------------------------------------------------------
    // Listener: Hvem har sagen - save -------------------------------------------------------------



    // ******************* SKIFT SIDE ******************************************************************************************

    // mine sager
    document.getElementById('navMineSager').addEventListener('click', e => {
        console.log("Åbner 'Mine sager'")
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


    // Alle sager
    document.getElementById('navAlleSager').addEventListener('click', e => {
        e.preventDefault()
        UICtrl.listeInit(6)
    })


    // Påbegyndelsesliste
    // document.getElementById('navPåbegyndelsessager').addEventListener('click', e => {
    //     e.preventDefault()
    //     UICtrl.listeInit(7)
    // })

    // ************************ SØGEBOKS ****************************************************************
    let searchDelay


    document.getElementById('search-form').addEventListener('submit', e => {
        e.preventDefault()
        const inputField = document.getElementById('search')
        const input = inputField.value

        // // Hvis der ikke er valgt en liste, gør intet
        if (liste.selected === null) {
            return false
        }

        // ... ellers gå videre med søgning

        // Registrer søgeord
        listeDef[liste.selected].searchString = input

        // Fjern indhold fra gammel table
        UIRender.deleteChildren('tbody')

        // Hvis det er listen med alle sager
        if (liste.selected === 6) {

            // Hvis der er skrevet et søgekriterie, genindlæs liste med dette kriterie
            if (input !== '') {

                UICtrl.listeInit(6, input)

            }

            // Hvis søgekriteriet er tomt, fjern liste (men genindlæs IKKE et resultat med en tom søgestreng - dette vil vise alle sager, og det tager laaang tid at indlæse)
            if (input === '') {
                UICtrl.listeInit(6, null)
            }

        } else {
            // indlæs liste igen
            UIRender.renderListView()
        }
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

        // ------------------------------------------------------------------------------------------------------------------------------------------
        loadPageSettings: () => {
            const contentArea = document.getElementById('data-content')

            fs.readFile(`${__dirname}/renderer/indstillinger.html`, 'utf8', (err, content) => {

                if (err) {
                    console.log(err)
                    return
                }

                contentArea.innerHTML = content

                // Indlæs data
                UIRender.renderSettings()

                const selectElements = document.querySelectorAll('select')

                // Listener - farvetema GEM
                // document.getElementById('farve-tema').addEventListener('change', e => {
                //     const farveClicked = e.target.value

                //     // skriv ny værdi til databasen
                //     const params = [
                //         ['brugerID', Number(bruger.ID)],
                //         ['setting_farvetema', Number(farveClicked)]
                //     ]

                //     DBCtrl.execStoredProcedure('opdaterSettingFarvetema', params)
                //         .then(() => {
                //             // Opdater brugerobjekt fra databasen
                //             const data = ipcRenderer.sendSync('get:bruger')
                //             bruger = new User(data)
                //             UIRender.updateColorTheme()

                //             // Visual feedback
                //             fn.saveHighlight(document.getElementById('card-settings-generelt'))
                //         })
                //         .catch(error => { console.log(error) })
                // })


                // Listener - navn GEM 
                document.getElementById('setting-save-button').addEventListener('click', e => {

                    const elementBrugerNavn = document.getElementById('settings-bruger-navn').value
                    const elementOverførAntalSager = document.getElementById('settings-antal-sager').value
                    const elementOverførSagstype = document.getElementById('settings-default-overfør-type').value
                    const elementOpstartsside = document.getElementById('settings-load-startup').value

                    const params = [
                        ['brugerId', Number(bruger.ID)],
                        ['brugerNavn', String(elementBrugerNavn)],
                        ['setting_antalSager', Number(elementOverførAntalSager)],
                        ['setting_sagstype', Number(elementOverførSagstype)],
                        ['setting_opstartsside', Number(elementOpstartsside)]
                    ]

                    console.log(params)

                    DBCtrl.execStoredProcedure('opdaterBrugerSettings', params)
                        .then(() => {
                            // Opdater brugerobjekt fra databasen
                            const data = ipcRenderer.sendSync('get:bruger')
                            bruger = new User(data)
                        })
                        .then(() => {
                            UIRender.optionsOverførSager()
                        })
                        .catch(error => { console.log(error) })

                })




            })
        },

        // ***********************************************************************************************************************
        listeInit: (listeID, searchCriteria = null) => {


            fs.readFile(`${__dirname}/renderer/liste.html`, 'utf8', (err, content) => {
                const contentArea = document.getElementById('data-content')
                if (err) {
                    console.log(err)
                    return
                }

                contentArea.innerHTML = content

                liste.selected = listeID

                // Ryd evt. tidligere søgning, hvis det IKKE er listen med alle sager
                if (liste.selected !== 6) {
                    // UIRender.clearSearchBox()
                    UICtrl.clearSearchString()
                }

                // Hvis det ikke er listen med alle sager eller hvis det er listen med alle sager hvor der er angivet et søgekriterie, indlæs som normalt
                if (liste.selected !== 6 || searchCriteria !== null) {
                    UICtrl.listeVisning(searchCriteria)
                }

                // Hvis det er listen med alle sager og der ikke er angivet et søgekriterie, indlæs blot overskrifter
                if (liste.selected === 6 && searchCriteria === null) {
                    // Fjern gammel table
                    // UIRender.deleteChildren('data-content')
                    // Indlæs overskrifter
                    UIRender.renderListHeadline()
                    UIRender.renderListViewHeadlines()
                }

                UICtrl.listeOptions()

            })

        },

        clearSearchString: () => {
            listeDef[liste.selected].searchString = ''
        },

        // ***********************************************************************************************************************
        // ***
        // Generel method som benyttes til at kalde methods på UIRender til visning af lister.
        // ***
        listeVisning: (searchCriteria = null) => {

            // Vis progress bar
            // UIRender.renderProgressBar()

            // Fjern gammel table
            // UIRender.deleteChildren('data-content')

            // UIRender.renderListHeadline()
            // UIRender.renderListViewHeadlines()


            // hent data
            DBCtrl.get(listeDef[liste.selected].listeNavn, searchCriteria)
                .then(result => {
                    liste.items = result

                    // sæt value på toggle opfølgningssager
                    document.getElementById('opfølgningssagerToggle').checked = listeDef[liste.selected].toggle_opfølgningssager

                    // Sorter array
                    fn.setSortColumn(listeDef[liste.selected].sortColumn, true)
                    liste.items.sort(fn.compare)

                    // indlæs liste
                    UIRender.renderListHeadline()
                    UIRender.renderListViewHeadlines()
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
                const toggle = document.getElementById('opfølgningssagerToggle')
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
                    // fn.sortIndicatorRemove()

                    // Sorter array
                    fn.setSortColumn(columnClicked, false)

                    liste.items.sort(fn.compare)
                        // fn.sortIndicatorToggle(e.target)

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