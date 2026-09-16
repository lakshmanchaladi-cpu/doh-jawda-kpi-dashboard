const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT * FROM import_batches ORDER BY id DESC LIMIT 5", (err, rows) => {
  if(err) console.error(err);
  else console.log(JSON.stringify(rows, null, 2));
});
