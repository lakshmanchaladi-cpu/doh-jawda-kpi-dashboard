const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
const q = `SELECT mrn, encounter_date, icd10_all, facility_id, year, quarter FROM locked_audit_records WHERE icd10_all LIKE '%Z94.0%'`;
db.all(q, (err, rows) => { console.log(rows); });
