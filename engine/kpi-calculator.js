const { initDb } = require('../database/db');
const { KPI_DEFINITIONS } = require('./kpi-definitions');

// ─── Physician type filter — covers all facility free-text variants ────────────

// Filters are now generated dynamically in calculateAllKPIs



async function generateDynamicFilters(db) {
  const mapRows = await db.all("SELECT group_name, code FROM code_mappings");
  const dict = {};
  for (let r of mapRows) {
    if(!dict[r.group_name]) dict[r.group_name] = [];
    dict[r.group_name].push(r.code.toUpperCase().trim());
  }

  function buildLikeOr(col, codes) {
    if (!codes || codes.length === 0) return '(1=0)';
    const conds = codes.map(c => `${col} LIKE '%${c}%'`);
    return '(' + conds.join(' OR ') + ')';
  }
  function buildLikeAndNot(col, codes) {
    if (!codes || codes.length === 0) return '';
    const conds = codes.map(c => `${col} NOT LIKE '%${c}%'`);
    return ' AND (' + conds.join(' AND ') + ')';
  }

  const filters = {};

  // DM Inclusions
  filters.DM_ICD_FILTER = buildLikeOr('icd10_all', dict['DM_Inclusion']);
  // DM Exclusions (Gestational, PCOS, Pregnancy)
  let dmExc = [];
  if(dict['DM_Gestational']) dmExc.push(...dict['DM_Gestational']);
  if(dict['DM_PCOS']) dmExc.push(...dict['DM_PCOS']);
  if(dict['DM_Steroid']) dmExc.push(...dict['DM_Steroid']);
  if(dict['Pregnancy_Exc']) dmExc.push(...dict['Pregnancy_Exc']);
  filters.DM_EXCL = buildLikeAndNot('icd10_all', dmExc);

  // HTN Inclusions
  filters.HTN_ICD_FILTER = buildLikeOr('icd10_all', dict['HTN_Inclusion']);
  // HTN Exclusions (ESRD, Transplant, Pregnancy)
  let htnExc = [];
  if(dict['HTN_ESRD']) htnExc.push(...dict['HTN_ESRD']);
  if(dict['HTN_Transplant']) htnExc.push(...dict['HTN_Transplant']);
  if(dict['Pregnancy_Exc']) htnExc.push(...dict['Pregnancy_Exc']);
  filters.HTN_EXCL = buildLikeAndNot('icd10_all', htnExc);
  if(dict['Dialysis']) filters.HTN_EXCL += buildLikeAndNot('cpt_all', dict['Dialysis']);

  // ABM Exclusions
  filters.ABM_EXCL = ` AND (is_abm_mandate = 0 OR is_abm_mandate IS NULL) `;
  filters.DEP_EXCL_FILTER = buildLikeOr('icd10_all', dict['Depression_Exc']);
  filters.BIPOLAR_EXCL_FILTER = buildLikeOr('icd10_all', dict['Bipolar_Exc']);

  // EM CPT Filter
  filters.EM_CPT_FILTER = buildLikeOr('cpt_all', dict['Valid_EM']);

  // PC_PHY_FILTER using clinician_licenses!
  // If physician_type explicitly matches the string in PC_Valid, OR if it's a license number in clinician_licenses that maps to a PC profession
  filters.PC_PHY_FILTER = `(
    UPPER(TRIM(physician_type)) IN (SELECT UPPER(TRIM(code)) FROM code_mappings WHERE group_name = 'PC_Valid')
    OR physician_type IN (SELECT license_number FROM clinician_licenses WHERE category IN ('General Practitioner', 'Family Medicine', 'Internal Medicine') OR profession IN ('General Practitioner', 'Family Medicine', 'Internal Medicine'))
  )`;

  filters.PC_PHY_PAED_FILTER = `(
    UPPER(TRIM(physician_type)) IN (SELECT UPPER(TRIM(code)) FROM code_mappings WHERE group_name IN ('PC_Valid', 'PC_Paed'))
    OR physician_type IN (SELECT license_number FROM clinician_licenses WHERE category IN ('General Practitioner', 'Family Medicine', 'Internal Medicine', 'Pediatrics') OR profession IN ('General Practitioner', 'Family Medicine', 'Internal Medicine', 'Pediatrics'))
  )`;

  return filters;
}


