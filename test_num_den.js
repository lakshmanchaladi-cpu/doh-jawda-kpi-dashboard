const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

const facilityId = 2; const year = 2026; const quarter = 2;
const lb12 = '2025-06-30';

const EM_CPT_FILTER = `(
  cpt_all LIKE '%99201%' OR cpt_all LIKE '%99202%' OR cpt_all LIKE '%99203%' OR cpt_all LIKE '%99204%' OR cpt_all LIKE '%99205%' OR 
  cpt_all LIKE '%99211%' OR cpt_all LIKE '%99212%' OR cpt_all LIKE '%99213%' OR cpt_all LIKE '%99214%' OR cpt_all LIKE '%99215%'
)`;
const DM_ICD_FILTER = `(icd10_all LIKE '%E10%' OR icd10_all LIKE '%E11%' OR icd10_all LIKE '%E13%')`;
const DM_EXCL = `AND icd10_all NOT LIKE '%O24.4%' AND (icd10_all NOT LIKE '%O24.4%' OR icd10_all IS NULL)`;
const ABM_EXCL = `AND (is_abm_mandate = 0 OR is_abm_mandate IS NULL)`;
const PC_PHY_FILTER = `(physician_category IN ('PC','PC_Valid','Primary Care / Family Medicine', 'General Practitioner'))`;

const sql = `
      SELECT mrn,
             MAX(CASE WHEN hba1c_date >= '${lb12}' THEN hba1c_value ELSE NULL END) as latest_hba1c,
             MAX(CASE WHEN hba1c_date >= '${lb12}' THEN hba1c_date ELSE NULL END) as latest_hba1c_date
      FROM locked_audit_records
      WHERE facility_id=${facilityId} 
        AND mrn IN (
          SELECT mrn FROM locked_audit_records
          WHERE facility_id=${facilityId} AND year=${year} AND quarter=${quarter}
            AND patient_age >= 18
            AND ${DM_ICD_FILTER} ${DM_EXCL} ${ABM_EXCL}
            AND ${PC_PHY_FILTER}
            AND ${EM_CPT_FILTER}
        )
      GROUP BY mrn
`;

db.all(sql, (err, rows) => {
  if (err) { console.error(err); return; }
  let numCount = 0;
  let hasHbA1cCount = 0;
  for (let r of rows) {
    if (r.latest_hba1c !== null) hasHbA1cCount++;
    if (r.latest_hba1c === null || r.latest_hba1c_date === null || r.latest_hba1c > 9.0) {
      numCount++;
    }
  }
  console.log('Total in Denominator:', rows.length);
  console.log('Total with any HbA1c value:', hasHbA1cCount);
  console.log('Total flagged for Numerator (>9.0 or NULL):', numCount);
});
