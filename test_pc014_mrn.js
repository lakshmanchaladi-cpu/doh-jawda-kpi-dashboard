const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
const sql = `
  SELECT mrn, encounter_date, bp_systolic, bp_diastolic, 
         (encounter_date || '_' || CASE WHEN bp_systolic < 130 AND bp_diastolic < 80 THEN '1' ELSE '0' END) as sort_key
  FROM locked_audit_records 
  WHERE facility_id=2 AND year=2026 AND quarter=2 AND bp_systolic IS NOT NULL 
    AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=2 AND year=2026 AND quarter=2 AND ABS(patient_age)>=18 AND ABS(patient_age)<=85 AND (icd10_all LIKE '%I10%' OR icd10_all LIKE '%I11%' OR icd10_all LIKE '%I12%' OR icd10_all LIKE '%I13%') AND (physician_category IN ('PC','PC_Valid','Primary Care / Family Medicine', 'General Practitioner')) AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=2 AND encounter_date>='2025-07-01' AND encounter_date<'2026-04-01' AND (icd10_all LIKE '%I10%' OR icd10_all LIKE '%I11%' OR icd10_all LIKE '%I12%' OR icd10_all LIKE '%I13%') GROUP BY mrn HAVING COUNT(DISTINCT encounter_date)>=2))
  ORDER BY mrn, encounter_date DESC
`;
db.all(sql, (err, rows) => {
  if (err) console.error(err);
  
  // Find a patient where the max date has a 0, but an earlier date has a 1
  let patients = {};
  for(let r of rows) {
    if(!patients[r.mrn]) patients[r.mrn] = [];
    patients[r.mrn].push(r);
  }
  
  let flipFlopFound = false;
  for(let mrn in patients) {
    let visits = patients[mrn];
    if(visits.length > 1) {
      let lastVisit = visits[0]; // because we ordered by DESC
      let hasEarlierControlled = visits.slice(1).some(v => v.sort_key.endsWith('_1'));
      if(lastVisit.sort_key.endsWith('_0') && hasEarlierControlled) {
        console.log(`Found a flip-flop patient! MRN: ${mrn}`);
        console.log(visits);
        flipFlopFound = true;
        break;
      }
    }
  }
  if(!flipFlopFound) console.log("No flip-flop patients exist in the denominator!");
});
