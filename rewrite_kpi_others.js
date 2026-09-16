const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target011 = /async function calc_PC011\([\s\S]*?async function calc_PC014/g;

const replacement = `async function calc_PC011(db, facilityId, year, quarter) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;

  const den = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
      AND \${PC_PHY_FILTER}
      AND \${EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
      AND \${PC_PHY_FILTER}
      AND \${EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
      AND (foot_exam_done = 1 OR cpt_all LIKE '%2028F%')
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC012(db, facilityId, year, quarter) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;

  const den = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
      AND \${PC_PHY_FILTER}
      AND \${EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
      AND \${PC_PHY_FILTER}
      AND \${EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
      AND (eye_exam_done = 1 OR cpt_all LIKE '%2022F%' OR cpt_all LIKE '%2024F%' OR cpt_all LIKE '%2026F%' OR cpt_all LIKE '%3072F%')
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC013(db, facilityId, year, quarter) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;

  const den = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
      AND \${PC_PHY_FILTER}
      AND \${EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
      AND \${PC_PHY_FILTER}
      AND \${EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
      AND (nephropathy_exam_done = 1 OR cpt_all LIKE '%3060F%' OR cpt_all LIKE '%82043%' OR cpt_all LIKE '%82570%')
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC014`;

code = code.replace(target011, replacement);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Completely rewrote PC011, PC012, PC013 numerators and denominators');
