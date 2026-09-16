const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// Add the CPT filter at the top of the file
const cptFilter = `
// E&M CPT Codes for Diabetes / Outpatient visits per DOH Jawda
const EM_CPT_FILTER = \`(
  cpt_all LIKE '%99201%' OR cpt_all LIKE '%99202%' OR cpt_all LIKE '%99203%' OR cpt_all LIKE '%99204%' OR cpt_all LIKE '%99205%' OR 
  cpt_all LIKE '%99211%' OR cpt_all LIKE '%99212%' OR cpt_all LIKE '%99213%' OR cpt_all LIKE '%99214%' OR cpt_all LIKE '%99215%'
)\`;
`;

if (!code.includes('EM_CPT_FILTER')) {
  code = code.replace("const DM_ICD_FILTER", cptFilter + "\nconst DM_ICD_FILTER");
}

// Fix PC009 Denominator
const targetPC009Den = `    // Denominator: active diabetic patients with %2 visits in 9-month lookback
    const den = await db.get(\`
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

const repPC009Den = `    // Denominator: active diabetic patients (Any visit in quarter with specific E&M CPT codes)
    const den = await db.get(\`
      SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
        AND patient_age >= 18
        AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
        AND \${PC_PHY_FILTER}
        AND \${EM_CPT_FILTER}
    \`, [facilityId, year, quarter]);`;

code = code.replace(targetPC009Den, repPC009Den);

// Fix PC009 Numerator (remove the lookback params from numerator too!)
const targetPC009NumParams = `        AND mrn IN (
          SELECT mrn FROM locked_audit_records
          WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
            AND \${DM_ICD_FILTER}
          GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
        )
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NULL OR latest_hba1c_date IS NULL OR latest_hba1c > 9.0
  \`, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);`;

const repPC009NumParams = `        AND \${EM_CPT_FILTER}
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NULL OR latest_hba1c_date IS NULL OR latest_hba1c > 9.0
  \`, [lb12, lb12, facilityId, facilityId, year, quarter]);`;

code = code.replace(targetPC009NumParams, repPC009NumParams);

// Repeat for PC010, PC011, PC012, PC013 which all share this diabetes denominator!
const kpis = ['PC010', 'PC011', 'PC012', 'PC013'];
for (let kpi of kpis) {
  const targetDen = `    const den = await db.get(\`
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

  const repDen = `    const den = await db.get(\`
      SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
        AND patient_age >= 18
        AND \${DM_ICD_FILTER} \${DM_EXCL} \${ABM_EXCL}
        AND \${PC_PHY_FILTER}
        AND \${EM_CPT_FILTER}
    \`, [facilityId, year, quarter]);`;
    
  code = code.replace(targetDen, repDen);
  
  if (kpi === 'PC010') {
    const targetPC010NumParams = `        AND mrn IN (
          SELECT mrn FROM locked_audit_records
          WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
            AND \${DM_ICD_FILTER}
          GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
        )
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NOT NULL AND latest_hba1c_date IS NOT NULL AND latest_hba1c <= 8.0
  \`, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);`;

    const repPC010NumParams = `        AND \${EM_CPT_FILTER}
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NOT NULL AND latest_hba1c_date IS NOT NULL AND latest_hba1c <= 8.0
  \`, [lb12, lb12, facilityId, facilityId, year, quarter]);`;
    code = code.replace(targetPC010NumParams, repPC010NumParams);
  }
}

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed Denominator logic for Diabetes KPIs');
