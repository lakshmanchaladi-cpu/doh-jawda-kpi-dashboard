const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all(`
  SELECT mrn, COUNT(*) as visits, SUM(CASE WHEN bp_systolic<130 AND bp_diastolic<80 THEN 1 ELSE 0 END) as controlled_count 
  FROM locked_audit_records 
  WHERE facility_id=2 AND year=2026 AND quarter=2 AND bp_systolic IS NOT NULL 
  GROUP BY mrn 
  HAVING visits > 1
`, (err, rows) => console.log('Patients with multiple Q2 BP readings:', rows));
