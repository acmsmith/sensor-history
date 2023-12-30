const sqlite3 = require('sqlite3');
const axios = require('axios').default;

function getConfig(db, fn) {
    db.all(`select rowid, sensor, attribute, name, active, modifier, lastupdated from sensor_config order by name asc`, 
    (err, rows) => {
      fn(rows);
    });
  }

  function getActiveConfig(db, fn) {
    db.all(`select rowid, sensor, attribute, name, active, modifier, lastupdated from sensor_config where active = 1`, 
    (err, rows) => {
      fn(rows);
    });
  }

  function clearConfig(db) {
    db.run(`delete from sensor_config`);
  }

  function addConfig(db, sensorId, name, aktive, attribute) {
    db.run(`  
    insert into sensor_config (sensor, name, active, attribute)
    values (?, ?, ?, ?);
           `, sensorId, name, aktive, attribute);
  }

  function updateConfig(db, rowid, name, attribute, active, modifier) {
    db.run(`  
    update sensor_config 
    set name = ?, attribute = ?, active = ?, modifier = ?  
    where rowid = ?;
           `, name, attribute, active, modifier, rowid);
    console.log("Config updated for: " + name);
  }

  function updateLastupdated(db, rowid, lastupdated) {
    db.run(`  
    update sensor_config set lastupdated = ? where rowid = ?;
           `, lastupdated, rowid);
  }

  function generateConfig(db, oldConfig){
    console.log("Generating Config");
    axios.get(`${process.env.PHOSCON_SERVER}/api/${process.env.USER_TOKEN}/sensors/`)
    .then(response =>  {
      var sensors = response.data;
      for (sensorId in sensors){
        var sensor = sensors[sensorId];
        if(sensor.hasOwnProperty('type') && sensor.hasOwnProperty('state')){
          var attribute = 'unknown';
          var aktive = 1;
          if(sensor['type'].toLowerCase().includes('temp')){
            attribute = 'temperature';
          }
          else if(sensor['type'].toLowerCase().includes('humid')){
            attribute = 'humidity';
          }
          else{
            aktive = 0;
          }
          const exists = (configElement) => configElement.sensor == sensorId;
          if(!oldConfig || !oldConfig.some(exists)) {
            console.log("Adding Config for sensor: " + sensorId + "-" + sensor['name']);
            addConfig(db, sensorId, sensor['name'], aktive, attribute);
          }
        }
      }
    });
  }

  module.exports = { getConfig, getActiveConfig, clearConfig, addConfig, 
    updateConfig, updateLastupdated, generateConfig };