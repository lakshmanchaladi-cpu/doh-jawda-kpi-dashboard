const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/kpi_data.db');
db.all("SELECT * FROM sqlite_master WHERE type='index' AND tbl_name='code_mappings'", [], (err, rows) => { 
  console.log(rows); 
  db.close(); 
});