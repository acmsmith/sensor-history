require("dotenv").config();

const express = require('express');
const axios = require('axios').default;
const path = require('path');
const fs = require('fs');
const app = express();

app.listen(process.env.PORT, () => {
  console.log(`Container log dir: ${process.env.LOG_PATH}.`);
  console.log(`Phoscon Server: ${process.env.PHOSCON_SERVER}.`);
  console.log(`The following sensors will be logged: ${process.env.SENSORS}.`);
  console.log(`Sensor API is listening on port ${process.env.PORT}.`);
  setInterval(phosconListener,60000);
  }
);

app.use(express.static('sensorviewer'));

function phosconListener(){
  console.log("Updating Devices...");
  var sensors = process.env.SENSORS.split(',');
  for(let i=0; i<sensors.length; i++){
    axios.get(`${process.env.PHOSCON_SERVER}/api/${process.env.USER_TOKEN}/sensors/`+sensors[i])
    .then(response =>  {
      logDataToFile(sensors[i], response.data);  
    });
  }
}

function logDataToFile(sensor, data){
  if(data.hasOwnProperty('type') && data.hasOwnProperty('state')){
    if(data['type'].toLowerCase().includes('temp')){
      var record = {
        id: sensor,
        sensor_type: "Temperature",
        timestamp: new Date().toISOString(),
        value: data.state['temperature']/100 
      };
      fs.appendFile(getTemperatureLogPath(), JSON.stringify(record)+',\n', function(err) {
        if (err) {
             console.log(err);
         }
     });
    } else if(data['type'].toLowerCase().includes('humid')){
      var record = {
        id: sensor,
        sensor_type: "Humidity",
        timestamp: new Date().toISOString(),
        value: data.state['humidity']/100
      };
      fs.appendFile(getHumidityLogPath(), JSON.stringify(record)+',\n', function(err) {
        if (err) {
             console.log(err);
         }
     });
    }
  }
}

function getTemperatureLogPath(){
  return path.join(process.env.LOG_PATH, 'as_temperature.log')
}
function getHumidityLogPath(){
  return path.join(process.env.LOG_PATH, 'as_humidity.log')
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/sensorviewer/index.html'));
});

app.get('/getAllSensors', (req, res) => {
  axios.get(`${process.env.PHOSCON_SERVER}/api/${process.env.USER_TOKEN}/sensors/`)
  .then(response =>   res.send(response.data));
});

app.get('/getSensor/:sensorId', (req, res) => {
  axios.get(`${process.env.PHOSCON_SERVER}/api/${process.env.USER_TOKEN}/sensors/`+req.params.sensorId)
  .then(response =>   res.send(response.data));
});

app.get('/getTemperatureLog', (req, res) => {
  var data = fs.readFileSync(getTemperatureLogPath(), 'utf8');
  res.send(data);
});

app.get('/getHumidityLog', (req, res) => {
  var data = fs.readFileSync(getHumidityLogPath(), 'utf8');
  res.send(data);
});