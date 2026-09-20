const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
(async () => {
  const db = await open({ filename: 'database/kpi_data.db', driver: sqlite3.Database });
  const row = await db.get("SELECT mrn, encounter_date, physician_type FROM emr_data WHERE facility_id=2 AND mrn='70291'");
  console.log(row);
})();
