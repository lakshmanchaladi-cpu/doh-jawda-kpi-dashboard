const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const { KPI_DEFINITIONS } = require('../engine/kpi-definitions');

const DB_PATH = path.join(__dirname, 'kpi_data.db');

let dbInstance = null;

async function initDb() {
  if (dbInstance) return dbInstance;

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON;');
  await db.exec('PRAGMA journal_mode = WAL;');

  // ── Schema ──
  await db.exec(`
    CREATE TABLE IF NOT EXISTS facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mf_no TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      facility_type TEXT DEFAULT 'Medical Center',
      coordinator TEXT DEFAULT '',
      license_no TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS kpi_definitions (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_name TEXT,
      type TEXT,
      domain TEXT NOT NULL,
      indicator_type TEXT,
      description TEXT,
      numerator_desc TEXT,
      denominator_desc TEXT,
      formula TEXT,
      unit TEXT DEFAULT '%',
      target REAL,
      target_dir TEXT DEFAULT 'gte',
      target_note TEXT,
      frequency TEXT DEFAULT 'quarterly',
      data_source TEXT,
      facility_type TEXT DEFAULT 'Both',
      age_min INTEGER,
      age_max INTEGER
    );

    CREATE TABLE IF NOT EXISTS import_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      year INTEGER,
      quarter INTEGER,
      row_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      errors_json TEXT,
      imported_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (facility_id) REFERENCES facilities(id)
    );

    CREATE TABLE IF NOT EXISTS emr_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      batch_id INTEGER,
      mrn TEXT,
      visit_id TEXT,
      patient_name TEXT,
      chief_complaints TEXT,
      physician_plan TEXT,
      narrative_diagnosis TEXT,
      procedure_notes TEXT,
      procedure_remarks TEXT,
      clinical_notes TEXT,
      patient_age REAL,
      patient_age_months REAL,
      patient_dob TEXT,
      gender TEXT,
      encounter_date TEXT NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      month INTEGER,
      physician_id TEXT,
      physician_type TEXT,
      icd10_primary TEXT,
      icd10_secondary TEXT,
      icd10_all TEXT,
      cpt_all TEXT,
      wait_time_mins REAL,
      hba1c_value REAL,
      hba1c_date TEXT,
      bp_systolic REAL,
      bp_diastolic REAL,
      bp_date TEXT,
      phq2_result INTEGER,
      phq9_score REAL,
      phq9_date TEXT,
      phq9_followup_date TEXT,
      depression_dx_date TEXT,
      followup_within_30d INTEGER,
      foot_exam_done INTEGER,
      eye_exam_done INTEGER,
      nephropathy_exam_done INTEGER,
      lipid_profile_done INTEGER,
      egfr_value REAL,
      egfr_date TEXT,
      uacr_done INTEGER,
      bmi REAL,
      autism_screened INTEGER,
      asthma_controller_count INTEGER,
      asthma_reliever_count INTEGER,
      appointment_wait_days INTEGER,
      row_hash TEXT UNIQUE,
      phq9_followup_score REAL,
      is_abm_mandate INTEGER DEFAULT 0,
      insurance_category TEXT,
      physician_category TEXT,
      is_thiqa INTEGER DEFAULT 0,
      is_palliative INTEGER DEFAULT 0,
      patient_refused INTEGER DEFAULT 0,
      visit_type TEXT,
      physician_name TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (batch_id) REFERENCES import_batches(id)
    );

    CREATE INDEX IF NOT EXISTS idx_emr_facility_quarter ON emr_data(facility_id, year, quarter);
    CREATE INDEX IF NOT EXISTS idx_emr_mrn ON emr_data(facility_id, mrn);
    CREATE INDEX IF NOT EXISTS idx_emr_audit_match ON emr_data(facility_id, mrn, encounter_date);

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      mrn TEXT NOT NULL,
      patient_dob TEXT,
      gender TEXT,
      last_encounter_date TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      UNIQUE(facility_id, mrn)
    );

    CREATE TABLE IF NOT EXISTS shafafiya_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      batch_id INTEGER,
      claim_id TEXT,
      mrn TEXT,
      ordering_physician_id TEXT,
      ordering_physician_type TEXT,
      patient_age REAL,
      patient_dob TEXT,
      gender TEXT,
      encounter_date TEXT NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      month INTEGER,
      physician_id TEXT,
      physician_type TEXT,
      icd10_primary TEXT,
      icd10_secondary TEXT,
      icd10_all TEXT,
      cpt_all TEXT,
      service_reference_ids TEXT,
      service_type TEXT,
      insurance_type TEXT,
      insurance_company TEXT,
      loinc_code TEXT,
      loinc_value TEXT,
      loinc_value_type TEXT,
      hba1c_value REAL,
      egfr_value REAL,
      row_hash TEXT UNIQUE,
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (batch_id) REFERENCES import_batches(id)
    );

    CREATE INDEX IF NOT EXISTS idx_shafafiya_facility_quarter ON shafafiya_data(facility_id, year, quarter);
    CREATE INDEX IF NOT EXISTS idx_shafafiya_audit_match ON shafafiya_data(facility_id, mrn, encounter_date);

    CREATE TABLE IF NOT EXISTS shafafiya_claim_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      batch_id INTEGER,
      claim_id TEXT,
      mrn TEXT,
      encounter_date TEXT NOT NULL,
      service_line_no INTEGER,
      cpt_code TEXT,
      service_reference_id TEXT,
      icd10_codes TEXT,
      ordering_physician_id TEXT,
      ordering_physician_type TEXT,
      rendering_physician_id TEXT,
      rendering_physician_type TEXT,
      loinc_code TEXT,
      loinc_value TEXT,
      loinc_value_type TEXT,
      insurance_type TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (batch_id) REFERENCES import_batches(id)
    );

    CREATE INDEX IF NOT EXISTS idx_claim_lines_claim ON shafafiya_claim_lines(facility_id, claim_id);

    CREATE TABLE IF NOT EXISTS code_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mapping_type TEXT NOT NULL,
      group_name TEXT,
      code_type TEXT,
      code TEXT,
      description TEXT,
      target_kpi TEXT,
      code_value TEXT,
      code_desc TEXT,
      standard_category TEXT,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS kpi_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kpi_code TEXT NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER,
      month INTEGER NOT NULL,
      numerator REAL,
      denominator REAL,
      value REAL,
      notes TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(kpi_code, year, month)
    );

    CREATE TABLE IF NOT EXISTS quarter_locks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      is_locked INTEGER DEFAULT 0,
      locked_at DATETIME,
      locked_by TEXT,
      UNIQUE(facility_id, year, quarter)
    );

    CREATE TABLE IF NOT EXISTS locked_audit_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      mrn TEXT,
      encounter_date TEXT,
      patient_age REAL,
      patient_age_months REAL,
      gender TEXT,
      is_palliative INTEGER,
      patient_refused INTEGER,
      phq2_result INTEGER,
      phq9_score INTEGER,
      phq9_date TEXT,
      phq9_followup_date TEXT,
      phq9_followup_score INTEGER,
      depression_dx_date TEXT,
      followup_within_30d INTEGER,
      foot_exam_done INTEGER,
      eye_exam_done INTEGER,
      nephropathy_exam_done INTEGER,
      lipid_profile_done INTEGER,
      egfr_value REAL,
      egfr_date TEXT,
      uacr_done INTEGER,
      bmi REAL,
      bp_systolic REAL,
      bp_diastolic REAL,
      bp_date TEXT,
      autism_screened INTEGER,
      asthma_controller_count INTEGER,
      asthma_reliever_count INTEGER,
      wait_time_mins INTEGER,
      appointment_wait_days INTEGER,
      hba1c_value REAL,
      hba1c_date TEXT,
      patient_dob TEXT,
      month INTEGER,
      visit_type TEXT,
      physician_type TEXT,
      physician_category TEXT,
      icd10_primary TEXT,
      icd10_secondary TEXT,
      icd10_all TEXT,
      cpt_all TEXT,
      insurance_category TEXT,
      is_thiqa INTEGER,
      is_abm_mandate INTEGER
    );

    CREATE TABLE IF NOT EXISTS job_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'calculate_kpi',
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_locked_audit_quarter ON locked_audit_records(facility_id, year, quarter);
    CREATE INDEX IF NOT EXISTS idx_locked_audit_mrn ON locked_audit_records(facility_id, mrn);
    CREATE INDEX IF NOT EXISTS idx_locked_audit_dates ON locked_audit_records(encounter_date);

    CREATE TABLE IF NOT EXISTS kpi_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      kpi_code TEXT NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      numerator REAL,
      denominator REAL,
      value REAL,
      status TEXT,
      notes TEXT,
      calculated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (kpi_code) REFERENCES kpi_definitions(code),
      UNIQUE(facility_id, kpi_code, year, quarter)
    );

    CREATE TABLE IF NOT EXISTS jdc_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      status TEXT DEFAULT 'draft',
      prepared_at TEXT,
      validated_at TEXT,
      submitted_at TEXT,
      ceo_name TEXT,
      ceo_designation TEXT DEFAULT 'Chief Executive Officer',
      ceo_signature_date TEXT,
      notes TEXT,
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      UNIQUE(facility_id, year, quarter)
    );

    CREATE TABLE IF NOT EXISTS manual_kpi_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facility_id INTEGER NOT NULL,
      kpi_code TEXT NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      numerator REAL,
      denominator REAL,
      value REAL,
      notes TEXT,
      entered_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      UNIQUE(facility_id, kpi_code, year, quarter)
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      company_name TEXT DEFAULT 'My Healthcare Consulting',
      active_year INTEGER DEFAULT ${new Date().getFullYear()},
      active_quarter INTEGER DEFAULT ${Math.ceil((new Date().getMonth()+1)/3)},
      active_facility_id INTEGER
    );
  `);

  // V2 Additions for import_batches
  await db.run("ALTER TABLE import_batches ADD COLUMN replaced_count INTEGER DEFAULT 0").catch(()=>{});
  await db.run("ALTER TABLE import_batches ADD COLUMN skipped_count INTEGER DEFAULT 0").catch(()=>{});
  await db.run("ALTER TABLE import_batches ADD COLUMN quarters_json TEXT").catch(()=>{});

  // Seed KPI Definitions
  const kpiCount = await db.get('SELECT COUNT(*) as c FROM kpi_definitions');
  if (kpiCount.c === 0) {
    for (const d of KPI_DEFINITIONS) {
      await db.run(`
        INSERT INTO kpi_definitions (
          code, name, short_name, type, domain, indicator_type, description, numerator_desc,
          denominator_desc, formula, unit, target, target_dir, target_note, frequency, data_source, facility_type, age_min, age_max
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        d.code, d.name, d.short_name || d.name, d.type || '', d.domain, d.indicator_type || '',
        d.description || '', d.numerator_desc || '', d.denominator_desc || '', d.formula || '',
        d.unit || '%', d.target ?? null, d.target_dir || 'gte', d.target_note || null,
        d.frequency || 'quarterly', d.data_source || 'EMR', d.facility_type || 'Both', d.age_min ?? null, d.age_max ?? null
      ]);
    }
    console.log(`✅ Seeded ${KPI_DEFINITIONS.length} JAWDA KPI definitions`);
  }

  const settCount = await db.get('SELECT COUNT(*) as c FROM app_settings');
  if (settCount.c === 0) {
    await db.run('INSERT INTO app_settings (id) VALUES (1)');
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  const schemaVersion = await db.get('SELECT value FROM app_meta WHERE key = ?', ['schema_version']);
  if (!schemaVersion) {
    await db.run('INSERT INTO app_meta (key, value) VALUES (?, ?)', ['schema_version', '1']);
  }

  const mappingColumns = await db.all('PRAGMA table_info(code_mappings)');
  const mappingColumnNames = new Set(mappingColumns.map(col => col.name));
  const requiredMappingColumns = [
    ['group_name', 'TEXT'],
    ['code_type', 'TEXT'],
    ['code', 'TEXT'],
    ['description', 'TEXT'],
    ['target_kpi', 'TEXT'],
    ['code_value', 'TEXT'],
    ['code_desc', 'TEXT'],
    ['standard_category', 'TEXT'],
    ['active', 'INTEGER DEFAULT 1']
  ];

  for (const [columnName, columnDef] of requiredMappingColumns) {
    if (!mappingColumnNames.has(columnName)) {
      await db.exec(`ALTER TABLE code_mappings ADD COLUMN ${columnName} ${columnDef};`);
    }
  }

  for (const tableName of ['emr_data', 'shafafiya_data']) {
    const columns = await db.all(`PRAGMA table_info(${tableName})`);
    if (!columns.some(column => column.name === 'physician_id')) {
      await db.exec(`ALTER TABLE ${tableName} ADD COLUMN physician_id TEXT;`);
      await db.run(`UPDATE ${tableName} SET physician_id = physician_type WHERE physician_id IS NULL OR TRIM(physician_id) = ''`);
    }
  }

  const additionalColumns = {
    emr_data: [
      ['visit_id', 'TEXT'], ['patient_name', 'TEXT'], ['chief_complaints', 'TEXT'],
      ['physician_plan', 'TEXT'], ['narrative_diagnosis', 'TEXT'], ['procedure_notes', 'TEXT'],
      ['procedure_remarks', 'TEXT'], ['clinical_notes', 'TEXT'], ['physician_name', 'TEXT'], ['insurance_company', 'TEXT']
    ],
    shafafiya_data: [
      ['ordering_physician_id', 'TEXT'], ['ordering_physician_type', 'TEXT'],
      ['service_reference_ids', 'TEXT'], ['insurance_company', 'TEXT'],
      ['loinc_code', 'TEXT'], ['loinc_value', 'TEXT'], ['loinc_value_type', 'TEXT']
    ]
  };
  for (const [tableName, columns] of Object.entries(additionalColumns)) {
    const existing = await db.all(`PRAGMA table_info(${tableName})`);
    const names = new Set(existing.map(column => column.name));
    for (const [columnName, columnDef] of columns) {
      if (!names.has(columnName)) await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef};`);
    }
  }

  const legacyIndexRows = await db.all("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'code_mappings' AND name = 'idx_code_mappings_legacy_unique'");
  if (legacyIndexRows.length > 0) {
    await db.exec('DROP INDEX idx_code_mappings_legacy_unique;');
  }

  await db.exec(`
    DELETE FROM code_mappings
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM code_mappings
      GROUP BY mapping_type, COALESCE(group_name, ''), COALESCE(code, ''), COALESCE(code_value, '')
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_code_mappings_unique
      ON code_mappings(mapping_type, COALESCE(group_name, ''), COALESCE(code, ''), COALESCE(code_value, ''));
  `);

  dbInstance = db;
    // 16. Clinician Licenses Dictionary
    await db.exec(`
      CREATE TABLE IF NOT EXISTS clinician_licenses (
        license_number TEXT,
        clinician_name TEXT,
        major TEXT,
        profession TEXT,
        category TEXT,
        facility_name TEXT,
        facility_mf_no TEXT,
        PRIMARY KEY (license_number, facility_mf_no)
      )
    `);

    return db;
}

module.exports = { initDb };
