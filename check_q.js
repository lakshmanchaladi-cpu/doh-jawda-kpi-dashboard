const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT * FROM code_mappings", (err, rows) => {
  rows.forEach(r => {
    if (r.group_name && r.group_name.includes('?')) console.log('Found ? in:', r.group_name);
    if (r.code && r.code.includes('?')) console.log('Found ? in code:', r.code);
  });
  console.log('Done checking mappings');
});
