const { fn } = require('./functions')
const { listeDef, currentSag, blurElements, colorThemes } = require('./variables')
let { liste } = require('./variables')
const escapeStringRegExp = require('escape-string-regexp')
const flows = ['Afventer afgørelsesdato','Tilladelsessag','Afslutningssag','Færdigbehandlet','Færdigbehandlet tilladelsessag, afventer afslutningsdato']


const UIRender = {


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
    UIRender.deleteChildren('progress-bar')
    document.getElementById('preloader-overlay').style.display = 'none'

    // Remove blur
    blurElements.forEach(element => {
      element.classList.remove('blur')
    })
    
  },

  renderProgressBar: () => {
    
    blurElements.forEach(element => {
      element.classList.add('blur')
    })

    document.getElementById('preloader-overlay').style.display = 'block'
    

    const progress = document.createElement('div')
    progress.innerHTML = `
      <div class="preloader-wrapper big active" >
        <div class="spinner-layer spinner-blue-only">
          <div class="circle-clipper left">
            <div class="circle"></div>
          </div><div class="gap-patch">
            <div class="circle"></div>
          </div><div class="circle-clipper right">
            <div class="circle"></div>
          </div>
        </div>
  </div >
    `

    document.getElementById('progress-bar').appendChild(progress)
  },

  // render sagsliste table
  renderListViewTable: () => {

    const contentDiv = document.getElementById('data-content')
    
    const headlineElement = document.createElement('h4')
    headlineElement.textContent = listeDef[liste.selected].headline
    contentDiv.appendChild(headlineElement)

    const table = document.createElement('table')
    table.setAttribute('id', 'table')
    table.classList.add('highlight')
    contentDiv.appendChild(table)

  },

  // render sagsliste overskrifter
  renderListViewHeadlines: () => {
    const table = document.getElementById('table')

    const thead = document.createElement('thead')
    thead.setAttribute('id', 'thead')
    const theadTr = document.createElement('tr')


    // table thead-elements
    for (let i = 0; i < listeDef[liste.selected].columns.length; i++) {
      const column = listeDef[liste.selected].columns[i] // shorthand

      const th = document.createElement('th')

      // celle til buttons
      if (column === 'SYSTEM_BUTTON_OVERFØR') {
        th.style.width = '90px'
      }

      if (column === 'antalBBRnotater') {
        th.textContent = 'Antal BBR notater'
        th.classList.add('center')
      }

      if (column === 'flow')
        th.textContent = 'Status'

      if (column === 'brugerNavn')
        th.textContent = 'Ligger hos'

      if (column === 'sagsnummer')
        th.textContent = 'Sagsnummer'

      if (column === 'esdh')
        th.textContent = 'ESDH'

      if (column === 'datoModtaget')
        th.textContent = 'Modtagelsesdato'

      if (column === 'datoAfgørelse')
        th.textContent = 'Afgørelsesdato'

      if (column === 'datoAfsluttet')
        th.textContent = 'Afslutningsdato'

      if (column === 'adresse')
        th.textContent = 'Adresse'

      if (column === 'sagsindhold')
        th.textContent = 'Sagsindhold'

      if (column === 'sagsbehandler')
        th.textContent = 'Sagsbehandler'

      if (column === 'sagsart')
        th.textContent = 'Sagsart'

      if (column === 'politiskKategori')
        th.textContent = 'Politisk kategori'

      // Sæt en data-attribute på hver th-element, der afspejler navnet på key'en i items-objektet
      // Dette benyttes til at styre hvilke kolonne listen skal sorteres efter, når der klikkes på en kolonneoverskrift
      // Af dovenskab bruger vi bare kolonnenavnet taget direkte fra Item-objektet/SQL-datasen til value på data-attributen
      th.setAttribute('data-column-name', column)

      theadTr.appendChild(th)

    }

    thead.appendChild(theadTr)
    table.appendChild(thead)

    const tbody = document.createElement('tbody')
    tbody.setAttribute('id','tbody')
    table.appendChild(tbody)
  },

  // render sagsliste
  renderListView: () => {
    
    // table row colors (markering)
    const colors = ['', 'blue', 'light-green', 'amber', 'red']
    const table = document.getElementById('table')
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
        const searchResult = regex.exec(item.sagsnummer) || regex.exec(item.esdh) || regex.exec(fn.datoConvert(item.datoModtaget)) || regex.exec(fn.datoConvert(item.datoAfgørelse)) || regex.exec(fn.datoConvert(item.datoAfsluttet)) || regex.exec(item.adresse) || regex.exec(item.sagsindhold)
        

        if (searchResult || listeDef[liste.selected].searchString === '') {
          
          // ny række
          const tr = document.createElement('tr')
          tr.setAttribute('data-sagID', item.sagID)

          // herefter gennemgå de øverste td'er
          for (let i = 0; i < listeDef[liste.selected].columns.length; i++) {
            const column = listeDef[liste.selected].columns[i] // shorthand i for-loop
            let tdValue
            const td = document.createElement('td')

            if (column === 'SYSTEM_BUTTON_OVERFØR') {
              // overførknap
              const buttonOverfør = document.createElement('button')
              buttonOverfør.innerHTML = '<i class="material-icons tiny right">add</i>'
              buttonOverfør.classList.add('btn', 'btn-floating', 'btn-small', 'margin-left-s', 'waves-effect', 'waves-light', 'action-overfør-sag')

              // tilføj farve ifølge valgt farvetema
              const farvetema = fn.getFarvetema()
              farvetema.class.forEach(farve => {
                buttonOverfør.classList.add(farve)
              })

              td.appendChild(buttonOverfør)
            }

            
            if (column === 'antalBBRnotater') {
              td.textContent = item.antalBBRnotater
              td.classList.add('center')
            }

            if (column === 'flow')
              td.textContent = flows[item.flow]

            if (column === 'brugerNavn')
              td.textContent = item.brugerNavn

            if (column === 'sagsnummer')
              tdValue = item.sagsnummer

            if (column === 'esdh')
              td.textContent = item.esdh

            if (column === 'datoModtaget') {
              tdValue = fn.datoConvert(item.datoModtaget).toString() || null
              td.className = 'center-align'
            }

            if (column === 'datoAfgørelse') {
              tdValue = fn.datoConvert(item.datoAfgørelse).toString() || null
              td.className = 'center-align'
            }

            if (column === 'datoAfsluttet') {
              tdValue = fn.datoConvert(item.datoAfsluttet).toString() || null
              td.className = 'center-align'
            }

            if (column === 'adresse') {
              tdValue = item.adresse
            }

            if (column === 'sagsindhold')
              tdValue = item.sagsindhold

            if (column === 'sagsbehandler')
              td.textContent = item.sagsbehandler

            if (column === 'sagsart')
              td.textContent = item.sagsart

            if (column === 'politiskKategori')
              td.textContent = item.politiskKategori


            // Aktiver highlight ved søgeresultater for udvalgte kolonner
            const searchColumns = ['sagsnummer', 'adresse', 'sagsindhold', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet']
            if (searchColumns.find(x => x === column) !== undefined && tdValue !== null) {
              td.innerHTML = tdValue.replace(regex, str => `<span class="yellow black-text"><b>${str}</b></span>`)
            }


            tr.appendChild(td)
          }



          // table row colors
          if (item.color !== null) {
            tr.classList.add(
              colors[item.color],
              'lighten-4',
              colors[item.color] + '-text',
              'text-darken-4'
            )
          }

          tbody.appendChild(tr)
        }
        }
        
    })

    table.appendChild(tbody)

  },

  updateCounters: () => {

    // Opdaterer angivelse af antal sager i de forskellige lister i navigationsdropdowns
    DBCtrl.getCounts('countIkkeTildeltTilladelse').then(result => { document.getElementById('navIkkeTildeltTilladelse-counter').textContent = result[0].count })
    DBCtrl.getCounts('countIkkeTildeltAfsluttet').then(result => { document.getElementById('navIkkeTildeltAfsluttet-counter').textContent = result[0].count })
    DBCtrl.getCounts('countTildeltTilladelse').then(result => { document.getElementById('navTildeltTilladelse-counter').textContent = result[0].count })
    DBCtrl.getCounts('countTildeltAfsluttet').then(result => { document.getElementById('navTildeltAfsluttet-counter').textContent = result[0].count })
    DBCtrl.getCounts('countOpfølgningsliste').then(result => { document.getElementById('navOpfølgningsliste-counter').textContent = result[0].count })
    DBCtrl.getCounts('countTildelt').then(result => { document.getElementById('navMineSager-counter').textContent = result[0].count })
    
  }, 

  renderNav: () => {

    const navElements = [
      { id: 'navIkkeTildeltTilladelse', text: 'Tilladelsessager' },
      { id: 'navIkkeTildeltAfsluttet', text: 'Afslutningssager' },
      { id: 'navTildeltTilladelse', text: 'Tilladelsessager' },
      { id: 'navTildeltAfsluttet', text: 'Afslutningssager' },
      { id: 'navOpfølgningsliste', text: 'Opfølgningsliste' },
      { id: 'navMineSager', text: 'Mine sager' }
    ]

    navElements.forEach(element => {
      const link = document.getElementById(element.id)
      const span = document.createElement('span')
      const small = document.createElement('small')

      small.textContent = '0'
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
    const element_esdh = document.getElementById('esdh')
    const element_ejendomsnummer = document.getElementById('ejendomsnummer')
    const element_datoModtaget = document.getElementById('dato-modtaget')
    const element_datoAfgørelse = document.getElementById('dato-afgørelse')
    const element_datoAfsluttet = document.getElementById('dato-afsluttet')
    const element_sagsart = document.getElementById('sagsart')
    const element_politiskKategori = document.getElementById('politisk-kategori')
    const element_sagsbehandler = document.getElementById('sagsbehandler')
    const element_adresse = document.getElementById('adresse')
    const element_sagsindhold = document.getElementById('sagsindhold')
    const element_færdigbehandletTilladelsessag = document.getElementById('færdigbehandling-tilladelsessag')
    const element_færdigbehandletTilladelsessagLabel = document.getElementById('færdigbehandlet-tilladelsessag-label')
    const element_færdigbehandletAfslutningssag = document.getElementById('færdigbehandling-afslutningssag')
    const element_færdigbehandletAfslutningsagLabel = document.getElementById('færdigbehandlet-afslutningssag-label')

    // Indlæs data i DOM elementer
    element_sagsnummer.textContent = sag.sagsnummer || null
    element_esdh.textContent = sag.esdh || null
    element_ejendomsnummer.textContent = sag.ejendomsnummer || null
    element_datoModtaget.textContent = sag.datoModtaget !== null ? fn.datoConvert(sag.datoModtaget) : null
    element_datoAfgørelse.textContent = sag.datoAfgørelse !== null ? fn.datoConvert(sag.datoAfgørelse) : null
    element_datoAfsluttet.textContent = sag.datoAfsluttet !== null ? fn.datoConvert(sag.datoAfsluttet) : null
    element_sagsart.textContent = sag.sagsart || null
    element_politiskKategori.textContent = sag.politiskKategori || null
    element_sagsbehandler.textContent = sag.sagsbehandler || null
    element_adresse.textContent = sag.adresse || null
    element_sagsindhold.textContent = sag.sagsindhold || null

    // Færdigbehandlet tilladelsessag ************************************************************************************
    // Fjern alt indhold i færdigbehandlet tilladelsessag label
    while (element_færdigbehandletTilladelsessagLabel.firstChild)
      element_færdigbehandletTilladelsessagLabel.removeChild(element_færdigbehandletTilladelsessagLabel.firstChild)

    // Hvis det er SYSTEM, sæt et em-tag og undlad at skrive dato
    if (sag.færdigbehandletTilladelseBrugerNavn === 'SYSTEM') {
      const em = document.createElement('em')
      em.textContent = 'Udført før sagsstyringssystem'
      element_færdigbehandletTilladelsessagLabel.appendChild(em)

    } else {
      // Hvis det er person
        element_færdigbehandletTilladelsessagLabel.textContent = sag.timestampFærdigbehandletTilladelse ? `${fn.datoConvert(sag.timestampFærdigbehandletTilladelse)} ${sag.færdigbehandletTilladelseBrugerNavn}` : null
    }

    // Sæt tilstand på checkbox - færdigbehandlet tilladelsessag
    if (sag.timestampFærdigbehandletTilladelse) {
      element_færdigbehandletTilladelsessag.checked = true
      element_færdigbehandletTilladelsessag.setAttribute('disabled', true)
    } else {
      // element_færdigbehandletTilladelsessag.removeAttribute('checked')
      element_færdigbehandletTilladelsessag.checked = false
      element_færdigbehandletTilladelsessag.removeAttribute('disabled')
    }


    // Færdigbehandlet afslutningssag ************************************************************************************
    // Fjern alt indhold i færdigbehandlet tilladelsessag label
    while (element_færdigbehandletAfslutningsagLabel.firstChild)
      element_færdigbehandletAfslutningsagLabel.removeChild(element_færdigbehandletAfslutningsagLabel.firstChild)

    // Hvis det er SYSTEM, sæt et em-tag og undlad at skrive dato
    if (sag.færdigbehandletAfslutningBrugerNavn === 'SYSTEM') {
      const em = document.createElement('em')
      em.textContent = 'Udført før sagsstyringssystem'
      element_færdigbehandletAfslutningsagLabel.appendChild(em)

    } else {
      // Hvis det er person
        element_færdigbehandletAfslutningsagLabel.textContent = sag.timestampFærdigbehandletAfslutning ? `${fn.datoConvert(sag.timestampFærdigbehandletAfslutning)} ${sag.færdigbehandletAfslutningBrugerNavn}` : null
    }

    // Sæt tilstand på checkbox - færdigbehandlet tilladelsessag
    if (sag.timestampFærdigbehandletAfslutning) {
      element_færdigbehandletAfslutningssag.checked = true
      element_færdigbehandletAfslutningssag.setAttribute('disabled', true)
    } else {
      element_færdigbehandletAfslutningssag.checked = false
      element_færdigbehandletAfslutningssag.removeAttribute('disabled')
    }


    // Hvem har sagen? **************************************************************************************************
    UIRender.renderHvemHarSagen()

    



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
      noteTimestamp.textContent = fn.datoConvert(sag.note.timestamp)
      noteBrugerNavn.textContent = sag.note.ændretAfBrugerNavn
    }
    M.textareaAutoResize(noteTextArea)



    // Markering **************************************************************************************************
    const radioGroup = document.getElementsByName('color')
    if (sag.color === null) {
      radioGroup[0].checked = true
    } else {
      radioGroup[sag.color].checked = true
    }
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
    
          if (bruger.ID === sag.brugerID)
            option.setAttribute('selected', true)
    
          select.appendChild(option)
        })
    
        // Init select
        M.FormSelect.init(document.getElementById('hvem-har-sagen'))
    
        document.getElementById('hvem-har-sagen-timestamp').textContent = fn.datoConvert(sag.sagBrugerÆndringTimestamp)
        document.getElementById('hvem-har-sagen-brugernavn').textContent = sag.sagBrugerÆndringBrugerNavn
      })
      .catch(error => { console.log(error)} )
  },

  updateColorTheme: () => {

    const elementsToUpdate = [
      (document.getElementsByTagName('nav'))[0],
      (document.getElementsByClassName('dropdown-content'))[0],
      (document.getElementsByClassName('dropdown-content'))[1],
      document.getElementById('overfør-sager'),
      (document.getElementsByName('overfør-sager-type'))[0],
      (document.getElementsByName('overfør-sager-type'))[1],
      document.getElementById('opfølgningssagerToggle') //.firstChild.nextSibling.firstChild.nextSibling.nextSibling.nextSibling

    ]

    // Gennemgå alle farver og fjern classes
    colorThemes.forEach(color => {
      color.class.forEach(oldColorClass => {
        elementsToUpdate.forEach(element => {
          let prefix = ''
          
          // Hvis det er en radio button
          if (element.tagName === 'INPUT' && element.getAttribute('type') === 'radio')
            prefix = 'radio-'
          
          if (element.classList.contains('switch'))
            prefix = 'toggle-'
          

          // 
          element.classList.remove(prefix + oldColorClass)
        })
      })
    })
    
    // Find den nye farve
    const newColor = fn.getFarvetema() //colorThemes.find(x => x.id === Number(bruger.settings.farvetema))

    // Tilføj ny farveclass
    elementsToUpdate.forEach(element => {
      let prefix = ''

      // Hvis det er en radio button
      if (element.tagName === 'INPUT' && element.getAttribute('type') === 'radio')
        prefix = 'radio-'

      if (element.classList.contains('switch'))
        prefix = 'toggle-'

      // Add classes
      newColor.class.forEach(newColorClass => {
        element.classList.add(prefix + newColorClass)
      })
    })
    
    
    
  },

  optionsOverførSager: () => {
    
    // Sagstype
    const sagstyper = document.getElementsByName('overfør-sager-type')
    for (let i = 0; i < sagstyper.length; i++) {
      if (i + 1 === bruger.settings.overfør.sagstype) // +1 fordi 1 = tilladelsessager, 2 = afslutningssager
        sagstyper[i].checked = true
    }

    // Antal sager
    document.getElementById('overfør-sager-antal').value = bruger.settings.overfør.antalSager
    M.updateTextFields()


  },

  renderSettings: () => {
    const elementAZ = document.getElementById('settings-az')
    const elementBrugerNavn = document.getElementById('settings-bruger-navn')
    const elementOverførAntalSager = document.getElementById('settings-antal-sager')
    const elementOverførSagstype = document.getElementById('settings-default-overfør-type')
    const elementOpstartsside = document.getElementById('settings-load-startup')
    
    // az
    elementAZ.value = bruger.az

    // navn
    elementBrugerNavn.value = bruger.navn

    // antal sager
    elementOverførAntalSager.value = bruger.settings.overfør.antalSager
    
    // Sagstype
    const sagstypeChildren = elementOverførSagstype.children
    for (let i=0; i < sagstypeChildren.length; i++) {
      if (Number(sagstypeChildren[i].value) === bruger.settings.overfør.sagstype) {
        sagstypeChildren[i].setAttribute('selected',true)
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
    const radioGroup = document.getElementsByName('radio-group-farvetema')
    radioGroup.forEach(radio => {
      if (Number(radio.value) === bruger.settings.farvetema) {
        radio.checked = true
      }
    })
  }
}



module.exports = {
  UIRender
}