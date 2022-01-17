const SYSTEM_BUTTON_OVERFØR = 'SYSTEM_BUTTON_OVERFØR'

const listeDef = [{
        listeID: 0,
        headline: 'Mine sager',
        listeNavn: 'tildelt',
        sortColumn: 'sagsnummer',
        sortDirection: 'asc',
        toggle_opfølgningssager: true,
        searchString: '',
        columns: ['flow', 'sagsnummer', 'ejendomsnummer', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler']
    },
    {
        listeID: 1,
        headline: 'Afventende tilladelsessager',
        listeNavn: 'ikkeTildeltTilladelse',
        sortColumn: 'sagsnummer',
        sortDirection: 'asc',
        toggle_opfølgningssager: true,
        searchString: '',
        columns: [SYSTEM_BUTTON_OVERFØR, 'sagsnummer', 'ejendomsnummer', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler']
    },
    {
        listeID: 2,
        headline: 'Afventende afslutningssager',
        listeNavn: 'ikkeTildeltAfsluttet',
        sortColumn: 'sagsnummer',
        sortDirection: 'asc',
        toggle_opfølgningssager: true,
        searchString: '',
        columns: [SYSTEM_BUTTON_OVERFØR, 'sagsnummer', 'ejendomsnummer', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler', ]
    },
    {
        listeID: 3,
        headline: 'Tilladelsessager under behandling',
        listeNavn: 'tildeltTilladelse',
        sortColumn: 'sagsnummer',
        sortDirection: 'asc',
        toggle_opfølgningssager: true,
        searchString: '',
        columns: [SYSTEM_BUTTON_OVERFØR, 'brugerNavn', 'sagsnummer', 'ejendomsnummer', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler']
    },
    {
        listeID: 4,
        headline: 'Afslutningssager under behandling',
        listeNavn: 'tildeltAfsluttet',
        sortColumn: 'sagsnummer',
        sortDirection: 'asc',
        toggle_opfølgningssager: true,
        searchString: '',
        columns: [SYSTEM_BUTTON_OVERFØR, 'brugerNavn', 'sagsnummer', 'ejendomsnummer', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler']
    },
    {
        listeID: 5,
        headline: 'Opfølgningsliste',
        listeNavn: 'opfølgningsliste',
        sortColumn: 'sagsnummer',
        sortDirection: 'asc',
        toggle_opfølgningssager: true,
        searchString: '',
        columns: [SYSTEM_BUTTON_OVERFØR, 'brugerNavn', 'flow', 'sagsnummer', 'ejendomsnummer', 'antalBBRnotater', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler']
    },
    {
        listeID: 6,
        headline: 'Alle sager',
        listeNavn: 'alle',
        sortColumn: 'sagsnummer',
        sortDirection: 'asc',
        toggle_opfølgningssager: true,
        searchString: '',
        columns: [SYSTEM_BUTTON_OVERFØR, 'brugerNavn', 'flow', 'sagsnummer', 'ejendomsnummer', 'datoModtaget', 'datoAfgørelse', 'datoAfsluttet', 'adresse', 'sagsindhold', 'sagsbehandler'] // bbr notater fjernet pga. performanceproblemer
    },
    {
        listeID: 7,
        headline: 'Påbegyndelsessager',
        listeNavn: 'påbegyndelsessager',
        sortColumn: 'sagsnummer',
        sortDirection: 'asc',
        toggle_opfølgningssager: true,
        searchString: '',
        columns: [SYSTEM_BUTTON_OVERFØR, 'brugerNavn', 'flow', 'sagsnummer', 'ejendomsnummer', 'antalBBRnotater', 'datoAktivitetPåbegyndelseSlut', 'adresse', 'sagsindhold']
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
    { id: 1, class: ['blue'], description: 'Blå' },
    { id: 2, class: ['green'], description: 'Grøn' },
    { id: 3, class: ['amber'], description: 'Gul' },
    { id: 4, class: ['red'], description: 'Red' },
    { id: 5, class: ['teal'], description: 'Blågrøn' },
    { id: 6, class: ['orange'], description: 'Orange' },
    { id: 7, class: ['pink'], description: 'Pink' },
    { id: 8, class: ['grey', 'darken-3'], description: 'Gråsort' }
]

let colorThemeSelected = 1

const flows = [
    'Afventer afgørelsesdato', // 0
    'Tilladelsessag', // 1
    'Afslutningssag', // 2
    'Færdigbehandlet', // 3
    'Afventer afslutningsdato', // 4
    'Afslutningssag, delvis færdigbehandlet' // 5
]

const centerColumns = [
    'antalBBRnotater',
    'sagsnummer',
    'ejendomsnummer',
    'datoModtaget',
    'datoAfgørelse',
    'datoAfsluttet',
    'datoAktivitetPåbegyndelseSlut'
]

module.exports = {
    listeDef,
    liste,
    currentSag,
    blurElements,
    colorThemes,
    colorThemeSelected,
    flows,
    centerColumns
}