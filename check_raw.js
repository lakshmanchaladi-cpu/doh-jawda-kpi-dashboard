const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT encounter_date, cpt_all FROM emr_data WHERE mrn='41553'", (err, rows) => {
  console.log("EMR:", rows.filter(r => r.cpt_all && r.cpt_all.includes('2028F')));
});
db.all("SELECT encounter_date, cpt_all FROM shafafiya_data WHERE mrn='41553'", (err, rows) => {
  console.log("RCM:", rows.filter(r => r.cpt_all && r.cpt_all.includes('2028F')));
});
