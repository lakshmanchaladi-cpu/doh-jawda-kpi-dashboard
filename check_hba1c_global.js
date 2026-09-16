const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT COUNT(*) as cnt, SUM(CASE WHEN hba1c_value IS NOT NULL THEN 1 ELSE 0 END) as has_hba1c FROM locked_audit_records", (err, rows) => {
  console.log(rows);
});
