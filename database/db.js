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
      patient_age REAL,
      patient_age_months REAL,
      patient_dob TEXT,
      gender TEXT,
      encounter_date TEXT NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      month INTEGER,
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
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (batch_id) REFERENCES import_batches(id)
    );

    CREATE INDEX IF NOT EXISTS idx_emr_facility_quarter ON emr_data(facility_id, year, quarter);
    CREATE INDEX IF NOT EXISTS idx_emr_mrn ON emr_data(facility_id, mrn);

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
      patient_age REAL,
      patient_dob TEXT,
      gender TEXT,
      encounter_date TEXT NOT NULL,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      month INTEGER,
      physician_type TEXT,
      icd10_primary TEXT,
      icd10_secondary TEXT,
      icd10_all TEXT,
      cpt_all TEXT,
      service_type TEXT,
      insurance_type TEXT,
      hba1c_value REAL,
      egfr_value REAL,
      row_hash TEXT UNIQUE,
      FOREIGN KEY (facility_id) REFERENCES facilities(id),
      FOREIGN KEY (batch_id) REFERENCES import_batches(id)
    );

    CREATE INDEX IF NOT EXISTS idx_shafafiya_facility_quarter ON shafafiya_data(facility_id, year, quarter);

    CREATE TABLE IF NOT EXISTS code_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mapping_type TEXT NOT NULL,
      code_value TEXT NOT NULL,
      code_desc TEXT,
      standard_category TEXT,
      active INTEGER DEFAULT 1,
      UNIQUE(mapping_type, code_value)
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
