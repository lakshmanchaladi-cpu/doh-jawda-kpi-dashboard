const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const { initDb } = require('../database/db');
const { registry } = require('../engine/kpi-registry');

// JDC (JAWDA Data Certification) Excel Export
// Generates official DOH-compliant workbook with:
//   1. JDC Certification cover sheet (facility info + CEO sign-off)
//   2. KPI Results sheet (all applicable KPIs)
//   3. Data Validation checklist
//   4. Submission audit trail

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toISOString().slice(0, 10);
}

// ── GET /api/jdc/status ──
// Current submission workflow status
router.get('/status', async (req, res) => {
  const { facility_id, year, quarter } = req.query;
  if (!facility_id || !year || !quarter) {
    return res.status(400).json({ error: 'facility_id, year, and quarter required' });
  }

  try {
    const db = await initDb();
    const sub = await db.get(`
      SELECT * FROM jdc_submissions WHERE facility_id=? AND year=? AND quarter=?
    `, [facility_id, year, quarter]);
    const lock = await db.get(`
      SELECT * FROM quarter_locks WHERE facility_id=? AND year=? AND quarter=?
    `, [facility_id, year, quarter]);

    res.json({
      submission: sub || null,
      quarterLocked: !!(lock && lock.is_locked),
      canPrepare: true,
      canValidate: !!(lock && lock.is_locked),
      canFinalize: !!(lock && lock.is_locked)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/jdc/prepare ──
// Record a submission draft (workbook download = preparation)
router.post('/prepare', async (req, res) => {
  const { facility_id, year, quarter, notes } = req.body || {};
  if (!facility_id || !year || !quarter) {
    return res.status(400).json({ error: 'facility_id, year, and quarter required' });
  }

  try {
    const db = await initDb();
    await db.run(`
      INSERT INTO jdc_submissions (facility_id, year, quarter, status, prepared_at, notes)
      VALUES (?, ?, ?, 'draft', datetime('now'), ?)
      ON CONFLICT(facility_id, year, quarter) DO UPDATE SET
        status='draft', prepared_at=datetime('now'),
        notes=COALESCE(excluded.notes, jdc_submissions.notes)
    `, [facility_id, year, quarter, notes || null]);

    const { logAudit, ACTION_TYPES } = require('../engine/audit');
    await logAudit({
      tableName: 'jdc_submissions',
      recordId: `${facility_id}-${year}-${quarter}`,
      action: ACTION_TYPES.SUBMISSION,
      newData: { facilityId: facility_id, year, quarter, status: 'draft' },
      description: `Prepared JDC submission for facility ${facility_id}, Q${quarter} ${year}`
    });

    res.json({ success: true, status: 'draft' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/jdc/validate ──
// Run completeness checks, mark submission validated
router.post('/validate', async (req, res) => {
  const { facility_id, year, quarter } = req.body || {};
  if (!facility_id || !year || !quarter) {
    return res.status(400).json({ error: 'facility_id, year, and quarter required' });
  }

  try {
    const db = await initDb();

    // Completeness checks
    const lock = await db.get(
      'SELECT * FROM quarter_locks WHERE facility_id=? AND year=? AND quarter=?',
      [facility_id, year, quarter]
    );
    const checks = [];
    checks.push({ label: 'Quarter locked', pass: !!(lock && lock.is_locked) });

    const results = await db.all(`
      SELECT kpi_code, numerator, denominator, value, status
      FROM kpi_results WHERE facility_id=? AND year=? AND quarter=?
    `, [facility_id, year, quarter]);
    checks.push({ label: 'KPI results exist', pass: results.length > 0, detail: `${results.length} KPIs calculated` });

    const noData = results.filter(r => !r.status || r.status === 'no-data');
    checks.push({ label: 'No KPIs missing data', pass: noData.length === 0, detail: `${noData.length} without data` });

    const imports = await db.get(`
      SELECT COUNT(*) as c FROM import_batches WHERE facility_id=? AND year=? AND quarter=?
    `, [facility_id, year, quarter]);
    checks.push({ label: 'Data imports recorded', pass: imports.c > 0, detail: `${imports.c} imports` });

    const allPass = checks.every(c => c.pass);

    await db.run(`
      INSERT INTO jdc_submissions (facility_id, year, quarter, status, validated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(facility_id, year, quarter) DO UPDATE SET
        status=excluded.status, validated_at=excluded.validated_at
    `, [facility_id, year, quarter, allPass ? 'validated' : 'draft']);

    const { logAudit, ACTION_TYPES } = require('../engine/audit');
    await logAudit({
      tableName: 'jdc_submissions',
      recordId: `${facility_id}-${year}-${quarter}`,
      action: ACTION_TYPES.SUBMISSION,
      newData: { facilityId: facility_id, year, quarter, status: allPass ? 'validated' : 'draft', checks },
      description: `Validated JDC submission for facility ${facility_id}, Q${quarter} ${year}: ${allPass ? 'ALL PASS' : 'FAILED CHECKS'}`
    });

    res.json({ success: true, validated: allPass, checks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/jdc/finalize ──
// Lock quarter (if needed), record CEO approval & sign-off, mark submitted
router.post('/finalize', async (req, res) => {
  const { facility_id, year, quarter, ceo_name, notes } = req.body || {};
  if (!facility_id || !year || !quarter) {
    return res.status(400).json({ error: 'facility_id, year, and quarter required' });
  }

  try {
    const db = await initDb();

    // Ensure quarter is locked
    const lock = await db.get(
      'SELECT * FROM quarter_locks WHERE facility_id=? AND year=? AND quarter=?',
      [facility_id, year, quarter]
    );
    if (!lock || !lock.is_locked) {
      await db.run(`
        INSERT INTO quarter_locks (facility_id, year, quarter, is_locked, locked_at, locked_by)
        VALUES (?, ?, ?, 1, datetime('now'), 'jdc-finalize')
        ON CONFLICT(facility_id, year, quarter) DO UPDATE SET
          is_locked=1, locked_at=datetime('now'), locked_by='jdc-finalize'
      `, [facility_id, year, quarter]);
    }

    await db.run(`
      INSERT INTO jdc_submissions (facility_id, year, quarter, status, submitted_at, ceo_name, ceo_signature_date, notes)
      VALUES (?, ?, ?, 'submitted', datetime('now'), ?, datetime('now'), ?)
      ON CONFLICT(facility_id, year, quarter) DO UPDATE SET
        status='submitted', submitted_at=datetime('now'),
        ceo_name=COALESCE(excluded.ceo_name, jdc_submissions.ceo_name),
        ceo_signature_date=datetime('now'),
        notes=COALESCE(excluded.notes, jdc_submissions.notes)
    `, [facility_id, year, quarter, ceo_name || null, notes || null]);

    const { logAudit, ACTION_TYPES } = require('../engine/audit');
    await logAudit({
      tableName: 'jdc_submissions',
      recordId: `${facility_id}-${year}-${quarter}`,
      action: ACTION_TYPES.SUBMISSION,
      newData: { facilityId: facility_id, year, quarter, status: 'submitted', ceo_name },
      description: `Finalized & signed JDC submission for facility ${facility_id}, Q${quarter} ${year}${ceo_name ? ` by ${ceo_name}` : ''}`
    });

    res.json({ success: true, status: 'submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/jdc/preview ──
// Return all data needed to preview the submission before exporting
router.get('/preview', async (req, res) => {
  const { facility_id, year, quarter } = req.query;
  if (!facility_id || !year || !quarter) {
    return res.status(400).json({ error: 'facility_id, year, and quarter required' });
  }

  try {
    const db = await initDb();
    const facility = await db.get('SELECT * FROM facilities WHERE id = ?', [facility_id]);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    const facilityType = facility.facility_type || 'Primary Care';
    const codes = await registry.getKPICodes(facilityType, parseInt(year), parseInt(quarter));

    const results = await db.all(`
      SELECT r.kpi_code, d.name, d.short_name, d.domain, d.type,
             d.unit, d.target, d.target_dir, d.target_note, d.facility_type as kpi_facility_type,
             r.numerator, r.denominator, r.value, r.status, r.calculated_at
      FROM kpi_results r
      JOIN kpi_definitions d ON r.kpi_code = d.code
      WHERE r.facility_id = ? AND r.year = ? AND r.quarter = ?
      ORDER BY r.kpi_code ASC
    `, [facility_id, year, quarter]);

    const lock = await db.get(
      'SELECT * FROM quarter_locks WHERE facility_id = ? AND year = ? AND quarter = ?',
      [facility_id, year, quarter]
    );

    const imports = await db.all(`
      SELECT file_type, file_name, row_count, error_count, status, imported_at
      FROM import_batches
      WHERE facility_id = ? AND year = ? AND quarter = ?
      ORDER BY imported_at DESC
    `, [facility_id, year, quarter]);

    const settings = await db.get('SELECT company_name FROM app_settings WHERE id = 1');

    res.json({
      facility,
      facilityType,
      year: parseInt(year),
      quarter: parseInt(quarter),
      company: settings?.company_name || '',
      registryVersion: codes.length > 0 ? 'V1 2026 / V9 2026' : 'None',
      totalKPIs: results.length,
      metKPIs: results.filter(r => r.status === 'met').length,
      nearKPIs: results.filter(r => r.status === 'near').length,
      notMetKPIs: results.filter(r => r.status === 'not-met').length,
      noDataKPIs: results.filter(r => !r.status || r.status === 'no-data').length,
      quarterLocked: !!(lock && lock.is_locked),
      lockedAt: lock ? fmtDate(lock.locked_at) : null,
      imports,
      importCount: imports.length,
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/jdc/export ──
// Generate and download the JDC Excel workbook
router.get('/export', async (req, res) => {
  const { facility_id, year, quarter } = req.query;
  if (!facility_id || !year || !quarter) {
    return res.status(400).json({ error: 'facility_id, year, and quarter required' });
  }

  try {
    const db = await initDb();
    const facility = await db.get('SELECT * FROM facilities WHERE id = ?', [facility_id]);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    const facilityType = facility.facility_type || 'Primary Care';
    const results = await db.all(`
      SELECT r.kpi_code, d.name, d.short_name, d.domain, d.type,
             d.unit, d.target, d.target_dir, d.target_note,
             r.numerator, r.denominator, r.value, r.status, r.calculated_at
      FROM kpi_results r
      JOIN kpi_definitions d ON r.kpi_code = d.code
      WHERE r.facility_id = ? AND r.year = ? AND r.quarter = ?
      ORDER BY r.kpi_code ASC
    `, [facility_id, year, quarter]);

    const lock = await db.get(
      'SELECT * FROM quarter_locks WHERE facility_id = ? AND year = ? AND quarter = ?',
      [facility_id, year, quarter]
    );

    const imports = await db.all(`
      SELECT file_type, file_name, row_count, error_count, status, imported_at
      FROM import_batches
      WHERE facility_id = ? AND year = ? AND quarter = ?
      ORDER BY imported_at DESC
    `, [facility_id, year, quarter]);

    const audit = await db.all(`
      SELECT action, table_name, description, user_id, timestamp
      FROM audit_log
      WHERE new_json LIKE ? OR old_json LIKE ?
      ORDER BY timestamp DESC
      LIMIT 200
    `, [`%${facility_id}-${year}-${quarter}%`, `%${facility_id}-${year}-${quarter}%`]);

    const settings = await db.get('SELECT company_name FROM app_settings WHERE id = 1');
    const companyName = settings?.company_name || '';

    // ════════════════════════════════════════════════════════════════
    // WORKBOOK BUILD
    // ════════════════════════════════════════════════════════════════
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: JDC Certification ──
    const cover = [];
    cover.push(['JAWDA DATA CERTIFICATION (JDC) SUBMISSION']);
    cover.push(['DOH Abu Dhabi - Primary Care & Medical Center Services']);
    cover.push([]);
    cover.push(['JDC Certification Report']);
    cover.push(['']);
    cover.push(['Facility Name', facility.name]);
    cover.push(['MF Number', facility.mf_no]);
    cover.push(['Facility License No.', facility.license_no || '']);
    cover.push(['Facility Type', facilityType]);
    cover.push(['Coordinator', facility.coordinator || '']);
    cover.push(['Phone', facility.phone || '']);
    cover.push(['Reporting Year', year]);
    cover.push(['Reporting Quarter', `Q${quarter}`]);
    cover.push(['Reporting Period', `Q${quarter} ${year}`]);
    cover.push(['Generated By', companyName || 'DOH JAWDA KPI System']);
    cover.push(['Generated On', fmtDate(new Date())]);
    cover.push([]);
    cover.push(['CERTIFICATION STATEMENT']);
    cover.push(['I certify that the information provided in this submission is accurate,']);
    cover.push(['complete, and derived from the facility medical records and payor data']);
    cover.push(['as required by the DOH JAWDA Data Certification guidelines.']);
    cover.push([]);
    cover.push(['STATUS']);
    cover.push(['Quarter Locked', (lock && lock.is_locked) ? 'Yes' : 'No']);
    cover.push(['Locked At', lock ? fmtDate(lock.locked_at) : '']);
    cover.push(['Total KPIs Submitted', results.length]);
    cover.push(['KPIs Met Target', results.filter(r => r.status === 'met').length]);
    cover.push(['KPIs Near Target', results.filter(r => r.status === 'near').length]);
    cover.push(['KPIs Not Met', results.filter(r => r.status === 'not-met').length]);
    cover.push(['KPIs No Data', results.filter(r => r.status === 'no-data').length]);
    cover.push([]);

    // ── Approval Panel Signature Block ──
    cover.push(['APPROVAL PANEL']);
    cover.push([]);
    cover.push(['Role/Designation', 'Name', 'Signature', 'Date']);
    cover.push(['Chief Executive Officer (CEO)', '', '', '']);
    cover.push(['Medical Director / CMO', '', '', '']);
    cover.push(['Quality & Patient Safety Officer', '', '', '']);
    cover.push(['HIM / Data Manager', '', '', '']);
    cover.push(['Designated Physician (KPI Owner)', '', '', '']);

    const coverSheet = XLSX.utils.aoa_to_sheet(cover);
    // Column widths
    coverSheet['!cols'] = [{ wch: 32 }, { wch: 50 }, { wch: 25 }, { wch: 14 }];
    // Merge certification title across columns
    coverSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }
    ];
    XLSX.utils.book_append_sheet(wb, coverSheet, 'JDC Certification');

    // ── Sheet 2: KPI Results ──
    const kpiHeader = [
      'KPI Code', 'Indicator Name', 'Domain', 'Type', 'Target',
      'Target Direction', 'Numerator', 'Denominator', 'Value (%)', 'Status', 'Calculated At'
    ];
    const kpiRows = [kpiHeader];
    results.forEach(r => {
      const statusLabel = r.status === 'met' ? 'Met Target'
        : r.status === 'near' ? 'Near Target'
        : r.status === 'not-met' ? 'Not Met'
        : 'No Data';
      kpiRows.push([
        r.kpi_code,
        r.name,
        r.domain,
        r.type || '',
        r.target != null ? r.target + (r.unit || '') : 'N/A',
        r.target_dir === 'gte' ? '>= target' : '<= target',
        r.numerator != null ? r.numerator : '',
        r.denominator != null ? r.denominator : '',
        r.value != null ? r.value : '',
        statusLabel,
        fmtDate(r.calculated_at)
      ]);
    });

    const kpiSheet = XLSX.utils.aoa_to_sheet(kpiRows);
    kpiSheet['!cols'] = [
      { wch: 10 }, { wch: 45 }, { wch: 20 }, { wch: 18 }, { wch: 12 },
      { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }
    ];
    XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPI Results');

    // ── Sheet 3: Data Validation Checklist ──
    const valHeader = ['Check Item', 'Status', 'Details', 'Date'];
    const valRows = [valHeader];
    valRows.push([
      'Quarter locked & records frozen',
      (lock && lock.is_locked) ? 'PASS' : 'FAIL',
      lock && lock.is_locked ? `Locked on ${fmtDate(lock.locked_at)}` : 'Quarter must be locked before submission',
      lock ? fmtDate(lock.locked_at) : ''
    ]);
    imports.forEach(imp => {
      valRows.push([
        `Data import (${imp.file_type || 'Unknown'})`,
        imp.error_count > 0 ? 'WARNING' : 'PASS',
        `${imp.file_name || ''} — ${imp.row_count || 0} rows${imp.error_count ? `, ${imp.error_count} errors` : ''}`,
        fmtDate(imp.imported_at)
      ]);
    });

    // Automatic KPI validation summary
    const noData = results.filter(r => !r.status || r.status === 'no-data');
    const notMet = results.filter(r => r.status === 'not-met');
    valRows.push([
      'All KPIs have data',
      noData.length === 0 ? 'PASS' : 'WARNING',
      noData.length === 0 ? 'All KPIs calculated' : `${noData.length} KPIs have no data`,
      ''
    ]);
    valRows.push([
      'KPI targets met',
      notMet.length === 0 ? 'PASS' : 'WARNING',
      notMet.length === 0 ? 'All targets met' : `${notMet.length} KPIs below target`,
      ''
    ]);

    const valSheet = XLSX.utils.aoa_to_sheet(valRows);
    valSheet['!cols'] = [{ wch: 40 }, { wch: 14 }, { wch: 50 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, valSheet, 'Validation Checklist');

    // ── Sheet 4: Audit Trail ──
    const auditHeader = ['Timestamp', 'Action', 'Table', 'Description', 'User'];
    const auditRows = [auditHeader];
    audit.forEach(a => {
      auditRows.push([fmtDate(a.timestamp), a.action, a.table_name, a.description || '', a.user_id || '']);
    });
    const auditSheet = XLSX.utils.aoa_to_sheet(auditRows);
    auditSheet['!cols'] = [{ wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 60 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, auditSheet, 'Audit Trail');

    // ── Response ──
    const safeName = facility.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `JDC_${safeName}_Q${quarter}_${year}.xlsx`;

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buf);

    // Log export to audit trail
    try {
      const { logAudit, ACTION_TYPES } = require('../engine/audit');
      await logAudit({
        tableName: 'jdc_export',
        recordId: `${facility_id}-${year}-${quarter}`,
        action: ACTION_TYPES.EXPORT,
        newData: { facilityId: facility_id, year, quarter, filename, kpiCount: results.length },
        description: `Exported JDC workbook ${filename} (${results.length} KPIs)`
      });
    } catch (auditErr) {
      console.error('Failed to log JDC export audit event:', auditErr.message);
    }
  } catch (err) {
    console.error('JDC export error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;