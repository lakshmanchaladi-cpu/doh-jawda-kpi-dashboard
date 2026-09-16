const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT DISTINCT major, category FROM clinician_licenses WHERE major LIKE '%General%' OR category LIKE '%Family%' LIMIT 10", (err, rows) => console.log('Matches:', rows));
