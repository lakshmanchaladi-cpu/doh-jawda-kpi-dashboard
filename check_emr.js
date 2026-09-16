const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT encounter_date, foot_exam_done, hba1c_value, cpt_all FROM emr_data WHERE mrn='41553'", (err, rows) => {
  console.log(rows);
});
