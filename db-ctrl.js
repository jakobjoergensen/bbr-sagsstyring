const sql = require('mssql/msnodesqlv8')
const { SQLConfig } = require('./sql-config')
const { ItemCtrl } = require('./item-ctrl')

const DBCtrl = (() => {

  // Private methods ----------------------------------
  async function getData(query) {
    try {

      
      const connectionPool = new sql.ConnectionPool(SQLConfig)
      await connectionPool.connect()

      const result = await connectionPool.request().query(query)

      connectionPool.close()
      return result['recordsets'][0]
      
      
      // sql.query(SQLConfig.connectionString, query, (err, rows) => {
      //   result = rows[0]
      //   return result
      // })

    } catch(err) { console.log(err) }
  }

  
  // Public methods ----------------------------------
  return {

    // Counter quries
    getCounts: async (view) => {
      
      try {
        let query

        switch (view) {
          case 'countIkkeTildeltTilladelse':
            query = 'SELECT COUNT(sagID) count FROM view_sagIkkeTildeltTilladelse'
          break

          case 'countIkkeTildeltAfsluttet':
            query = 'SELECT COUNT(sagID) count FROM view_sagIkkeTildeltAfsluttet'
          break

          case 'countTildeltTilladelse':
            query = 'SELECT COUNT(sagID) count FROM view_sagTildeltTilladelse'
          break

          case 'countTildeltAfsluttet':
            query = 'SELECT COUNT(sagID) count FROM view_sagTildeltAfsluttet'
          break

          case 'countTildelt':
            query = 'SELECT COUNT(sagID) count FROM view_sagTildelt WHERE tildeltBrugerID = ' + bruger.ID
          break

          case 'countOpfølgningsliste':
            query = 'SELECT COUNT(*) count FROM view_sagAktuel INNER JOIN view_antalBBRnotater ON view_sagAktuel.sagID = view_antalBBRnotater.sagID'
          break

        }
        
        // kør forespørgsel
        if (query) {
          const items = await getData(query)
          return items[0]['count']

        } else {
          console.log('Ingen query!')

        }

      } catch (err) { console.log(err) } 
    },


    // Generel quries
    get: async (view, ID = '') => {
      try {
        let query

        switch (view) {
          case 'ikkeTildeltTilladelse':
            query = `SELECT
                    view_sagIkkeTildeltTilladelse.sagID,
                    view_sagIkkeTildeltTilladelse.ejendomsnummer,
                    view_sagIkkeTildeltTilladelse.sagsnummer,
                    view_sagIkkeTildeltTilladelse.esdh,
                    view_sagIkkeTildeltTilladelse.datoModtaget,
                    view_sagIkkeTildeltTilladelse.datoAfgørelse,
                    view_sagIkkeTildeltTilladelse.datoAfsluttet,
                    view_sagIkkeTildeltTilladelse.sagsbehandler,
                    view_sagIkkeTildeltTilladelse.sagsart,
                    view_sagIkkeTildeltTilladelse.politiskKategori,
                    view_sagIkkeTildeltTilladelse.adresse,
                    view_sagIkkeTildeltTilladelse.sagsindhold,
                    markering.color
                    FROM view_sagIkkeTildeltTilladelse
                    LEFT JOIN markering ON view_sagIkkeTildeltTilladelse.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                    ORDER BY datoAfgørelse`
          break;

          case 'ikkeTildeltAfsluttet':
           query = `SELECT
                    view_sagIkkeTildeltAfsluttet.sagID,
                    view_sagIkkeTildeltAfsluttet.ejendomsnummer,
                    view_sagIkkeTildeltAfsluttet.sagsnummer,
                    view_sagIkkeTildeltAfsluttet.esdh,
                    view_sagIkkeTildeltAfsluttet.datoModtaget,
                    view_sagIkkeTildeltAfsluttet.datoAfgørelse,
                    view_sagIkkeTildeltAfsluttet.datoAfsluttet,
                    view_sagIkkeTildeltAfsluttet.sagsbehandler,
                    view_sagIkkeTildeltAfsluttet.sagsart,
                    view_sagIkkeTildeltAfsluttet.politiskKategori,
                    view_sagIkkeTildeltAfsluttet.adresse,
                    view_sagIkkeTildeltAfsluttet.sagsindhold,
                    markering.color
                    FROM view_sagIkkeTildeltAfsluttet
                    LEFT JOIN markering ON view_sagIkkeTildeltAfsluttet.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                    ORDER BY datoAfsluttet`
          break;

          case 'tildeltTilladelse':
            query = `SELECT
                    view_sagTildeltTilladelse.sagID,
                    view_sagTildeltTilladelse.ejendomsnummer,
                    view_sagTildeltTilladelse.sagsnummer,
                    view_sagTildeltTilladelse.esdh,
                    view_sagTildeltTilladelse.datoModtaget,
                    view_sagTildeltTilladelse.datoAfgørelse,
                    view_sagTildeltTilladelse.datoAfsluttet,
                    view_sagTildeltTilladelse.sagsbehandler,
                    view_sagTildeltTilladelse.sagsart,
                    view_sagTildeltTilladelse.politiskKategori,
                    view_sagTildeltTilladelse.adresse,
                    view_sagTildeltTilladelse.sagsindhold,
                    view_sagTildeltTilladelse.brugerNavn,
                    markering.color
                    FROM view_sagTildeltTilladelse
                    LEFT JOIN markering ON view_sagTildeltTilladelse.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                    ORDER BY datoAfgørelse`
          break;

          case 'tildeltAfsluttet':
            query = `SELECT
                    view_sagTildeltAfsluttet.sagID,
                    view_sagTildeltAfsluttet.ejendomsnummer,
                    view_sagTildeltAfsluttet.sagsnummer,
                    view_sagTildeltAfsluttet.esdh,
                    view_sagTildeltAfsluttet.datoModtaget,
                    view_sagTildeltAfsluttet.datoAfgørelse,
                    view_sagTildeltAfsluttet.datoAfsluttet,
                    view_sagTildeltAfsluttet.sagsbehandler,
                    view_sagTildeltAfsluttet.sagsart,
                    view_sagTildeltAfsluttet.politiskKategori,
                    view_sagTildeltAfsluttet.adresse,
                    view_sagTildeltAfsluttet.sagsindhold,
                    view_sagTildeltAfsluttet.brugerNavn,
                    markering.color
                    FROM view_sagTildeltAfsluttet
                    LEFT JOIN markering ON view_sagTildeltAfsluttet.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                    ORDER BY datoAfsluttet`
          break;

          case 'tildelt':
            query = `SELECT
                    view_sagTildelt.sagID,
                    view_sagTildelt.flow,
                    view_sagTildelt.ejendomsnummer,
                    view_sagTildelt.sagsnummer,
                    view_sagTildelt.esdh,
                    view_sagTildelt.datoModtaget,
                    view_sagTildelt.datoAfgørelse,
                    view_sagTildelt.datoAfsluttet,
                    view_sagTildelt.sagsbehandler,
                    view_sagTildelt.sagsart,
                    view_sagTildelt.politiskKategori,
                    view_sagTildelt.adresse,
                    view_sagTildelt.sagsindhold,
                    markering.color
                    FROM view_sagTildelt
                    LEFT JOIN markering ON view_sagTildelt.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                    WHERE tildeltBrugerID = ${bruger.ID}`
          break;

          case 'sag':
            query = `SELECT
                    view_sag.sagID,
                    view_sag.flow,
                    view_sag.timestampFærdigbehandletTilladelse,
                    view_sag.timestampFærdigbehandletAfsluttet,
                    view_sag.ejendomsnummer,
                    view_sag.sagsnummer,
                    view_sag.esdh,
                    view_sag.datoModtaget,
                    view_sag.datoAfgørelse,
                    view_sag.datoAfsluttet,
                    view_sag.sagsbehandler,
                    view_sag.sagsart,
                    view_sag.politiskKategori,
                    view_sag.adresse,
                    view_sag.sagsindhold,
                    view_sag.brugerID,
                    view_sag.brugerNavn,
                    view_sag.færdigbehandletTilladelseÆndretAfBrugerNavn,
                    view_sag.færdigbehandletAfsluttetÆndretAfBrugerNavn,
                    view_sag.sagBrugerÆndringTimestamp,
                    view_sag.sagBrugerÆndringBrugerNavn,
                    markering.color
                    FROM view_sag
                    LEFT JOIN markering ON view_sag.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                    WHERE view_sag.sagID = ${ID}`
          break;

          case 'bbrNotater':
            query = `SELECT
                    sagID,
                    dato_oprettet,
                    NotatTekst,
                    notatlinjenummer,
                    entitetstype,
                    entitetIdentifikation
                    FROM view_bbrNotatNy
                    WHERE sagID = ${ID}`
          break

          case 'opfølgningsliste':
            query = `SELECT
                    sag.ID 'sagID'
                    ,sag.timestampUdlæsningTilladelse
                    ,sag.timestampUdlæsningAfsluttet
                    ,sagIndhold.timestampFærdigbehandletTilladelse
                    ,sagIndhold.timestampFærdigbehandletAfsluttet
                    ,sub_view_structura.ejendomsnummer
                    ,sub_view_structura.sagsnummer
                    ,sub_view_structura.esdh
                    ,sub_view_structura.datoModtaget
                    ,sub_view_structura.datoAfgørelse
                    ,sub_view_structura.datoAfsluttet
                    ,sub_view_structura.sagsbehandler
                    ,sub_view_structura.sagsart
                    ,sub_view_structura.politiskKategori
                    ,sub_view_structura.adresse
                    ,view_antalBBRnotater.antalBBRnotater
                    ,view_sagAktuel.flow
                    ,view_sagBrugerAktuel.brugerID
                    ,view_sagBrugerAktuel.brugerNavn
                    FROM sag
                    INNER JOIN sagIndhold ON sag.sagIndholdID = sagIndhold.ID
                    INNER JOIN sub_view_structura ON sag.referenceStructura = sub_view_structura.referenceStructura
                    INNER JOIN view_antalBBRnotater ON sag.ID = view_antalBBRnotater.sagID
                    LEFT JOIN view_sagAktuel ON sag.ID = view_sagAktuel.sagID
                    LEFT JOIN view_sagBrugerAktuel ON sag.ID = view_sagBrugerAktuel.sagID`
          break

        }
        
        // kør forespørgsel
        if (query) {
          const items = await getData(query)
          const populatedItems = ItemCtrl.populateItemList(items)
          return populatedItems

        } else {
          console.log('Ingen query!')

        }
        
        
      } catch (err) { console.log(err) }    
    },

    getKPITilladelsessager: async (datoMin, datoMax) => {
      query = `SELECT *
              FROM view_kpi_antalFærdigbehandletTilladelseBruger
              WHERE brugerID = ${bruger.ID}
              AND datoFærdigbehandletTilladelse >= '${datoMin}'
              AND datoFærdigbehandletTilladelse <= '${datoMax}'
              `
      
      const rows = await getData(query)
      return rows
    },

    getKPIAfslutningssager: async (datoMin, datoMax) => {
      query = `SELECT *
              FROM view_kpi_antalFærdigbehandletAfsluttetBruger
              WHERE brugerID = ${bruger.ID}
              AND datoFærdigbehandletAfslutning >= '${datoMin}'
              AND datoFærdigbehandletAfslutning <= '${datoMax}'
              `
      
      const rows = await getData(query)
      return rows
    },


    getBBRNotater: async (sagID) => {
      query = `SELECT
              sagID,
              dato_oprettet,
              NotatTekst,
              notatlinjenummer,
              entitetstype,
              entitetIdentifikation
              FROM view_bbrNotatNy
              WHERE sagID = ${sagID}`

      const items = await getData(query)
      return items
    },

    getNote: async (sagID) => {
        query = `SELECT
                noteID,
                sagID,
                ændretAfBrugerID,
                ændretAfBrugerNavn,
                timestamp,
                tekst
                FROM view_noteAktuel
                WHERE sagID = ${sagID}`

          const rows = await getData(query)
          return rows[0]
    },

    execStoredProcedure: (procedure, params, callback = null) => {
      
        try {

          const sql2 = require('msnodesqlv8')
          sql2.open(SQLConfig.connectionString, (err, conn) => {
            const pm = conn.procedureMgr()
            pm.callproc(procedure, params, (err, result, output) => {
              if (callback)
                callback(err, result, output)
            })
          })
          


        } catch (err) { console.log(err) }
      }
    
  }
})()


module.exports = {
  DBCtrl
}