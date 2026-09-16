const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT encounter_date, cpt_all, foot_exam_done FROM locked_audit_records WHERE mrn='41553' AND cpt_all LIKE '%2028F%'", (err, rows) => {
  console.log(rows);
});
