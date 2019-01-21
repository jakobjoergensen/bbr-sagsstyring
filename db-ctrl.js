const sql = require('mssql/msnodesqlv8')
const { SQLConfig } = require('./sql-config')
const { ItemCtrl } = require('./item-ctrl')


const DBCtrl = (() => {
  
  const pool = new sql.ConnectionPool(SQLConfig).connect()
  

  // Private methods ----------------------------------
  function getData (queryString) {
    
    return pool
      .then(pool => {
        return pool.request().query(queryString)
      })
      .then(result => {
        return result['recordset']
      })
      .catch(error => { console.log(error) })
  }


  
  // Public methods ----------------------------------
  return {

    // Counter quries
    getCounts: (view) => {
      
      try {
        let query

        switch (view) {
          case 'countIkkeTildeltTilladelse':
            query = 'SELECT COUNT(*) count FROM view_sagIkkeTildeltTilladelse'
          break

          case 'countIkkeTildeltAfsluttet':
            query = 'SELECT COUNT(*) count FROM view_sagIkkeTildeltAfsluttet'
          break

          case 'countTildeltTilladelse':
            query = 'SELECT COUNT(*) count FROM view_sagTildeltTilladelse'
          break

          case 'countTildeltAfsluttet':
            query = 'SELECT COUNT(*) count FROM view_sagTildeltAfsluttet'
          break

          case 'countTildelt':
            query = 'SELECT COUNT(*) count FROM view_sagTildelt WHERE tildeltBrugerID = ' + bruger.ID
          break

          case 'countOpfølgningsliste':
            query = 'SELECT COUNT(*) OVER() count FROM view_sagOpfølgning GROUP BY sagID'
          break

        }
        
        // kør forespørgsel
        return getData(query)
        
      } catch (err) { console.log(err) } 
    },


    // Generel quries
    get: (view, ID = null) => {
      
      let query

      switch (view) {
        case 'ikkeTildeltTilladelse':
          query = `SELECT
                    view_sagIkkeTildeltTilladelse.*
                    ,markering.color
                  FROM
                    view_sagIkkeTildeltTilladelse
                    LEFT JOIN markering ON view_sagIkkeTildeltTilladelse.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  ORDER BY view_sagIkkeTildeltTilladelse.datoAfgørelse`
        break

        case 'ikkeTildeltAfsluttet':
          query = `SELECT
                    view_sagIkkeTildeltAfsluttet.*
                    ,markering.color
                  FROM
                    view_sagIkkeTildeltAfsluttet
                    LEFT JOIN markering ON view_sagIkkeTildeltAfsluttet.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  ORDER BY view_sagIkkeTildeltAfsluttet.datoAfsluttet`
        break

        case 'tildeltTilladelse':
          query = `SELECT
                    view_sagTildeltTilladelse.*
                    ,markering.color
                  FROM
                    view_sagTildeltTilladelse
                    LEFT JOIN markering ON view_sagTildeltTilladelse.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  ORDER BY view_sagTildeltTilladelse.datoAfgørelse`
        break

        case 'tildeltAfsluttet':
          query = `SELECT
                    view_sagTildeltAfsluttet.*
                    ,markering.color
                  FROM
                    view_sagTildeltAfsluttet
                    LEFT JOIN markering ON view_sagTildeltAfsluttet.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  ORDER BY view_sagTildeltAfsluttet.datoAfsluttet`
        break

        case 'tildelt':
          query = `SELECT
                  view_sagTildelt.*
                  ,markering.color
                  FROM
                    view_sagTildelt
                    LEFT JOIN markering ON view_sagTildelt.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  WHERE
                    view_sagTildelt.tildeltBrugerID = ${bruger.ID}`
        break

        case 'sag':
          query = `SELECT
                  view_sag.*
                  ,markering.color
                  FROM view_sag
                  LEFT JOIN markering ON view_sag.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  WHERE view_sag.sagID = ${ID}`
        break

        case 'opfølgningsliste':
          query = `SELECT
                  view_sagOpfølgning.*
                  ,markering.color
                  FROM view_sagOpfølgning
                  LEFT JOIN markering ON view_sagOpfølgning.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}`
        break

        case 'alle':
          query = `SELECT * FROM view_sagAktuelAlle WHERE sagsnummer LIKE '%${ID}%' OR esdh LIKE '%${ID}%' OR datoModtaget LIKE '%${ID}%' OR datoAfgørelse LIKE '%${ID}%' OR datoAfsluttet LIKE '%${ID}%' OR adresse LIKE '%${ID}%' OR sagsindhold LIKE '%${ID}%'`
        break

        case 'påbegyndelsessager':
          query = `SELECT
                  view_påbegyndelsessager.*
                  ,markering.color
                  FROM view_påbegyndelsessager
                  LEFT JOIN markering ON view_påbegyndelsessager.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}`
        break
      }
      
      // kør forespørgsel
      if (query) {
        
        return getData(query)
          .then(result => {
            const populatedItems = ItemCtrl.populateItemList(result)
            return populatedItems
          })
          .catch(err => console.log(err))
      }
    },

    getKPITilladelsessager: async (datoMin, datoMax) => {
      query = `SELECT *
              FROM view_kpi_antalFærdigbehandletTilladelseBruger
              WHERE brugerID = ${bruger.ID}
              AND datoFærdigbehandletTilladelse >= '${datoMin}'
              AND datoFærdigbehandletTilladelse <= '${datoMax}'
              `
      
      return getData(query)
    },

    getKPIAfslutningssager: async (datoMin, datoMax) => {
      query = `SELECT *
              FROM view_kpi_antalFærdigbehandletAfsluttetBruger
              WHERE brugerID = ${bruger.ID}
              AND datoFærdigbehandletAfslutning >= '${datoMin}'
              AND datoFærdigbehandletAfslutning <= '${datoMax}'
              `
      
      return getData(query)
    },


    getBBRNotater: sagID => {
      query = `SELECT
              sagID,
              datoOprettet,
              notatNummer,
              notatType,
              entitetsidentifikation,
              notatTekst
              FROM bbrNotat
              WHERE sagID = ${sagID}`

      return getData(query)
    },

    getNote: sagID => {
      query = `SELECT
              noteID,
              sagID,
              ændretAfBrugerID,
              ændretAfBrugerNavn,
              timestamp,
              tekst
              FROM view_noteAktuel
              WHERE sagID = ${sagID}`

      return getData(query)
    },

    getFærdigbehandlingerTilladelse: sagID => {
      query = `SELECT
              brugerID,
              brugerNavn,
              timestampFærdigbehandletTilladelse        
              FROM view_sagerFærdigbehandletTilladelse
              WHERE sagID = '${sagID}'
              ORDER BY timestampFærdigbehandletTilladelse DESC
              `

      return getData(query)
    },

    getFærdigbehandlingerAfsluttet: sagID => {
      query = `SELECT
              brugerID,
              brugerNavn,
              timestampFærdigbehandletAfsluttet        
              FROM view_sagerFærdigbehandletAfsluttet
              WHERE sagID = '${sagID}'
              ORDER BY timestampFærdigbehandletAfsluttet DESC
              `

      return getData(query)
    },


    execStoredProcedure: (procedure, params, output = null) => {
      
      return pool
        .then(pool => {
          const request = new sql.Request(pool)

          // Parametre
          params.forEach(param => { request.input(param[0], param[1]) })
          
          // Output parameters
          if (output)
            request.output(output[0])

          return request.execute(procedure)

        })
        .catch(error => { console.log(error)})
      
    }
    
  }
})()


module.exports = {
  DBCtrl
}