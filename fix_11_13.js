const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target11 = `  const den = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=? AND ABS(patient_age)>=18 AND ABS(patient_age)<=75
      AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
      AND \${PC_PHY_FILTER}
      AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date>=? AND encounter_date<?
                  AND \${DM_ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date)>=2)
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);`;

const rep11 = `  const den = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=? AND ABS(patient_age)>=18
      AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
      AND \${PC_PHY_FILTER}
      AND \${EM_CPT_FILTER}
  \`, [facilityId, year, quarter]);`;

code = code.replace(target11, rep11);
code = code.replace(target11, rep11); // For PC012
code = code.replace(target11, rep11); // For PC013

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed PC011, PC012, PC013');
