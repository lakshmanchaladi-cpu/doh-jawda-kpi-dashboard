const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT encounter_date, hba1c_value, foot_exam_done FROM emr_data WHERE mrn='41553'", (err, rows) => {
  console.log(rows);
});
