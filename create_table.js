const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clinician_licenses (
    license_number TEXT,
    clinician_name TEXT,
    major TEXT,
    profession TEXT,
    category TEXT,
    facility_name TEXT,
    facility_mf_no TEXT,
    PRIMARY KEY (license_number, facility_mf_no)
  )`, err => {
    if (err) console.error(err);
    else console.log('Table clinician_licenses created');
  });
});
