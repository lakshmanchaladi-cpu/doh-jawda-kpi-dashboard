const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

(async () => {
  const all = (query, params = []) => new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
  });

  const mapRows = await all("SELECT group_name, code FROM code_mappings");
  const dict = {};
  for (let r of mapRows) {
    if(!dict[r.group_name]) dict[r.group_name] = [];
    dict[r.group_name].push(r.code.toUpperCase().trim());
  }

  function buildLikeOr(col, codes) {
    if (!codes || codes.length === 0) return '(1=0)';
    return '(' + codes.map(c => `${col} LIKE '%${c}%'`).join(' OR ') + ')';
  }

  const HTN_ICD_FILTER = buildLikeOr('icd10_all', dict['HTN_Inclusion']);
  const EM_CPT_FILTER = buildLikeOr('cpt_all', dict['Valid_EM']);
  const PC_PHY_FILTER = `(
    UPPER(TRIM(physician_type)) IN (SELECT UPPER(TRIM(code)) FROM code_mappings WHERE group_name = 'PC_Valid')
    OR physician_type IN (SELECT license_number FROM clinician_licenses WHERE category IN ('General Practitioner', 'Family Medicine', 'Internal Medicine') OR profession IN ('General Practitioner', 'Family Medicine', 'Internal Medicine'))
  )`;

  const facilityId = 2; const year = 2026; const quarter = 2;

  // The 521 Pool
  const q521 = `
    SELECT DISTINCT mrn FROM locked_audit_records
    WHERE facility_id=${facilityId} AND year=${year} AND quarter=${quarter}
      AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
      AND ${HTN_ICD_FILTER}
      AND ${EM_CPT_FILTER}
      AND ${PC_PHY_FILTER}
  `;
  
  const pool521 = await all(q521);
  const mrns = pool521.map(r => r.mrn);

  if (mrns.length === 0) return console.log("No patients found in 521 pool.");

  // Check ESRD in Q2 (icd10 N18.6 or mapped ESRD codes, or Dialysis)
  const esrdCodes = dict['HTN_ESRD'] || ['N18.6'];
  const dialysisCodes = dict['Dialysis'] || [];

  const esrdQuery = `
    SELECT mrn, encounter_date, icd10_all, cpt_all
    FROM locked_audit_records
    WHERE facility_id=${facilityId} AND year=${year} AND quarter=${quarter}
      AND mrn IN (${mrns.map(m => `'${m}'`).join(',')})
      AND (${buildLikeOr('icd10_all', esrdCodes)} OR ${buildLikeOr('cpt_all', dialysisCodes)})
  `;

  const esrdPatients = await all(esrdQuery);
  console.log(`Found ${esrdPatients.length} ESRD encounters among the 521 patients in Q2.`);
  if (esrdPatients.length > 0) {
    console.log(JSON.stringify(esrdPatients, null, 2));
  } else {
    // Check if ANY patient in the entire dataset (across all quarters/facilities) has N18.6
    const anyEsrd = await all(`SELECT mrn, encounter_date, icd10_all FROM locked_audit_records WHERE icd10_all LIKE '%N18.6%'`);
    console.log(`\nPatients in ENTIRE database with N18.6: ${anyEsrd.length}`);
  }
})();
