const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT code, name, category, display_order FROM kpi_definitions WHERE code='PC014'", (err, rows) => {
  console.table(rows);
});