function lookbackDate(year, quarter) {
  const qStart = new Date(year, (quarter-1)*3, 1);
  qStart.setMonth(qStart.getMonth() - 9);
  return qStart.toISOString().slice(0,10);
}

function lookback12Date(year, quarter) {
  const qEnd = new Date(year, quarter*3, 0);
  qEnd.setMonth(qEnd.getMonth() - 12);
  return qEnd.toISOString().slice(0,10);
}

// PC026: denominator is 2 quarters before reporting quarter per V9 time-shift
function pc026DenominatorQuarter(year, quarter) {
  let denQ = quarter - 2;
  let denY = year;
  if (denQ <= 0) { denQ += 4; denY -= 1; }
  return { denYear: denY, denQuarter: denQ };
}

function kpiStatus(value, kpi) {
  if (value == null) return 'no-data';
  if (!kpi.target) return 'no-target';
  if (kpi.target_dir === 'gte') {
    if (value >= kpi.target) return 'met';
    if (value >= kpi.target * 0.9) return 'near';
    return 'not-met';
  } else {
    if (value <= kpi.target) return 'met';
    if (value <= kpi.target * 1.1) return 'near';
    return 'not-met';
  }
}


async function calc_PC004(db, facilityId, year, quarter, filters) {
  const sql = `
    WITH first_phq2 AS (
      SELECT mrn, MIN(encounter_date) as min_phq2_date
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=? AND phq2_result=1
      GROUP BY mrn
    ),
    exclusions AS (
      SELECT DISTINCT mrn FROM locked_audit_records
      WHERE facility_id=? 
        AND ( ${filters.DEP_EXCL_FILTER} OR ${filters.BIPOLAR_EXCL_FILTER} )
    ),
    q2_data AS (
      SELECT mrn, MAX(patient_refused) as refused, MAX(is_abm_mandate) as abm,
             MAX(CASE WHEN bp_systolic IS NULL THEN 1 ELSE 0 END) as no_vitals,
             MAX(CASE WHEN visit_type LIKE '%Dental%' OR visit_type LIKE '%Ayurvedic%' OR visit_type LIKE '%Homeopathic%' THEN 1 ELSE 0 END) as bad_visit
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
      GROUP BY mrn
    ),
    eligible AS (
      SELECT f.mrn, f.min_phq2_date
      FROM first_phq2 f
      JOIN locked_audit_records r ON f.mrn = r.mrn AND f.min_phq2_date = r.encounter_date
      JOIN q2_data q ON f.mrn = q.mrn
      WHERE r.facility_id=? AND r.year=? AND r.quarter=?
        AND ABS(r.patient_age) >= 18
        AND r.is_thiqa = 1
        AND f.mrn NOT IN (SELECT mrn FROM exclusions)
        AND q.refused = 0 AND q.abm = 0 AND q.no_vitals = 0 AND q.bad_visit = 0
    )
    SELECT 
      (SELECT GROUP_CONCAT(mrn) FROM eligible) as den_list,
      (SELECT GROUP_CONCAT(e.mrn) FROM eligible e 
       JOIN locked_audit_records r ON e.mrn = r.mrn 
       WHERE r.facility_id=? AND r.year=? AND r.quarter=? 
         AND r.phq9_score IS NOT NULL 
         AND r.phq9_date IS NOT NULL
         AND (julianday(r.phq9_date) - julianday(e.min_phq2_date)) <= 1
      ) as num_list
  `;
  
  const result = await db.get(sql, [
    facilityId, year, quarter, facilityId, facilityId, year, quarter, facilityId, year, quarter, facilityId, year, quarter
  ]);

  const numList = result && result.num_list ? result.num_list.split(',') : [];
  const denList = result && result.den_list ? result.den_list.split(',') : [];

  return { numerator: numList.length, denominator: denList.length, num_list: numList, den_list: denList };
};

