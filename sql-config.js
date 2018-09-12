
// const SQLConfig = {
//     connectionString: `Server=${server};Database=${database};user=aztmbjj;Password=7ureTAKE`
// }

const SQLConfig = {
    server: 'srvsql29',
    database: 'BBRsagsstyring',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
}

// Exports
module.exports = {
    SQLConfig
}