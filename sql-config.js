// SQL Config
const server = 'srvsql29'
const database = 'BBRsagsstyring'

const SQLConfig = {
    // driver: 'msnodesqlv8',
    connectionString: `Driver={SQL Server Native Client 11.0};Server=${server};Database=${database};Trusted_Connection={yes};`
}


// Exports
module.exports = {
    SQLConfig
}