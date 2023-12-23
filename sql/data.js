const sqlite3 = require('sqlite3');
const sqlconfig = require('./config');

function getData(db, sensortype, fn) {
    db.all(`select c.name, c.sensor as id, c.attribute, d.value, d.timestamp from sensor_data d
    inner join sensor_config c on d.config = c.rowid where c.attribute = ?`, sensortype, 
    (err, rows) => {
      fn(rows);
    });
  }
  
  function addData(db, config, value, newlastupdated, oldlastupdated) {
    if(!valid(newlastupdated) || value == 0){return;}
    if(newlastupdated <= oldlastupdated){return;}
    sqlconfig.updateLastupdated(db, config, newlastupdated)
    db.run(`  
    insert into sensor_data (timestamp, config, value)
    values (?, ?, ?);
           `, newlastupdated, config, value);
  }

  function deleteData(db, trimlogperiod) {
    db.run(`delete from sensor_data where ROUND((JULIANDAY('now') - JULIANDAY(timestamp)) * 86400) > ?`, trimlogperiod);
  }

  function valid(timestamp){
    return (new Date(timestamp)).getTime() > 0
  }

  module.exports = { getData, addData, deleteData };