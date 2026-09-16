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

  // Same 521 Pool logic
  const HTN_ICD_FILTER = buildLikeOr('icd10_all', dict['HTN_Inclusion']);
  const EM_CPT_FILTER = buildLikeOr('cpt_all', dict['Valid_EM']);
  const PC_PHY_FILTER = `(
    UPPER(TRIM(physician_type)) IN (SELECT UPPER(TRIM(code)) FROM code_mappings WHERE group_name = 'PC_Valid')
    OR physician_type IN (SELECT license_number FROM clinician_licenses WHERE category IN ('General Practitioner', 'Family Medicine', 'Internal Medicine') OR profession IN ('General Practitioner', 'Family Medicine', 'Internal Medicine'))
  )`;

  const facilityId = 2; const year = 2026; const quarter = 2;

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

  if(mrns.length === 0) return console.log("0 patients.");

  const esrdCodes = dict['HTN_ESRD'] || ['N18.6'];
  const dialysisCodes = dict['Dialysis'] || [];
  const transCodes = dict['HTN_Transplant'] || ['Z94.0'];

  // Check ALL HISTORY for these MRNs (no year/quarter restriction)
  const historyQuery = `
    SELECT mrn, encounter_date, icd10_all, cpt_all
    FROM locked_audit_records
    WHERE facility_id=${facilityId}
      AND mrn IN (${mrns.map(m => `'${m}'`).join(',')})
  `;
  const allHistory = await all(historyQuery);

  let esrdFound = 0;
  let transFound = 0;
  const esrdMrns = new Set();
  const transMrns = new Set();

  for(let r of allHistory) {
    const icd = (r.icd10_all || '').toUpperCase();
    const cpt = (r.cpt_all || '').toUpperCase();

    // ESRD Check
    if(esrdCodes.some(c => icd.includes(c)) || dialysisCodes.some(c => cpt.includes(c))) {
      esrdMrns.add(r.mrn);
      esrdFound++;
    }

    // Transplant Check
    if(transCodes.some(c => icd.includes(c))) {
      transMrns.add(r.mrn);
      transFound++;
    }
  }

  console.log(`Total ESRD MRNs found in ANY timeframe: ${esrdMrns.size}`);
  console.log(`Total Transplant MRNs found in ANY timeframe: ${transMrns.size}`);
  
  // Just in case, check the ENTIRE DB for transplant codes regardless of the 521 pool
  const anyTrans = await all(`SELECT COUNT(*) as c FROM locked_audit_records WHERE ${buildLikeOr('icd10_all', transCodes)}`);
  console.log(`Total encounters in DB with Transplant codes: ${anyTrans[0].c}`);

})();
