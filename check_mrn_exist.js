const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

db.all(`SELECT mrn, hba1c_value, hba1c_date FROM emr_data WHERE mrn IN ('41553', '51198', '71109')`, (err, rows) => console.log('EMR:', rows));
db.all(`SELECT mrn, hba1c_value FROM shafafiya_data WHERE mrn IN ('41553', '51198', '71109')`, (err, rows) => console.log('RCM:', rows));
