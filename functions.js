const { listeDef, liste, colorThemes } = require('./variables')
const dateFormat = require('dateformat')

const fn = (() => {

  return {

    setSortColumn: (column, first) => {
      // SORT DIRECTION
      // hvis registrede sorteringskolonne er den samme som der klikkes på eller er angivet ved listeindlæsning (sidstnævnte vil jo altid være tilfældet ved indlæsning)
      if (column === listeDef[liste.selected].sortColumn) {
        // hvis det ikke er listeindlæsning
        if (!first) {
          // toggle sort direction
          listeDef[liste.selected].sortDirection === 'asc' ? listeDef[liste.selected].sortDirection = 'desc' : listeDef[liste.selected].sortDirection = 'asc'
        } else {
          // hvis det er indlæsning, gør intet (benyt registrede sorteringsretning
        }
      } else {
        // hvis registrede sorteringskolonne ikke er den samme som den der blev klikket
        listeDef[liste.selected].sortDirection = 'asc'
      }

      // set sort column
      listeDef[liste.selected].sortColumn = column
    },
    
    compare: (a, b) => {

      let aColumn
      let bColumn

      aColumn = a[listeDef[liste.selected].sortColumn]
      bColumn = b[listeDef[liste.selected].sortColumn]

      if (typeof a === 'string') {
        aColumn.toUpperCase()
        bColumn.toUpperCase()
      }

      
      let comparison

      if (aColumn > bColumn) {
        comparison = listeDef[liste.selected].sortDirection === 'asc' ? 1 : -1 // hvis asc så 1, hvis desc så -1
      } else {
        comparison = listeDef[liste.selected].sortDirection === 'asc' ? -1 : 1 // hvis asc så -1, hvis desc så 1
      }

      return comparison
    },

    sortIndicatorRemove: () => {

      const oldSortColumn = listeDef[liste.selected].sortColumn || null

      if (oldSortColumn) {
        const ths = document.getElementById('table').firstChild.firstChild.children // alle th'er
        
        for (let i=0; i<ths.length; i++) {

          // hvis den pågældende th har en span som lastChild, fjern denne child
          if (ths[i].children.length > 0 ) {
            ths[i].removeChild(ths[i].lastChild)
          }
        }
      }
    },


    sortIndicatorToggle: (target) => {

      const span = document.createElement('span')
      const i = document.createElement('i')
      i.classList.add('material-icons', 'tiny')

      listeDef[liste.selected].sortDirection === 'asc' ? i.textContent = 'arrow_drop_up' : i.textContent = 'arrow_drop_down'
      span.appendChild(i)
      target.appendChild(span)
    },


    datoConvert: dateValue => dateFormat(dateValue, 'dd-mm-yyyy'),

    saveHighlight(element, toastTekst = null) {

      if (toastTekst)
        M.toast({html: toastTekst})

      let d = 50 // tid mellem hvert farveskift (ms)

      for (let i = 60; i <= 100; i = i + 0.1) { //i represents the lightness

        d += 1 // tilføjet tid mellem hvert farveskift ... langsommere og langsommere (ms)

        ;(function (ii, dd) {
          setTimeout(function () {
            element.style.backgroundColor = 'hsl(49,98%,' + ii + '%)'
          }, dd)
        })(i, d)
      }
    },

    getFarvetema: () => colorThemes.find(x => x.id === Number(bruger.settings.farvetema))
    
  }
})()



module.exports = {
  fn
}