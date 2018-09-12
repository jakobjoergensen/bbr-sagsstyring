const { DBCtrl } = require('../db-ctrl')

DBCtrl.getCounts('countIkkeTildeltTilladelse')
.then(result => {
  console.log(result[0].count)
})
.catch(error => {
  console.log('Error! ', error)
})