const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

const sql = `
  SELECT COUNT(*) as c 
  FROM locked_audit_records 
  WHERE facility_id=2 AND year=2026 AND quarter=2
    AND (
      cpt_all LIKE '%99201%' OR cpt_all LIKE '%99202%' OR cpt_all LIKE '%99203%' OR 
      cpt_all LIKE '%99204%' OR cpt_all LIKE '%99205%' OR cpt_all LIKE '%99211%' OR 
      cpt_all LIKE '%99212%' OR cpt_all LIKE '%99213%' OR cpt_all LIKE '%99214%' OR 
      cpt_all LIKE '%99215%'
    )
`;

db.get(sql, (err, row) => console.log('Encounters with E&M CPT codes:', row));
