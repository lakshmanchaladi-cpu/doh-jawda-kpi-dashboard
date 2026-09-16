const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

const rcmCaseSql = "'Dummy'";
const facility_id = 2;
const year = 2026;
const quarter = 2;

const sql = `
        SELECT 
          e.facility_id, e.year, e.quarter, e.mrn, e.encounter_date
        FROM emr_data e
        LEFT JOIN shafafiya_data s 
          ON e.facility_id = s.facility_id 
          AND e.mrn = s.mrn 
          AND e.encounter_date = s.encounter_date
        LEFT JOIN facilities fac ON fac.id = e.facility_id
        LEFT JOIN clinician_licenses cl 
          ON cl.license_number = COALESCE(s.physician_type, e.physician_type)
          AND cl.facility_mf_no = fac.mf_no
        WHERE e.facility_id = ? AND e.year = ? AND e.quarter = ?
`;

db.all(sql, [facility_id, year, quarter], (err, rows) => {
  if (err) console.error(err);
  console.log('Selected Rows:', rows ? rows.length : 0);
});
