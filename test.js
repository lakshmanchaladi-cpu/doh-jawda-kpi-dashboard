
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/kpi_data.db');
db.get("SELECT COUNT(DISTINCT mrn) as c FROM emr_data WHERE year=2026 AND quarter=2 AND (strftime('%Y', encounter_date) - strftime('%Y', patient_dob)) >= 18", (err, r) => console.log('DOB Patients:', r.c));

