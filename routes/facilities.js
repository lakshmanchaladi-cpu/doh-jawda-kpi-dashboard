const express = require('express');
const router = express.Router();
const { initDb } = require('../database/db');

function parseFacilityId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

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
  if (!mf_no || !name) {
    return res.status(400).json({ error: 'mf_no and name are required' });
  }

  try {
    const db = await initDb();
    const result = await db.run(`
      INSERT INTO facilities (mf_no, name, facility_type, coordinator, license_no, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [String(mf_no).trim(), String(name).trim(), facility_type || 'Medical Center', coordinator || '', license_no || '', phone || '']);
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
  const facilityId = parseFacilityId(req.params.id);
  if (!facilityId) {
    return res.status(400).json({ error: 'Valid facility id is required' });
  }

  try {
    const { name, mf_no, facility_type, coordinator, license_no, phone, active } = req.body;
    if (!mf_no || !name) {
      return res.status(400).json({ error: 'mf_no and name are required' });
    }

    const db = await initDb();
    const result = await db.run(
      'UPDATE facilities SET name=?, mf_no=?, facility_type=?, coordinator=?, license_no=?, phone=?, active=? WHERE id=?',
      [String(name).trim(), String(mf_no).trim(), facility_type || 'Medical Center', coordinator || '', license_no || null, phone || null, active === undefined ? 1 : (active ? 1 : 0), facilityId]
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
  const facilityId = parseFacilityId(req.params.id);
  if (!facilityId) {
    return res.status(400).json({ error: 'Valid facility id is required' });
  }

  try {
    const db = await initDb();
    const facility = await db.get('SELECT active FROM facilities WHERE id = ?', [facilityId]);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    
    const newStatus = facility.active ? 0 : 1;
    await db.run('UPDATE facilities SET active = ? WHERE id = ?', [newStatus, facilityId]);
    res.json({ success: true, active: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a facility
router.delete('/:id', async (req, res) => {
  const facilityId = parseFacilityId(req.params.id);
  if (!facilityId) {
    return res.status(400).json({ error: 'Valid facility id is required' });
  }

  try {
    const db = await initDb();
    await db.run('DELETE FROM facilities WHERE id = ?', [facilityId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

