const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT DISTINCT physician_category FROM locked_audit_records WHERE facility_id=2 AND year=2026 AND quarter=2", (err, rows) => {
  console.log('Categories:', rows);
});
