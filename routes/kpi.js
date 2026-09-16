const express = require('express');
const router  = express.Router();
const db      = require('../database/db');

// GET all KPI definitions
router.get('/definitions', (req, res) => {
  const kpis = db.prepare('SELECT * FROM kpi_definitions ORDER BY code').all();
  res.json(kpis);
});

// GET all clinical mappings to display dynamically in Proofs
router.get('/proof-mappings', (req, res) => {
  const mappings = db.prepare("SELECT group_name, GROUP_CONCAT(code, ', ') as codes FROM code_mappings GROUP BY group_name").all();
  const mapDict = {};
  mappings.forEach(m => mapDict[m.group_name] = m.codes);
  res.json(mapDict);
});

// GET KPI data filtered by year/quarter/month
router.get('/data', (req, res) => {
  const { year, quarter, month, code } = req.query;
  let sql    = 'SELECT d.*, k.name, k.domain, k.unit, k.target, k.target_dir FROM kpi_data d JOIN kpi_definitions k ON d.kpi_code = k.code WHERE 1=1';
  const args = [];

  if (year)    { sql += ' AND d.year = ?';    args.push(Number(year)); }
  if (quarter) { sql += ' AND d.quarter = ?'; args.push(Number(quarter)); }
  if (month)   { sql += ' AND d.month = ?';   args.push(Number(month)); }
  if (code)    { sql += ' AND d.kpi_code = ?'; args.push(code); }

  sql += ' ORDER BY d.year, d.month, d.kpi_code';
  res.json(db.prepare(sql).all(...args));
});

// GET latest value for each KPI (for dashboard)
router.get('/dashboard', (req, res) => {
  const { year, quarter } = req.query;
  const yr  = year    ? Number(year)    : new Date().getFullYear();
  const qtr = quarter ? Number(quarter) : Math.ceil((new Date().getMonth() + 1) / 3);

  const sql = `
    SELECT k.code, k.name, k.domain, k.unit, k.target, k.target_dir, k.description,
           d.value, d.numerator, d.denominator, d.year, d.quarter, d.month, d.notes
    FROM kpi_definitions k
    LEFT JOIN (
      SELECT kpi_code, value, numerator, denominator, year, quarter, month, notes
      FROM kpi_data
      WHERE year = ? AND quarter = ?
      ORDER BY month DESC
    ) d ON d.kpi_code = k.code
    GROUP BY k.code
    ORDER BY k.code
  `;
  res.json(db.prepare(sql).all(yr, qtr));
});

// GET trend data for a single KPI (last 12 months)
router.get('/trend/:code', (req, res) => {
  const { code } = req.params;
  const data = db.prepare(`
    SELECT year, month, quarter, value, numerator, denominator
    FROM kpi_data
    WHERE kpi_code = ?
    ORDER BY year ASC, month ASC
    LIMIT 24
  `).all(code);
  res.json(data);
});

// POST — upsert monthly KPI data entry
router.post('/data', (req, res) => {
  const { kpi_code, year, month, numerator, denominator, notes } = req.body;
  if (!kpi_code || !year || !month) return res.status(400).json({ error: 'kpi_code, year, month required' });

  const quarter = Math.ceil(month / 3);
  let value = null;

  const kpi = db.prepare('SELECT * FROM kpi_definitions WHERE code = ?').get(kpi_code);
  if (!kpi) return res.status(404).json({ error: 'KPI not found' });

  if (numerator != null && denominator != null && denominator > 0) {
    if (kpi.unit === 'ratio') {
      value = parseFloat((numerator / (numerator + denominator)).toFixed(4));
    } else {
      value = parseFloat(((numerator / denominator) * 100).toFixed(2));
    }
  } else if (numerator != null && denominator == null) {
    value = parseFloat(Number(numerator).toFixed(2));
  }

  const upsert = db.prepare(`
    INSERT INTO kpi_data (kpi_code, year, quarter, month, numerator, denominator, value, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(kpi_code, year, month) DO UPDATE SET
      numerator   = excluded.numerator,
      denominator = excluded.denominator,
      value       = excluded.value,
      quarter     = excluded.quarter,
      notes       = excluded.notes,
      updated_at  = datetime('now')
  `);

  upsert.run(kpi_code, year, quarter, month, numerator ?? null, denominator ?? null, value, notes ?? null);

  const row = db.prepare('SELECT * FROM kpi_data WHERE kpi_code=? AND year=? AND month=?').get(kpi_code, year, month);
  res.json({ success: true, data: row });
});

// DELETE a KPI data entry
router.delete('/data/:id', (req, res) => {
  db.prepare('DELETE FROM kpi_data WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET summary stats for all KPIs across a year
router.get('/annual/:year', (req, res) => {
  const data = db.prepare(`
    SELECT k.code, k.name, k.domain, k.unit, k.target, k.target_dir,
           AVG(d.value) as avg_value,
           MIN(d.value) as min_value,
           MAX(d.value) as max_value,
           COUNT(d.id) as data_points
    FROM kpi_definitions k
    LEFT JOIN kpi_data d ON d.kpi_code = k.code AND d.year = ?
    GROUP BY k.code
    ORDER BY k.code
  `).all(Number(req.params.year));
  res.json(data);
});

module.exports = router;
