const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const regexOthers = /const den = await db\.get\(`\s*SELECT COUNT\(DISTINCT mrn\) as cnt, GROUP_CONCAT\(DISTINCT mrn\) as mrn_list FROM locked_audit_records\s*WHERE facility_id=\? AND year=\? AND quarter=\? AND ABS\(patient_age\)>=18 AND ABS\(patient_age\)<=75\s*AND \$\{DM_ICD_FILTER\} \$\{DM_EXCL\} \$\{ABM_EXCL\}\s*AND \$\{PC_PHY_FILTER\}\s*AND mrn IN \(SELECT mrn FROM locked_audit_records WHERE facility_id=\? AND encounter_date>=.*?GROUP BY mrn HAVING COUNT\(DISTINCT encounter_date\)>=2\)\s*`, \[facilityId, year, quarter, facilityId, lb9, qStart\]\);/g;

const repOthers = `// Denominator: active diabetic patients (Any visit in quarter with specific E&M CPT codes)
    const den = await db.get(\`
      SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
        AND ABS(patient_age)>=18
        AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
        AND \${PC_PHY_FILTER}
        AND \${EM_CPT_FILTER}
    \`, [facilityId, year, quarter]);`;

code = code.replace(regexOthers, repOthers);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed PC011, PC012, PC013 Denominators');
