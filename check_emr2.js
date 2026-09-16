const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT rowid, encounter_date, hba1c_value, foot_exam_done, cpt_all FROM emr_data WHERE mrn='41553' ORDER BY rowid DESC LIMIT 20", (err, rows) => {
  if(err) console.error(err);
  else console.log(JSON.stringify(rows, null, 2));
});
