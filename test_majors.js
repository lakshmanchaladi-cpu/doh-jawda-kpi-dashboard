const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.all("SELECT DISTINCT major, minor, title FROM clinician_licenses WHERE title LIKE '%Family%' OR title LIKE '%General%' OR minor LIKE '%Family%' OR minor LIKE '%General%' LIMIT 10", (err, rows) => console.log('PC Titles:', rows));
