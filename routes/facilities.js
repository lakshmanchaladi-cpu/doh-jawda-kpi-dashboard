const express = require('express');
const router = express.Router();
const { initDb } = require('../database/db');

// Get all facilities
router.get('/', async (req, res) => {
  try {
    const db = await initDb();
    const facilities = await db.all('SELECT * FROM facilities ORDER BY name ASC');
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a facility
router.post('/', async (req, res) => {
  const { mf_no, name, facility_type, coordinator, license_no, phone } = req.body;
  try {
    const db = await initDb();
    const result = await db.run(`
      INSERT INTO facilities (mf_no, name, facility_type, coordinator, license_no, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [mf_no, name, facility_type, coordinator, license_no, phone]);
    res.json({ success: true, id: result.lastID });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'A facility with this MF number already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update a facility
router.put('/:id', async (req, res) => {
  try {
    const { name, mf_no, facility_type, coordinator, license_no, phone, active } = req.body;
    const db = await initDb();
    const result = await db.run(
      'UPDATE facilities SET name=?, mf_no=?, facility_type=?, coordinator=?, license_no=?, phone=?, active=? WHERE id=?',
      [name, mf_no, facility_type, coordinator, license_no || null, phone || null, active === undefined ? 1 : (active ? 1 : 0), req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Facility not found' });
    res.json({ success: true });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'A facility with this MF number already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Toggle facility status
router.post('/:id/toggle', async (req, res) => {
  try {
    const db = await initDb();
    const facility = await db.get('SELECT active FROM facilities WHERE id = ?', [req.params.id]);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    
    const newStatus = facility.active ? 0 : 1;
    await db.run('UPDATE facilities SET active = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, active: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a facility
router.delete('/:id', async (req, res) => {
  try {
    const db = await initDb();
    await db.run('DELETE FROM facilities WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

