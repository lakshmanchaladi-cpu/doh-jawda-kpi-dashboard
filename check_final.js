const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT kpi_code, numerator, denominator, value, status FROM kpi_results WHERE quarter=2 AND facility_id=2 AND kpi_code IN ('PC011', 'PC012', 'PC013')", (err, rows) => {
  console.table(rows);
});
