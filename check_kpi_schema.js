const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT sql FROM sqlite_master WHERE name='kpi_results'", (err, rows) => {
  console.log(rows[0].sql);
});
