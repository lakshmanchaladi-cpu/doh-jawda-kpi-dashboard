const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT kpi_code, numerator, denominator, value FROM kpi_results WHERE quarter=2 AND facility_id=2 AND kpi_code='PC009'", (err, rows) => {
  console.log(rows);
});
