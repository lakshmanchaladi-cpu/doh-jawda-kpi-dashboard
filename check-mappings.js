const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/kpi_data.db');
db.all("SELECT mapping_type, group_name, COUNT(*) as count FROM code_mappings GROUP BY mapping_type, group_name ORDER BY mapping_type, group_name", [], (err, rows) => { 
  console.table(rows); 
  db.close(); 
});