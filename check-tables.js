const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/kpi_data.db');
db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, rows) => {
  console.log(rows.map(r => r.name).join(', '));
  db.close();
});