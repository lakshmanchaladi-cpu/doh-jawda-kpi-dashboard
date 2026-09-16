const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT facility_id, year, quarter, COUNT(*) as c FROM emr_data GROUP BY facility_id, year, quarter", (err, rows) => {
  console.log(rows);
});
