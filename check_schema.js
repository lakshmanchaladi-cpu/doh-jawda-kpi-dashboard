const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

db.all("PRAGMA table_info(emr_data);", (err, rows) => {
  console.log("EMR:", rows.map(r => r.name).join(', '));
});
db.all("PRAGMA table_info(shafafiya_data);", (err, rows) => {
  console.log("RCM:", rows.map(r => r.name).join(', '));
});
