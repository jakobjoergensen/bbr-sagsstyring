const sql = require('mssql/msnodesqlv8')
const { SQLConfig } = require('./sql-config')
const { ItemCtrl } = require('./item-ctrl')
const { fn } = require('./functions')


const DBCtrl = (() => {

    const pool = new sql.ConnectionPool(SQLConfig).connect()


    // Private methods ----------------------------------
    function getData(queryString) {

        return pool
            .then(pool => {
                fn.showLoading()
                return pool.request().query(queryString)
            })
            .then(result => {
                fn.hideLoading()
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
                        query = 'SELECT COUNT(*) count FROM vSagerIkkeTildeltTilladelse'
                        break

                    case 'countIkkeTildeltAfsluttet':
                        query = 'SELECT COUNT(*) count FROM vSagerIkkeTildeltAfsluttet'
                        break

                    case 'countTildeltTilladelse':
                        query = 'SELECT COUNT(*) count FROM vSagerTildeltTilladelse'
                        break

                    case 'countTildeltAfsluttet':
                        query = 'SELECT COUNT(*) count FROM vSagerTildeltAfsluttet'
                        break

                    case 'countTildelt':
                        query = `SELECT COUNT(*) count FROM vSagerTildelt WHERE brugerID = ${bruger.ID}`
                        break

                    case 'countOpfølgningsliste':
                        query = 'SELECT DISTINCT COUNT(sagId) count FROM vSagerOpfølgning '
                        break

                    case 'countPåbegyndelsesliste':
                        query = 'SELECT DISTINCT COUNT(sagId) count FROM vSagerPåbegyndelse '
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
                    s.*
                    ,m.color
                  FROM
                    vSagerIkkeTildeltTilladelse s
                    LEFT JOIN markering m ON s.sagID = m.sagID AND m.brugerID = ${bruger.ID}
                  ORDER BY s.datoAfgørelse`
                    break

                case 'ikkeTildeltAfsluttet':
                    query = `SELECT
                    s.*
                    ,m.color
                  FROM
                    vSagerIkkeTildeltAfsluttet s
                    LEFT JOIN markering m ON s.sagID = m.sagID AND m.brugerID = ${bruger.ID}
                  ORDER BY s.datoAfsluttet`
                    break

                case 'tildeltTilladelse':
                    query = `SELECT
                    s.*
                    ,m.color
                  FROM
                    vSagerTildeltTilladelse s
                    LEFT JOIN markering m ON s.sagID = m.sagID AND m.brugerID = ${bruger.ID}
                  ORDER BY s.datoAfgørelse`
                    break

                case 'tildeltAfsluttet':
                    query = `SELECT
                    s.*
                    ,m.color
                  FROM
                    vSagerTildeltAfsluttet s
                    LEFT JOIN markering m ON s.sagID = m.sagID AND m.brugerID = ${bruger.ID}
                  ORDER BY s.datoAfsluttet`
                    break

                case 'tildelt':
                    query = `SELECT
                    s.*
                    ,m.color
                  FROM
                    vSagerTildelt s
                    LEFT JOIN markering m ON s.sagID = m.sagID AND m.brugerID = ${bruger.ID}
                  WHERE
                    s.brugerID = ${bruger.ID}`
                    break

                case 'sag':
                    query = `SELECT
                      s.*
                      ,m.color
                    FROM vSager s
                    LEFT JOIN markering m ON s.sagID = m.sagID AND m.brugerID = ${bruger.ID}
                    WHERE s.sagID = ${ID}`
                    break

                case 'opfølgningsliste':
                    query = `SELECT
                      s.*
                      ,m.color
                    FROM vSagerOpfølgning s
                    LEFT JOIN markering m ON s.sagID = m.sagID AND m.brugerID = ${bruger.ID}`
                    break

                case 'alle':
                    query = `SELECT * FROM vSager WHERE sagsnummer LIKE '%${ID}%' OR adresse LIKE '%${ID}%' OR sagsindhold LIKE '%${ID}%'`
                    break

                    // case 'påbegyndelsessager':
                    //     query = `SELECT
                    //   view_påbegyndelsessager.*
                    //   ,markering.color
                    //   FROM view_påbegyndelsessager
                    //   LEFT JOIN markering ON view_påbegyndelsessager.sagID = markering.sagID AND markering.brugerID = ${bruger.ID}`
                    //     break
            }

            // kør forespørgsel
            if (query) {

                return getData(query)
                    .then(result => {
                        const populatedItems = ItemCtrl.populateItemList(result)
                        console.log(populatedItems)
                        return populatedItems
                    })
                    .catch(err => console.log(err))
            }
        },

        getKPITilladelsessager: async(datoMin, datoMax) => {
            query = `SELECT k.*
              FROM vKpiAntalFærdigbehandletTilladelse k
              WHERE k.brugerID = ${bruger.ID}
              AND k.datoFærdigbehandletTilladelse >= '${datoMin}'
              AND k.datoFærdigbehandletTilladelse <= '${datoMax}'
              `

            return getData(query)
        },

        getKPIAfslutningssager: async(datoMin, datoMax) => {
            query = `SELECT k.*
              FROM vKpiAntalFærdigbehandletAfsluttet k
              WHERE k.brugerID = ${bruger.ID}
              AND k.datoFærdigbehandletAfslutning >= '${datoMin}'
              AND k.datoFærdigbehandletAfslutning <= '${datoMax}'
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
                n.noteID,
                n.sagID,
                n.BrugerID,
                n.BrugerNavn,
                n.timestamp,
                n.tekst
              FROM vNoter n
              WHERE n.sagID = ${sagID}`

            return getData(query)
        },

        getFærdigbehandlingerTilladelse: sagID => {
            query = `SELECT
                s.brugerID,
                s.brugerNavn,
                s.BehandletTidspunkt
              FROM vSagerFærdigbehandletTilladelse s
              WHERE s.sagID = '${sagID}'
              ORDER BY s.BehandletTidspunkt DESC
              `

            return getData(query)
        },

        getFærdigbehandlingerAfsluttet: sagID => {
            query = `SELECT
                brugerID,
                brugerNavn,
                BehandletTidspunkt
              FROM vSagerFærdigbehandletAfsluttet
              WHERE sagID = '${sagID}'
              ORDER BY BehandletTidspunkt DESC
              `

            return getData(query)
        },

        getFærdigbehandlingerPåbegyndelsesdato: sagID => {
            query = `SELECT
              brugerID,
              brugerNavn,
              BehandletTidspunkt
              FROM vSagerFærdigbehandletPåbegyndelse
              WHERE sagID = '${sagID}'
              ORDER BY BehandletTidspunkt DESC
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
                    if (output) {
                        request.output(output[0])
                    }

                    fn.saving()

                    var result = request.execute(procedure)

                    fn.saveHighlight()
                    return result

                })
                .catch(error => { console.log(error) })

        }

    }
})()


module.exports = {
    DBCtrl
}