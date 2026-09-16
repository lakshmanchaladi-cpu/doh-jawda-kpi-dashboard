const express = require('express');
const router = express.Router();
const { initDb } = require('../database/db');
const engine = require('../engine/kpi-calculator');

router.post('/calculate', async (req, res) => {
  const { facility_id, year, quarter } = req.body;
  if (!facility_id || !year || !quarter) {
    return res.status(400).json({ error: 'facility_id, year, and quarter are required' });
  }

  try {
    const db = await initDb();
    const lockRow = await db.get('SELECT is_locked FROM quarter_locks WHERE facility_id=? AND year=? AND quarter=?', [facility_id, year, quarter]);
    if (!lockRow || !lockRow.is_locked) {
      return res.status(403).json({ error: 'Data Audit is not locked! You must review and Save & Lock the Data Audit for this quarter before the KPI Engine can recalculate.' });
    }

    const results = await engine.calculateAllKPIs(facility_id, parseInt(year), parseInt(quarter));
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/waterfall', async (req, res) => {
  const { facility_id, year, quarter, kpi_code } = req.query;
  try {
    const db = await initDb();
    if (!db._dynamicFilters) db._dynamicFilters = await engine.generateDynamicFilters(db);
    const f = db._dynamicFilters;

    const lb9 = `${year-1}-07-01`; // Simplify for Q2 2026 -> 2025-07-01
    const qStart = `${year}-04-01`; // Simplify for Q2

    if (kpi_code === 'PC014' || kpi_code === 'PC009') {
      const ICD_FILTER = kpi_code === 'PC014' ? f.HTN_ICD_FILTER : f.DM_ICD_FILTER;
      const row1Data = await db.all(`
        SELECT DISTINCT mrn FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
          AND ${ICD_FILTER} AND ${f.EM_CPT_FILTER} AND ${f.PC_PHY_FILTER}
      `, [facility_id, year, quarter]);
      
      const row2Data = await db.all(`
        SELECT DISTINCT mrn FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
          AND ${ICD_FILTER} AND ${f.EM_CPT_FILTER} AND ${f.PC_PHY_FILTER}
          AND mrn IN (
            SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
            AND ${ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
          )
      `, [facility_id, year, quarter, facility_id, lb9, qStart]);

      const isHTN = kpi_code === 'PC014';
      const excMap = isHTN ? 
        { "ESRD": 0, "Renal Transplant": 0, "Pregnancy": 0, "ABM Mandate": 0 } :
        { "Pregnancy": 0, "Gestational Diabetes": 0, "PCOS": 0, "ABM Mandate": 0 };

      res.json({
        step1: { label: `1. Total number of unique outpatients (=18 to =85 years of age) with Q2 ${isHTN ? 'HTN' : 'DM'} visit`, count: row1Data.length },
        step2: { label: "2. who had at least 2 outpatient visits within 09 months", count: row2Data.length },
        exclusions: excMap,
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
// GET all clinical mappings to display dynamically in Proofs
router.get('/proof-mappings', async (req, res) => {
  try {
    const db = await initDb();
    const mappings = await db.all("SELECT group_name, GROUP_CONCAT(code, ', ') as codes FROM code_mappings GROUP BY group_name");
    const mapDict = {};
    mappings.forEach(m => mapDict[m.group_name] = m.codes);
    res.json(mapDict);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/results', async (req, res) => {
  const { facility_id, year, quarter } = req.query;
  if (!facility_id) return res.status(400).json({ error: 'facility_id is required' });

  try {
    const db = await initDb();
    let sql = `
      SELECT r.*, d.name, d.domain, d.target, d.target_dir, d.unit, d.short_name, d.facility_type, 
             d.description, d.numerator_desc, d.denominator_desc, d.formula 
      FROM kpi_results r
      JOIN kpi_definitions d ON r.kpi_code = d.code
      WHERE r.facility_id = ?
    `;
    const params = [facility_id];

    if (year) { sql += ' AND r.year = ?'; params.push(year); }
    if (quarter) { sql += ' AND r.quarter = ?'; params.push(quarter); }

    sql += ' ORDER BY r.kpi_code ASC';

    const results = await db.all(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trends', async (req, res) => {
  const { facility_id, year, quarter } = req.query;
  if (!facility_id || !year || !quarter) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const db = await initDb();
    const results = await db.all(`
      SELECT kpi_code, year, quarter, value, target 
      FROM kpi_results r
      JOIN kpi_definitions d ON r.kpi_code = d.code
      WHERE r.facility_id = ? 
      ORDER BY year DESC, quarter DESC
    `, [facility_id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/manual', async (req, res) => {
  const { facility_id, kpi_code, year, quarter, value, numerator, denominator } = req.body;
  if (!facility_id || !kpi_code || !year || !quarter || value === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const db = await initDb();
    await db.run(`
      INSERT INTO manual_kpi_entries (facility_id, kpi_code, year, quarter, value, numerator, denominator)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(facility_id, kpi_code, year, quarter) DO UPDATE SET
        value=excluded.value, numerator=excluded.numerator, denominator=excluded.denominator
    `, [facility_id, kpi_code, year, quarter, value, numerator || null, denominator || null]);
    
    await engine.calculateAllKPIs(facility_id, parseInt(year), parseInt(quarter));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lock Status
router.get('/lock-status', async (req, res) => {
  const { facility_id, year, quarter } = req.query;
  try {
    const db = await initDb();
    const row = await db.get(
      'SELECT is_locked, locked_at FROM quarter_locks WHERE facility_id=? AND year=? AND quarter=?',
      [facility_id, year, quarter]
    );
    res.json({ is_locked: row ? !!row.is_locked : false, locked_at: row ? row.locked_at : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Lock & Generate Master Records
router.post('/toggle-lock', async (req, res) => {
  const { facility_id, year, quarter, lock } = req.body;
  try {
    const db = await initDb();
    const isLocked = lock ? 1 : 0;
    const now = lock ? new Date().toISOString() : null;
    
    await db.run('BEGIN TRANSACTION');

    // 1. Update Lock Status
    await db.run(`
      INSERT INTO quarter_locks (facility_id, year, quarter, is_locked, locked_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(facility_id, year, quarter) DO UPDATE SET
        is_locked=excluded.is_locked, locked_at=excluded.locked_at
    `, [facility_id, year, quarter, isLocked, now]);

    // 2. Clear old locked records for this quarter
    await db.run('DELETE FROM locked_audit_records WHERE facility_id=? AND year=? AND quarter=?', [facility_id, year, quarter]);

    // 3. If locking, generate the merged records from EMR + RCM
    if (isLocked) {
      // Get the dynamic RCM_CASE_SQL from DB
      const mappings = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type = 'Insurance'");
      const cases = mappings.map(m => `WHEN UPPER(TRIM(s.insurance_type)) = '${String(m.code).toUpperCase()}' THEN '${m.group_name}'`).join(' ');
      const rcmCaseSql = `CASE ${cases} WHEN s.insurance_type IS NULL OR TRIM(s.insurance_type) = '' THEN 'Self-Pay' ELSE 'Commercial' END`;
      
      const physicianMappings = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type = 'Physician_Role'");
      const physCases = physicianMappings.map(m => `WHEN UPPER(TRIM(COALESCE(s.physician_type, e.physician_type))) = '${String(m.code).toUpperCase()}' THEN '${m.group_name}'`).join(' ');
      const physCaseSql = `CASE ${physCases} WHEN 1=0 THEN 'dummy' ELSE 'Other' END`;

      await db.run(`
        INSERT INTO locked_audit_records (
          facility_id, year, quarter, mrn, encounter_date,
          patient_age, patient_age_months, gender, is_palliative, patient_refused,
          phq2_result, phq9_score, phq9_date, phq9_followup_date, phq9_followup_score, depression_dx_date, followup_within_30d,
          foot_exam_done, eye_exam_done, nephropathy_exam_done, lipid_profile_done, egfr_value, egfr_date, uacr_done, bmi,
          bp_systolic, bp_diastolic, bp_date, autism_screened, asthma_controller_count, asthma_reliever_count, wait_time_mins, appointment_wait_days, hba1c_value, hba1c_date,
          patient_dob, month, visit_type, physician_type, physician_category, icd10_primary, icd10_secondary, icd10_all, cpt_all,
          insurance_category, is_thiqa, is_abm_mandate
        )
        SELECT 
          e.facility_id, e.year, e.quarter, e.mrn, e.encounter_date,
          e.patient_age, e.patient_age_months, e.gender, e.is_palliative, e.patient_refused,
          e.phq2_result, e.phq9_score, e.phq9_date, e.phq9_followup_date, e.phq9_followup_score, e.depression_dx_date, e.followup_within_30d,
          e.foot_exam_done, e.eye_exam_done, e.nephropathy_exam_done, e.lipid_profile_done, e.egfr_value, e.egfr_date, e.uacr_done, e.bmi,
          e.bp_systolic, e.bp_diastolic, e.bp_date, e.autism_screened, e.asthma_controller_count, e.asthma_reliever_count, e.wait_time_mins, e.appointment_wait_days,
          COALESCE(e.hba1c_value, s.hba1c_value) as hba1c_value, e.hba1c_date,
          e.patient_dob, e.month, e.visit_type,
          COALESCE(s.physician_type, e.physician_type) as physician_type,
          COALESCE(cl.major, 'Other') as physician_category,
          COALESCE(s.icd10_primary, e.icd10_primary) as icd10_primary,
          COALESCE(s.icd10_secondary, e.icd10_secondary) as icd10_secondary,
          COALESCE(s.icd10_all, e.icd10_all) as icd10_all,
          COALESCE(s.cpt_all, e.cpt_all) as cpt_all,
          (${rcmCaseSql}) as insurance_category,
          CASE WHEN (${rcmCaseSql}) = 'THIQA' THEN 1 ELSE 0 END as is_thiqa,
          CASE WHEN (${rcmCaseSql}) = 'ABM_Mandate' THEN 1 ELSE 0 END as is_abm_mandate
        FROM emr_data e
        LEFT JOIN shafafiya_data s 
          ON e.facility_id = s.facility_id 
          AND e.mrn = s.mrn 
          AND e.encounter_date = s.encounter_date
        LEFT JOIN facilities fac ON fac.id = e.facility_id
        LEFT JOIN clinician_licenses cl 
          ON cl.license_number = COALESCE(s.physician_type, e.physician_type)
          AND cl.facility_mf_no = fac.mf_no
        WHERE e.facility_id = ? AND e.year = ? AND e.quarter = ?
      `, [facility_id, year, quarter]);
    }

    await db.run('COMMIT');
    res.json({ success: true, is_locked: lock });
  } catch (err) {
    console.error('Lock Error:', err);
    try {
      const db = await initDb();
      await db.run('ROLLBACK');
    } catch (e) {}
    res.status(500).json({ error: err.message });
  }
});

// View Claims (numerator/denominator breakdown)
router.get('/claims', async (req, res) => {
  const { facility_id, year, quarter, kpi_code } = req.query;
  try {
    const db = await initDb();
    const fn = engine.CALCULATORS[kpi_code];
    if (!fn) return res.status(400).json({ error: 'Unsupported KPI Code for drill-down' });
    
    if (!db._dynamicFilters) db._dynamicFilters = await engine.generateDynamicFilters(db);
      const result = await fn(db, facility_id, year, quarter, db._dynamicFilters);
    const num = result.num_list || [];
    const den = result.den_list || [];
    
    // Gap = Denominator minus Numerator
    const gap = den.filter(mrn => !num.includes(mrn));
    
    res.json({
      numerator: num,
      gap: gap
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
