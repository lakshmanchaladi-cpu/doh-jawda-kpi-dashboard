const fs = require('fs');
let code = fs.readFileSync('routes/facilities.js', 'utf8');

// The second PUT route starts around line 43
// Let's replace both with a single robust PUT, and add a toggle POST
const putBlockRegex = /\/\/ Update a facility[\s\S]*module\.exports = router;/;

const newBlock = `// Update a facility
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
`;

code = code.replace(putBlockRegex, newBlock);
fs.writeFileSync('routes/facilities.js', code);
console.log('Fixed backend facilities API');
