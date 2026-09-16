const { initDb } = require('../database/db');
const express = require('express');
const router = express.Router();

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
  
  let cases = mappings.map(m => `WHEN UPPER(TRIM(insurance_type)) = '${String(m.code).toUpperCase()}' THEN '${m.group_name}'`).join('\n      ');
  
  return `
    CASE
      ${cases}
      WHEN insurance_type IS NULL OR TRIM(insurance_type) = '' THEN 'Self-Pay'
      ELSE 'Commercial'
    END
  `;
}

// ─── GET /api/audit/summary ───────────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const db = await initDb();
    const { facility_id, year, quarter } = req.query;
    if (!facility_id) return res.status(400).json({ error: 'facility_id required' });

    const fid = parseInt(facility_id);
    const y = year ? parseInt(year) : new Date().getFullYear();
    const q = quarter ? parseInt(quarter) : Math.ceil((new Date().getMonth() + 1) / 3);

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
  try {
    const db = await initDb();
    const { facility_id } = req.query;
    if (!facility_id) return res.status(400).json({ error: 'facility_id required' });

    const fid = parseInt(facility_id);
    const bounds = await db.get(`
      SELECT 
        MIN(year * 100 + month) as min_ym,
        MAX(year * 100 + month) as max_ym
      FROM (
        SELECT year, month FROM emr_data WHERE facility_id=?
        UNION ALL
        SELECT year, month FROM shafafiya_data WHERE facility_id=?
      )
    `, [fid, fid]);

    const months = [];
    if (bounds && bounds.min_ym && bounds.max_ym) {
      let currentYear = Math.floor(bounds.max_ym / 100);
      let currentMonth = bounds.max_ym % 100;
      const minYear = Math.floor(bounds.min_ym / 100);
      const minMonth = bounds.min_ym % 100;
      
      let offset = 0;
      while ((currentYear > minYear) || (currentYear === minYear && currentMonth >= minMonth)) {
        const d = new Date(currentYear, currentMonth - 1, 1);
        months.push({
          offset: offset++,
          label: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
          year: currentYear,
          month: currentMonth
        });
        currentMonth--;
        if (currentMonth < 1) {
          currentMonth = 12;
          currentYear--;
        }
      }
    } else {
      // Fallback if no data
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          offset: i,
          label: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
          year: d.getFullYear(),
          month: d.getMonth() + 1
        });
      }
    }

    // Bulk query EMR by month
    const emrByMonth = await db.all(
      `SELECT year, month, COUNT(*) as cnt FROM emr_data
       WHERE facility_id=?
       GROUP BY year, month`,
      [fid]
    );

    // Bulk query RCM by month with insurance breakdown
    const rcmCaseSql = await getRcmCaseSql(db);
    
    const rcmByMonth = await db.all(
      `SELECT year, month,
         COUNT(*) as total,
         SUM(CASE WHEN (${rcmCaseSql})='THIQA' THEN 1 ELSE 0 END) as thiqa,
         SUM(CASE WHEN (${rcmCaseSql})='ABM_Mandate' THEN 1 ELSE 0 END) as abm,
         SUM(CASE WHEN (${rcmCaseSql})='Self-Pay' THEN 1 ELSE 0 END) as selfpay,
         SUM(CASE WHEN (${rcmCaseSql}) NOT IN ('THIQA', 'ABM_Mandate', 'Self-Pay') THEN 1 ELSE 0 END) as commercial
       FROM shafafiya_data
       WHERE facility_id=?
       GROUP BY year, month`,
      [fid]
    );

    // Bulk query matched
    const matchedByMonth = await db.all(
      `SELECT e.year, e.month, COUNT(*) as cnt
       FROM emr_data e
       WHERE e.facility_id=? AND EXISTS (
         SELECT 1 FROM shafafiya_data s
         WHERE s.facility_id=e.facility_id AND s.mrn=e.mrn AND s.encounter_date=e.encounter_date
       )
       GROUP BY e.year, e.month`,
      [fid]
    );

    const emrMap = {};
    emrByMonth.forEach(r => { emrMap[`${r.year}-${r.month}`] = r.cnt; });

    const rcmMap = {};
    rcmByMonth.forEach(r => { rcmMap[`${r.year}-${r.month}`] = r; });

    const matchMap = {};
    matchedByMonth.forEach(r => { matchMap[`${r.year}-${r.month}`] = r.cnt; });

    const result = months.map(m => {
      const key = `${m.year}-${m.month}`;
      const emrCnt = emrMap[key] || 0;
      const rcm = rcmMap[key] || {};
      const rcmCnt = rcm.total || 0;
      const matchedCnt = matchMap[key] || 0;
      const maxCnt = Math.max(emrCnt, rcmCnt);
      const matchRate = maxCnt > 0 ? Math.round((matchedCnt / maxCnt) * 100) : null;

      return {
        offset: m.offset,
        label: m.label,
        year: m.year,
        month: m.month,
        emrVisits: emrCnt,
        rcmClaims: rcmCnt,
        matched: matchedCnt,
        thiqa: rcm.thiqa || 0,
        abm: rcm.abm || 0,
        selfPay: rcm.selfpay || 0,
        commercial: rcm.commercial || 0,
        emrStatus: emrCnt > 0 ? 'received' : 'missing',
        rcmStatus: rcmCnt > 0 ? 'received' : 'missing',
        matchRate
      };
    });

    res.json(result);
  } catch (e) {
    console.error('Audit monthly error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/audit/reconciliation ───────────────────────────────────────────
router.get('/reconciliation', async (req, res) => {
  try {
    const db = await initDb();
    const { facility_id, year, quarter } = req.query;
    if (!facility_id) return res.status(400).json({ error: 'facility_id required' });

    const fid = parseInt(facility_id);
const y = year ? parseInt(year) : new Date().getFullYear();
const q = quarter ? parseInt(quarter) : Math.ceil((new Date().getMonth() + 1) / 3);

      // EMR-only records (no RCM claim)
      const emrOnly = await db.all(
        `SELECT e.id, e.mrn, e.encounter_date, e.physician_type,
                e.icd10_primary, e.patient_age, e.gender
         FROM emr_data e
         WHERE e.facility_id=?
         AND NOT EXISTS (
           SELECT 1 FROM shafafiya_data s
           WHERE s.facility_id=e.facility_id AND s.mrn=e.mrn AND s.encounter_date=e.encounter_date
         )
         ORDER BY e.encounter_date DESC LIMIT 100`,
        [fid]
      );

      const rcmCaseSql = await getRcmCaseSql(db);

      // RCM-only records (no EMR visit)
      const rcmOnly = await db.all(
        `SELECT s.id, s.claim_id, s.mrn, s.encounter_date, s.physician_type,
                s.icd10_primary, s.insurance_type, (${rcmCaseSql}) as insurance_category
         FROM shafafiya_data s
         WHERE s.facility_id=?
         AND NOT EXISTS (
           SELECT 1 FROM emr_data e
           WHERE e.facility_id=s.facility_id AND e.mrn=s.mrn AND e.encounter_date=s.encounter_date
         )
         ORDER BY s.encounter_date DESC LIMIT 100`,
        [fid]
      );

      // Audit records (All Insurances, whole medical center)
      const auditRecords = await db.all(
        `SELECT s.claim_id, s.mrn, s.encounter_date, s.physician_type,
                s.icd10_primary, s.insurance_type,
                CASE WHEN EXISTS (
                  SELECT 1 FROM emr_data e
                  WHERE e.facility_id=s.facility_id AND e.mrn=s.mrn AND e.encounter_date=s.encounter_date
                ) THEN 'Matched' ELSE 'No EMR Record' END as emr_match
         FROM shafafiya_data s
         WHERE s.facility_id=?
         ORDER BY emr_match DESC, s.encounter_date DESC LIMIT 500`,
        [fid]
      );

      res.json({ emrOnly, rcmOnly, thiqaRecords: auditRecords });
  } catch (e) {
    console.error('Audit reconciliation error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/audit/batches ───────────────────────────────────────────────────
router.get('/batches', async (req, res) => {
  try {
    const db = await initDb();
    const { facility_id } = req.query;
    if (!facility_id) return res.status(400).json({ error: 'facility_id required' });

    const batches = await db.all(
      `SELECT id, file_name, file_type, year, quarter, row_count, error_count, status, imported_at
       FROM import_batches
       WHERE facility_id=?
       ORDER BY imported_at DESC LIMIT 20`,
      [parseInt(facility_id)]
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
    
    if (!facility_id || !year || !quarter) {
       return res.status(400).json({ error: 'facility_id, year, and quarter are required' });
    }
    
    const rcmMissingEmr = await db.all(`
      SELECT claim_id, mrn, encounter_date, physician_type, insurance_type, icd10_all, cpt_all
      FROM shafafiya_data
      WHERE facility_id=?
      AND NOT EXISTS (
        SELECT 1 FROM emr_data e WHERE e.mrn=shafafiya_data.mrn AND e.encounter_date=shafafiya_data.encounter_date AND e.facility_id=shafafiya_data.facility_id
      )
    `, [parseInt(facility_id), parseInt(year), parseInt(quarter)]);
    
    const emrMissingRcm = await db.all(`
      SELECT mrn, patient_age, encounter_date, physician_category, icd10_primary
      FROM emr_data
      WHERE facility_id=?
      AND NOT EXISTS (
        SELECT 1 FROM shafafiya_data s WHERE s.mrn=emr_data.mrn AND s.encounter_date=emr_data.encounter_date AND s.facility_id=emr_data.facility_id
      )
    `, [parseInt(facility_id), parseInt(year), parseInt(quarter)]);
    
    let csv = 'Type,MRN,Date,Claim_ID,Physician,Missing_Reason\n';
    
    for (const r of rcmMissingEmr) {
      csv += `"RCM Only","${r.mrn}","${r.encounter_date}","${r.claim_id || ''}","${r.physician_type || ''}","RCM claim exists but no EMR visit found for this Date/MRN"\n`;
    }
    for (const r of emrMissingRcm) {
      csv += `"EMR Only","${r.mrn}","${r.encounter_date}","","","EMR visit exists but no RCM claim found for this Date/MRN"\n`;
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Gap_Analysis_Q${quarter}_${year}.csv"`);
    res.send(csv);
    
  } catch(e) {
    console.error(e);
    res.status(500).send('Error generating report');
  }
});

module.exports = router;
