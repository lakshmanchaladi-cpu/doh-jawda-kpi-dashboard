const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
const sql = `
  SELECT mrn, COUNT(DISTINCT encounter_date) as c 
  FROM locked_audit_records 
  WHERE facility_id=2 AND encounter_date >= '2025-07-01' AND encounter_date < '2026-04-01' 
    AND (icd10_all LIKE '%E10%' OR icd10_all LIKE '%E11%' OR icd10_all LIKE '%E13%')
  GROUP BY mrn HAVING c >= 2
`;
db.all(sql, (err, rows) => {
  if (err) console.error(err);
  console.log('Diabetic Patients with 2 visits in lookback:', rows.length);
});
