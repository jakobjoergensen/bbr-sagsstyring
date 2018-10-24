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
            query = 'SELECT COUNT(*) count FROM view_sagIkkeTildeltTilladelseNY3'
          break

          case 'countIkkeTildeltAfsluttet':
            query = 'SELECT COUNT(*) count FROM view_sagIkkeTildeltAfsluttetNY3'
          break

          case 'countTildeltTilladelse':
            query = 'SELECT COUNT(*) count FROM view_sagTildeltTilladelseNY3'
          break

          case 'countTildeltAfsluttet':
            query = 'SELECT COUNT(*) count FROM view_sagTildeltAfsluttetNY3'
          break

          case 'countTildelt':
            query = 'SELECT COUNT(*) count FROM view_sagTildeltNY3 WHERE tildeltBrugerID = ' + bruger.ID
          break

          case 'countOpfølgningsliste':
            query = 'SELECT COUNT(*) OVER() count FROM view_sagOpfølgningNY3 GROUP BY sagID'
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
                    view_sagIkkeTildeltTilladelseNY3.*
                    ,markering.color
                  FROM
                    view_sagIkkeTildeltTilladelseNY3
                    LEFT JOIN markering ON view_sagIkkeTildeltTilladelseNY3.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  ORDER BY view_sagIkkeTildeltTilladelseNY3.datoAfgørelse`
        break

        case 'ikkeTildeltAfsluttet':
          query = `SELECT
                    view_sagIkkeTildeltAfsluttetNY3.*
                    ,markering.color
                  FROM
                    view_sagIkkeTildeltAfsluttetNY3
                    LEFT JOIN markering ON view_sagIkkeTildeltAfsluttetNY3.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  ORDER BY view_sagIkkeTildeltAfsluttetNY3.datoAfsluttet`
        break

        case 'tildeltTilladelse':
          query = `SELECT
                    view_sagTildeltTilladelseNY3.*
                    ,markering.color
                  FROM
                    view_sagTildeltTilladelseNY3
                    LEFT JOIN markering ON view_sagTildeltTilladelseNY3.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  ORDER BY view_sagTildeltTilladelseNY3.datoAfgørelse`
        break

        case 'tildeltAfsluttet':
          query = `SELECT
                    view_sagTildeltAfsluttetNY3.*
                    ,markering.color
                  FROM
                    view_sagTildeltAfsluttetNY3
                    LEFT JOIN markering ON view_sagTildeltAfsluttetNY3.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  ORDER BY view_sagTildeltAfsluttetNY3.datoAfsluttet`
        break

        case 'tildelt':
          query = `SELECT
                  view_sagTildeltNY3.*
                  ,markering.color
                  FROM
                    view_sagTildeltNY3
                    LEFT JOIN markering ON view_sagTildeltNY3.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  WHERE
                    view_sagTildeltNY3.tildeltBrugerID = ${bruger.ID}`
        break

        case 'sag':
          query = `SELECT
                  view_sag.*
                  ,markering.color
                  FROM view_sag
                  LEFT JOIN markering ON view_sag.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}
                  WHERE view_sag.sagID = ${ID}`
        break

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
                  view_sagOpfølgningNY3.*
                  ,markering.color
                  FROM view_sagOpfølgningNY3
                  LEFT JOIN markering ON view_sagOpfølgningNY3.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}`
        break

        case 'alle':
          query = `SELECT * FROM view_sagAktuelAlleNY3 WHERE sagsnummer LIKE '%${ID}%' OR esdh LIKE '%${ID}%' OR datoModtaget LIKE '%${ID}%' OR datoAfgørelse LIKE '%${ID}%' OR datoAfsluttet LIKE '%${ID}%' OR adresse LIKE '%${ID}%' OR sagsindhold LIKE '%${ID}%'`

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
              FROM view_sagerFærdigbehandletTilladelseNY
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
              FROM view_sagerFærdigbehandletAfsluttetNY
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