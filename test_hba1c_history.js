const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
const sql = `
  SELECT mrn, hba1c_date, hba1c_value, year, quarter 
  FROM locked_audit_records 
  WHERE facility_id=2 AND hba1c_value IS NOT NULL 
    AND mrn IN (
      SELECT mrn FROM locked_audit_records 
      WHERE facility_id=2 AND year=2026 AND quarter=2 
        AND patient_age >= 18 AND patient_age <= 75 
        AND (icd10_all LIKE '%E10%' OR icd10_all LIKE '%E11%' OR icd10_all LIKE '%E13%') 
        AND (physician_category IN ('PC','PC_Valid','Primary Care / Family Medicine', 'General Practitioner'))
    )
`;
db.all(sql, (err, rows) => {
  if (err) console.error(err);
  console.log('HbA1c tests for our 66 eligible patients across ANY quarter:', rows);
});
