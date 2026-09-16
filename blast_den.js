const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// For PC010
const pc010DenTarget = `  const den = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
      AND \${PC_PHY_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND \${DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  \`, [facilityId, year, quarter, facilityId, lb9, qStart]);`;

const pc010DenRep = `  const den = await db.get(\`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18
      AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
      AND \${PC_PHY_FILTER}
      AND \${EM_CPT_FILTER}
  \`, [facilityId, year, quarter]);`;

code = code.replace(pc010DenTarget, pc010DenRep);

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Blasted PC010 Denominator');
