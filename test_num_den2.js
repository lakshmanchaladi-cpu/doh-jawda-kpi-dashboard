const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

const facilityId = 2; const year = 2026; const quarter = 2;

const EM_CPT_FILTER = `(
  cpt_all LIKE '%99201%' OR cpt_all LIKE '%99202%' OR cpt_all LIKE '%99203%' OR cpt_all LIKE '%99204%' OR cpt_all LIKE '%99205%' OR 
  cpt_all LIKE '%99211%' OR cpt_all LIKE '%99212%' OR cpt_all LIKE '%99213%' OR cpt_all LIKE '%99214%' OR cpt_all LIKE '%99215%'
)`;
const DM_ICD_FILTER = `(icd10_all LIKE '%E10%' OR icd10_all LIKE '%E11%' OR icd10_all LIKE '%E13%')`;
const DM_EXCL = `
  AND (icd10_all NOT LIKE '%O24.4%' OR icd10_all IS NULL)
  AND (icd10_all NOT LIKE '%E28.2%' OR icd10_all IS NULL)
  AND (icd10_all NOT LIKE '%E09%' OR icd10_all IS NULL)
`;
const ABM_EXCL = `AND (is_abm_mandate = 0 OR is_abm_mandate IS NULL)`;
const PC_PHY_FILTER = `(physician_category IN ('PC','PC_Valid','Primary Care / Family Medicine', 'General Practitioner'))`;

const sql = `
  SELECT COUNT(DISTINCT mrn) as c FROM locked_audit_records
  WHERE facility_id=${facilityId} AND year=${year} AND quarter=${quarter}
    AND patient_age >= 18
    AND ${DM_ICD_FILTER} ${DM_EXCL} ${ABM_EXCL}
    AND ${PC_PHY_FILTER}
    AND ${EM_CPT_FILTER}
`;

db.get(sql, (err, row) => console.log('New Denominator Count:', row));
