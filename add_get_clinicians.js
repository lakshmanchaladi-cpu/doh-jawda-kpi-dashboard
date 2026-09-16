const fs = require('fs');
let code = fs.readFileSync('routes/settings.js', 'utf8');

const newRoute = `
router.get('/clinicians', async (req, res) => {
  try {
    const db = await initDb();
    const total = await db.get('SELECT COUNT(*) as cnt FROM clinician_licenses');
    const rows = await db.all('SELECT * FROM clinician_licenses LIMIT 100');
    res.json({ total: total.cnt, rows: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

code = code.replace("module.exports = router;", newRoute + "\nmodule.exports = router;");
fs.writeFileSync('routes/settings.js', code);
console.log('Added /clinicians route');
