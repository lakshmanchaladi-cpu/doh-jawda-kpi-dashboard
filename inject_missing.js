const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const newPC004 = `
async function calc_PC004(db, facilityId, year, quarter, filters) {
  const sql = \`
    WITH first_phq2 AS (
      SELECT mrn, MIN(encounter_date) as min_phq2_date
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=? AND phq2_result=1
      GROUP BY mrn
    ),
    exclusions AS (
      SELECT DISTINCT mrn FROM locked_audit_records
      WHERE facility_id=? 
        AND ( \${filters.DEP_EXCL_FILTER} OR \${filters.BIPOLAR_EXCL_FILTER} )
    ),
    q2_data AS (
      SELECT mrn, MAX(patient_refused) as refused, MAX(is_abm_mandate) as abm,
             MAX(CASE WHEN bp_systolic IS NULL THEN 1 ELSE 0 END) as no_vitals,
             MAX(CASE WHEN visit_type LIKE '%Dental%' OR visit_type LIKE '%Ayurvedic%' OR visit_type LIKE '%Homeopathic%' THEN 1 ELSE 0 END) as bad_visit
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
      GROUP BY mrn
    ),
    eligible AS (
      SELECT f.mrn, f.min_phq2_date
      FROM first_phq2 f
      JOIN locked_audit_records r ON f.mrn = r.mrn AND f.min_phq2_date = r.encounter_date
      JOIN q2_data q ON f.mrn = q.mrn
      WHERE r.facility_id=? AND r.year=? AND r.quarter=?
        AND ABS(r.patient_age) >= 18
        AND r.is_thiqa = 1
        AND f.mrn NOT IN (SELECT mrn FROM exclusions)
        AND q.refused = 0 AND q.abm = 0 AND q.no_vitals = 0 AND q.bad_visit = 0
    )
    SELECT 
      (SELECT GROUP_CONCAT(mrn) FROM eligible) as den_list,
      (SELECT GROUP_CONCAT(e.mrn) FROM eligible e 
       JOIN locked_audit_records r ON e.mrn = r.mrn 
       WHERE r.facility_id=? AND r.year=? AND r.quarter=? 
         AND r.phq9_score IS NOT NULL 
         AND r.phq9_date IS NOT NULL
         AND (julianday(r.phq9_date) - julianday(e.min_phq2_date)) <= 1
      ) as num_list
  \`;
  
  const result = await db.get(sql, [
    facilityId, year, quarter, facilityId, facilityId, year, quarter, facilityId, year, quarter, facilityId, year, quarter
  ]);

  const numList = result && result.num_list ? result.num_list.split(',') : [];
  const denList = result && result.den_list ? result.den_list.split(',') : [];

  return { numerator: numList.length, denominator: denList.length, num_list: numList, den_list: denList };
};

async function calc_PC005(db, facilityId, year, quarter, filters) {
  const sql = \`
    WITH q2_dx AS (
      SELECT mrn, MIN(encounter_date) as dx_date
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=? 
        AND phq9_score BETWEEN 5 AND 14
        AND \${filters.DEP_EXCL_FILTER}
      GROUP BY mrn
    ),
    exclusions AS (
      SELECT DISTINCT mrn FROM locked_audit_records
      WHERE facility_id=? AND \${filters.BIPOLAR_EXCL_FILTER}
    ),
    established AS (
      SELECT DISTINCT r.mrn FROM locked_audit_records r
      JOIN q2_dx q ON r.mrn = q.mrn
      WHERE r.facility_id=? 
        AND r.encounter_date < q.dx_date
        AND \${filters.DEP_EXCL_FILTER}
    ),
    q2_data AS (
      SELECT mrn, MAX(patient_refused) as refused, MAX(is_abm_mandate) as abm
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
      GROUP BY mrn
    ),
    eligible AS (
      SELECT f.mrn, f.dx_date
      FROM q2_dx f
      JOIN locked_audit_records r ON f.mrn = r.mrn AND f.dx_date = r.encounter_date
      JOIN q2_data q ON f.mrn = q.mrn
      WHERE r.facility_id=? AND r.year=? AND r.quarter=?
        AND ABS(r.patient_age) >= 18
        AND \${filters.PC_PHY_FILTER}
        AND f.mrn NOT IN (SELECT mrn FROM exclusions)
        AND f.mrn NOT IN (SELECT mrn FROM established)
        AND q.refused = 0 AND q.abm = 0
    )
    SELECT 
      (SELECT GROUP_CONCAT(mrn) FROM eligible) as den_list,
      (SELECT GROUP_CONCAT(e.mrn) FROM eligible e 
       JOIN locked_audit_records r ON e.mrn = r.mrn AND e.dx_date = r.encounter_date
       WHERE r.facility_id=? AND r.year=? AND r.quarter=? 
         AND r.followup_within_30d = 1
      ) as num_list
  \`;

  const result = await db.get(sql, [
    facilityId, year, quarter, facilityId, facilityId, facilityId, year, quarter, facilityId, year, quarter, facilityId, year, quarter
  ]);

  const numList = result && result.num_list ? result.num_list.split(',') : [];
  const denList = result && result.den_list ? result.den_list.split(',') : [];

  return { numerator: numList.length, denominator: denList.length, num_list: numList, den_list: denList };
}
`;

code = code.replace("async function calc_PC009", newPC004 + "\nasync function calc_PC009");
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Restored PC004 and PC005');
