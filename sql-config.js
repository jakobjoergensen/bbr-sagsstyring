const test = false

const SQLConfig = {
    server: 'srvsql29',
    database: 'BBRsagsstyring' + (test ? '_Test': ''),
    driver: 'SQL Server Native Client 11.0', //'msnodesqlv8',
    options: {
        trustedConnection: true
    }
}

// Exports
module.exports = {
    SQLConfig
}