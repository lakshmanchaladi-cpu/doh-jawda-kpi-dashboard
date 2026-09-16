const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const kpis = ['PC009', 'PC010', 'PC011', 'PC012', 'PC013'];

for (let kpi of kpis) {
  const regex = new RegExp(`const den = await db\\.get\\(\\\`\\s*SELECT COUNT\\(DISTINCT mrn\\) as cnt, GROUP_CONCAT\\(DISTINCT mrn\\) as mrn_list FROM locked_audit_records\\s*WHERE facility_id=\\? AND year=\\? AND quarter=\\?\\s*AND (?:patient_age >= 18|ABS\\(patient_age\\)>=18)\\s*AND \\\$\\{DM_ICD_FILTER\\} \\\$\\{DM_EXCL\\} \\\$\\{ABM_EXCL\\}\\s*AND \\\$\\{PC_PHY_FILTER\\}\\s*AND \\\$\\{EM_CPT_FILTER\\}\\s*\\\`, \\[facilityId, year, quarter\\]\\);`, 'g');

  const replacement = `const den = await db.get(\`
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
    \`, [facilityId, year, quarter, facilityId, lb9, qStart]);`;

  code = code.replace(regex, replacement);
}

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Restored the 2-visit 9-month lookback to the denominators!');
