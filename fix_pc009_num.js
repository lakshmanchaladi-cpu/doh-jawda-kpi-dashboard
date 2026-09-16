const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const targetPC009Num = `      SELECT mrn,
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
    WHERE latest_hba1c IS NULL OR latest_hba1c_date IS NULL OR latest_hba1c > 9.0
  \`, [lb12, lb12, facilityId, year, quarter, facilityId, lb9, qStart]);`;

const replacementPC009Num = `      SELECT mrn,
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
    WHERE latest_hba1c IS NULL OR latest_hba1c_date IS NULL OR latest_hba1c > 9.0
  \`, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);`;

code = code.replace(targetPC009Num, replacementPC009Num);

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed PC009 numerator multi-quarter scan');
