const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

const DM_ICD_FILTER = "(icd10_all LIKE '%E10%' OR icd10_all LIKE '%E11%' OR icd10_all LIKE '%E13%')";
const PC_PHY_FILTER = "(physician_category IN ('PC','PC_Valid','Primary Care / Family Medicine', 'General Practitioner'))";

const sql = `
  SELECT hba1c_value, hba1c_date 
  FROM locked_audit_records 
  WHERE facility_id=2 AND year=2026 AND quarter=2
    AND mrn IN (
      SELECT mrn FROM locked_audit_records
      WHERE facility_id=2 AND encounter_date >= '2025-07-01' AND encounter_date < '2026-04-01'
        AND ${DM_ICD_FILTER}
      GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
    )
    AND ${DM_ICD_FILTER} AND ${PC_PHY_FILTER}
`;

db.all(sql, (err, rows) => {
  const withValues = rows.filter(r => r.hba1c_value !== null);
  console.log('Total denominator encounters:', rows.length);
  console.log('Encounters with HbA1c values:', withValues.length);
  if (withValues.length > 0) console.log('Sample values:', withValues.slice(0, 5));
});
