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

  // Re-fetch 521 pool
  const q521 = `
    SELECT DISTINCT mrn FROM locked_audit_records
    WHERE facility_id=${facilityId} AND year=${year} AND quarter=${quarter}
      AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
      AND ${HTN_ICD_FILTER}
      AND ${EM_CPT_FILTER}
      AND ${PC_PHY_FILTER}
  `;
  const pool = await all(q521);
  const mrns = pool.map(r => r.mrn);

  if(mrns.length === 0) return console.log("Pool empty.");

  const pregCodes = dict['Pregnancy_Exc'] || [];
  
  // ABM mappings (if they mapped specific insurance or CPT for ABM)
  // But wait, the engine checks `is_abm_mandate = 1` which is generated on import.
  
  const query = `
    SELECT mrn, encounter_date, icd10_all, is_abm_mandate
    FROM locked_audit_records
    WHERE facility_id=${facilityId} AND year=${year} AND quarter=${quarter}
      AND mrn IN (${mrns.map(m => `'${m}'`).join(',')})
  `;
  const records = await all(query);

  let pregExcluded = new Set();
  let abmExcluded = new Set();

  for(let r of records) {
    const icd = (r.icd10_all || '').toUpperCase();
    
    // Check Pregnancy
    if(pregCodes.some(c => icd.includes(c))) {
      pregExcluded.add(r.mrn);
    }
    
    // Check ABM
    if(r.is_abm_mandate == 1 || r.is_abm_mandate === '1' || r.is_abm_mandate === true) {
      abmExcluded.add(r.mrn);
    }
  }

  console.log(`Patients excluded for Pregnancy (in Q2): ${pregExcluded.size}`);
  console.log(`Patients excluded for ABM Mandate (in Q2): ${abmExcluded.size}`);

  // Out of curiosity, are there any pregnant patients in the entire DB?
  let anyPreg = await all(`SELECT COUNT(*) as c FROM locked_audit_records WHERE ${buildLikeOr('icd10_all', pregCodes)}`);
  console.log(`Total encounters in DB with Pregnancy codes: ${anyPreg[0].c}`);

  let anyAbm = await all(`SELECT COUNT(*) as c FROM locked_audit_records WHERE is_abm_mandate=1`);
  console.log(`Total encounters in DB with ABM Mandate: ${anyAbm[0].c}`);

})();
