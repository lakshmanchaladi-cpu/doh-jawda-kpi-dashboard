const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

(async () => {
  // Promisify db.all
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
  const PC_PHY_FILTER = `(
    UPPER(TRIM(physician_type)) IN (SELECT UPPER(TRIM(code)) FROM code_mappings WHERE group_name = 'PC_Valid')
    OR physician_type IN (SELECT license_number FROM clinician_licenses WHERE category IN ('General Practitioner', 'Family Medicine', 'Internal Medicine') OR profession IN ('General Practitioner', 'Family Medicine', 'Internal Medicine'))
  )`;

  const facilityId = 2; const year = 2026; const quarter = 2;
  const lb9 = '2025-07-01'; const qStart = '2026-04-01';

  // Base Population
  const baseQuery = `
    SELECT DISTINCT mrn FROM locked_audit_records
    WHERE facility_id=${facilityId} AND year=${year} AND quarter=${quarter}
      AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
      AND ${HTN_ICD_FILTER}
      AND ${PC_PHY_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records 
        WHERE facility_id=${facilityId} AND encounter_date >= '${lb9}' AND encounter_date < '${qStart}'
        AND ${HTN_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  `;
  const baseRows = await all(baseQuery);
  const baseMrns = baseRows.map(r => r.mrn);
  
  console.log('Base Population:', baseMrns.length);

  // Now, fetch all records for these MRNs in Q2 to check exclusions
  if(baseMrns.length === 0) return;

  const records = await all(`
    SELECT mrn, icd10_all, cpt_all, is_abm_mandate
    FROM locked_audit_records
    WHERE facility_id=${facilityId} AND year=${year} AND quarter=${quarter}
      AND mrn IN (${baseMrns.map(m => `'${m}'`).join(',')})
  `);

  // Group by MRN
  const patientData = {};
  for(let r of records) {
    if(!patientData[r.mrn]) patientData[r.mrn] = { is_esrd: false, is_transplant: false, is_preg: false, is_abm: false };
    
    // Check ESRD
    if(dict['HTN_ESRD']) {
      if(dict['HTN_ESRD'].some(c => (r.icd10_all || '').toUpperCase().includes(c))) patientData[r.mrn].is_esrd = true;
    }
    if(dict['Dialysis']) {
      if(dict['Dialysis'].some(c => (r.cpt_all || '').toUpperCase().includes(c))) patientData[r.mrn].is_esrd = true; // Treating dialysis as ESRD exclusion
    }

    // Check Transplant
    if(dict['HTN_Transplant']) {
      if(dict['HTN_Transplant'].some(c => (r.icd10_all || '').toUpperCase().includes(c))) patientData[r.mrn].is_transplant = true;
    }

    // Check Pregnancy
    if(dict['Pregnancy_Exc']) {
      if(dict['Pregnancy_Exc'].some(c => (r.icd10_all || '').toUpperCase().includes(c))) patientData[r.mrn].is_preg = true;
    }

    // Check ABM
    if(r.is_abm_mandate === 1 || r.is_abm_mandate === '1' || r.is_abm_mandate === true) {
      patientData[r.mrn].is_abm = true;
    }
  }

  // Calculate Waterfall
  let countBase = baseMrns.length;
  let countEsrd = 0;
  let countTransplant = 0;
  let countPregnancy = 0;
  let countAbm = 0;
  let finalCount = 0;

  for(let mrn of baseMrns) {
    const p = patientData[mrn];
    if(p.is_esrd) { countEsrd++; continue; }
    if(p.is_transplant) { countTransplant++; continue; }
    if(p.is_preg) { countPregnancy++; continue; }
    if(p.is_abm) { countAbm++; continue; }
    finalCount++;
  }

  console.log('ESRD Exclusion:', countEsrd);
  console.log('Transplant Exclusion:', countTransplant);
  console.log('Pregnancy Exclusion:', countPregnancy);
  console.log('ABM Exclusion:', countAbm);
  console.log('Final Total Patients:', finalCount);

})();
