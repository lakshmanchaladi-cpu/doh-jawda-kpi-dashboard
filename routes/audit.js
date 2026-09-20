const { initDb } = require('../database/db');
const express = require('express');
const router = express.Router();

function parsePositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseQuarter(value) {
  const quarter = parsePositiveInt(value);
  return quarter && quarter <= 4 ? quarter : null;
}

// Sanitize codes for safe use in SQL
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

function physicianDisplayCategory(value) {
  if (value === 'PC_Valid') return 'General Practitioner';
  if (value === 'PC_Paed') return 'Pediatrician';
  if (value === 'Specialist') return 'Specialist Physician';
  if (value === 'Non_PC') return 'Non-Primary Care';
  return 'Other / Unknown';
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

// ─── Insurance Resolver ───────────────────────────────────────────────────────
// Resolves RCM license codes and EMR free-text to 5 standard buckets

function resolveRcmInsurance(code) {
  if (!code || code.trim() === '') return 'Self-Pay';
  const c = code.trim().toUpperCase();
  if (c === 'D001') return 'THIQA';
  if (c === 'D002' || c === 'D003') return 'ABM Mandate';
  if (c.startsWith('D')) return 'Commercial';
  if (c.startsWith('A')) return 'Commercial';
  if (c.startsWith('C')) return 'Commercial';
  if (c.startsWith('B')) return 'Commercial';
  if (c === 'E001' || c === 'E002') return 'Government';
  if (c.startsWith('E')) return 'Government';
  // free-text fallback if facility sent text instead of code
  return resolveEmrInsurance(code);
}

function resolveEmrInsurance(val) {
  if (!val || val.trim() === '') return 'Unknown';
  const v = val.trim().toLowerCase().replace(/[\s\-_]/g, '');
  if (v.includes('thiqa')) return 'THIQA';
  if (v.includes('mandate') || v.includes('abm') || v.includes('funded')) return 'ABM Mandate';
  if (v.includes('selfpay') || v.includes('self') || v.includes('cash')
      || v.includes('private') || v.includes('haad')) return 'Self-Pay';
  if (v.includes('government') || v.includes('dof') || v.includes('presidential')) return 'Government';
  if (v.length > 0) return 'Commercial';
  return 'Unknown';
}

async function getRcmCaseSql(db) {
  const mappings = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type = 'Insurance'");
  
  let cases = mappings
    .map(m => {
      const code = sanitizeCode(m.code);
      const group = sanitizeCode(canonicalInsuranceCategory(m.group_name));
      if (!code || !group) return null;
      return `WHEN UPPER(TRIM(insurance_type)) = '${sqlLiteral(code)}' THEN '${sqlLiteral(group)}'`;
    })
    .filter(Boolean)
    .join('\n      ');
  
  return `
    CASE
      ${cases}
      WHEN insurance_type IS NULL OR TRIM(insurance_type) = '' THEN 'Self-Pay'
      ELSE 'Commercial'
    END
  `;
}

async function getPhysicianCaseSql(db, expression) {
  const mappings = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type = 'Physician_Type'");
  const cases = mappings
    .map(m => {
      const code = sanitizeCode(m.code);
      const group = sanitizeCode(physicianDisplayCategory(m.group_name));
      if (!code || !group) return null;
      return `WHEN UPPER(TRIM(COALESCE(${expression}, ''))) = '${sqlLiteral(code)}' THEN '${sqlLiteral(group)}'`;
    })
    .filter(Boolean)
    .join('\n      ');
  return `CASE ${cases}
      WHEN EXISTS (
        SELECT 1 FROM clinician_licenses cl
        WHERE UPPER(TRIM(cl.license_number)) = UPPER(TRIM(COALESCE(${expression}, '')))
      ) THEN COALESCE(
        (SELECT NULLIF(TRIM(cl.category), '') FROM clinician_licenses cl
         WHERE UPPER(TRIM(cl.license_number)) = UPPER(TRIM(COALESCE(${expression}, '')))
         LIMIT 1),
        (SELECT NULLIF(TRIM(cl.profession), '') FROM clinician_licenses cl
         WHERE UPPER(TRIM(cl.license_number)) = UPPER(TRIM(COALESCE(${expression}, '')))
         LIMIT 1),
        'Other / Unknown'
      )
      ELSE 'Other / Unknown'
    END`;
}

// ─── GET /api/audit/summary ───────────────────────────────────────────────────
router.get('/vault-summary', async (req, res) => {
  const facilityId = parseInt(req.query.facility_id);
  if (!facilityId) return res.status(400).json({ error: 'facility_id required' });
  try {
    const db = await initDb();
    const rows = await db.all(`
      SELECT
        e.year,
        e.quarter,
        COUNT(e.id)  AS emr_count,
        COUNT(s.id)  AS rcm_count,
        SUM(CASE WHEN s.mrn IS NOT NULL THEN 1 ELSE 0 END) AS match_count,
        ROUND(SUM(CASE WHEN s.mrn IS NOT NULL THEN 1.0 ELSE 0 END) / COUNT(e.id) * 100, 1) AS match_rate,
        MAX(kr.calculated_at) AS last_calculated_at,
        MAX(ql.is_locked)     AS is_reviewed
      FROM emr_data e
      LEFT JOIN shafafiya_data s
        ON e.facility_id = s.facility_id AND e.mrn = s.mrn AND e.encounter_date = s.encounter_date
      LEFT JOIN kpi_results kr
        ON e.facility_id = kr.facility_id AND e.year = kr.year AND e.quarter = kr.quarter
      LEFT JOIN quarter_locks ql
        ON e.facility_id = ql.facility_id AND e.year = ql.year AND e.quarter = ql.quarter
      WHERE e.facility_id = ?
      GROUP BY e.year, e.quarter
      ORDER BY e.year DESC, e.quarter DESC
    `, [facilityId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/exceptions', async (req, res) => {
  const facilityId = parseInt(req.query.facility_id);
  const year       = parseInt(req.query.year);
  const quarter    = parseInt(req.query.quarter);
  if (!facilityId || !year || !quarter) return res.status(400).json({ error: 'facility_id, year, quarter required' });
  try {
    const db = await initDb();
    const rows = await db.all(`
      SELECT e.mrn, e.encounter_date, e.icd10_primary, e.physician_type,
             'No Matching RCM Claim' AS reason
      FROM emr_data e
      WHERE e.facility_id=? AND e.year=? AND e.quarter=?
      AND NOT EXISTS (
        SELECT 1 FROM shafafiya_data s
        WHERE s.facility_id=e.facility_id AND s.mrn=e.mrn AND s.encounter_date=e.encounter_date
      )
      ORDER BY e.encounter_date
    `, [facilityId, year, quarter]);

    const headers = 'MRN,Encounter Date,ICD10 Primary,Physician Type,Reason\n';
    const csvBody = rows.map(r =>
      `${r.mrn},${r.encounter_date},${r.icd10_primary || ''},${r.physician_type || ''},${r.reason}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="exceptions_Q${quarter}_${year}.csv"`);
    res.send(headers + csvBody);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const db = await initDb();
    const { facility_id, year, quarter } = req.query;
    const fid = parsePositiveInt(facility_id);
    const y = year ? parsePositiveInt(year) : new Date().getFullYear();
    const q = quarter ? parseQuarter(quarter) : Math.ceil((new Date().getMonth() + 1) / 3);
    if (!fid || !y || !q) return res.status(400).json({ error: 'Valid facility_id, year, and quarter are required' });

    // EMR counts
    const emrTotal = await db.get(
      'SELECT COUNT(*) as cnt FROM emr_data WHERE facility_id=?',
      [fid]
    );
    const emrMonths = await db.get(
      'SELECT COUNT(DISTINCT year || "-" || month) as cnt FROM emr_data WHERE facility_id=?',
      [fid]
    );

    // RCM counts
    const rcmTotal = await db.get(
      'SELECT COUNT(*) as cnt FROM shafafiya_data WHERE facility_id=?',
      [fid]
    );
    const rcmMonths = await db.get(
      'SELECT COUNT(DISTINCT year || "-" || month) as cnt FROM shafafiya_data WHERE facility_id=?',
      [fid]
    );

    const rcmCaseSql = await getRcmCaseSql(db);

    const insCounts = await db.all(
      `SELECT (${rcmCaseSql}) as category, COUNT(*) as cnt 
       FROM shafafiya_data 
       WHERE facility_id=? 
       GROUP BY category`, 
      [fid]
    );
    
    let thiqaCnt = 0, abmCnt = 0, commCnt = 0, selfCnt = 0;
    insCounts.forEach(row => {
       if (row.category === 'THIQA') thiqaCnt += row.cnt;
      else if (row.category === 'ABM_Mandate') abmCnt += row.cnt;
       else if (row.category === 'Self-Pay') selfCnt += row.cnt;
       else commCnt += row.cnt;
    });

    // Matched: MRN + encounter_date exists in both
    const matched = await db.get(
      `SELECT COUNT(*) as cnt FROM emr_data e
       WHERE e.facility_id=?
       AND EXISTS (
         SELECT 1 FROM shafafiya_data s
         WHERE s.facility_id=e.facility_id AND s.mrn=e.mrn AND s.encounter_date=e.encounter_date
       )`,
      [fid]
    );

    // EMR-only (no matching RCM)
    const emrOnly = await db.get(
      `SELECT COUNT(*) as cnt FROM emr_data e
       WHERE e.facility_id=?
       AND NOT EXISTS (
         SELECT 1 FROM shafafiya_data s
         WHERE s.facility_id=e.facility_id AND s.mrn=e.mrn AND s.encounter_date=e.encounter_date
       )`,
      [fid]
    );

    // RCM-only (no matching EMR)
    const rcmOnly = await db.get(
      `SELECT COUNT(*) as cnt FROM shafafiya_data s
       WHERE s.facility_id=?
       AND NOT EXISTS (
         SELECT 1 FROM emr_data e
         WHERE e.facility_id=s.facility_id AND e.mrn=s.mrn AND e.encounter_date=s.encounter_date
       )`,
      [fid]
    );

    const emrCnt = emrTotal.cnt || 0;
    const rcmCnt = rcmTotal.cnt || 0;
    const matchedCnt = matched.cnt || 0;
    const maxCnt = Math.max(emrCnt, rcmCnt);
    const matchRate = maxCnt > 0 ? Math.round((matchedCnt / maxCnt) * 100) : 0;

    // Completeness score (0-100)
    const emrMonthsCnt = emrMonths.cnt || 0;
    const rcmMonthsCnt = rcmMonths.cnt || 0;
    const maxTotalMonths = Math.max(emrMonthsCnt, rcmMonthsCnt, 1);
    const score = Math.round(
      (emrMonthsCnt / maxTotalMonths) * 50 +
      (rcmMonthsCnt / maxTotalMonths) * 25 +
      (matchRate >= 80 ? 25 : (matchRate / 80) * 25)
    );

    res.json({
      quarter: `Q${q} ${y}`,
      emr: emrCnt,
      rcm: rcmCnt,
      matched: matchedCnt,
      emrOnly: emrOnly.cnt || 0,
      rcmOnly: rcmOnly.cnt || 0,
      thiqa: thiqaCnt,
      abm: abmCnt,
      commercial: commCnt,
      selfPay: selfCnt,
      matchRate,
      completenessScore: score,
      emrMonths: emrMonthsCnt,
      rcmMonths: rcmMonthsCnt
    });
  } catch (e) {
    console.error('Audit summary error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/audit/monthly ───────────────────────────────────────────────────
router.get('/monthly', async (req, res) => {
  res.json({ deprecated: true, message: 'This endpoint is deprecated in V2.0. Use /vault-summary instead.' });
});

// ─── GET /api/audit/reconciliation ───────────────────────────────────────────
router.get('/reconciliation', async (req, res) => {
  res.json({ deprecated: true, message: 'This endpoint is deprecated in V2.0. Use /vault-summary or /exceptions instead.' });
});

// ─── GET /api/audit/batches ───────────────────────────────────────────────────
router.get('/batches', async (req, res) => {
  try {
    const db = await initDb();
    const { facility_id } = req.query;
    const fid = parsePositiveInt(facility_id);
    if (!fid) return res.status(400).json({ error: 'Valid facility_id is required' });

    const batches = await db.all(
      `SELECT id, file_name, file_type, year, quarter, row_count, error_count, status, imported_at
       FROM import_batches
       WHERE facility_id=?
       ORDER BY imported_at DESC LIMIT 20`,
      [fid]
    );

    res.json(batches);
  } catch (e) {
    console.error('Audit batches error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/audit/download-gaps
router.get('/download-gaps', async (req, res) => {
  try {
    const { initDb } = require('../database/db');
    const db = await initDb();
    const { facility_id, year, quarter } = req.query;
     const fid = parsePositiveInt(facility_id);
     const yearNum = parsePositiveInt(year);
     const quarterNum = parseQuarter(quarter);
    
     if (!fid || !yearNum || !quarterNum) {
       return res.status(400).json({ error: 'Valid facility_id, year, and quarter are required' });
    }
    
    const rcmMissingEmr = await db.all(`
      SELECT claim_id, mrn, encounter_date, physician_type, insurance_type, icd10_all, cpt_all
      FROM shafafiya_data
      WHERE facility_id=? AND year=? AND quarter=?
      AND NOT EXISTS (
        SELECT 1 FROM emr_data e WHERE e.mrn=shafafiya_data.mrn AND e.encounter_date=shafafiya_data.encounter_date AND e.facility_id=shafafiya_data.facility_id AND e.year=? AND e.quarter=?
      )
    `, [fid, yearNum, quarterNum, yearNum, quarterNum]);
    
    const emrMissingRcm = await db.all(`
      SELECT mrn, patient_age, encounter_date, physician_category, icd10_primary
      FROM emr_data
      WHERE facility_id=? AND year=? AND quarter=?
      AND NOT EXISTS (
        SELECT 1 FROM shafafiya_data s WHERE s.mrn=emr_data.mrn AND s.encounter_date=emr_data.encounter_date AND s.facility_id=emr_data.facility_id AND s.year=? AND s.quarter=?
      )
    `, [fid, yearNum, quarterNum, yearNum, quarterNum]);
    
    let csv = 'Type,MRN,Date,Claim_ID,Physician,Missing_Reason\n';
    
    for (const r of rcmMissingEmr) {
      csv += [
        'RCM Only', r.mrn, r.encounter_date, r.claim_id, r.physician_type,
        'RCM claim exists but no EMR visit found for this Date/MRN'
      ].map(csvCell).join(',') + '\n';
    }
    for (const r of emrMissingRcm) {
      csv += [
        'EMR Only', r.mrn, r.encounter_date, '', '',
        'EMR visit exists but no RCM claim found for this Date/MRN'
      ].map(csvCell).join(',') + '\n';
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Gap_Analysis_Q${quarter}_${year}.csv"`);
    res.send(csv);
    
  } catch(e) {
    console.error(e);
    res.status(500).send('Error generating report');
  }
});

router.get('/exceptions', async (req, res) => {
  try {
    const { initDb } = require('../database/db');
    const db = await initDb();
    const facility_id = parseInt(req.query.facility_id);
    const year = parseInt(req.query.year);
    const quarter = parseInt(req.query.quarter);
    
    if (!facility_id || !year || !quarter) {
      return res.status(400).send('Valid facility_id, year, and quarter are required');
    }
    
    const emrExceptions = await db.all(`
      SELECT 'EMR' as source, mrn, encounter_date, patient_age, physician_type, icd10_primary,
      CASE 
        WHEN encounter_date IS NULL OR encounter_date = '' THEN 'Missing Encounter Date'
        WHEN patient_age IS NULL OR patient_age < 0 OR patient_age > 120 THEN 'Invalid Age (' || IFNULL(patient_age, 'NULL') || ')'
        WHEN physician_type IS NULL OR physician_type = '' THEN 'Missing Physician Type'
        WHEN icd10_primary IS NULL OR icd10_primary = '' THEN 'Missing Primary Diagnosis'
        ELSE 'Other Malformed Data'
      END as exception_reason
      FROM emr_data
      WHERE facility_id=? AND year=? AND quarter=?
      AND (
        encounter_date IS NULL OR encounter_date = '' OR
        patient_age IS NULL OR patient_age < 0 OR patient_age > 120 OR
        physician_type IS NULL OR physician_type = '' OR
        icd10_primary IS NULL OR icd10_primary = ''
      )
    `, [facility_id, year, quarter]);
    
    let csv = 'Source,MRN,Encounter_Date,Age,Physician_Type,Diagnosis,Exception_Reason\n';
    
    for (const r of emrExceptions) {
      csv += [
        r.source, r.mrn, r.encounter_date, r.patient_age, r.physician_type, r.icd10_primary, r.exception_reason
      ].map(v => v ? `"${v.toString().replace(/"/g, '""')}"` : '""').join(',') + '\n';
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Data_Exceptions_Q${quarter}_${year}.csv"`);
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error generating exception report');
  }
});

module.exports = router;
