const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT id, facility_id, file_type, status, uploaded_at FROM import_batches ORDER BY uploaded_at DESC LIMIT 5", (err, rows) => {
  console.table(rows);
});
