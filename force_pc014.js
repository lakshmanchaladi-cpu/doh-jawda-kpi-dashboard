const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const regex = /const num = await db\.get\(`\s*SELECT COUNT\(DISTINCT mrn\) as cnt, GROUP_CONCAT\(DISTINCT mrn\) as mrn_list FROM locked_audit_records\s*WHERE facility_id=\? AND year=\? AND quarter=\? AND ABS\(patient_age\)>=18 AND ABS\(patient_age\)<=85\s*AND \$\{HTN_ICD_FILTER\} \$\{HTN_EXCL\} \$\{ABM_EXCL\}\s*AND \$\{PC_PHY_FILTER\}\s*AND bp_systolic < 130 AND bp_diastolic < 80\s*AND bp_systolic IS NOT NULL AND bp_diastolic IS NOT NULL\s*`, \[facilityId, year, quarter\]\);/g;

const rep = `// Numerator: Most recent BP in the quarter < 130/80. If ties on the same day, prioritize the controlled reading.
    const num = await db.get(\`
      SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM (
        SELECT mrn,
               MAX( encounter_date || '_' || CASE WHEN bp_systolic < 130 AND bp_diastolic < 80 THEN '1' ELSE '0' END ) as best_last_reading
        FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND bp_systolic IS NOT NULL AND bp_diastolic IS NOT NULL
          AND ABS(patient_age)>=18 AND ABS(patient_age)<=85
          AND \${HTN_ICD_FILTER} \${HTN_EXCL} \${ABM_EXCL}
          AND \${PC_PHY_FILTER}
          AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date>=? AND encounter_date<?
                      AND \${HTN_ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date)>=2)
        GROUP BY mrn
      ) sub
      WHERE best_last_reading LIKE '%_1'
    \`, [facilityId, year, quarter, facilityId, lb9, qStart]);`;

code = code.replace(regex, rep);

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Forced PC014 Numerator update with regex');