async function calc_PC005(db, facilityId, year, quarter, filters) {
  const sql = `
    WITH q2_dx AS (
      SELECT mrn, MIN(encounter_date) as dx_date
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=? 
        AND phq9_score BETWEEN 5 AND 14
        AND ${filters.DEP_EXCL_FILTER}
      GROUP BY mrn
    ),
    exclusions AS (
      SELECT DISTINCT mrn FROM locked_audit_records
      WHERE facility_id=? AND ${filters.BIPOLAR_EXCL_FILTER}
    ),
    established AS (
      SELECT DISTINCT r.mrn FROM locked_audit_records r
      JOIN q2_dx q ON r.mrn = q.mrn
      WHERE r.facility_id=? 
        AND r.encounter_date < q.dx_date
        AND ${filters.DEP_EXCL_FILTER}
    ),
    q2_data AS (
      SELECT mrn, MAX(patient_refused) as refused, MAX(is_abm_mandate) as abm
      FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
      GROUP BY mrn
    ),
    eligible AS (
      SELECT f.mrn, f.dx_date
      FROM q2_dx f
      JOIN locked_audit_records r ON f.mrn = r.mrn AND f.dx_date = r.encounter_date
      JOIN q2_data q ON f.mrn = q.mrn
      WHERE r.facility_id=? AND r.year=? AND r.quarter=?
        AND ABS(r.patient_age) >= 18
        AND ${filters.PC_PHY_FILTER}
        AND f.mrn NOT IN (SELECT mrn FROM exclusions)
        AND f.mrn NOT IN (SELECT mrn FROM established)
        AND q.refused = 0 AND q.abm = 0
    )
    SELECT 
      (SELECT GROUP_CONCAT(mrn) FROM eligible) as den_list,
      (SELECT GROUP_CONCAT(e.mrn) FROM eligible e 
       JOIN locked_audit_records r ON e.mrn = r.mrn AND e.dx_date = r.encounter_date
       WHERE r.facility_id=? AND r.year=? AND r.quarter=? 
         AND r.followup_within_30d = 1
      ) as num_list
  `;

  const result = await db.get(sql, [
    facilityId, year, quarter, facilityId, facilityId, facilityId, year, quarter, facilityId, year, quarter, facilityId, year, quarter
  ]);

  const numList = result && result.num_list ? result.num_list.split(',') : [];
  const denList = result && result.den_list ? result.den_list.split(',') : [];

  return { numerator: numList.length, denominator: denList.length, num_list: numList, den_list: denList };
}

