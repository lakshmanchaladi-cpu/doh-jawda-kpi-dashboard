const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// The file has multiple definitions of calc_PC011/12/13 due to earlier bad regex. We need to clear them out safely and replace them before calc_PC014.
const regex = /async function calc_PC011[\s\S]*?async function calc_PC014/g;

const newCode = `async function calc_PC011(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;
  const lb12 = lookback12Date(year, quarter);

  const denomSql = \`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${filters.DM_ICD_FILTER} \${filters.DM_EXCL} \${filters.ABM_EXCL}
      AND \${filters.PC_PHY_FILTER}
      AND \${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  \`;
  const den = await db.get(denomSql, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const numSql = \`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${filters.DM_ICD_FILTER} \${filters.DM_EXCL} \${filters.ABM_EXCL}
      AND \${filters.PC_PHY_FILTER}
      AND \${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? 
          AND (foot_exam_done = 1 OR cpt_all LIKE '%2028F%')
      )
  \`;
  const num = await db.get(numSql, [facilityId, year, quarter, facilityId, lb9, qStart, facilityId, lb12]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC012(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;
  const lb12 = lookback12Date(year, quarter);

  const denomSql = \`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${filters.DM_ICD_FILTER} \${filters.DM_EXCL} \${filters.ABM_EXCL}
      AND \${filters.PC_PHY_FILTER}
      AND \${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  \`;
  const den = await db.get(denomSql, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const numSql = \`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${filters.DM_ICD_FILTER} \${filters.DM_EXCL} \${filters.ABM_EXCL}
      AND \${filters.PC_PHY_FILTER}
      AND \${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? 
          AND (eye_exam_done = 1 OR cpt_all LIKE '%2022F%' OR cpt_all LIKE '%2024F%' OR cpt_all LIKE '%2026F%' OR cpt_all LIKE '%3072F%')
      )
  \`;
  const num = await db.get(numSql, [facilityId, year, quarter, facilityId, lb9, qStart, facilityId, lb12]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC013(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;
  const lb12 = lookback12Date(year, quarter);

  const denomSql = \`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${filters.DM_ICD_FILTER} \${filters.DM_EXCL} \${filters.ABM_EXCL}
      AND \${filters.PC_PHY_FILTER}
      AND \${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  \`;
  const den = await db.get(denomSql, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const numSql = \`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${filters.DM_ICD_FILTER} \${filters.DM_EXCL} \${filters.ABM_EXCL}
      AND \${filters.PC_PHY_FILTER}
      AND \${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? 
          AND (nephropathy_exam_done = 1 OR cpt_all LIKE '%3060F%' OR cpt_all LIKE '%82043%' OR cpt_all LIKE '%82570%')
      )
  \`;
  const num = await db.get(numSql, [facilityId, year, quarter, facilityId, lb9, qStart, facilityId, lb12]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC014`;

code = code.replace(regex, newCode);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Successfully rewrote PC011, PC012, and PC013 with strict 12-month lookback logic');
