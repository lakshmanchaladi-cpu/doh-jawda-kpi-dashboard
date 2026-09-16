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

  const q = `SELECT mrn, encounter_date, icd10_all, cpt_all, physician_type 
    FROM locked_audit_records
    WHERE facility_id=2 AND year=2026 AND quarter=2
      AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
      AND ${HTN_ICD_FILTER}
      AND ${EM_CPT_FILTER}
      AND ${PC_PHY_FILTER}
    LIMIT 5`;
  
  const sample = await all(q);
  console.log(JSON.stringify(sample, null, 2));
})();
