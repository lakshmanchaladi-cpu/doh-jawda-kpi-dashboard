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
  const PC_PHY_FILTER = `(
    UPPER(TRIM(physician_type)) IN (SELECT UPPER(TRIM(code)) FROM code_mappings WHERE group_name = 'PC_Valid')
    OR physician_type IN (SELECT license_number FROM clinician_licenses WHERE category IN ('General Practitioner', 'Family Medicine', 'Internal Medicine') OR profession IN ('General Practitioner', 'Family Medicine', 'Internal Medicine'))
  )`;

  const facilityId = 2; const year = 2026; const quarter = 2;
  const lb9 = '2025-07-01'; const qStart = '2026-04-01';

  // ROW 1: Q2 ONLY
  const queryRow1 = `
    SELECT DISTINCT mrn FROM locked_audit_records
    WHERE facility_id=${facilityId} AND year=${year} AND quarter=${quarter}
      AND ABS(patient_age) >= 18 AND ABS(patient_age) <= 85
      AND ${HTN_ICD_FILTER}
      AND ${PC_PHY_FILTER}
  `;
  const row1Data = await all(queryRow1);
  const row1Count = row1Data.length;

  // ROW 2: Q2 + Lookback
  const queryRow2 = `
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
  const row2Data = await all(queryRow2);
  const row2Count = row2Data.length;

  console.log('Row 1 (Q2 Base):', row1Count);
  console.log('Row 2 (Q2 + Lookback):', row2Count);

})();