async function calc_PC009(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const lb12 = lookback12Date(year, quarter);
  const qStart = `${year}-${String(quarter*3-2).padStart(2,'0')}-01`;

  const den = await db.get(`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND ${filters.DM_ICD_FILTER} ${filters.DM_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND ${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND ${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  `, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM (
      SELECT mrn,
             MAX(CASE WHEN COALESCE(hba1c_date, encounter_date) >= ? THEN hba1c_value ELSE NULL END) as latest_hba1c,
             MAX(CASE WHEN COALESCE(hba1c_date, encounter_date) >= ? THEN COALESCE(hba1c_date, encounter_date) ELSE NULL END) as latest_hba1c_date
      FROM locked_audit_records
      WHERE facility_id=? 
        AND mrn IN (
          SELECT mrn FROM locked_audit_records
          WHERE facility_id=? AND year=? AND quarter=?
            AND patient_age >= 18 AND patient_age <= 75
            AND ${filters.DM_ICD_FILTER} ${filters.DM_EXCL} ${filters.ABM_EXCL}
            AND ${filters.PC_PHY_FILTER}
            AND ${filters.EM_CPT_FILTER}
            AND mrn IN (
              SELECT mrn FROM locked_audit_records
              WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
                AND ${filters.DM_ICD_FILTER}
              GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
            )
        )
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NULL OR latest_hba1c_date IS NULL OR latest_hba1c > 9.0
  `, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC010(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const lb12 = lookback12Date(year, quarter);
  const qStart = `${year}-${String(quarter*3-2).padStart(2,'0')}-01`;

  const den = await db.get(`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND ${filters.DM_ICD_FILTER} ${filters.DM_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND ${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND ${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  `, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM (
      SELECT mrn,
             MAX(CASE WHEN COALESCE(hba1c_date, encounter_date) >= ? THEN hba1c_value ELSE NULL END) as latest_hba1c,
             MAX(CASE WHEN COALESCE(hba1c_date, encounter_date) >= ? THEN COALESCE(hba1c_date, encounter_date) ELSE NULL END) as latest_hba1c_date
      FROM locked_audit_records
      WHERE facility_id=? 
        AND mrn IN (
          SELECT mrn FROM locked_audit_records
          WHERE facility_id=? AND year=? AND quarter=?
            AND patient_age >= 18 AND patient_age <= 75
            AND ${filters.DM_ICD_FILTER} ${filters.DM_EXCL} ${filters.ABM_EXCL}
            AND ${filters.PC_PHY_FILTER}
            AND ${filters.EM_CPT_FILTER}
            AND mrn IN (
              SELECT mrn FROM locked_audit_records
              WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
                AND ${filters.DM_ICD_FILTER}
              GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
            )
        )
      GROUP BY mrn
    ) sub
    WHERE latest_hba1c IS NOT NULL AND latest_hba1c_date IS NOT NULL AND latest_hba1c <= 8.0
  `, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC011(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = `${year}-${String(quarter*3-2).padStart(2,'0')}-01`;
  const lb12 = lookback12Date(year, quarter);

  const denomSql = `
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND ${filters.DM_ICD_FILTER} ${filters.DM_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND ${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND ${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  `;
  const den = await db.get(denomSql, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const numSql = `
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND ${filters.DM_ICD_FILTER} ${filters.DM_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND ${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND ${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? 
          AND (foot_exam_done = 1 OR cpt_all LIKE '%2028F%')
      )
  `;
  const num = await db.get(numSql, [facilityId, year, quarter, facilityId, lb9, qStart, facilityId, lb12]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC012(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = `${year}-${String(quarter*3-2).padStart(2,'0')}-01`;
  const lb12 = lookback12Date(year, quarter);

  const denomSql = `
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND ${filters.DM_ICD_FILTER} ${filters.DM_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND ${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND ${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  `;
  const den = await db.get(denomSql, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const numSql = `
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND ${filters.DM_ICD_FILTER} ${filters.DM_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND ${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND ${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? 
          AND (eye_exam_done = 1 OR cpt_all LIKE '%2022F%' OR cpt_all LIKE '%2024F%' OR cpt_all LIKE '%2026F%' OR cpt_all LIKE '%3072F%')
      )
  `;
  const num = await db.get(numSql, [facilityId, year, quarter, facilityId, lb9, qStart, facilityId, lb12]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC013(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = `${year}-${String(quarter*3-2).padStart(2,'0')}-01`;
  const lb12 = lookback12Date(year, quarter);

  const denomSql = `
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND ${filters.DM_ICD_FILTER} ${filters.DM_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND ${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND ${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
  `;
  const den = await db.get(denomSql, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const numSql = `
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=?
      AND patient_age >= 18 AND patient_age <= 75
      AND ${filters.DM_ICD_FILTER} ${filters.DM_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND ${filters.EM_CPT_FILTER}
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
          AND ${filters.DM_ICD_FILTER}
        GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
      )
      AND mrn IN (
        SELECT mrn FROM locked_audit_records
        WHERE facility_id=? AND encounter_date >= ? 
          AND (nephropathy_exam_done = 1 OR cpt_all LIKE '%3060F%' OR cpt_all LIKE '%82043%' OR cpt_all LIKE '%82570%')
      )
  `;
  const num = await db.get(numSql, [facilityId, year, quarter, facilityId, lb9, qStart, facilityId, lb12]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC014(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = `${year}-${String(quarter*3-2).padStart(2,'0')}-01`;

  const den = await db.get(`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=? AND ABS(patient_age)>=18 AND ABS(patient_age)<=85
      AND ${filters.HTN_ICD_FILTER} ${filters.HTN_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date>=? AND encounter_date<?
                  AND ${filters.HTN_ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date)>=2)
  `, [facilityId, year, quarter, facilityId, lb9, qStart]);

  // Numerator: Most recent BP in the quarter < 130/80. If ties on the same day, prioritize the controlled reading.
    const num = await db.get(`
      SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM (
        SELECT mrn,
               MAX( encounter_date || '_' || CASE WHEN bp_systolic < 130 AND bp_diastolic < 80 THEN '1' ELSE '0' END ) as best_last_reading
        FROM locked_audit_records
        WHERE facility_id=? AND year=? AND quarter=?
          AND bp_systolic IS NOT NULL AND bp_diastolic IS NOT NULL
          AND ABS(patient_age)>=18 AND ABS(patient_age)<=85
          AND ${filters.HTN_ICD_FILTER} ${filters.HTN_EXCL} ${filters.ABM_EXCL}
          AND ${filters.PC_PHY_FILTER}
          AND ${filters.EM_CPT_FILTER}
          AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date>=? AND encounter_date<?
                      AND ${filters.HTN_ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date)>=2)
        GROUP BY mrn
      ) sub
      WHERE best_last_reading LIKE '%_1'
    `, [facilityId, year, quarter, facilityId, lb9, qStart]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC016(db, facilityId, year, quarter, filters) {
  const lb9  = lookbackDate(year, quarter);
  const qStart = `${year}-${String(quarter*3-2).padStart(2,'0')}-01`;

  const den = await db.get(`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=? AND ABS(patient_age)>=18 AND ABS(patient_age)<=85
      AND ${filters.HTN_ICD_FILTER} ${filters.HTN_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date>=? AND encounter_date<?
                  AND ${filters.HTN_ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date)>=2)
  `, [facilityId, year, quarter, facilityId, lb9, qStart]);

  const num = await db.get(`
    SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
    WHERE facility_id=? AND year=? AND quarter=? AND ABS(patient_age)>=18 AND ABS(patient_age)<=85
      AND ${filters.HTN_ICD_FILTER} ${filters.HTN_EXCL} ${filters.ABM_EXCL}
      AND ${filters.PC_PHY_FILTER}
      AND (nephropathy_exam_done=1 OR (uacr_done=1 AND egfr_value IS NOT NULL))
  `, [facilityId, year, quarter]);

  return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}



const CALCULATORS = {
  PC004: calc_PC004, PC005: calc_PC005,
  PC009: calc_PC009, PC010: calc_PC010,
  PC011: calc_PC011, PC012: calc_PC012, PC013: calc_PC013,
  PC014: calc_PC014, PC016: calc_PC016,
  
};

async function calculateAllKPIs(facilityId, year, quarter) {
  const db = await initDb();
  const kpiDefs = await db.all('SELECT * FROM kpi_definitions');
  const results = [];

  for (const kpi of kpiDefs) {
    const calc = CALCULATORS[kpi.code];
    if (!calc) continue;

    let num = null, den = null, value = null;
    try {
      
        if(!db._dynamicFilters) db._dynamicFilters = await generateDynamicFilters(db);
        const r = await calc(db, facilityId, year, quarter, db._dynamicFilters);
      num = r.numerator;
      den = r.denominator;

      if (kpi.code === 'PC030') {
        value = r.value ?? null;
      } else if (num != null && den != null && den > 0) {
        if (kpi.unit === '%') value = parseFloat(((num / den) * 100).toFixed(2));
        else value = parseFloat((num / den).toFixed(4));
      }
    } catch(e) {
      console.error("KPI " + kpi.code + " calc error:", e.message);
    }

      let status = 'no-data';
      if (den === 0) {
        status = 'met'; // User explicitly requested N/A to be treated as 'pass'
      } else if (value != null && kpi.target) {
        if (kpi.target_dir === 'gte') {
            status = value >= kpi.target ? 'met' : (value >= kpi.target * 0.9 ? 'near' : 'not-met');
        } else {
            status = value <= kpi.target ? 'met' : (value <= kpi.target * 1.1 ? 'near' : 'not-met');
        }
      }

    await db.run(`
      INSERT INTO kpi_results (facility_id, kpi_code, year, quarter, numerator, denominator, value, status, calculated_at)
      VALUES (?,?,?,?,?,?,?,?,datetime('now'))
      ON CONFLICT(facility_id, kpi_code, year, quarter) DO UPDATE SET
        numerator=excluded.numerator, denominator=excluded.denominator,
        value=excluded.value, status=excluded.status, calculated_at=excluded.calculated_at
    `, [facilityId, kpi.code, year, quarter, num, den, value, status]);

    results.push({ code: kpi.code, name: kpi.short_name, numerator: num, denominator: den, value, status });
  }

  return results;
}

module.exports = { calculateAllKPIs, kpiStatus, CALCULATORS, generateDynamicFilters };
