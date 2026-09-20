const fs = require('fs');
let content = fs.readFileSync('routes/kpi-engine.js', 'utf8');

const newRoute = \
router.get('/proofs/export', async (req, res) => {
  const facilityId = parseInt(req.query.facility_id);
  const year = parseInt(req.query.year);
  const quarter = parseInt(req.query.quarter);
  const { kpi_code } = req.query;

  if (!facilityId || !year || !quarter || !kpi_code) {
    return res.status(400).send('facility_id, year, quarter, and kpi_code are required');
  }

  try {
    const { initDb } = require('../database/db');
    const engine = require('../engine/kpi-calculator');
    const db = await initDb();
    const fn = engine.CALCULATORS[kpi_code];
    if (!fn) return res.status(400).send('Unsupported KPI Code');
    
    if (!db._dynamicFilters) db._dynamicFilters = await engine.generateDynamicFilters(db);
    const result = await fn(db, facilityId, year, quarter, db._dynamicFilters);
    
    const num = result.num_list || [];
    const den = result.den_list || [];
    
    if (den.length === 0) {
      return res.status(404).send('No patients found in the denominator for this KPI.');
    }
    
    // Get full patient details for the denominator MRNs
    const placeholders = den.map(() => '?').join(',');
    const details = await db.all(\\\
      SELECT mrn, encounter_date, physician_type, physician_category, patient_age, insurance_category
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=? AND mrn IN (\\\)
    \\\, [facilityId, year, quarter, ...den]);
    
    let csv = 'KPI_Code,MRN,Status,Encounter_Date,Physician_Type,Physician_Category,Patient_Age,Insurance\\n';
    
    for (const d of details) {
      const isMet = num.includes(d.mrn);
      const status = isMet ? 'MET (Numerator)' : 'NOT MET (Gap)';
      
      const row = [
        kpi_code,
        d.mrn,
        status,
        d.encounter_date,
        d.physician_type,
        d.physician_category,
        d.patient_age,
        d.insurance_category
      ].map(v => v ? \\\"\\\"\\\ : '""').join(',');
      
      csv += row + '\\n';
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', \\\ttachment; filename="Auditor_Proofs_\\\_Q\\\_\\\.csv"\\\);
    res.send(csv);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
\;

content = content.replace('module.exports = router;', newRoute);
fs.writeFileSync('routes/kpi-engine.js', content);
