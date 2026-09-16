const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target009 = /async function calc_PC009\([\s\S]*?async function calc_PC011/g;

const replacement = `async function calc_PC009(db, facilityId, year, quarter) {
  const lb9  = lookbackDate(year, quarter);
  const lb12 = lookback12Date(year, quarter);
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
            AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
            AND \${PC_PHY_FILTER}
            AND \${EM_CPT_FILTER}
            AND mrn IN (
              SELECT mrn FROM locked_audit_records
              WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
                AND \${DM_ICD_FILTER}
              GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
            )
        )
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NULL OR latest_hba1c_date IS NULL OR latest_hba1c > 9.0
  \`, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC010(db, facilityId, year, quarter) {
  const lb9  = lookbackDate(year, quarter);
  const lb12 = lookback12Date(year, quarter);
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
            AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
            AND \${PC_PHY_FILTER}
            AND \${EM_CPT_FILTER}
            AND mrn IN (
              SELECT mrn FROM locked_audit_records
              WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
                AND \${DM_ICD_FILTER}
              GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
            )
        )
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NOT NULL AND latest_hba1c_date IS NOT NULL AND latest_hba1c <= 8.0
  \`, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC011`;

code = code.replace(target009, replacement);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Completely rewrote PC009 and PC010 numerator and denominator logic for perfect matching');
