// Node modules
const truncate = require('truncate')
const escapeStringRegExp = require('escape-string-regexp')

// App modules
const { fn } = require('./functions')
const { listeDef, currentSag, blurElements, colorThemes, flows, centerColumns } = require('./variables')
let { liste } = require('./variables')
const fs = require('fs')

// Private methods


const UIRender = (() => {

    function renderSagPersonElement(person, tid) {
        const div = document.createElement('div')

        fs.readFile(`${__dirname}/renderer/sagPersonElement.html`, 'utf8', (err, content) => {

            if (err) {
                console.log(err)
                return
            }

            div.innerHTML = content

            div.getElementsByClassName('hvem-har-sagen-brugernavn')[0].innerHTML = person
            div.getElementsByClassName('hvem-har-sagen-timestamp')[0].textContent = tid

        })
        return div
    }

    function populateSelectWithUsers(select, brugerId) {

        // Tomt option element
        const option = document.createElement('option')
        option.setAttribute('value', 'tilbage-til-gruppen')
        option.textContent = 'Ingen'
        select.appendChild(option)

        // Brugere option elementer
        brugere.forEach(bruger => {
            const option = document.createElement('option')
            option.setAttribute('value', bruger.ID)
            option.textContent = bruger.navn

            if (bruger.ID === brugerId) {
                option.setAttribute('selected', true)
            }

            select.appendChild(option)
        })
    }

    return {
        // ryd evt. gammel liste
        clear: () => {

        },

        clearSearchBox: () => {
            const searchBox = document.getElementById('search')
            searchBox.value = ''
        },

        deleteChildren: elementID => {
            const element = document.getElementById(elementID)
            while (element.firstChild)
                element.removeChild(element.firstChild)
        },


        deleteProgressBar: () => {
            // UIRender.deleteChildren('progress-bar')
            // document.getElementById('preloader-overlay').style.display = 'none'

            // // Remove blur
            // blurElements.forEach(element => {
            //     element.classList.remove('blur')
            // })

        },

        renderProgressBar: () => {

            // blurElements.forEach(element => {
            //     element.classList.add('blur')
            // })

            // document.getElementById('preloader-overlay').style.display = 'block'


            //         const progress = document.createElement('div')
            //         progress.innerHTML = `
            //       <div class="preloader-wrapper big active" >
            //         <div class="spinner-layer spinner-blue-only">
            //           <div class="circle-clipper left">
            //             <div class="circle"></div>
            //           </div><div class="gap-patch">
            //             <div class="circle"></div>
            //           </div><div class="circle-clipper right">
            //             <div class="circle"></div>
            //           </div>
            //         </div>
            //   </div >
            //     `

            //         document.getElementById('progress-bar').appendChild(progress)
        },

        // render sagsliste table
        renderListHeadline: () => {

            const listeHeadline = document.getElementById('liste-headline')
            listeHeadline.textContent = listeDef[liste.selected].headline


        },

        // render sagsliste overskrifter
        renderListViewHeadlines: () => {
            // const table = document.getElementById('table')
            // thead.setAttribute('id', 'thead')
            const theadTr = document.createElement('tr')


            // table thead-elements
            for (let i = 0; i < listeDef[liste.selected].columns.length; i++) {
                const column = listeDef[liste.selected].columns[i] // shorthand

                const th = document.createElement('th')

                // celle til buttons
                if (column === 'SYSTEM_BUTTON_OVERFØR') {
                    th.classList.add('td-tilføjknap')
                }

                if (column === 'antalBBRnotater')
                    th.textContent = 'BBR notater'

                if (column === 'flow')
                    th.textContent = 'Status'

                if (column === 'brugerNavn')
                    th.textContent = 'Ligger hos'

                if (column === 'sagsnummer')
                    th.textContent = 'Sagsnummer'

                if (column === 'ejendomsnummer')
                    th.textContent = 'Ejd.nr.'

                if (column === 'datoModtaget') {
                    th.textContent = 'Modtagelsedato'
                    th.classList.add('td-datokolonner')
                }

                if (column === 'datoAfgørelse') {
                    th.textContent = 'Afgørelsesdato'
                    th.classList.add('td-datokolonner')
                }

                if (column === 'datoAfsluttet') {
                    th.textContent = 'Afslutningsdato'
                    th.classList.add('td-datokolonner')
                }

                if (column === 'adresse')
                    th.textContent = 'Adresse'

                if (column === 'sagsindhold') {
                    th.textContent = 'Overskrift'
                    th.classList.add('td-limited-width')
                }

                if (column === 'sagsbehandler')
                    th.textContent = 'Sagsbehandler'

                if (column === 'sagsart')
                    th.textContent = 'Sagsart'

                if (column === 'politiskKategori')
                    th.textContent = 'Politisk kategori'

                if (column === 'datoAktivitetPåbegyndelseSlut')
                    th.textContent = 'Slutdato for aktivitet'


                // center align visse kolonners overskrifter
                // if (centerColumns.find(x => x === column) !== undefined)
                //     th.className = 'center-align'

                // Sæt en data-attribute på hver th-element, der afspejler navnet på key'en i items-objektet
                // Dette benyttes til at styre hvilke kolonne listen skal sorteres efter, når der klikkes på en kolonneoverskrift
                // Af dovenskab bruger vi bare kolonnenavnet taget direkte fra Item-objektet/SQL-datasen til value på data-attributen
                th.setAttribute('data-column-name', column)

                theadTr.appendChild(th)

            }
            const thead = document.getElementById('thead')

            thead.appendChild(theadTr)
                // table.appendChild(thead)

        },

        // render sagsliste
        renderListView: () => {

            // table row colors (markering)
            // const table = document.getElementById('table')
            const tbody = document.getElementById('tbody')


            const escapedString = escapeStringRegExp(listeDef[liste.selected].searchString)
            const regex = new RegExp(escapedString, 'i') // i = case insensitve

            // table content
            liste.items.forEach(item => {

                // vis/skjul opfølgningssager: skal rækken vises eller ej?
                if (!listeDef[liste.selected].toggle_opfølgningssager && item.antalBBRnotater > 0) {

                    // do nothing ... sagen er en opfølgningssag og der er valgt at skjule opfølgningssager. easy.

                } else {

                    // sagen er enten ikke en opfølgningssag, eller der er valgt at vise alle sager, inklusiv opfølgningssager

                    // søgekriterier
                    const searchResult = regex.exec(item.sagsnummer) || regex.exec(item.adresse) || regex.exec(item.sagsindhold)


                    if (searchResult || listeDef[liste.selected].searchString === '') {

                        // ny række
                        const tr = document.createElement('tr')
                        tr.setAttribute('data-sagid', item.sagID)

                        // herefter gennemgå de øverste td'er
                        for (let i = 0; i < listeDef[liste.selected].columns.length; i++) {
                            const column = listeDef[liste.selected].columns[i] // shorthand i for-loop
                            let tdValue
                            const td = document.createElement('td')

                            if (column === 'SYSTEM_BUTTON_OVERFØR') {
                                // overførknap
                                const buttonOverfør = document.createElement('button')
                                buttonOverfør.innerHTML = '+'
                                buttonOverfør.classList.add('button', 'is-info', 'is-small', 'action-overfør-sag')

                                // tilføj farve ifølge valgt farvetema
                                const farvetema = fn.getFarvetema()
                                farvetema.class.forEach(farve => {
                                    buttonOverfør.classList.add(farve)
                                })

                                td.appendChild(buttonOverfør)
                            }


                            if (column === 'antalBBRnotater')
                                td.textContent = item.antalBBRnotater

                            if (column === 'flow')
                                td.textContent = item.flow

                            if (column === 'brugerNavn')
                                td.textContent = item.brugerNavn

                            if (column === 'sagsnummer')
                                tdValue = item.sagsnummer

                            if (column === 'ejendomsnummer')
                                td.textContent = item.ejendomsnummer

                            if (column === 'datoModtaget') {
                                tdValue = fn.datoConvert(item.datoModtaget).toString() || null
                                td.classList.add('td-datokolonner')
                            }

                            if (column === 'datoAfgørelse') {
                                tdValue = null

                                if (item.datoAfgørelse !== null)
                                    tdValue = fn.datoConvert(item.datoAfgørelse).toString()
                            }


                            if (column === 'datoAfsluttet') {
                                tdValue = null

                                if (item.datoAfsluttet !== null)
                                    tdValue = fn.datoConvert(item.datoAfsluttet).toString()
                            }


                            if (column === 'datoAktivitetPåbegyndelseSlut') {
                                tdValue = null

                                if (item.datoAktivitetPåbegyndelseSlut !== null)
                                    tdValue = fn.datoConvert(item.datoAktivitetPåbegyndelseSlut).toString()
                            }


                            if (column === 'adresse')
                                tdValue = truncate(item.adresse, 35)

                            if (column === 'sagsindhold')
                                tdValue = truncate(item.sagsindhold, 50)

                            if (column === 'sagsbehandler')
                                td.textContent = item.sagsbehandler

                            if (column === 'sagsart')
                                td.textContent = item.sagsart

                            if (column === 'politiskKategori')
                                td.textContent = item.politiskKategori

                            // Aktiver highlight ved søgeresultater for udvalgte kolonner
                            const searchColumns = ['sagsnummer', 'adresse', 'sagsindhold', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'datoAktivitetPåbegyndelseSlut']
                            if (searchColumns.find(x => x === column) !== undefined && tdValue !== null) {
                                td.innerHTML = tdValue.replace(regex, str => `<span class="has-background-warning has-text-warning-dark has-text-weight-bold">${str}</span>`)
                            }


                            tr.appendChild(td)
                        }



                        // table row colors
                        if (item.color !== null) {
                            console.log(colors[item.color])
                            tr.classList.add('table-row-' + colors[item.color])
                        }
                        tbody.appendChild(tr)
                    }
                }

            })

            // table.appendChild(tbody)

        },

        updateCounters: () => {

            // Opdaterer angivelse af antal sager i de forskellige lister i navigationsdropdowns
            DBCtrl.getCounts('countTildelt')
                .then(result => {
                    document.getElementById('navMineSager-counter').textContent = result[0].count
                })
                .then(() => {
                    DBCtrl.getCounts('countIkkeTildeltTilladelse').then(result => { document.getElementById('navIkkeTildeltTilladelse-counter').textContent = result[0].count })
                        .then(() => {
                            DBCtrl.getCounts('countIkkeTildeltAfsluttet').then(result => { document.getElementById('navIkkeTildeltAfsluttet-counter').textContent = result[0].count })
                                .then(() => {
                                    DBCtrl.getCounts('countTildeltTilladelse').then(result => { document.getElementById('navTildeltTilladelse-counter').textContent = result[0].count })
                                        .then(() => {
                                            DBCtrl.getCounts('countTildeltAfsluttet').then(result => { document.getElementById('navTildeltAfsluttet-counter').textContent = result[0].count })
                                                .then(() => {
                                                    DBCtrl.getCounts('countOpfølgningsliste').then(result => { document.getElementById('navOpfølgningsliste-counter').textContent = result[0].count })
                                                })
                                        })
                                })
                        })
                })
                // DBCtrl.getCounts('countPåbegyndelsesliste').then(result => { document.getElementById('navPåbegyndelsessager-counter').textContent = result[0].count })
        },

        renderNav: () => {

            const navElements = [
                { id: 'navIkkeTildeltTilladelse', text: 'Tilladelsessager' },
                { id: 'navIkkeTildeltAfsluttet', text: 'Afslutningssager' },
                { id: 'navTildeltTilladelse', text: 'Tilladelsessager' },
                { id: 'navTildeltAfsluttet', text: 'Afslutningssager' },
                { id: 'navOpfølgningsliste', text: 'Opfølgningsliste' },
                { id: 'navMineSager', text: 'Mine sager' },
                // { id: 'navPåbegyndelsessager', text: 'Påbegyndelsessager' }
            ]

            navElements.forEach(element => {

                const link = document.getElementById(element.id)
                const span = document.createElement('span')
                const small = document.createElement('small')
                small.textContent = '...'
                small.setAttribute('id', element.id + '-counter')
                link.textContent = element.text

                span.classList.add('right')
                span.appendChild(small)
                link.appendChild(span)
            })

        },

        renderNavElementMineSager: (elementID, elementText, count) => {
            const link = document.getElementById(elementID)
            const span = document.createElement('span')
            const small = document.createElement('small')

            small.textContent = count
            link.textContent = elementText

            span.classList.add('badge')
            span.classList.add('white-text')

            span.appendChild(small)
            link.appendChild(span)
        },

        renderSag: (sag) => {
            // DOM elementer i modalvindue
            const element_sagsnummer = document.getElementById('sagsnummer')
            const element_ejendomsnummer = document.getElementById('ejendomsnummer')
            const element_datoModtaget = document.getElementById('dato-modtaget')
            const element_datoAfgørelse = document.getElementById('dato-afgørelse')
            const element_datoAfsluttet = document.getElementById('dato-afsluttet')
            const element_sagsart = document.getElementById('sagsart')
            const element_politiskKategori = document.getElementById('politisk-kategori')
            const element_sagsbehandler = document.getElementById('sagsbehandler')
            const element_adresse = document.getElementById('adresse')
            const element_sagsindhold = document.getElementById('sagsindhold')
            const element_titel_sagsnummer = document.getElementById('sag-titel-sagsnummer')
            const element_titel = document.getElementById('sag-titel')


            // Indlæs data i DOM elementer
            element_sagsnummer.textContent = sag.sagsnummer || null
            element_ejendomsnummer.textContent = sag.ejendomsnummer || null
            element_datoModtaget.textContent = sag.datoModtaget !== null ? fn.datoConvert(sag.datoModtaget) : null
            element_datoAfgørelse.textContent = sag.datoAfgørelse !== null ? fn.datoConvert(sag.datoAfgørelse) : null
            element_datoAfsluttet.textContent = sag.datoAfsluttet !== null ? fn.datoConvert(sag.datoAfsluttet) : null
            element_sagsart.textContent = sag.sagsart || null
            element_politiskKategori.textContent = sag.politiskKategori || null
            element_sagsbehandler.textContent = sag.sagsbehandler || null
            element_adresse.textContent = sag.adresse || null
            element_sagsindhold.textContent = sag.sagsindhold || null
            element_titel_sagsnummer.textContent = sag.sagsnummer || null
            element_titel.textContent = sag.sagsindhold || null

            UIRender.renderHvemHarSagen()
            UIRender.færdigbehandletTilladelse(sag)
            UIRender.færdigbehandletAfsluttet(sag)
            UIRender.færdigbehandletPåbegyndelsesdato(sag)


            // BBR notater **************************************************************************************************
            const tbody = document.getElementById('bbrNotater-tbody')

            // ryd evt. tidligere indhold
            UIRender.deleteChildren('bbrNotater-tbody')

            sag.BBRnotater.forEach(notat => {
                const tr = document.createElement('tr')
                tr.innerHTML = `
        <tr>
          <td>${notat.datoOprettet.toLocaleDateString()}</td>
          <td>${notat.notatNummer}</td>
          <td>${notat.entitetsidentifikation}</td>
          <td>${notat.notatTekst}</td>
        </tr>
      `
                tbody.appendChild(tr)
            })


            // Noter **************************************************************************************************
            const noteTextArea = document.getElementById('note')
            const noteTimestamp = document.getElementById('note-timestamp')
            const noteBrugerNavn = document.getElementById('note-brugernavn')

            noteTextArea.value = null
            noteTimestamp.textContent = null
            noteBrugerNavn.textContent = null

            if (sag.note !== null) {
                noteTextArea.value = sag.note.tekst
                noteTimestamp.textContent = fn.datoTidConvert(sag.note.timestamp)
                noteBrugerNavn.textContent = sag.note.BrugerNavn
            }
            // M.textareaAutoResize(noteTextArea)



            // Markering **************************************************************************************************
            const radioGroup = document.getElementsByName('color')
            if (sag.color === null) {
                radioGroup[0].checked = true
            } else {
                radioGroup[sag.color].checked = true

                // const markeringBorder = document.getElementById('markering-border')
                // markeringBorder.classList.remove(...markeringBorder.classList)
                // markeringBorder.classList.add('lighten-1')
                // markeringBorder.classList.add(colors[sag.color])
            }
        },


        færdigbehandletTilladelse: (sag) => {
            const element_færdigbehandletTilladelsessagItems = document.getElementById('færdigbehandlet-tilladelsessag-items')

            // Fjern alt indhold i færdigbehandlet afsluttet div
            while (element_færdigbehandletTilladelsessagItems.firstChild) {
                element_færdigbehandletTilladelsessagItems.removeChild(element_færdigbehandletTilladelsessagItems.firstChild)
            }

            for (let i = 0; i < sag.færdigbehandletTilladelse.length; i++) {

                const person = sag.færdigbehandletTilladelse[i].brugerID === 12 ? 'Udført før sagsstyringssystem' : sag.færdigbehandletTilladelse[i].brugerNavn
                const tid = sag.færdigbehandletTilladelse[i].brugerID === 12 ? '' : fn.datoTidConvert(sag.færdigbehandletTilladelse[i].BehandletTidspunkt)

                const div = renderSagPersonElement(person, tid)
                element_færdigbehandletTilladelsessagItems.appendChild(div)
            }

            const select = document.getElementById('færdigbehandlet-tilladelsessag-brugerliste')
            populateSelectWithUsers(select, bruger.ID)
        },

        færdigbehandletAfsluttet: (sag) => {
            console.log(sag)
            const element_færdigbehandletAfslutningssagItems = document.getElementById('færdigbehandlet-afslutningssag-items')

            // Fjern alt indhold i færdigbehandlet afsluttet div
            while (element_færdigbehandletAfslutningssagItems.firstChild) {
                element_færdigbehandletAfslutningssagItems.removeChild(element_færdigbehandletAfslutningssagItems.firstChild)
            }

            for (let i = 0; i < sag.færdigbehandletAfsluttet.length; i++) {

                const person = sag.færdigbehandletAfsluttet[i].brugerID === 12 ? 'Udført før sagsstyringssystem' : sag.færdigbehandletAfsluttet[i].brugerNavn
                const tid = sag.færdigbehandletAfsluttet[i].brugerID === 12 ? '' : fn.datoTidConvert(sag.færdigbehandletAfsluttet[i].BehandletTidspunkt)

                const div = renderSagPersonElement(person, tid)
                element_færdigbehandletAfslutningssagItems.appendChild(div)
            }

            const select = document.getElementById('færdigbehandlet-afslutningssag-brugerliste')
            populateSelectWithUsers(select, bruger.ID)
        },


        færdigbehandletPåbegyndelsesdato: (sag) => {

            const element_færdigbehandletPåbegyndelsesdatoItems = document.getElementById('færdigbehandlet-påbegyndelsesdato-items')

            // Fjern alt indhold i færdigbehandlet afsluttet div
            while (element_færdigbehandletPåbegyndelsesdatoItems.firstChild) {
                element_færdigbehandletPåbegyndelsesdatoItems.removeChild(element_færdigbehandletPåbegyndelsesdatoItems.firstChild)
            }

            for (let i = 0; i < sag.færdigbehandletPåbegyndelsesdato.length; i++) {

                const person = sag.færdigbehandletPåbegyndelsesdato[i].brugerID === 12 ? 'Udført før sagsstyringssystem' : sag.færdigbehandletPåbegyndelsesdato[i].brugerNavn
                const tid = sag.færdigbehandletPåbegyndelsesdato[i].brugerID === 12 ? '' : fn.datoTidConvert(sag.færdigbehandletPåbegyndelsesdato[i].BehandletTidspunkt)

                const div = renderSagPersonElement(person, tid)
                element_færdigbehandletPåbegyndelsesdatoItems.appendChild(div)
            }

            const select = document.getElementById('færdigbehandlet-påbegyndelsesdato-brugerliste')
            populateSelectWithUsers(select, bruger.ID)
        },


        renderHvemHarSagen: () => {

            const select = document.getElementById('hvem-har-sagen')
            DBCtrl.get('sag', currentSag.sagID)
                .then(data => {

                    const sag = data[0]

                    // Ryd gammelt indhold
                    UIRender.deleteChildren('hvem-har-sagen')
                    UIRender.deleteChildren('hvem-har-sagen-timestamp')
                    UIRender.deleteChildren('hvem-har-sagen-brugernavn')
                    populateSelectWithUsers(select, bruger.ID)

                    if (sag.brugerId !== null) {
                        document.getElementById('hvem-har-sagen-remove-button').classList.remove('hidden')
                        document.getElementById('hvem-har-sagen-timestamp').textContent = fn.datoTidConvert(sag.brugerTimestamp)
                        document.getElementById('hvem-har-sagen-brugernavn').textContent = sag.brugerNavn
                    } else {
                        document.getElementById('hvem-har-sagen-remove-button').classList.add('hidden')
                        document.getElementById('hvem-har-sagen-brugernavn').textContent = 'Ingen'
                    }

                })
                .catch(error => { console.log(error) })
        },

        updateColorTheme: () => {

            // const elementsToUpdate = [
            //     (document.getElementsByTagName('nav'))[0],
            //     (document.getElementsByClassName('dropdown-content'))[0],
            //     (document.getElementsByClassName('dropdown-content'))[1],
            //     document.getElementById('overfør-sager'),
            //     (document.getElementsByName('overfør-sager-type'))[0],
            //     (document.getElementsByName('overfør-sager-type'))[1],
            //     document.getElementById('opfølgningssagerToggle') //.firstChild.nextSibling.firstChild.nextSibling.nextSibling.nextSibling

            // ]

            // // Gennemgå alle farver og fjern classes
            // colorThemes.forEach(color => {
            //     color.class.forEach(oldColorClass => {
            //         elementsToUpdate.forEach(element => {
            //             let prefix = ''

            //             // Hvis det er en radio button
            //             if (element.tagName === 'INPUT' && element.getAttribute('type') === 'radio')
            //                 prefix = 'radio-'

            //             if (element.classList.contains('switch'))
            //                 prefix = 'toggle-'


            //             // 
            //             element.classList.remove(prefix + oldColorClass)
            //         })
            //     })
            // })

            // // Find den nye farve
            // const newColor = fn.getFarvetema() //colorThemes.find(x => x.id === Number(bruger.settings.farvetema))

            // // Tilføj ny farveclass
            // elementsToUpdate.forEach(element => {
            //     let prefix = ''

            //     // Hvis det er en radio button
            //     if (element.tagName === 'INPUT' && element.getAttribute('type') === 'radio')
            //         prefix = 'radio-'

            //     if (element.classList.contains('switch'))
            //         prefix = 'toggle-'

            //     // Add classes
            //     newColor.class.forEach(newColorClass => {
            //         element.classList.add(prefix + newColorClass)
            //     })
            // })



        },

        optionsOverførSager: () => {

            // Sagstype
            const sagstyper = document.getElementById('overfør-sager-type')
            console.log(sagstyper)
            sagstyper.value = bruger.settings.overfør.sagstype
                // for (let i = 0; i < sagstyper.length; i++) {
                //     if (i + 1 === bruger.settings.overfør.sagstype) // +1 fordi 1 = tilladelsessager, 2 = afslutningssager
                //         sagstyper[i].checked = true
                // }

            // Antal sager
            document.getElementById('overfør-sager-antal').value = bruger.settings.overfør.antalSager
                // M.updateTextFields()


        },

        renderSettings: () => {
            // const elementAZ = document.getElementById('settings-az')
            const elementBrugerNavn = document.getElementById('settings-bruger-navn')
            const elementOverførAntalSager = document.getElementById('settings-antal-sager')
            const elementOverførSagstype = document.getElementById('settings-default-overfør-type')
            const elementOpstartsside = document.getElementById('settings-load-startup')

            // az
            // elementAZ.value = bruger.az

            // navn
            elementBrugerNavn.value = bruger.navn

            // antal sager
            elementOverførAntalSager.value = bruger.settings.overfør.antalSager

            // Sagstype
            const sagstypeChildren = elementOverførSagstype.children
            for (let i = 0; i < sagstypeChildren.length; i++) {
                if (Number(sagstypeChildren[i].value) === bruger.settings.overfør.sagstype) {
                    sagstypeChildren[i].setAttribute('selected', true)
                } else {
                    sagstypeChildren[i].removeAttribute('selected')
                }
            }

            // Opstartsside
            const opstartssideChildren = elementOpstartsside.children
            for (let i = 0; i < opstartssideChildren.length; i++) {
                if (Number(opstartssideChildren[i].value) === bruger.settings.opstartsside) {
                    opstartssideChildren[i].setAttribute('selected', true)
                } else {
                    opstartssideChildren[i].removeAttribute('selected')
                }
            }

            // Farvetema
            // const radioGroup = document.getElementsByName('radio-group-farvetema')
            // radioGroup.forEach(radio => {
            //     if (Number(radio.value) === bruger.settings.farvetema) {
            //         radio.checked = true
            //     }
            // })
        }
    }
})()

module.exports = {
    UIRender
}