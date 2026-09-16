const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT encounter_date, cpt_all, hba1c_value, foot_exam_done, icd10_all FROM locked_audit_records WHERE mrn='41553'", (err, rows) => {
  console.log(rows);
});
