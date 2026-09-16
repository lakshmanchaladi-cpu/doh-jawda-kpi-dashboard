const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT mrn, encounter_date, cpt_all, hba1c_value, hba1c_date FROM locked_audit_records WHERE cpt_all LIKE '%83036%' LIMIT 5", (err, rows) => {
  if (err) console.error(err);
  console.log(rows);
});
