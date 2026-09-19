const assert = require('assert');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const TEST_DB = path.join(__dirname, 'test-kpi.db');

let db;

async function setupTestDb() {
  if (db) { try { await db.close(); } catch {} }
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  if (fs.existsSync(TEST_DB + '-wal')) fs.unlinkSync(TEST_DB + '-wal');
  if (fs.existsSync(TEST_DB + '-shm')) fs.unlinkSync(TEST_DB + '-shm');

  db = await open({ filename: TEST_DB, driver: sqlite3.Database });
  await db.exec('PRAGMA journal_mode = WAL;');

  await db.exec(`
    CREATE TABLE facilities (id INTEGER PRIMARY KEY AUTOINCREMENT, mf_no TEXT UNIQUE NOT NULL, name TEXT NOT NULL, facility_type TEXT DEFAULT 'Medical Center', coordinator TEXT DEFAULT '', license_no TEXT DEFAULT '', phone TEXT DEFAULT '', active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE kpi_definitions (code TEXT PRIMARY KEY, name TEXT, short_name TEXT, type TEXT, domain TEXT, indicator_type TEXT, description TEXT, numerator_desc TEXT, denominator_desc TEXT, formula TEXT, unit TEXT DEFAULT '%', target REAL, target_dir TEXT DEFAULT 'gte', target_note TEXT, frequency TEXT DEFAULT 'quarterly', data_source TEXT, facility_type TEXT DEFAULT 'Both', age_min INTEGER, age_max INTEGER);
    CREATE TABLE import_batches (id INTEGER PRIMARY KEY AUTOINCREMENT, facility_id INTEGER, file_name TEXT, file_type TEXT, year INTEGER, quarter INTEGER, row_count INTEGER DEFAULT 0, error_count INTEGER DEFAULT 0, status TEXT DEFAULT 'pending', errors_json TEXT, imported_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (facility_id) REFERENCES facilities(id));
    CREATE TABLE emr_data (id INTEGER PRIMARY KEY AUTOINCREMENT, facility_id INTEGER, batch_id INTEGER, mrn TEXT, visit_id TEXT, patient_name TEXT, chief_complaints TEXT, physician_plan TEXT, narrative_diagnosis TEXT, procedure_notes TEXT, procedure_remarks TEXT, clinical_notes TEXT, patient_age REAL, patient_age_months REAL, patient_dob TEXT, gender TEXT, encounter_date TEXT NOT NULL, year INTEGER NOT NULL, quarter INTEGER NOT NULL, month INTEGER, physician_id TEXT, physician_type TEXT, icd10_primary TEXT, icd10_secondary TEXT, icd10_all TEXT, cpt_all TEXT, wait_time_mins REAL, hba1c_value REAL, hba1c_date TEXT, bp_systolic REAL, bp_diastolic REAL, bp_date TEXT, phq2_result INTEGER, phq9_score REAL, phq9_date TEXT, phq9_followup_date TEXT, depression_dx_date TEXT, followup_within_30d INTEGER, foot_exam_done INTEGER, eye_exam_done INTEGER, nephropathy_exam_done INTEGER, lipid_profile_done INTEGER, egfr_value REAL, egfr_date TEXT, uacr_done INTEGER, bmi REAL, autism_screened INTEGER, asthma_controller_count INTEGER, asthma_reliever_count INTEGER, appointment_wait_days INTEGER, row_hash TEXT UNIQUE, phq9_followup_score REAL, is_abm_mandate INTEGER DEFAULT 0, insurance_category TEXT, physician_category TEXT, is_thiqa INTEGER DEFAULT 0, is_palliative INTEGER DEFAULT 0, patient_refused INTEGER DEFAULT 0, visit_type TEXT, physician_name TEXT);
    CREATE INDEX idx_emr_facility_quarter ON emr_data(facility_id, year, quarter);
    CREATE INDEX idx_emr_mrn ON emr_data(facility_id, mrn);
    CREATE INDEX idx_emr_audit_match ON emr_data(facility_id, mrn, encounter_date);
    CREATE TABLE patients (id INTEGER PRIMARY KEY AUTOINCREMENT, facility_id INTEGER, mrn TEXT NOT NULL, patient_dob TEXT, gender TEXT, last_encounter_date TEXT, FOREIGN KEY (facility_id) REFERENCES facilities(id), UNIQUE(facility_id, mrn));
    CREATE TABLE shafafiya_data (id INTEGER PRIMARY KEY AUTOINCREMENT, facility_id INTEGER, batch_id INTEGER, claim_id TEXT, mrn TEXT, ordering_physician_id TEXT, ordering_physician_type TEXT, patient_age REAL, patient_dob TEXT, gender TEXT, encounter_date TEXT NOT NULL, year INTEGER NOT NULL, quarter INTEGER NOT NULL, month INTEGER, physician_id TEXT, physician_type TEXT, icd10_primary TEXT, icd10_secondary TEXT, icd10_all TEXT, cpt_all TEXT, service_reference_ids TEXT, service_type TEXT, insurance_type TEXT, insurance_company TEXT, loinc_code TEXT, loinc_value TEXT, loinc_value_type TEXT, hba1c_value REAL, egfr_value REAL, row_hash TEXT UNIQUE, FOREIGN KEY (facility_id) REFERENCES facilities(id), FOREIGN KEY (batch_id) REFERENCES import_batches(id));
    CREATE INDEX idx_shafafiya_facility_quarter ON shafafiya_data(facility_id, year, quarter);
    CREATE INDEX idx_shafafiya_audit_match ON shafafiya_data(facility_id, mrn, encounter_date);
    CREATE TABLE shafafiya_claim_lines (id INTEGER PRIMARY KEY AUTOINCREMENT, facility_id INTEGER, batch_id INTEGER, claim_id TEXT, mrn TEXT, encounter_date TEXT NOT NULL, service_line_no INTEGER, cpt_code TEXT, service_reference_id TEXT, icd10_codes TEXT, ordering_physician_id TEXT, ordering_physician_type TEXT, rendering_physician_id TEXT, rendering_physician_type TEXT, loinc_code TEXT, loinc_value TEXT, loinc_value_type TEXT, insurance_type TEXT, FOREIGN KEY (facility_id) REFERENCES facilities(id), FOREIGN KEY (batch_id) REFERENCES import_batches(id));
    CREATE INDEX idx_claim_lines_claim ON shafafiya_claim_lines(facility_id, claim_id);
    CREATE TABLE code_mappings (id INTEGER PRIMARY KEY AUTOINCREMENT, mapping_type TEXT NOT NULL, group_name TEXT, code_type TEXT, code TEXT, description TEXT, target_kpi TEXT, code_value TEXT, code_desc TEXT, standard_category TEXT, active INTEGER DEFAULT 1);
    CREATE TABLE kpi_results (id INTEGER PRIMARY KEY AUTOINCREMENT, facility_id INTEGER NOT NULL, kpi_code TEXT NOT NULL, year INTEGER NOT NULL, quarter INTEGER NOT NULL, numerator REAL, denominator REAL, value REAL, status TEXT, notes TEXT, calculated_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (facility_id) REFERENCES facilities(id), FOREIGN KEY (kpi_code) REFERENCES kpi_definitions(code), UNIQUE(facility_id, kpi_code, year, quarter));
    CREATE TABLE quarter_locks (id INTEGER PRIMARY KEY AUTOINCREMENT, facility_id INTEGER NOT NULL, year INTEGER NOT NULL, quarter INTEGER NOT NULL, is_locked INTEGER DEFAULT 0, locked_at DATETIME, locked_by TEXT, UNIQUE(facility_id, year, quarter));
    CREATE TABLE locked_audit_records (id INTEGER PRIMARY KEY AUTOINCREMENT, facility_id INTEGER NOT NULL, year INTEGER NOT NULL, quarter INTEGER NOT NULL, mrn TEXT, encounter_date TEXT, patient_age REAL, patient_age_months REAL, gender TEXT, is_palliative INTEGER, patient_refused INTEGER, phq2_result INTEGER, phq9_score INTEGER, phq9_date TEXT, phq9_followup_date TEXT, phq9_followup_score INTEGER, depression_dx_date TEXT, followup_within_30d INTEGER, foot_exam_done INTEGER, eye_exam_done INTEGER, nephropathy_exam_done INTEGER, lipid_profile_done INTEGER, egfr_value REAL, egfr_date TEXT, uacr_done INTEGER, bmi REAL, bp_systolic REAL, bp_diastolic REAL, bp_date TEXT, autism_screened INTEGER, asthma_controller_count INTEGER, asthma_reliever_count INTEGER, wait_time_mins INTEGER, appointment_wait_days INTEGER, hba1c_value REAL, hba1c_date TEXT, patient_dob TEXT, month INTEGER, visit_type TEXT, physician_type TEXT, physician_category TEXT, icd10_primary TEXT, icd10_secondary TEXT, icd10_all TEXT, cpt_all TEXT, insurance_category TEXT, is_thiqa INTEGER, is_abm_mandate INTEGER);
    CREATE INDEX idx_locked_facility_quarter ON locked_audit_records(facility_id, year, quarter);
    CREATE INDEX idx_locked_mrn ON locked_audit_records(facility_id, mrn);
    CREATE TABLE manual_kpi_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, facility_id INTEGER NOT NULL, kpi_code TEXT NOT NULL, year INTEGER NOT NULL, quarter INTEGER NOT NULL, numerator REAL, denominator REAL, value REAL, notes TEXT, entered_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (facility_id) REFERENCES facilities(id), UNIQUE(facility_id, kpi_code, year, quarter));
    CREATE TABLE audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT, record_id TEXT, action TEXT, old_json TEXT, new_json TEXT, user_id TEXT, user_role TEXT, description TEXT, timestamp DATETIME DEFAULT (datetime('now')));
    CREATE TABLE app_settings (id INTEGER PRIMARY KEY DEFAULT 1, company_name TEXT DEFAULT 'Test', active_year INTEGER DEFAULT 2026, active_quarter INTEGER DEFAULT 2, active_facility_id INTEGER);
    CREATE TABLE app_meta (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE clinician_licenses (license_number TEXT, clinician_name TEXT, major TEXT, profession TEXT, category TEXT, facility_name TEXT, facility_mf_no TEXT, PRIMARY KEY (license_number, facility_mf_no));
    CREATE TABLE kpi_registry_versions (id INTEGER PRIMARY KEY AUTOINCREMENT, version TEXT, effective_from TEXT, effective_to TEXT, facility_types TEXT, kpi_codes_json TEXT);
  `);

  await db.run("INSERT INTO facilities (id, mf_no, name, facility_type) VALUES (1, 'MF001', 'Test Facility', 'Medical Center')");
  await db.run("INSERT INTO facilities (id, mf_no, name, facility_type) VALUES (2, 'MF002', 'Test PC', 'Primary Care')");

  const { KPI_DEFINITIONS } = require('../engine/kpi-definitions');
  for (const d of KPI_DEFINITIONS) {
    await db.run(`INSERT INTO kpi_definitions (code,name,short_name,type,domain,indicator_type,description,numerator_desc,denominator_desc,formula,unit,target,target_dir,frequency,data_source,facility_type,age_min,age_max) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.code, d.name, d.short_name||d.name, d.type||'', d.domain, d.indicator_type||'', d.description||'', d.numerator_desc||'', d.denominator_desc||'', d.formula||'', d.unit||'%', d.target??null, d.target_dir||'gte', d.frequency||'quarterly', d.data_source||'EMR', d.facility_type||'Both', d.age_min??null, d.age_max??null]);
  }

  await db.run(`INSERT INTO kpi_registry_versions (version, effective_from, effective_to, facility_types, kpi_codes_json) VALUES ('v9-2026-q1', '2026-01-01', '2026-06-30', '["Primary Care"]', '["PC004","PC005","PC009","PC010","PC011","PC012","PC013","PC014","PC016","PC021","PC023","PC024","PC025","PC026","PC027","PC028","PC029","PC030"]')`);
  await db.run(`INSERT INTO kpi_registry_versions (version, effective_from, effective_to, facility_types, kpi_codes_json) VALUES ('v1-2026-q3', '2026-07-01', NULL, '["Primary Care","Medical Center"]', '["PC004","PC005","PC009","PC010","PC011","PC012","PC013","PC014","PC016","PC021","PC023","PC024","PC025","PC026","PC027","PC028","PC029","PC030"]')`);

  await db.run("INSERT INTO app_meta (key, value) VALUES ('schema_version', '1')");
  await db.run("INSERT INTO app_settings (id) VALUES (1)");

  const codeMappings = [
    { mapping_type: 'Disease_Group', group_name: 'DM_Inclusion', code: 'E10' },
    { mapping_type: 'Disease_Group', group_name: 'DM_Inclusion', code: 'E11' },
    { mapping_type: 'Disease_Group', group_name: 'DM_Inclusion', code: 'E13' },
    { mapping_type: 'Disease_Group', group_name: 'DM_Inclusion', code: 'O24' },
    { mapping_type: 'Disease_Group', group_name: 'HTN_Inclusion', code: 'I10' },
    { mapping_type: 'Disease_Group', group_name: 'HTN_Inclusion', code: 'I11' },
    { mapping_type: 'Disease_Group', group_name: 'HTN_Inclusion', code: 'I12' },
    { mapping_type: 'Disease_Group', group_name: 'HTN_Inclusion', code: 'I13' },
    { mapping_type: 'Disease_Group', group_name: 'Depression_Inc', code: 'F32' },
    { mapping_type: 'Disease_Group', group_name: 'Depression_Inc', code: 'F33' },
    { mapping_type: 'Disease_Group', group_name: 'Depression_Exc', code: 'F01' },
    { mapping_type: 'Disease_Group', group_name: 'Depression_Exc', code: 'F31' },
    { mapping_type: 'Exclusion_Group', group_name: 'DM_Gestational', code: 'O24.4' },
    { mapping_type: 'Exclusion_Group', group_name: 'DM_PCOS', code: 'E28.2' },
    { mapping_type: 'Exclusion_Group', group_name: 'DM_Steroid', code: 'E09' },
    { mapping_type: 'Exclusion_Group', group_name: 'Pregnancy_Exc', code: 'O00' },
    { mapping_type: 'Exclusion_Group', group_name: 'HTN_ESRD', code: 'N18.6' },
    { mapping_type: 'Exclusion_Group', group_name: 'HTN_Transplant', code: 'Z94.0' },
    { mapping_type: 'Physician_Type', group_name: 'PC_Valid', code: 'GP' },
    { mapping_type: 'Physician_Type', group_name: 'PC_Valid', code: 'FM' },
    { mapping_type: 'Physician_Type', group_name: 'PC_Valid', code: 'IM' },
    { mapping_type: 'Physician_Type', group_name: 'PC_Paed', code: 'PEDIATRICIAN' },
    { mapping_type: 'Category', group_name: 'Valid_EM', code: '99211' },
    { mapping_type: 'Category', group_name: 'Valid_EM', code: '99212' },
    { mapping_type: 'Category', group_name: 'Valid_EM', code: '99213' },
    { mapping_type: 'Category', group_name: 'Valid_EM', code: '99214' },
    { mapping_type: 'Category', group_name: 'Valid_EM', code: '99215' },
    { mapping_type: 'Category', group_name: 'Foot_Exam', code: '2028F' },
    { mapping_type: 'Category', group_name: 'Foot_Exam', code: '97110' },
    { mapping_type: 'Category', group_name: 'Eye_Exam', code: '92134' },
    { mapping_type: 'Category', group_name: 'Eye_Exam', code: '92132' },
    { mapping_type: 'Category', group_name: 'Nephropathy', code: '82043' },
    { mapping_type: 'Category', group_name: 'Nephropathy', code: '82565' },
  ];
  for (const m of codeMappings) {
    await db.run("INSERT INTO code_mappings (mapping_type, group_name, code) VALUES (?, ?, ?)", [m.mapping_type, m.group_name, m.code]);
  }
}

function makeRecord(overrides = {}) {
  return {
    facility_id: 1, mrn: 'MRN001', encounter_date: '2026-03-15', year: 2026, quarter: 2,
    patient_age: 45, patient_age_months: null, gender: 'M',
    is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0,
    icd10_all: null, cpt_all: null, bmi: null, phq9_score: null, phq9_date: null,
    phq9_followup_score: null, phq9_followup_date: null, phq2_result: 0,
    bp_systolic: null, bp_diastolic: null, egfr_value: null, uacr_done: 0,
    foot_exam_done: 0, eye_exam_done: 0, nephropathy_exam_done: 0, lipid_profile_done: 0,
    hba1c_value: null, hba1c_date: null, autism_screened: 0,
    asthma_controller_count: 0, asthma_reliever_count: 0, appointment_wait_days: null,
    wait_time_mins: null, visit_type: 'Outpatient', physician_type: 'GP',
    physician_category: 'General Practitioner', physician_name: 'Dr Test',
    insurance_category: 'Commercial', patient_dob: '1981-01-01', month: 3,
    ...overrides,
  };
}

const COLS = ['facility_id','mrn','encounter_date','year','quarter','patient_age','patient_age_months','gender',
  'is_palliative','patient_refused','is_abm_mandate','is_thiqa','icd10_all','cpt_all','bmi',
  'phq9_score','phq9_date','phq9_followup_score','phq9_followup_date','phq2_result',
  'bp_systolic','bp_diastolic','egfr_value','uacr_done','foot_exam_done','eye_exam_done',
  'nephropathy_exam_done','lipid_profile_done','hba1c_value','hba1c_date','autism_screened',
  'asthma_controller_count','asthma_reliever_count','appointment_wait_days','wait_time_mins',
  'visit_type','physician_type','physician_category','physician_name','insurance_category','patient_dob','month'];

async function insertRecords(records) {
  for (const r of records) {
    await db.run(`INSERT INTO locked_audit_records (${COLS.join(',')}) VALUES (${COLS.map(()=>'?').join(',')})`,
      COLS.map(c => r[c]));
  }
}

const { initDb } = require('../database/db');
const origInitDb = initDb;

// ─── Tests ──────────────────────────────────────────────────────────────────

async function testSanitizeCode() {
  delete require.cache[require.resolve('../engine/kpi-calculator')];
  const mod = require('../engine/kpi-calculator');
  assert.strictEqual(mod.sanitizeCode('E11.9'), 'E11.9', 'Basic ICD code');
  assert.strictEqual(mod.sanitizeCode('99213'), '99213', 'CPT code');
  assert.strictEqual(mod.sanitizeCode('Z13.4'), 'Z13.4', 'Z code');
  assert.strictEqual(mod.sanitizeCode('E11.9; DROP TABLE'), null, 'SQL injection rejected');
  assert.strictEqual(mod.sanitizeCode(''), null, 'Empty string');
  assert.strictEqual(mod.sanitizeCode(null), null, 'Null');
  console.log('  sanitizeCode passed');
}

async function testKpiStatus() {
  const mod = require('../engine/kpi-calculator');
  assert.strictEqual(mod.kpiStatus(95, { target: 90, target_dir: 'gte' }), 'met', 'gte met');
  assert.strictEqual(mod.kpiStatus(85, { target: 90, target_dir: 'gte' }), 'near', 'gte near');
  assert.strictEqual(mod.kpiStatus(80, { target: 90, target_dir: 'gte' }), 'not-met', 'gte not-met');
  assert.strictEqual(mod.kpiStatus(25, { target: 30, target_dir: 'lte' }), 'met', 'lte met');
  assert.strictEqual(mod.kpiStatus(33, { target: 30, target_dir: 'lte' }), 'near', 'lte near');
  assert.strictEqual(mod.kpiStatus(40, { target: 30, target_dir: 'lte' }), 'not-met', 'lte not-met');
  assert.strictEqual(mod.kpiStatus(null, { target: 90 }), 'no-data', 'no-data');
  assert.strictEqual(mod.kpiStatus(50, { target: null }), 'no-target', 'no-target');
  assert.strictEqual(mod.kpiStatus(0, { target: 90, target_dir: 'gte' }), 'not-met', 'zero not-met');
  console.log('  kpiStatus passed');
}

async function testExclusions() {
  const { getExclusionDescriptions } = require('../engine/exclusions');
  const d = getExclusionDescriptions('PC009');
  assert.ok(d.includes('ABM Mandate patients excluded'), 'PC009 ABM');
  assert.ok(d.includes('Pregnancy-related diagnoses excluded'), 'PC009 Pregnancy');
  assert.ok(d.includes('Gestational DM (O24.4) excluded'), 'PC009 Gestational');
  assert.ok(d.includes('PCOS (E28.2) excluded'), 'PC009 PCOS');
  assert.ok(d.includes('Steroid-induced DM (E09) excluded'), 'PC009 Steroid');
  assert.ok(d.includes('Palliative care patients excluded'), 'PC009 Palliative');
  assert.ok(d.includes('Patient refused excluded'), 'PC009 Refused');

  const pc004Desc = getExclusionDescriptions('PC004');
  assert.ok(pc004Desc.includes('Bipolar disorder (F31) excluded'), 'PC004 Bipolar');
  assert.ok(!pc004Desc.includes('Gestational'), 'PC004 no Gestational');

  const pc027Desc = getExclusionDescriptions('PC027');
  assert.ok(pc027Desc.includes('COPD/CF/Bronchiectasis/Respiratory failure excluded'), 'PC027 Asthma');

  const pc014Desc = getExclusionDescriptions('PC014');
  assert.ok(pc014Desc.includes('ESRD (N18.6) excluded'), 'PC014 ESRD');
  assert.ok(pc014Desc.includes('Renal transplant (Z94.0) excluded'), 'PC014 Transplant');
  assert.ok(pc014Desc.includes('Dialysis patients excluded'), 'PC014 Dialysis');
  console.log('  exclusion descriptions passed');
}

async function testCalculatePC009() {
  await setupTestDb();
  initDb.__mock = db;
  delete require.cache[require.resolve('../database/db.js')];
  delete require.cache[require.resolve('../engine/kpi-calculator')];
  delete require.cache[require.resolve('../engine/kpi-registry')];
  delete require.cache[require.resolve('../engine/exclusions')];
  delete require.cache[require.resolve('../engine/kpi-definitions')];

  const { calculateAllKPIs, generateDynamicFilters } = require('../engine/kpi-calculator');
  const filters = await generateDynamicFilters(db);

  const records = [
    makeRecord({ mrn: 'P1', encounter_date: '2025-12-15', icd10_all: 'E11.9', cpt_all: '99213', bmi: 30, phq9_score: null, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P1', encounter_date: '2026-02-10', icd10_all: 'E11.9', cpt_all: '99214', bmi: 30, hba1c_value: 9.5, hba1c_date: '2026-02-10', phq9_score: null, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P2', encounter_date: '2025-12-20', icd10_all: 'E10.9', cpt_all: '99213', bmi: 25, phq9_score: null, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P2', encounter_date: '2026-03-01', icd10_all: 'E10.9', cpt_all: '99214', bmi: 25, hba1c_value: 7.2, hba1c_date: '2026-03-01', phq9_score: null, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P3', encounter_date: '2026-01-10', icd10_all: 'E11.9', cpt_all: '99213', bmi: 28, phq9_score: null, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P4', encounter_date: '2025-12-10', icd10_all: 'I10', cpt_all: '99213', bmi: 28, phq9_score: null, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P4', encounter_date: '2026-02-15', icd10_all: 'I10', cpt_all: '99214', bmi: 28, phq9_score: null, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P5', encounter_date: '2025-12-12', icd10_all: 'E11.9', cpt_all: '99213', bmi: 26, phq9_score: null, is_palliative: 1, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P5', encounter_date: '2026-02-20', icd10_all: 'E11.9', cpt_all: '99214', bmi: 26, hba1c_value: 10.0, hba1c_date: '2026-02-20', phq9_score: null, is_palliative: 1, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
  ];
  await insertRecords(records);

  const results = await calculateAllKPIs(1, 2026, 2, null);
  const pc009 = results.find(r => r.code === 'PC009');
  assert.ok(pc009, 'PC009 calculated');
  assert.strictEqual(pc009.denominator, 2, `PC009 den=2 got ${pc009.denominator}`);
  assert.strictEqual(pc009.numerator, 1, `PC009 num=1 got ${pc009.numerator}`);

  const pc010 = results.find(r => r.code === 'PC010');
  assert.ok(pc010, 'PC010 calculated');
  assert.strictEqual(pc010.denominator, 2, `PC010 den=2`);
  assert.strictEqual(pc010.numerator, 1, `PC010 num=1`);

  await db.close();
  fs.unlinkSync(TEST_DB);
  console.log('  PC009/PC010 passed');
}

async function testCalculatePC014() {
  await setupTestDb();
  initDb.__mock = db;
  for (const f of ['../database/db.js','../engine/kpi-calculator','../engine/kpi-registry','../engine/exclusions','../engine/kpi-definitions']) {
    delete require.cache[require.resolve(f)];
  }
  const { calculateAllKPIs } = require('../engine/kpi-calculator');

  const records = [
    makeRecord({ mrn: 'P1', encounter_date: '2025-12-10', icd10_all: 'I10', cpt_all: '99213', bp_systolic: 135, bp_diastolic: 85, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP', patient_age: 50 }),
    makeRecord({ mrn: 'P1', encounter_date: '2026-03-15', icd10_all: 'I10', cpt_all: '99214', bp_systolic: 125, bp_diastolic: 75, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP', patient_age: 50 }),
    makeRecord({ mrn: 'P2', encounter_date: '2025-12-12', icd10_all: 'I10', cpt_all: '99213', bp_systolic: 140, bp_diastolic: 90, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP', patient_age: 55 }),
    makeRecord({ mrn: 'P2', encounter_date: '2026-03-20', icd10_all: 'I10', cpt_all: '99214', bp_systolic: 145, bp_diastolic: 95, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP', patient_age: 55 }),
    makeRecord({ mrn: 'P3', encounter_date: '2025-12-15', icd10_all: 'I10 N18.6', cpt_all: '99213', bp_systolic: 120, bp_diastolic: 70, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP', patient_age: 60 }),
    makeRecord({ mrn: 'P3', encounter_date: '2026-03-25', icd10_all: 'I10 N18.6', cpt_all: '99214', bp_systolic: 118, bp_diastolic: 68, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP', patient_age: 60 }),
  ];
  await insertRecords(records);

  const results = await calculateAllKPIs(1, 2026, 2, null);
  const pc014 = results.find(r => r.code === 'PC014');
  assert.ok(pc014, 'PC014 calculated');
  assert.strictEqual(pc014.denominator, 2, `PC014 den=2 got ${pc014.denominator}`);
  assert.strictEqual(pc014.numerator, 1, `PC014 num=1 got ${pc014.numerator}`);

  await db.close();
  fs.unlinkSync(TEST_DB);
  console.log('  PC014 passed');
}

async function testCalculatePC027() {
  await setupTestDb();
  initDb.__mock = db;
  for (const f of ['../database/db.js','../engine/kpi-calculator','../engine/kpi-registry','../engine/exclusions','../engine/kpi-definitions']) {
    delete require.cache[require.resolve(f)];
  }
  const { calculateAllKPIs } = require('../engine/kpi-calculator');

  const records = [
    makeRecord({ mrn: 'P1', encounter_date: '2026-02-01', icd10_all: 'J45.40', cpt_all: '99214', asthma_controller_count: 3, asthma_reliever_count: 1, patient_age: 30, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P2', encounter_date: '2026-02-15', icd10_all: 'J45.40', cpt_all: '99214', asthma_controller_count: 1, asthma_reliever_count: 4, patient_age: 35, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P3', encounter_date: '2026-03-01', icd10_all: 'J44.0', cpt_all: '99213', asthma_controller_count: 2, asthma_reliever_count: 1, patient_age: 40, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'P4', encounter_date: '2026-03-10', icd10_all: 'J45.40', cpt_all: '99214', asthma_controller_count: 2, asthma_reliever_count: 1, patient_age: 4, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
  ];
  await insertRecords(records);

  const results = await calculateAllKPIs(1, 2026, 2, null);
  const pc027 = results.find(r => r.code === 'PC027');
  assert.ok(pc027, 'PC027 calculated');
  assert.strictEqual(pc027.denominator, 2, `PC027 den=2 got ${pc027.denominator}`);
  assert.strictEqual(pc027.numerator, 1, `PC027 num=1 got ${pc027.numerator}`);

  await db.close();
  fs.unlinkSync(TEST_DB);
  console.log('  PC027 passed');
}

async function testCalculatePC021() {
  await setupTestDb();
  initDb.__mock = db;
  for (const f of ['../database/db.js','../engine/kpi-calculator','../engine/kpi-registry','../engine/exclusions','../engine/kpi-definitions']) {
    delete require.cache[require.resolve(f)];
  }
  const { calculateAllKPIs } = require('../engine/kpi-calculator');

  const records = [
    makeRecord({ mrn: 'C1', encounter_date: '2026-03-01', icd10_all: 'Z13.4', cpt_all: '96110', patient_age_months: 20, patient_age: null, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'C2', encounter_date: '2026-03-15', icd10_all: null, cpt_all: '99213', patient_age_months: 22, patient_age: null, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'C3', encounter_date: '2026-03-10', icd10_all: 'Z13.4', cpt_all: '96110', patient_age_months: 18, patient_age: null, is_palliative: 1, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'C4', encounter_date: '2026-03-12', icd10_all: 'Z13.4', cpt_all: '96110', patient_age_months: 30, patient_age: null, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
  ];
  await insertRecords(records);

  const results = await calculateAllKPIs(1, 2026, 2, null);
  const pc021 = results.find(r => r.code === 'PC021');
  assert.ok(pc021, 'PC021 calculated');
  assert.strictEqual(pc021.denominator, 2, `PC021 den=2 got ${pc021.denominator}`);
  assert.strictEqual(pc021.numerator, 1, `PC021 num=1 got ${pc021.numerator}`);

  await db.close();
  fs.unlinkSync(TEST_DB);
  console.log('  PC021 passed');
}

async function testCalculatePC025() {
  await setupTestDb();
  initDb.__mock = db;
  for (const f of ['../database/db.js','../engine/kpi-calculator','../engine/kpi-registry','../engine/exclusions','../engine/kpi-definitions']) {
    delete require.cache[require.resolve(f)];
  }
  const { calculateAllKPIs } = require('../engine/kpi-calculator');

  const records = [
    makeRecord({ mrn: 'O1', encounter_date: '2026-03-01', bmi: 28, icd10_all: null, patient_age: 40, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'O2', encounter_date: '2026-03-15', bmi: 22, icd10_all: 'E66.01', patient_age: 45, is_palliative: 0, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
    makeRecord({ mrn: 'O3', encounter_date: '2026-03-10', bmi: 20, icd10_all: null, patient_age: 30, is_palliative: 1, patient_refused: 0, is_abm_mandate: 0, is_thiqa: 0, physician_type: 'GP' }),
  ];
  await insertRecords(records);

  const results = await calculateAllKPIs(1, 2026, 2, null);
  const pc025 = results.find(r => r.code === 'PC025');
  assert.ok(pc025, 'PC025 calculated');
  assert.strictEqual(pc025.denominator, 2, `PC025 den=2 got ${pc025.denominator}`);
  assert.strictEqual(pc025.numerator, 2, `PC025 num=2 got ${pc025.numerator}`);

  await db.close();
  fs.unlinkSync(TEST_DB);
  console.log('  PC025 passed');
}

async function testCalculatePC028Manual() {
  await setupTestDb();
  initDb.__mock = db;
  for (const f of ['../database/db.js','../engine/kpi-calculator','../engine/kpi-registry','../engine/exclusions','../engine/kpi-definitions']) {
    delete require.cache[require.resolve(f)];
  }
  const { calculateAllKPIs } = require('../engine/kpi-calculator');

  await db.run("INSERT INTO manual_kpi_entries (facility_id, kpi_code, year, quarter, numerator, denominator, value) VALUES (?,?,?,?,?,?,?)", [1, 'PC028', 2026, 2, 85, 100, 85]);

  const results = await calculateAllKPIs(1, 2026, 2, null);
  const pc028 = results.find(r => r.code === 'PC028');
  assert.ok(pc028, 'PC028 calculated');
  assert.strictEqual(pc028.value, 85, 'PC028 value');
  assert.strictEqual(pc028.numerator, 85, 'PC028 numerator');

  await db.close();
  fs.unlinkSync(TEST_DB);
  console.log('  PC028 passed');
}

async function testVersionSwitching() {
  await setupTestDb();
  initDb.__mock = db;
  for (const f of ['../database/db.js','../engine/kpi-calculator','../engine/kpi-registry','../engine/exclusions','../engine/kpi-definitions']) {
    delete require.cache[require.resolve(f)];
  }
  const { calculateAllKPIs } = require('../engine/kpi-calculator');

  const v9 = await calculateAllKPIs(1, 2026, 1, null);
  assert.ok(v9.length > 0, 'V9 KPIs for Q1');

  const v1 = await calculateAllKPIs(1, 2026, 3, null);
  assert.ok(v1.length > 0, 'V1 KPIs for Q3');

  assert.strictEqual(v9.length, v1.length, 'Same count across versions');

  await db.close();
  fs.unlinkSync(TEST_DB);
  console.log('  Version switching passed');
}

async function main() {
  console.log('\n🧪 Running KPI Calculator Tests\n');
  await testSanitizeCode();
  await testKpiStatus();
  await testExclusions();
  await testCalculatePC009();
  await testCalculatePC014();
  await testCalculatePC027();
  await testCalculatePC021();
  await testCalculatePC025();
  await testCalculatePC028Manual();
  await testVersionSwitching();
  console.log('\n🎉 All unit tests passed!\n');
}

main().catch(err => { console.error('❌ Test failed:', err); process.exit(1); });