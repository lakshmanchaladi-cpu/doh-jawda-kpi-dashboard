const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT code FROM kpi_definitions", (err, rows) => {
  console.log(rows.map(r => r.code));
});
