const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT code FROM code_mappings WHERE group_name='PC_Valid'", (err, rows) => {
  console.log('PC_Valid Codes:', rows);
});
