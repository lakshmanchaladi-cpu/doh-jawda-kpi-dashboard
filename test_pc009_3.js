const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

const PC_PHY_FILTER = "(physician_category IN ('PC','PC_Valid','Primary Care / Family Medicine', 'General Practitioner'))";

const sql = `SELECT COUNT(DISTINCT mrn) as cnt FROM locked_audit_records WHERE facility_id=2 AND year=2026 AND quarter=2 AND patient_age >= 18 AND patient_age <= 75 AND (icd10_all LIKE '%E10%' OR icd10_all LIKE '%E11%' OR icd10_all LIKE '%E13%') AND (is_abm_mandate = 0 OR is_abm_mandate IS NULL) AND ${PC_PHY_FILTER} AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=2 AND encounter_date >= '2025-07-01' AND encounter_date < '2026-04-01' AND (icd10_all LIKE '%E10%' OR icd10_all LIKE '%E11%' OR icd10_all LIKE '%E13%') GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2)`;

db.get(sql, (err, row) => console.log('With NEW Physician Filter:', row));
