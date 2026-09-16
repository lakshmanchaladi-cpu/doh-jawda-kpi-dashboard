const express = require('express');
const router  = express.Router();
const db      = require('../database/db');

// GET all patients
router.get('/', (req, res) => {
  const { condition, active } = req.query;
  let sql = 'SELECT * FROM patients WHERE 1=1';
  const args = [];
  if (condition) { sql += ' AND condition LIKE ?'; args.push(`%${condition}%`); }
  if (active !== undefined) { sql += ' AND active = ?'; args.push(Number(active)); }
  sql += ' ORDER BY name';
  res.json(db.prepare(sql).all(...args));
});

// GET single patient with measurements
router.get('/:id', (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Not found' });
  const measurements = db.prepare(
    'SELECT * FROM patient_measurements WHERE patient_id = ? ORDER BY measurement_date DESC'
  ).all(patient.id);
  res.json({ ...patient, measurements });
});

// POST create patient
router.post('/', (req, res) => {
  const { mrn, name, dob, gender, condition } = req.body;
  if (!mrn || !name) return res.status(400).json({ error: 'mrn and name required' });
  try {
    const r = db.prepare(
      'INSERT INTO patients (mrn, name, dob, gender, condition) VALUES (?, ?, ?, ?, ?)'
    ).run(mrn, name, dob ?? null, gender ?? null, condition ?? null);
    res.json({ success: true, id: r.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'MRN already exists' });
  }
});

// PUT update patient
router.put('/:id', (req, res) => {
  const { name, dob, gender, condition, active } = req.body;
  db.prepare(
    'UPDATE patients SET name=?, dob=?, gender=?, condition=?, active=? WHERE id=?'
  ).run(name, dob ?? null, gender ?? null, condition ?? null, active ?? 1, req.params.id);
  res.json({ success: true });
});

// POST add measurement
router.post('/:id/measurements', (req, res) => {
  const { kpi_code, measurement_date, value, notes } = req.body;
  const kpi = db.prepare('SELECT * FROM kpi_definitions WHERE code = ?').get(kpi_code);
  if (!kpi) return res.status(400).json({ error: 'Invalid KPI code' });

  let meets_target = null;
  if (value != null) {
    if (kpi.target_dir === 'gte') meets_target = value >= kpi.target ? 1 : 0;
    else meets_target = value <= kpi.target ? 1 : 0;
  }

  const r = db.prepare(
    'INSERT INTO patient_measurements (patient_id, kpi_code, measurement_date, value, meets_target, notes) VALUES (?,?,?,?,?,?)'
  ).run(req.params.id, kpi_code, measurement_date, value ?? null, meets_target, notes ?? null);

  res.json({ success: true, id: r.lastInsertRowid });
});

// GET patient counts by condition (for dashboard stats)
router.get('/stats/summary', (req, res) => {
  const stats = db.prepare(`
    SELECT condition, COUNT(*) as total, SUM(active) as active_count
    FROM patients GROUP BY condition ORDER BY total DESC
  `).all();
  res.json(stats);
});

module.exports = router;
