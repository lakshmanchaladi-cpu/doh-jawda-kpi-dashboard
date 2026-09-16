const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT group_name, GROUP_CONCAT(code) as codes FROM code_mappings WHERE group_name IN ('HTN_Transplant', 'HTN_ESRD', 'Dialysis') GROUP BY group_name", (err, rows) => {
  console.log(rows);
});
