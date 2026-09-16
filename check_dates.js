const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

const mrns = ['41553', '51198', '71109'];

db.all(`SELECT mrn, encounter_date, hba1c_value, hba1c_date FROM emr_data WHERE mrn IN ('41553', '51198', '71109') AND hba1c_value IS NOT NULL`, [], (err, rows) => {
  console.log('--- EMR DATA ---');
  console.table(rows);
});

db.all(`SELECT mrn, encounter_date, hba1c_value, hba1c_date FROM shafafiya_data WHERE mrn IN ('41553', '51198', '71109')`, [], (err, rows) => {
  console.log('--- RCM DATA ---');
  console.table(rows);
});
