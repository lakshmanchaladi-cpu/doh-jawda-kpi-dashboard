const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.get("SELECT COUNT(*) as c FROM locked_audit_records WHERE facility_id=2 AND year=2026 AND quarter=2 AND (cpt_all LIKE '%99201%' OR cpt_all LIKE '%99212%')", (err, row) => console.log('Count:', row));
