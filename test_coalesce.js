const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

const facilityId = 2; const year = 2026; const quarter = 2;
const lb12 = '2025-06-30'; const lb9 = '2025-07-01'; const qStart = '2026-04-01';

const EM_CPT_FILTER = `(cpt_all LIKE '%99201%' OR cpt_all LIKE '%99202%' OR cpt_all LIKE '%99203%' OR cpt_all LIKE '%99204%' OR cpt_all LIKE '%99205%' OR cpt_all LIKE '%99211%' OR cpt_all LIKE '%99212%' OR cpt_all LIKE '%99213%' OR cpt_all LIKE '%99214%' OR cpt_all LIKE '%99215%')`;
const DM_ICD_FILTER = `(icd10_all LIKE '%E10%' OR icd10_all LIKE '%E11%' OR icd10_all LIKE '%E13%')`;
const DM_EXCL = `AND (icd10_all NOT LIKE '%O24.4%' OR icd10_all IS NULL) AND (icd10_all NOT LIKE '%E28.2%' OR icd10_all IS NULL) AND (icd10_all NOT LIKE '%E09%' OR icd10_all IS NULL)`;
const ABM_EXCL = `AND (is_abm_mandate = 0 OR is_abm_mandate IS NULL)`;
const PC_PHY_FILTER = `(physician_category IN ('PC','PC_Valid','Primary Care / Family Medicine', 'General Practitioner'))`;

const sql = `
  SELECT COUNT(DISTINCT mrn) as cnt FROM (
    SELECT mrn,
           MAX(CASE WHEN COALESCE(hba1c_date, encounter_date) >= '${lb12}' THEN hba1c_value ELSE NULL END) as latest_hba1c
    FROM locked_audit_records
    WHERE facility_id=${facilityId} 
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=${facilityId} AND year=${year} AND quarter=${quarter}
          AND patient_age >= 18 AND patient_age <= 75
          AND ${DM_ICD_FILTER} ${DM_EXCL} ${ABM_EXCL}
          AND ${PC_PHY_FILTER}
          AND ${EM_CPT_FILTER}
          AND mrn IN (
            SELECT mrn FROM locked_audit_records
            WHERE facility_id=${facilityId} AND encounter_date >= '${lb9}' AND encounter_date < '${qStart}'
              AND ${DM_ICD_FILTER}
            GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
          )
      )
    GROUP BY mrn
  ) sub
  WHERE latest_hba1c IS NULL OR latest_hba1c > 9.0
`;

db.get(sql, (err, row) => console.log('PC009 Numerator with COALESCE:', row));
