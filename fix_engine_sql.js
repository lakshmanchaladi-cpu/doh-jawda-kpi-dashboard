const fs = require('fs');
let code = fs.readFileSync('routes/kpi-engine.js', 'utf8');

const targetSql = `        FROM emr_data e
        LEFT JOIN shafafiya_data s 
          ON e.facility_id = s.facility_id 
          AND e.mrn = s.mrn 
          AND e.encounter_date = s.encounter_date
        WHERE e.facility_id = ? AND e.year = ? AND e.quarter = ?`;

const replacementSql = `        FROM emr_data e
        LEFT JOIN shafafiya_data s 
          ON e.facility_id = s.facility_id 
          AND e.mrn = s.mrn 
          AND e.encounter_date = s.encounter_date
        LEFT JOIN facilities fac ON fac.id = e.facility_id
        LEFT JOIN clinician_licenses cl 
          ON cl.license_number = COALESCE(s.physician_type, e.physician_type)
          AND cl.facility_mf_no = fac.mf_no
        WHERE e.facility_id = ? AND e.year = ? AND e.quarter = ?`;

if (code.includes(targetSql)) {
  code = code.replace(targetSql, replacementSql);
  fs.writeFileSync('routes/kpi-engine.js', code);
  console.log('Fixed Save & Lock SQL Join');
} else {
  console.log('Target SQL not found in kpi-engine.js');
}
