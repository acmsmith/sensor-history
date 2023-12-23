const sqlite3 = require('sqlite3');
const axios = require('axios').default;

function getConfig(db, fn) {
    db.all(`select rowid, sensor, attribute, name, active, modifier, lastupdated from sensor_config`, 
    (err, rows) => {
      fn(rows);
    });
  }

  function clearConfig(db) {
    db.run(`delete from sensor_config`);
  }

  function addConfig(db, sensorId, name, attribute) {
    db.run(`  
    insert into sensor_config (sensor, name, active, attribute)
    values (?, ?, ?, ?);
           `, sensorId, name, 1, attribute);
  }

  function updateConfig(db, rowid, name, attribute, active, modifier, lastupdated) {
    db.run(`  
    update sensor_config 
    set name = ?, attribute = ?, active = ?, modifier = ?, lastupdated = ? 
    where rowid = ?;
           `, name, attribute, active, modifier, lastupdated, rowid);
  }

  function updateLastupdated(db, rowid, lastupdated) {
    db.run(`  
    update sensor_config 
    set lastupdated = ? 
    where rowid = ?;
           `, lastupdated, rowid);
  }

  function populateConfig(db) {
    console.log("Resetting Config");
    clearConfig(db);
    var sensors = process.env.SENSORS.split(',');
    for(let i=0; i<sensors.length; i++){
      axios.get(`${process.env.PHOSCON_SERVER}/api/${process.env.USER_TOKEN}/sensors/`+sensors[i])
      .then(response =>  {
        if(response.data.hasOwnProperty('type') && response.data.hasOwnProperty('state')){
          console.log("Adding to config: " + sensors[i]);
          var attribute = 'unkown';
          if(response.data['type'].toLowerCase().includes('temp')){
            attribute = 'temperature';
          }
          else if(response.data['type'].toLowerCase().includes('humid')){
            attribute = 'humidity';
          }
          addConfig(db, sensors[i], response.data['name'], attribute);
        }
      });
    };
  }

  module.exports = { getConfig, clearConfig, addConfig, populateConfig, updateConfig, updateLastupdated };