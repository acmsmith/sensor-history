const sqlite3 = require('sqlite3');
const sqlconfig = require('./config');
const fs = require("fs");
const filepath = './sensor.db';

function connectToDatabase() {
  if (fs.existsSync(filepath)) {
    return new sqlite3.Database('./sensor.db', sqlite3.OPEN_READWRITE);
  }
  else{
    return createDatabase();
  }
}

function createDatabase() {
  db = new sqlite3.Database('./sensor.db', (err) => {
      if (err) {
          console.log("Error: " + err);
          exit(1);
      }
      createTables(db);
  });
  return db;
}

function createTables(newdb) {
  newdb.exec(`
  create table sensor_config (
      sensor not null,
      name text not null,
      attribute text not null,
      active int,
      modifier int,
      lastupdated string
  );
  create table sensor_data (
    timestamp string not null,
    config int not null,
    value real not null
  );
      `, ()  => {
        console.log("Database Created.");
        sqlconfig.generateConfig(db, null);
  });
}

module.exports = { connectToDatabase, createDatabase, createTables };