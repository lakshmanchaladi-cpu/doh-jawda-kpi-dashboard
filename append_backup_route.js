const fs = require('fs');
let content = fs.readFileSync('routes/settings.js', 'utf8');

const backupRoute = `
// Phase 9: Backup & Recovery
router.get('/database/backup', (req, res) => {
  const dbPath = process.env.DB_PATH || require('path').join(__dirname, '../database/kpi_data.db');
  if (fs.existsSync(dbPath)) {
    res.download(dbPath, \`jawda_database_backup_\${new Date().toISOString().slice(0,10)}.db\`);
  } else {
    res.status(404).json({ error: 'Database file not found' });
  }
});
module.exports = router;
`;

content = content.replace('module.exports = router;', backupRoute);
fs.writeFileSync('routes/settings.js', content);
console.log('Appended backup route');
