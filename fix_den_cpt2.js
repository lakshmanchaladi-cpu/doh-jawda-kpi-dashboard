const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const regexPC009Den = /\/\/ Denominator: active diabetic patients[\s\S]*?const den = await db\.get\(`\s*SELECT COUNT\(DISTINCT mrn\) as cnt, GROUP_CONCAT\(DISTINCT mrn\) as mrn_list FROM locked_audit_records\s*WHERE facility_id=\? AND year=\? AND quarter=\?\s*AND patient_age >= 18 AND patient_age <= 75\s*AND \$\{DM_ICD_FILTER\} \$\{DM_EXCL\} \$\{ABM_EXCL\}\s*AND \$\{PC_PHY_FILTER\}\s*AND mrn IN \([\s\S]*?GROUP BY mrn HAVING COUNT\(DISTINCT encounter_date\) >= 2\s*\)\s*`, \[facilityId, year, quarter, facilityId, lb9, qStart\]\);/g;

const repPC009Den = `// Denominator: active diabetic patients (Any visit in quarter with specific E&M CPT codes)
    const den = await db.get(\`
      SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
        AND patient_age >= 18
        AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
        AND \${PC_PHY_FILTER}
        AND \${EM_CPT_FILTER}
    \`, [facilityId, year, quarter]);`;

code = code.replace(regexPC009Den, repPC009Den);

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed Denominator logic with Regex');
