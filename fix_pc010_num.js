const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const targetPC010Num = `      SELECT mrn,
             MAX(CASE WHEN hba1c_date >= ? THEN hba1c_value ELSE NULL END) as latest_hba1c,
             MAX(CASE WHEN hba1c_date >= ? THEN hba1c_date ELSE NULL END) as latest_hba1c_date
      FROM locked_audit_records
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
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NOT NULL AND latest_hba1c_date IS NOT NULL AND latest_hba1c <= 8.0
  \`, [lb12, lb12, facilityId, year, quarter, facilityId, lb9, qStart]);`;

const replacementPC010Num = `      SELECT mrn,
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
        )
        AND mrn IN (
          SELECT mrn FROM locked_audit_records
          WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
            AND \${DM_ICD_FILTER}
          GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
        )
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NOT NULL AND latest_hba1c_date IS NOT NULL AND latest_hba1c <= 8.0
  \`, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);`;

code = code.replace(targetPC010Num, replacementPC010Num);

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed PC010 numerator multi-quarter scan');
