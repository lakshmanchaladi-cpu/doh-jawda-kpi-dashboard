const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const regex = /async function calc_PC005[\s\S]*?async function calc_PC021/g;

const newPC005 = `async function calc_PC005(db, facilityId, year, quarter, filters) {
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
    facilityId, year, quarter, // q2_dx
    facilityId, // exclusions
    facilityId, // established
    facilityId, year, quarter, // q2_data
    facilityId, year, quarter, // eligible
    facilityId, year, quarter  // num_list
  ]);

  const numList = result && result.num_list ? result.num_list.split(',') : [];
  const denList = result && result.den_list ? result.den_list.split(',') : [];

  return { numerator: numList.length, denominator: denList.length, num_list: numList, den_list: denList };
}

async function calc_PC021`;

code = code.replace(regex, newPC005);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Rewrote PC005');
