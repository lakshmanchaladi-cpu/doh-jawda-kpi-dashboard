const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT encounter_date, cpt_all FROM emr_data WHERE mrn='41553' AND encounter_date IN ('2026-01-03', '2026-05-19')", (err, rows) => {
  console.log("EMR:", rows);
});
db.all("SELECT encounter_date, cpt_all FROM shafafiya_data WHERE mrn='41553' AND encounter_date IN ('2026-01-03', '2026-05-19')", (err, rows) => {
  console.log("RCM:", rows);
});
