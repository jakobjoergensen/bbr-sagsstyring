// const { DBCtrl } = require('./db-ctrl')

/**ITEM CONTROLLER***********************************************************/
const ItemCtrl = (() => {

    return {
        populateItemList: (items) => {
            let populatedItemList = []

            items.forEach(item => {
                let sagsnumre = []

                if (item.sagsnummer) {
                    sagsnumre.push(item.sagsnummer)
                }

                if (item.structuraSagsnummer) {
                    sagsnumre.push(item.structuraSagsnummer)
                }


                const newItem = {
                    sagID: item.sagID || null,
                    flowID: item.flowID || null,
                    flow: item.flow || null,

                    ejendomsnummer: item.ejendomsnummer || null,
                    sagsnummer: sagsnumre.join(" / ") || null,
                    datoModtaget: item.datoModtaget || null,
                    datoAfgørelse: item.datoAfgørelse || null,
                    datoAfsluttet: item.datoAfsluttet || null,
                    // datoAktivitetPåbegyndelseSlut: item.datoAktivitetPåbegyndelseSlut || null,
                    sagsbehandler: item.sagsbehandler || null,
                    sagsart: item.sagsart || null,
                    politiskKategori: item.politiskKategori || null,
                    adresse: item.adresse || null,
                    sagsindhold: item.sagsindhold || null,

                    brugerId: item.brugerId || null,
                    brugerTimestamp: item.brugerTimestamp || null,
                    brugerNavn: item.brugerNavn || null,

                    color: item.color || null,
                    antalBBRnotater: item.antalBBRnotater || null,
                    BBRnotater: item.BBRnotater || {},
                    note: item.note || null,
                    færdigbehandletTilladelse: [],
                    færdigbehandletAfsluttet: [],
                    færdigbehandletPåbegyndelsesdato: []
                        // referenceStructura: item.referenceStructura || null,
                        // timestampUdlæsningTilladelse: item.timestampUdlæsningTilladelse || null,
                        // timestampUdlæsningAfslutning: item.timestampUdlæsningAfsluttet || null,
                        // ændringTimestamp: item.ændringTimestamp || null,
                        // ændringBrugerID: item.ændringBrugerID || null,
                        // ændringBrugerNavn: item.ændringBrugerNavn || null,
                        // timestampFærdigbehandletTilladelse: item.timestampFærdigbehandletTilladelse || null,
                        // timestampFærdigbehandletAfslutning: item.timestampFærdigbehandletAfsluttet || null,
                        // timestampFærdigbehandletPåbegyndelsesdato: item.timestampFærdigbehandletPåbegyndelsesdato || null,
                        // byggesagTimestampOprettet: item.byggesagTimestampOprettet || null,
                        // byggesagTimestampÆndret: item.byggesagTimestampÆndre || null,
                        // færdigbehandletTilladelseBrugerNavn: item.færdigbehandletTilladelseÆndretAfBrugerNavn || null,
                        // færdigbehandletAfslutningBrugerNavn: item.færdigbehandletAfsluttetÆndretAfBrugerNavn || null,
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