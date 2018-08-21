const SYSTEM_BUTTON_OVERFØR = 'SYSTEM_BUTTON_OVERFØR'

const listeDef = [
  {
    listeID: 0,
    headline: 'Mine sager',
    listeNavn: 'tildelt',
    sortColumn: 'sagsnummer',
    sortDirection: 'asc',
    toggle_opfølgningssager: true,
    searchString: '',
    columns: ['flow', 'sagsnummer', 'esdh', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler', 'sagsart', 'politiskKategori']
  },
  {
    listeID: 1,
    headline: 'Afventende tilladelsessager',
    listeNavn: 'ikkeTildeltTilladelse',
    sortColumn: 'sagsnummer',
    sortDirection: 'asc',
    toggle_opfølgningssager: true,
    searchString: '',
    columns: [SYSTEM_BUTTON_OVERFØR, 'sagsnummer', 'esdh', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler', 'sagsart', 'politiskKategori']
  },
  {
    listeID: 2,
    headline: 'Afventende afslutningssager',
    listeNavn: 'ikkeTildeltAfsluttet',
    sortColumn: 'sagsnummer',
    sortDirection: 'asc',
    toggle_opfølgningssager: true,
    searchString: '',
    columns: [SYSTEM_BUTTON_OVERFØR,'sagsnummer', 'esdh', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler', 'sagsart', 'politiskKategori']
  },
  {
    listeID: 3,
    headline: 'Tilladelsessager under behandling',
    listeNavn: 'tildeltTilladelse',
    sortColumn: 'sagsnummer',
    sortDirection: 'asc',
    toggle_opfølgningssager: true,
    searchString: '',
    columns: [SYSTEM_BUTTON_OVERFØR,'brugerNavn', 'sagsnummer', 'esdh', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler', 'sagsart', 'politiskKategori']
  },
  {
    listeID: 4,
    headline: 'Afslutningssager under behandling',
    listeNavn: 'tildeltAfsluttet',
    sortColumn: 'sagsnummer',
    sortDirection: 'asc',
    toggle_opfølgningssager: true,
    searchString: '',
    columns: [SYSTEM_BUTTON_OVERFØR,'brugerNavn', 'sagsnummer', 'esdh', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler', 'sagsart', 'politiskKategori']
  },
  {
    listeID: 5,
    headline: 'Opfølgningsliste',
    listeNavn: 'opfølgningsliste',
    sortColumn: 'sagsnummer',
    sortDirection: 'asc',
    toggle_opfølgningssager: true,
    searchString: '',
    columns: [SYSTEM_BUTTON_OVERFØR,'brugerNavn', 'flow', 'sagsnummer', 'esdh', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler', 'sagsart', 'politiskKategori']
  }
]

const liste = {
  selected: null,
  items: []
}

const currentSag = {
  sagID: null
}

const blurElements = [
  document.getElementById('navbar'),
  document.getElementById('data-content'),
  document.getElementById('options-fixed')
]

const colorThemes = [
  { id: 1, class: ['blue'], description: 'Blå'},
  { id: 2, class: ['light-green'], description: 'Grøn'},
  { id: 3, class: ['amber'], description: 'Gul'},
  { id: 4, class: ['red'], description: 'Red'},
  { id: 5, class: ['teal'], description: 'Blågrøn'},
  { id: 6, class: ['orange'], description: 'Orange'},
  { id: 7, class: ['pink'], description: 'Pink'},
  { id: 8, class: ['grey','darken-3'], description: 'Gråsort'}
]

let colorThemeSelected = 1



module.exports = {
  listeDef,
  liste,
  currentSag,
  blurElements,
  colorThemes,
  colorThemeSelected
}