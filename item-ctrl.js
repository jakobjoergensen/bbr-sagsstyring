// const { DBCtrl } = require('./db-ctrl')

/**ITEM CONTROLLER***********************************************************/
const ItemCtrl = (() => {

  return {
    populateItemList: (items) => {
      let populatedItemList = []
  
      items.forEach(item => {
        const newItem = {
          sagID: item.sagID || null,
          flowID: item.flowID || null,
          flow: item.flow || null,
          sagIndholdIDAktuel: item.sagIndholdIDAktuel || null,
          sagIndholdID: item.sagIndholdID || null,
          referenceStructura: item.referenceStructura || null,
          timestampUdlæsningTilladelse: item.timestampUdlæsningTilladelse || null,
          timestampUdlæsningAfslutning: item.timestampUdlæsningAfsluttet || null,
          ændringTimestamp: item.ændringTimestamp || null,
          ændringBrugerID: item.ændringBrugerID || null,
          ændringBrugerNavn: item.ændringBrugerNavn || null,
          timestampFærdigbehandletTilladelse: item.timestampFærdigbehandletTilladelse || null,
          timestampFærdigbehandletAfslutning: item.timestampFærdigbehandletAfsluttet || null,
          timestampFærdigbehandletPåbegyndelsesdato: item.timestampFærdigbehandletPåbegyndelsesdato || null,
          ejendomsnummer: item.ejendomsnummer || null,
          sagsnummer: item.sagsnummer || null,
          esdh: item.esdh || null,
          byggesagTimestampOprettet: item.byggesagTimestampOprettet || null,
          byggesagTimestampÆndret: item.byggesagTimestampÆndre || null,
          datoModtaget: item.datoModtaget || null,
          datoAfgørelse: item.datoAfgørelse || null,
          datoAfsluttet: item.datoAfsluttet || null,
          datoAktivitetPåbegyndelseSlut: item.datoAktivitetPåbegyndelseSlut || null,
          sagsbehandler: item.sagsbehandler || null,
          sagsart: item.sagsart || null,
          politiskKategori: item.politiskKategori || null,
          adresse: item.adresse || null,
          sagsindhold: item.sagsindhold || null,
          brugerNavn: item.brugerNavn || null,
          færdigbehandletTilladelseBrugerNavn: item.færdigbehandletTilladelseÆndretAfBrugerNavn || null,
          færdigbehandletAfslutningBrugerNavn: item.færdigbehandletAfsluttetÆndretAfBrugerNavn || null,
          brugerID: item.brugerID || null,
          color: item.color || null,
          antalBBRnotater: item.antalBBRnotater || null,
          BBRnotater: item.BBRnotater || {},
          note: item.note || null,
          sagBrugerÆndringTimestamp: item.sagBrugerÆndringTimestamp || null,
          sagBrugerÆndringBrugerNavn: item.sagBrugerÆndringBrugerNavn || null,
          færdigbehandletTilladelse: [],
          færdigbehandletAfsluttet: [],
          færdigbehandletPåbegyndelsesdato: []
        }
        
        populatedItemList.push(newItem)
        
      })

      return populatedItemList
    }
  }

})()

module.exports = {
  ItemCtrl
}