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
                        query = 'EXEC spGetAntalSagerIkkeTildeltTilladelse'
                        break

                    case 'countIkkeTildeltAfsluttet':
                        query = 'EXEC spGetAntalSagerIkkeTildeltAfsluttet'
                        break

                    case 'countTildeltTilladelse':
                        query = 'EXEC spGetAntalSagerTildeltTilladelse'
                        break

                    case 'countTildeltAfsluttet':
                        query = 'EXEC spGetAntalSagerTildeltAfsluttet'
                        break

                    case 'countTildelt':
                        query = `EXEC spGetAntalSagerTildeltBruger @BrugerId = ${bruger.ID}`
                        break

                    case 'countOpfølgningsliste':
                        query = 'EXEC spGetAntalSagerOpfølgning'
                        break

                    case 'countPåbegyndelsesliste':
                        query = 'EXEC spGetAntalSagerPåbegyndelse'
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
                    query = `EXEC spGetIkkeTildeltTilladelse @BrugerId = ${bruger.ID}`
                    break

                case 'ikkeTildeltAfsluttet':
                    query = `EXEC spGetIkkeTildeltAfsluttet @BrugerId = ${bruger.ID}`
                    break

                case 'tildeltTilladelse':
                    query = `EXEC spGetTildeltTilladelse @BrugerId = ${bruger.ID}`
                    break

                case 'tildeltAfsluttet':
                    query = `EXEC spGetTildeltAfsluttet @BrugerId = ${bruger.ID}`
                    break

                case 'tildelt':
                    query = `EXEC spGetTildelt @BrugerId = ${bruger.ID}`
                    break

                case 'sag':
                    query = `EXEC spGetSag @BrugerId = ${bruger.ID}, @SagId = ${ID}`
                    break

                case 'opfølgningsliste':
                    query = `EXEC spGetOpfølgningssager @BrugerId = ${bruger.ID}`
                    break

                case 'alle':
                    query = `EXEC søgAlleSager @søgeord = ${ID}`
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
            query = `EXEC spGetBbrNotater @SagID = ${sagID}`
            return getData(query)
        },

        getNote: sagID => {
            query = `EXEC spGetNote @SagID = ${sagID}`
            return getData(query)
        },

        getFærdigbehandlingerTilladelse: sagID => {
            query = `EXEC spGetFærdigbehandletTilladelse @SagID = ${sagID}`
            return getData(query)
        },

        getFærdigbehandlingerAfsluttet: sagID => {
            query = `EXEC spGetFærdigbehandletAfsluttet @SagID = ${sagID}`
            return getData(query)
        },

        getFærdigbehandlingerPåbegyndelsesdato: sagID => {
            query = `EXEC spGetFærdigbehandletPåbegyndelse @SagID = ${sagID}`
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