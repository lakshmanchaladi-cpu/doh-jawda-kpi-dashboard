const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const missingKPIs = `
async function calc_PC009(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const lb12 = lookback12Date(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;

  const den = await db.get(\`
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
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM (
      SELECT mrn,
             MAX(CASE WHEN hba1c_date >= ? THEN hba1c_value ELSE NULL END) as latest_hba1c,
             MAX(CASE WHEN hba1c_date >= ? THEN hba1c_date ELSE NULL END) as latest_hba1c_date
      FROM locked_audit_records
      WHERE facility_id=? 
        AND mrn IN (
          SELECT mrn FROM locked_audit_records
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
        )
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NULL OR latest_hba1c_date IS NULL OR latest_hba1c > 9.0
  \`, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC010(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const lb12 = lookback12Date(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;

  const den = await db.get(\`
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
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM (
      SELECT mrn,
             MAX(CASE WHEN hba1c_date >= ? THEN hba1c_value ELSE NULL END) as latest_hba1c,
             MAX(CASE WHEN hba1c_date >= ? THEN hba1c_date ELSE NULL END) as latest_hba1c_date
      FROM locked_audit_records
      WHERE facility_id=? 
        AND mrn IN (
          SELECT mrn FROM locked_audit_records
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
        )
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NOT NULL AND latest_hba1c_date IS NOT NULL AND latest_hba1c <= 8.0
  \`, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC011(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;

  const den = await db.get(\`
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
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(\`
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
      AND (foot_exam_done = 1 OR cpt_all LIKE '%2028F%')
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC012(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;

  const den = await db.get(\`
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
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(\`
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
      AND (eye_exam_done = 1 OR cpt_all LIKE '%2022F%' OR cpt_all LIKE '%2024F%' OR cpt_all LIKE '%2026F%' OR cpt_all LIKE '%3072F%')
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC013(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;

  const den = await db.get(\`
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
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(\`
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
      AND (nephropathy_exam_done = 1 OR cpt_all LIKE '%3060F%' OR cpt_all LIKE '%82043%' OR cpt_all LIKE '%82570%')
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC014(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;

  const den = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 85
      AND \${filters.HTN_ICD_FILTER} \${filters.HTN_EXCL} \${filters.ABM_EXCL}
      AND \${filters.PC_PHY_FILTER}
      AND \${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${filters.HTN_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM (
      SELECT mrn,
             MAX( encounter_date || '_' || CASE WHEN bp_systolic < 130 AND bp_diastolic < 80 THEN '1' ELSE '0' END ) as best_last_reading
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
        AND bp_systolic IS NOT NULL AND bp_diastolic IS NOT NULL
        AND ABS(patient_age)>=18 AND ABS(patient_age)<=85
        AND \${filters.HTN_ICD_FILTER} \${filters.HTN_EXCL} \${filters.ABM_EXCL}
        AND \${filters.PC_PHY_FILTER}
        AND \${filters.EM_CPT_FILTER}
        AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date>=? AND encounter_date<?
                    AND \${filters.HTN_ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date)>=2)
      GROUP BY mrn
    ) sub
    WHERE best_last_reading LIKE '%_1'
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC016(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;

  const den = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 85
      AND \${filters.HTN_ICD_FILTER} \${filters.HTN_EXCL} \${filters.ABM_EXCL}
      AND \${filters.PC_PHY_FILTER}
      AND \${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${filters.HTN_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 85
      AND \${filters.HTN_ICD_FILTER} \${filters.HTN_EXCL} \${filters.ABM_EXCL}
      AND \${filters.PC_PHY_FILTER}
      AND \${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${filters.HTN_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
      AND (nephropathy_exam_done = 1 OR cpt_all LIKE '%3060F%' OR cpt_all LIKE '%82043%' OR cpt_all LIKE '%82570%')
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}
`;

const insertTarget = 'async function calc_PC021(db, facilityId, year, quarter, filters) {';
code = code.replace(insertTarget, missingKPIs + '\n' + insertTarget);

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Successfully rebuilt and restored PC009 through PC016!!!');
