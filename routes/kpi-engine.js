const express = require('express');
const router = express.Router();
const { initDb } = require('../database/db');
const engine = require('../engine/kpi-calculator');
const { registry } = require('../engine/kpi-registry');
const { logKPICalculation, logQuarterLock } = require('../engine/audit');

function parsePositiveInt(value, fallback = null) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

// Sanitize codes for safe use in SQL (insurance codes, physician codes, etc.)
function sanitizeCode(code) {
  if (!code) return null;
  const sanitized = String(code).trim().toUpperCase();
  // Allow only valid code characters: A-Z, 0-9, ., -, _
  if (!/^[A-Z0-9.\-_]+$/.test(sanitized)) {
    console.warn(`Rejected invalid code in CASE statement: ${code}`);
    return null;
  }
  return sanitized;
}

function sqlLiteral(value) {
  return String(value).replace(/'/g, "''");
}

function canonicalInsuranceCategory(value) {
  const category = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (category === 'thiqa') return 'THIQA';
  if (category === 'abm_mandate' || category === 'abm') return 'ABM_Mandate';
  if (category === 'self_pay' || category === 'selfpay') return 'Self-Pay';
  return 'Commercial';
}

function validateFacilityQuarter(req, res, facilityId, year, quarter) {
  const facility = parsePositiveInt(facilityId);
  const yearNum = parsePositiveInt(year);
  const quarterNum = parsePositiveInt(quarter);

  if (!facility) {
    res.status(400).json({ error: 'Valid facility_id is required' });
    return null;
  }

  if (!yearNum || yearNum < 2000) {
    res.status(400).json({ error: 'Valid year is required' });
    return null;
  }

  if (!quarterNum || quarterNum < 1 || quarterNum > 4) {
    res.status(400).json({ error: 'quarter must be between 1 and 4' });
    return null;
  }

  return { facility, year: yearNum, quarter: quarterNum };
}

router.post('/calculate', async (req, res) => {
  const validated = validateFacilityQuarter(req, res, req.body.facility_id, req.body.year, req.body.quarter);
  if (!validated) return;

  const { facility, year, quarter } = validated;
  const version = typeof req.body.version === 'string' && req.body.version.trim() ? req.body.version.trim() : null;

  try {
    const db = await initDb();
    const emrCount = await db.get(
      'SELECT COUNT(*) as cnt FROM emr_data WHERE facility_id=? AND year=? AND quarter=?',
      [facility, year, quarter]
    );
    if (!emrCount || emrCount.cnt === 0) {
      return res.status(400).json({
        error: `No EMR data found for Q${quarter} ${year}. Please upload your data first via Data Manager.`
      });
    }

    // Insert job and respond immediately
    const job = await db.run(
      "INSERT INTO job_queue (type, payload, status) VALUES ('calculate_kpi', ?, 'pending')",
      [JSON.stringify({ facility_id: facility, year, quarter, version })]
    );
    const jobId = job.lastID;
    res.json({ success: true, job_id: jobId, status: 'processing' });

    // Run engine in background — does NOT block the response above
    
        setImmediate(async () => {
        try {
          await db.run("UPDATE job_queue SET status='running', updated_at=CURRENT_TIMESTAMP WHERE id=?", [jobId]);
          
          // --- BEGIN V2 AUTO-COMPILE STEP ---
          await db.run('BEGIN TRANSACTION');
          await db.run('DELETE FROM locked_audit_records WHERE facility_id=? AND year=? AND quarter=?', [facility, year, quarter]);

          const { sanitizeCode, canonicalInsuranceCategory } = require('../engine/kpi-calculator');
          function sqlLiteral(str) { return str ? str.replace(/'/g, "''") : ''; }
          
          const mappings = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type = 'Insurance'");
          const insuranceCases = mappings.map(m => {
            const code = sanitizeCode(m.code);
            const group = m.group_name ? m.group_name.trim() : 'Commercial';
            if (!code || !group) return null;
            return `WHEN UPPER(TRIM(COALESCE(s.insurance_type, ''))) = '${sqlLiteral(code)}' THEN '${sqlLiteral(group)}'`;
          }).filter(Boolean).join(' ');
          const rcmCaseSql = `CASE ${insuranceCases} WHEN UPPER(TRIM(COALESCE(s.insurance_type, ''))) = '' THEN 'Self-Pay' ELSE 'Commercial' END`;
          
          const physicianMappings = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type IN ('Physician_Type', 'Physician_Role')");
          const physCases = physicianMappings.map(m => {
            const code = sanitizeCode(m.code);
            const group = m.group_name ? m.group_name.trim() : 'Other';
            if (!code || !group) return null;
            return `WHEN UPPER(TRIM(COALESCE(s.physician_type, e.physician_type))) = '${sqlLiteral(code)}' THEN '${sqlLiteral(group)}'`;
          }).filter(Boolean).join(' ');
          const physCaseSql = `CASE ${physCases} ELSE 'Other' END`;

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
              (${physCaseSql}) as physician_category,
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
          `, [facility, year, quarter]);
          
          await db.run('COMMIT');
          // --- END V2 AUTO-COMPILE STEP ---

          const results = await engine.calculateAllKPIs(facility, year, quarter, version);
        
        // Audit log each KPI calculation
        const userId = req.user?.id || 'local';
        for (const result of results) {
          await logKPICalculation(facility, year, quarter, result.code, result, userId);
        }

        await db.run("UPDATE job_queue SET status='done', result=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
          [JSON.stringify({ kpi_count: results.length }), jobId]);
      } catch (err) {
        await db.run("UPDATE job_queue SET status='error', result=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
          [JSON.stringify({ error: err.message }), jobId]);
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/job-status', async (req, res) => {
  const jobId = parseInt(req.query.job_id);
  if (!jobId) return res.status(400).json({ error: 'job_id is required' });
  try {
    const db = await initDb();
    const job = await db.get('SELECT status, result, updated_at FROM job_queue WHERE id=?', [jobId]);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ status: job.status, result: job.result ? JSON.parse(job.result) : null, updated_at: job.updated_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/waterfall', async (req, res) => {
  const facilityId = parsePositiveInt(req.query.facility_id);
  const year = parsePositiveInt(req.query.year);
  const quarter = parsePositiveInt(req.query.quarter);
  const { kpi_code } = req.query;

  if (!facilityId || !year || !quarter) {
    return res.status(400).json({ error: 'facility_id, year, and quarter are required' });
  }

  try {
    const db = await initDb();
    if (!db._dynamicFilters) db._dynamicFilters = await engine.generateDynamicFilters(db);
    const f = db._dynamicFilters;

    const lb9 = `${year-1}-07-01`;
    const qStart = `${year}-04-01`;

    if (kpi_code === 'PC014' || kpi_code === 'PC009') {
      const ICD_FILTER = kpi_code === 'PC014' ? f.HTN_ICD_FILTER : f.DM_ICD_FILTER;
      const row1Data = await db.all(`
        SELECT DISTINCT mrn FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
          AND ${ICD_FILTER} AND ${f.EM_CPT_FILTER} AND ${f.PC_PHY_FILTER}
      `, [facilityId, year, quarter]);
      
      const row2Data = await db.all(`
        SELECT DISTINCT mrn FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
          AND ${ICD_FILTER} AND ${f.EM_CPT_FILTER} AND ${f.PC_PHY_FILTER}
          AND mrn IN (
            SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
            AND ${ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
          )
      `, [facilityId, year, quarter, facilityId, lb9, qStart]);

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
    const mappings = await db.all(`
      SELECT group_name, GROUP_CONCAT(code, ', ') as codes
      FROM code_mappings
      WHERE mapping_type IN ('Disease_Group', 'Exclusion_Group', 'ICD-10', 'Category', 'Action_Table', 'Physician_Type')
      GROUP BY group_name
    `);
    const mapDict = {};
    mappings.forEach(m => mapDict[m.group_name] = m.codes);
    res.json(mapDict);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET available KPI registry versions + active resolution for a facility/quarter
router.get('/versions', async (req, res) => {
  const facilityId = parsePositiveInt(req.query.facility_id);
  const year = parsePositiveInt(req.query.year);
  const quarter = parsePositiveInt(req.query.quarter);

  try {
    const versions = await registry.getAllVersions();

    // Resolve which version(s) would apply for the selected facility/quarter
    let active = null;
    if (facilityId && year && quarter) {
      const db = await initDb();
      const fac = await db.get('SELECT facility_type FROM facilities WHERE id = ?', [facilityId]);
      if (fac) {
        const type = fac.facility_type || 'Primary Care';
        active = await registry.getRegistry(type, year, quarter);
      }
    }

    res.json({
      versions: versions.map(v => ({
        version: v.version,
        name: v.name,
        effective_from: v.effective_from,
        effective_to: v.effective_to,
        facility_types: v.facility_types,
        kpi_count: (() => { try { return JSON.parse(v.kpi_codes).length; } catch { return 0; } })(),
        description: v.description
      })),
      active: active ? { version: active.version, name: active.name } : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/results', async (req, res) => {
  const facilityId = parsePositiveInt(req.query.facility_id);
  const year = parsePositiveInt(req.query.year);
  const quarter = parsePositiveInt(req.query.quarter);

  if (!facilityId) return res.status(400).json({ error: 'facility_id is required' });

  try {
    const db = await initDb();
    let sql = `
      SELECT r.*, d.name, d.domain, d.target, d.target_dir, d.unit, d.short_name, d.facility_type, 
             d.description, d.numerator_desc, d.denominator_desc, d.formula 
      FROM kpi_results r
      JOIN kpi_definitions d ON r.kpi_code = d.code
      WHERE r.facility_id = ?
    `;
    const params = [facilityId];

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
  const facilityId = parsePositiveInt(req.query.facility_id);
  const year = parsePositiveInt(req.query.year);
  const quarter = parsePositiveInt(req.query.quarter);

  if (!facilityId || !year || !quarter) return res.status(400).json({ error: 'facility_id, year, and quarter are required' });

  try {
    const db = await initDb();
    const results = await db.all(`
      SELECT kpi_code, year, quarter, value, target 
      FROM kpi_results r
      JOIN kpi_definitions d ON r.kpi_code = d.code
      WHERE r.facility_id = ? 
      ORDER BY year DESC, quarter DESC
    `, [facilityId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/manual', async (req, res) => {
  const { facility_id, kpi_code, year, quarter, value, numerator, denominator } = req.body;
  const facilityId = parsePositiveInt(facility_id);
  const yearNum = parsePositiveInt(year);
  const quarterNum = parsePositiveInt(quarter);

  if (!facilityId || !kpi_code || !yearNum || !quarterNum || value === undefined) {
    return res.status(400).json({ error: 'facility_id, kpi_code, year, quarter, and value are required' });
  }

  try {
    const db = await initDb();
    await db.run(`
      INSERT INTO manual_kpi_entries (facility_id, kpi_code, year, quarter, value, numerator, denominator)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(facility_id, kpi_code, year, quarter) DO UPDATE SET
        value=excluded.value, numerator=excluded.numerator, denominator=excluded.denominator
    `, [facilityId, String(kpi_code).trim(), yearNum, quarterNum, value, numerator || null, denominator || null]);
    
    await engine.calculateAllKPIs(facilityId, yearNum, quarterNum);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lock Status
router.get('/lock-status', async (req, res) => {
  const facilityId = parsePositiveInt(req.query.facility_id);
  const year = parsePositiveInt(req.query.year);
  const quarter = parsePositiveInt(req.query.quarter);

  if (!facilityId || !year || !quarter) {
    return res.status(400).json({ error: 'facility_id, year, and quarter are required' });
  }

  try {
    const db = await initDb();
    const row = await db.get(
      'SELECT is_locked, locked_at FROM quarter_locks WHERE facility_id=? AND year=? AND quarter=?',
      [facilityId, year, quarter]
    );
    res.json({ is_locked: row ? !!row.is_locked : false, locked_at: row ? row.locked_at : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Lock & Generate Master Records
router.post('/toggle-lock', async (req, res) => {
  const { facility_id, year, quarter, lock } = req.body;
  const facilityId = parsePositiveInt(facility_id);
  const yearNum = parsePositiveInt(year);
  const quarterNum = parsePositiveInt(quarter);

  if (!facilityId || !yearNum || !quarterNum || lock === undefined) {
    return res.status(400).json({ error: 'facility_id, year, quarter, and lock are required' });
  }

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
    `, [facilityId, yearNum, quarterNum, isLocked, now]);

    // 2. Clear old locked records for this quarter
    await db.run('DELETE FROM locked_audit_records WHERE facility_id=? AND year=? AND quarter=?', [facilityId, yearNum, quarterNum]);

    // 3. If locking, generate the merged records from EMR + RCM
    if (isLocked) {
      // Get the dynamic RCM_CASE_SQL from DB
      const mappings = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type = 'Insurance'");
      const insuranceCases = mappings
        .map(m => {
          const code = sanitizeCode(m.code);
          const group = sanitizeCode(canonicalInsuranceCategory(m.group_name));
          if (!code || !group) return null;
          return `WHEN UPPER(TRIM(COALESCE(s.insurance_type, ''))) = '${sqlLiteral(code)}' THEN '${sqlLiteral(group)}'`;
        })
        .filter(Boolean)
        .join(' ');
      const rcmCaseSql = `CASE ${insuranceCases} WHEN UPPER(TRIM(COALESCE(s.insurance_type, ''))) = '' THEN 'Self-Pay' ELSE 'Commercial' END`;
      
      const physicianMappings = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type IN ('Physician_Type', 'Physician_Role')");
      const physCases = physicianMappings
        .map(m => {
          const code = sanitizeCode(m.code);
          const group = sanitizeCode(m.group_name);
          if (!code || !group) return null;
          return `WHEN UPPER(TRIM(COALESCE(s.physician_type, e.physician_type))) = '${sqlLiteral(code)}' THEN '${sqlLiteral(group)}'`;
        })
        .filter(Boolean)
        .join(' ');
      const physCaseSql = `CASE ${physCases} ELSE 'Other' END`;

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
          (${physCaseSql}) as physician_category,
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
      `, [facilityId, yearNum, quarterNum]);
    }

    await db.run('COMMIT');
    
    // Audit log the lock/unlock action
    const userId = req.user?.id || 'local';
    await logQuarterLock(facilityId, yearNum, quarterNum, lock, userId);
    
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
  const facilityId = parsePositiveInt(req.query.facility_id);
  const year = parsePositiveInt(req.query.year);
  const quarter = parsePositiveInt(req.query.quarter);
  const { kpi_code } = req.query;

  if (!facilityId || !year || !quarter || !kpi_code) {
    return res.status(400).json({ error: 'facility_id, year, quarter, and kpi_code are required' });
  }

  try {
    const db = await initDb();
    const fn = engine.CALCULATORS[kpi_code];
    if (!fn) return res.status(400).json({ error: 'Unsupported KPI Code for drill-down' });
    
    if (!db._dynamicFilters) db._dynamicFilters = await engine.generateDynamicFilters(db);
      const result = await fn(db, facilityId, year, quarter, db._dynamicFilters);
    const num = result.num_list || [];
    const den = result.den_list || [];
    
    const gap = den.filter(mrn => !num.includes(mrn));
    
    res.json({
      numerator: num,
      gap: gap
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    
    const placeholders = den.map(() => '?').join(',');
    const details = await db.all(`
      SELECT mrn, encounter_date, physician_type, physician_category, patient_age, insurance_category
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=? AND mrn IN (${placeholders})
    `, [facilityId, year, quarter, ...den]);
    
    let csv = 'KPI_Code,MRN,Status,Encounter_Date,Physician_Type,Physician_Category,Patient_Age,Insurance\n';
    
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
      ].map(v => v ? `"${v.toString().replace(/"/g, '""')}"` : '""').join(',');
      
      csv += row + '\n';
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Auditor_Proofs_${kpi_code}_Q${quarter}_${year}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
