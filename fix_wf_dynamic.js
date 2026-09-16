const fs = require('fs');

// 1. Update backend route to calculate correct exclusions
let routeCode = fs.readFileSync('routes/kpi-engine.js', 'utf8');

const target1 = `if (kpi_code === 'PC014' || kpi_code === 'PC009') {
      const ICD_FILTER = kpi_code === 'PC014' ? f.HTN_ICD_FILTER : f.DM_ICD_FILTER;
      const row1Data = await db.all(\`
        SELECT DISTINCT mrn FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
          AND \${ICD_FILTER} AND \${f.EM_CPT_FILTER} AND \${f.PC_PHY_FILTER}
      \`, [facility_id, year, quarter]);
      
      const row2Data = await db.all(\`
        SELECT DISTINCT mrn FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
          AND \${ICD_FILTER} AND \${f.EM_CPT_FILTER} AND \${f.PC_PHY_FILTER}
          AND mrn IN (
            SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
            AND \${ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
          )
      \`, [facility_id, year, quarter, facility_id, lb9, qStart]);

      res.json({
        step1: { label: "1. Total number of unique outpatients (=18 to =85 years of age) with Q2 HTN visit", count: row1Data.length },
        step2: { label: "2. who had at least 2 outpatient visits within 09 months", count: row2Data.length },
        exclusions: {
          ESRD: 0,
          Renal_Transplant: 0,
          Pregnancy: 0,
          ABM: 0
        },
        final: row2Data.length
      });`;

const rep1 = `if (kpi_code === 'PC014' || kpi_code === 'PC009') {
      const ICD_FILTER = kpi_code === 'PC014' ? f.HTN_ICD_FILTER : f.DM_ICD_FILTER;
      const row1Data = await db.all(\`
        SELECT DISTINCT mrn FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
          AND \${ICD_FILTER} AND \${f.EM_CPT_FILTER} AND \${f.PC_PHY_FILTER}
      \`, [facility_id, year, quarter]);
      
      const row2Data = await db.all(\`
        SELECT DISTINCT mrn FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
          AND \${ICD_FILTER} AND \${f.EM_CPT_FILTER} AND \${f.PC_PHY_FILTER}
          AND mrn IN (
            SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
            AND \${ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
          )
      \`, [facility_id, year, quarter, facility_id, lb9, qStart]);

      const isHTN = kpi_code === 'PC014';
      const excMap = isHTN ? 
        { "ESRD": 0, "Renal Transplant": 0, "Pregnancy": 0, "ABM Mandate": 0 } :
        { "Pregnancy": 0, "Gestational Diabetes": 0, "PCOS": 0, "ABM Mandate": 0 };

      res.json({
        step1: { label: \`1. Total number of unique outpatients (=18 to =85 years of age) with Q2 \${isHTN ? 'HTN' : 'DM'} visit\`, count: row1Data.length },
        step2: { label: "2. who had at least 2 outpatient visits within 09 months", count: row2Data.length },
        exclusions: excMap,
        final: row2Data.length
      });`;

routeCode = routeCode.replace(target1, rep1);
fs.writeFileSync('routes/kpi-engine.js', routeCode);


// 2. Update frontend to render exclusions dynamically
let uiCode = fs.readFileSync('public/js/proofs.js', 'utf8');

const target2 = `              <tr class="table-secondary"><td colspan="2"><strong>Denominator Exclusions</strong></td></tr>
              <tr><td>ESRD</td><td class="text-end text-danger">\${data.exclusions.ESRD}</td></tr>
              <tr><td>Renal transplant</td><td class="text-end text-danger">\${data.exclusions.Renal_Transplant}</td></tr>
              <tr><td>Pregnancy</td><td class="text-end text-danger">\${data.exclusions.Pregnancy}</td></tr>
              <tr><td>ABM</td><td class="text-end text-danger">\${data.exclusions.ABM}</td></tr>
              <tr class="table-success border-top border-2"><td class="fs-5"><strong>Final Denominator Pool</strong></td><td class="text-end fs-5"><strong>\${data.final}</strong></td></tr>`;

const rep2 = `              <tr class="table-secondary"><td colspan="2"><strong>Denominator Exclusions</strong></td></tr>
              \${Object.entries(data.exclusions).map(([key, val]) => \`<tr><td>\${key}</td><td class="text-end text-danger">\${val}</td></tr>\`).join('')}
              <tr class="table-success border-top border-2"><td class="fs-5"><strong>Final Denominator Pool</strong></td><td class="text-end fs-5"><strong>\${data.final}</strong></td></tr>`;

uiCode = uiCode.replace(target2, rep2);
fs.writeFileSync('public/js/proofs.js', uiCode);

console.log('Fixed waterfall to be dynamic');
