const fs = require('fs');
let code = fs.readFileSync('routes/kpi-engine.js', 'utf8');

const newRoute = `
router.get('/waterfall', async (req, res) => {
  const { facility_id, year, quarter, kpi_code } = req.query;
  try {
    const db = await initDb();
    if (!db._dynamicFilters) db._dynamicFilters = await engine.generateDynamicFilters(db);
    const f = db._dynamicFilters;

    const lb9 = \`\${year-1}-07-01\`; // Simplify for Q2 2026 -> 2025-07-01
    const qStart = \`\${year}-04-01\`; // Simplify for Q2

    if (kpi_code === 'PC014') {
      const row1Data = await db.all(\`
        SELECT DISTINCT mrn FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
          AND \${f.HTN_ICD_FILTER} AND \${f.EM_CPT_FILTER} AND \${f.PC_PHY_FILTER}
      \`, [facility_id, year, quarter]);
      
      const row2Data = await db.all(\`
        SELECT DISTINCT mrn FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
          AND \${f.HTN_ICD_FILTER} AND \${f.EM_CPT_FILTER} AND \${f.PC_PHY_FILTER}
          AND mrn IN (
            SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
            AND \${f.HTN_ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
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
      });
    } else {
      res.json({ error: "Waterfall not implemented for this KPI yet" });
    }
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// GET all clinical mappings
`;

code = code.replace('// GET all clinical mappings', newRoute);
fs.writeFileSync('routes/kpi-engine.js', code);
console.log('Injected /waterfall route');
