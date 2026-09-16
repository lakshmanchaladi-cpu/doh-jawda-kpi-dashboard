const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.get("SELECT COUNT(*) as c FROM emr_data WHERE quarter=2", (err, r) => console.log("EMR:", r.c));
db.get("SELECT COUNT(*) as c FROM shafafiya_data WHERE quarter=2", (err, r) => console.log("RCM:", r.c));
db.get("SELECT COUNT(*) as c FROM locked_audit_records WHERE quarter=2", (err, r) => console.log("LOCKED:", r.c));
