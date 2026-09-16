const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const regexNum = /SELECT mrn FROM locked_audit_records\s*WHERE facility_id=\? AND year=\? AND quarter=\?\s*AND patient_age >= 18 AND patient_age <= 75\s*AND \$\{DM_ICD_FILTER\} \$\{DM_EXCL\} \$\{ABM_EXCL\}\s*AND \$\{PC_PHY_FILTER\}\s*\)/g;

const replacementNum = `SELECT mrn FROM locked_audit_records
          WHERE facility_id=? AND year=? AND quarter=?
            AND patient_age >= 18 AND patient_age <= 75
            AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
            AND \${PC_PHY_FILTER}
            AND \${EM_CPT_FILTER}
        )`;

code = code.replace(regexNum, replacementNum);

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed Numerator sub-filters to include EM_CPT_FILTER');
