const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
(async () => {
  const db = await open({ filename: 'database/kpi_data.db', driver: sqlite3.Database });
  
  const sample = await db.all(`
    SELECT 
      e.mrn, 
      e.encounter_date, 
      e.icd10_primary as emr_icd, 
      s.icd10_primary as rcm_icd,
      e.patient_age,
      s.insurance_type as rcm_insurance,
      e.physician_type as emr_physician,
      s.physician_type as rcm_physician,
      COALESCE(s.physician_type, e.physician_type) as final_physician
    FROM emr_data e
    JOIN shafafiya_data s 
      ON e.facility_id = s.facility_id 
      AND e.mrn = s.mrn 
      AND e.encounter_date = s.encounter_date
    LIMIT 3
  `);
  
  console.log(JSON.stringify(sample, null, 2));
})();
