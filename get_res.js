const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.get("SELECT numerator, denominator, value FROM kpi_results WHERE kpi_code='PC009' AND facility_id=2 AND year=2026 AND quarter=2", (err, row) => console.log('PC009 Result:', row));
