
const express = require('express');
const axios = require('axios').default;
const path = require('path');
const app = express();
const sqlconfig = require('./sql/config');
const sqlconnection = require('./sql/connection');
const sqldata = require('./sql/data');
var trimlogperiod = parseFloat(process.env.LOG_RETENTION_PERIOD);
var updateRateSecods = parseFloat(process.env.UPDATE_RATE);
let db;
let elapsed = 0;

app.listen(process.env.PORT, () => {
  console.log(`Phoscon Server: ${process.env.PHOSCON_SERVER}.`);
  console.log(`Update Rate: ${process.env.UPDATE_RATE} seconds`);
  console.log(`History will be kept for: ${process.env.LOG_RETENTION_PERIOD} seconds`);
  console.log(`Sensor API is listening on port ${process.env.PORT}.`);
  db = sqlconnection.connectToDatabase();
  setInterval(phosconListener,process.env.UPDATE_RATE*1000);
  }
);

app.use(express.static('sensorviewer'));

app.use(express.urlencoded({extended: true}));

function phosconListener(){
  //console.log("Updating Devices...");
  elapsed = elapsed + updateRateSecods;
  sqlconfig.getActiveConfig(db, 
    result => {
      for(let i=0; i<result.length; i++){
        let attribute = result[i].attribute;
        let sensor = result[i].sensor;
        let config = result[i].rowid;
        let lastupdated = result[i].lastupdated;
        axios.get(`${process.env.PHOSCON_SERVER}/api/${process.env.USER_TOKEN}/sensors/` + sensor)
        .then(response =>  {
            //console.log("Recording: " + result[i].name + '-' + attribute + ' ' + lastupdated);
            sqldata.addData(db, config, response.data.state[attribute]/100, response.data.state['lastupdated'], lastupdated);
        });
      }
    }
  );
  if(elapsed > trimlogperiod){
    console.log("Trimming Logs to: " + trimlogperiod/60/60/24 + " Days");
    sqldata.deleteData(db, trimlogperiod);
    elapsed = 0;
  }
}


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/sensorviewer/index.html'));
});

app.get('/getConfig', (req, res) => {
  sqlconfig.getConfig(db, result => {
    res.send(result);
  });
});

app.post('/updateConfig', (req, res) => {
  var active = 0;
  if(req.body.active == "on")
    active = 1;
  sqlconfig.updateConfig(db, req.body.rowid, req.body.name, req.body.attribute, active, req.body.modifier);
  res.send("Config Updated");
});

app.get('/getAllSensors', (req, res) => {
  axios.get(`${process.env.PHOSCON_SERVER}/api/${process.env.USER_TOKEN}/sensors/`)
  .then(response => res.send(response.data));
});

app.get('/getSensor/:sensorId', (req, res) => {
  axios.get(`${process.env.PHOSCON_SERVER}/api/${process.env.USER_TOKEN}/sensors/`+req.params.sensorId)
  .then(response => res.send(response.data));
});

app.get('/getCompleteState', (req, res) => {
  axios.get(`${process.env.PHOSCON_SERVER}/api/${process.env.USER_TOKEN}/`)
  .then(response =>   res.send(response.data));
});

app.get('/getData/:sensorType', (req, res) => {
  sqldata.getData(db, req.params.sensorType, result => {
    res.send(result);
  });
});

app.get('/refreshConfig', (req, res) => {
  sqlconfig.getConfig(db, oldConfig => {
    sqlconfig.generateConfig(db, oldConfig)
    res.send('OK');
  });
});
