/**
 * Initial schema migration for DOH JAWDA KPI Dashboard
 * Captures the current database schema as of 2026-09-17
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Enable foreign keys and WAL mode
  pgm.sql('PRAGMA foreign_keys = ON;');
  pgm.sql('PRAGMA journal_mode = WAL;');

  // ── Core Tables ──

  pgm.createTable('facilities', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    mf_no: { type: 'TEXT', notNull: true, unique: true },
    name: { type: 'TEXT', notNull: true },
    facility_type: { type: 'TEXT', default: 'Medical Center' },
    coordinator: { type: 'TEXT', default: '' },
    license_no: { type: 'TEXT', default: '' },
    phone: { type: 'TEXT', default: '' },
    active: { type: 'INTEGER', default: 1 },
    created_at: { type: 'TEXT', default: 'datetime(\'now\')' }
  });

  pgm.createTable('kpi_definitions', {
    code: { type: 'TEXT', primaryKey: true },
    name: { type: 'TEXT', notNull: true },
    short_name: { type: 'TEXT' },
    type: { type: 'TEXT' },
    domain: { type: 'TEXT', notNull: true },
    indicator_type: { type: 'TEXT' },
    description: { type: 'TEXT' },
    numerator_desc: { type: 'TEXT' },
    denominator_desc: { type: 'TEXT' },
    formula: { type: 'TEXT' },
    unit: { type: 'TEXT', default: "'%'" },
    target: { type: 'REAL' },
    target_dir: { type: 'TEXT', default: "'gte'" },
    target_note: { type: 'TEXT' },
    frequency: { type: 'TEXT', default: "'quarterly'" },
    data_source: { type: 'TEXT' },
    facility_type: { type: 'TEXT', default: "'Both'" },
    age_min: { type: 'INTEGER' },
    age_max: { type: 'INTEGER' }
  });

  pgm.createTable('import_batches', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    facility_id: { type: 'INTEGER', notNull: true, references: 'facilities', onDelete: 'CASCADE' },
    file_name: { type: 'TEXT', notNull: true },
    file_type: { type: 'TEXT', notNull: true },
    year: { type: 'INTEGER' },
    quarter: { type: 'INTEGER' },
    row_count: { type: 'INTEGER', default: 0 },
    error_count: { type: 'INTEGER', default: 0 },
    status: { type: 'TEXT', default: "'pending'" },
    errors_json: { type: 'TEXT' },
    imported_at: { type: 'TEXT', default: 'datetime(\'now\')' }
  });

  pgm.createTable('emr_data', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    facility_id: { type: 'INTEGER', notNull: true, references: 'facilities', onDelete: 'CASCADE' },
    batch_id: { type: 'INTEGER', references: 'import_batches', onDelete: 'SET NULL' },
    mrn: { type: 'TEXT' },
    visit_id: { type: 'TEXT' },
    patient_name: { type: 'TEXT' },
    chief_complaints: { type: 'TEXT' },
    physician_plan: { type: 'TEXT' },
    narrative_diagnosis: { type: 'TEXT' },
    procedure_notes: { type: 'TEXT' },
    procedure_remarks: { type: 'TEXT' },
    clinical_notes: { type: 'TEXT' },
    patient_age: { type: 'REAL' },
    patient_age_months: { type: 'REAL' },
    patient_dob: { type: 'TEXT' },
    gender: { type: 'TEXT' },
    encounter_date: { type: 'TEXT', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    quarter: { type: 'INTEGER', notNull: true },
    month: { type: 'INTEGER' },
    physician_id: { type: 'TEXT' },
    physician_type: { type: 'TEXT' },
    icd10_primary: { type: 'TEXT' },
    icd10_secondary: { type: 'TEXT' },
    icd10_all: { type: 'TEXT' },
    cpt_all: { type: 'TEXT' },
    wait_time_mins: { type: 'REAL' },
    hba1c_value: { type: 'REAL' },
    hba1c_date: { type: 'TEXT' },
    bp_systolic: { type: 'REAL' },
    bp_diastolic: { type: 'REAL' },
    bp_date: { type: 'TEXT' },
    phq2_result: { type: 'INTEGER' },
    phq9_score: { type: 'REAL' },
    phq9_date: { type: 'TEXT' },
    phq9_followup_date: { type: 'TEXT' },
    depression_dx_date: { type: 'TEXT' },
    followup_within_30d: { type: 'INTEGER' },
    foot_exam_done: { type: 'INTEGER' },
    eye_exam_done: { type: 'INTEGER' },
    nephropathy_exam_done: { type: 'INTEGER' },
    lipid_profile_done: { type: 'INTEGER' },
    egfr_value: { type: 'REAL' },
    egfr_date: { type: 'TEXT' },
    uacr_done: { type: 'INTEGER' },
    bmi: { type: 'REAL' },
    autism_screened: { type: 'INTEGER' },
    asthma_controller_count: { type: 'INTEGER' },
    asthma_reliever_count: { type: 'INTEGER' },
    appointment_wait_days: { type: 'INTEGER' },
    row_hash: { type: 'TEXT', unique: true },
    phq9_followup_score: { type: 'REAL' },
    is_abm_mandate: { type: 'INTEGER', default: 0 },
    insurance_category: { type: 'TEXT' },
    physician_category: { type: 'TEXT' },
    is_thiqa: { type: 'INTEGER', default: 0 },
    is_palliative: { type: 'INTEGER', default: 0 },
    patient_refused: { type: 'INTEGER', default: 0 },
    visit_type: { type: 'TEXT' },
    physician_name: { type: 'TEXT' }
  });

  pgm.createIndex('emr_data', ['facility_id', 'year', 'quarter'], { name: 'idx_emr_facility_quarter' });
  pgm.createIndex('emr_data', ['facility_id', 'mrn'], { name: 'idx_emr_mrn' });
  pgm.createIndex('emr_data', ['facility_id', 'mrn', 'encounter_date'], { name: 'idx_emr_audit_match' });

  pgm.createTable('patients', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    facility_id: { type: 'INTEGER', notNull: true, references: 'facilities', onDelete: 'CASCADE' },
    mrn: { type: 'TEXT', notNull: true },
    patient_dob: { type: 'TEXT' },
    gender: { type: 'TEXT' },
    last_encounter_date: { type: 'TEXT' }
  }, { constraints: { unique: ['facility_id', 'mrn'] } });

  pgm.createTable('shafafiya_data', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    facility_id: { type: 'INTEGER', notNull: true, references: 'facilities', onDelete: 'CASCADE' },
    batch_id: { type: 'INTEGER', references: 'import_batches', onDelete: 'SET NULL' },
    claim_id: { type: 'TEXT' },
    mrn: { type: 'TEXT' },
    ordering_physician_id: { type: 'TEXT' },
    ordering_physician_type: { type: 'TEXT' },
    patient_age: { type: 'REAL' },
    patient_dob: { type: 'TEXT' },
    gender: { type: 'TEXT' },
    encounter_date: { type: 'TEXT', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    quarter: { type: 'INTEGER', notNull: true },
    month: { type: 'INTEGER' },
    physician_id: { type: 'TEXT' },
    physician_type: { type: 'TEXT' },
    icd10_primary: { type: 'TEXT' },
    icd10_secondary: { type: 'TEXT' },
    icd10_all: { type: 'TEXT' },
    cpt_all: { type: 'TEXT' },
    service_reference_ids: { type: 'TEXT' },
    service_type: { type: 'TEXT' },
    insurance_type: { type: 'TEXT' },
    insurance_company: { type: 'TEXT' },
    loinc_code: { type: 'TEXT' },
    loinc_value: { type: 'TEXT' },
    loinc_value_type: { type: 'TEXT' },
    hba1c_value: { type: 'REAL' },
    egfr_value: { type: 'REAL' },
    row_hash: { type: 'TEXT', unique: true }
  });

  pgm.createIndex('shafafiya_data', ['facility_id', 'year', 'quarter'], { name: 'idx_shafafiya_facility_quarter' });
  pgm.createIndex('shafafiya_data', ['facility_id', 'mrn', 'encounter_date'], { name: 'idx_shafafiya_audit_match' });

  pgm.createTable('shafafiya_claim_lines', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    facility_id: { type: 'INTEGER', notNull: true, references: 'facilities', onDelete: 'CASCADE' },
    batch_id: { type: 'INTEGER', references: 'import_batches', onDelete: 'SET NULL' },
    claim_id: { type: 'TEXT' },
    mrn: { type: 'TEXT' },
    encounter_date: { type: 'TEXT', notNull: true },
    service_line_no: { type: 'INTEGER' },
    cpt_code: { type: 'TEXT' },
    service_reference_id: { type: 'TEXT' },
    icd10_codes: { type: 'TEXT' },
    ordering_physician_id: { type: 'TEXT' },
    ordering_physician_type: { type: 'TEXT' },
    rendering_physician_id: { type: 'TEXT' },
    rendering_physician_type: { type: 'TEXT' },
    loinc_code: { type: 'TEXT' },
    loinc_value: { type: 'TEXT' },
    loinc_value_type: { type: 'TEXT' },
    insurance_type: { type: 'TEXT' }
  });

  pgm.createIndex('shafafiya_claim_lines', ['facility_id', 'claim_id'], { name: 'idx_claim_lines_claim' });

  pgm.createTable('code_mappings', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    mapping_type: { type: 'TEXT', notNull: true },
    group_name: { type: 'TEXT' },
    code_type: { type: 'TEXT' },
    code: { type: 'TEXT' },
    description: { type: 'TEXT' },
    target_kpi: { type: 'TEXT' },
    code_value: { type: 'TEXT' },
    code_desc: { type: 'TEXT' },
    standard_category: { type: 'TEXT' },
    active: { type: 'INTEGER', default: 1 }
  });

  pgm.createTable('kpi_data', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    kpi_code: { type: 'TEXT', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    quarter: { type: 'INTEGER' },
    month: { type: 'INTEGER', notNull: true },
    numerator: { type: 'REAL' },
    denominator: { type: 'REAL' },
    value: { type: 'REAL' },
    notes: { type: 'TEXT' },
    updated_at: { type: 'TEXT', default: 'datetime(\'now\')' }
  }, { constraints: { unique: ['kpi_code', 'year', 'month'] } });

  pgm.createTable('quarter_locks', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    facility_id: { type: 'INTEGER', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    quarter: { type: 'INTEGER', notNull: true },
    is_locked: { type: 'INTEGER', default: 0 },
    locked_at: { type: 'TEXT' },
    locked_by: { type: 'TEXT' }
  }, { constraints: { unique: ['facility_id', 'year', 'quarter'] } });

  pgm.createTable('locked_audit_records', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    facility_id: { type: 'INTEGER', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    quarter: { type: 'INTEGER', notNull: true },
    mrn: { type: 'TEXT' },
    encounter_date: { type: 'TEXT' },
    patient_age: { type: 'REAL' },
    patient_age_months: { type: 'REAL' },
    gender: { type: 'TEXT' },
    is_palliative: { type: 'INTEGER' },
    patient_refused: { type: 'INTEGER' },
    phq2_result: { type: 'INTEGER' },
    phq9_score: { type: 'INTEGER' },
    phq9_date: { type: 'TEXT' },
    phq9_followup_date: { type: 'TEXT' },
    phq9_followup_score: { type: 'INTEGER' },
    depression_dx_date: { type: 'TEXT' },
    followup_within_30d: { type: 'INTEGER' },
    foot_exam_done: { type: 'INTEGER' },
    eye_exam_done: { type: 'INTEGER' },
    nephropathy_exam_done: { type: 'INTEGER' },
    lipid_profile_done: { type: 'INTEGER' },
    egfr_value: { type: 'REAL' },
    egfr_date: { type: 'TEXT' },
    uacr_done: { type: 'INTEGER' },
    bmi: { type: 'REAL' },
    bp_systolic: { type: 'REAL' },
    bp_diastolic: { type: 'REAL' },
    bp_date: { type: 'TEXT' },
    autism_screened: { type: 'INTEGER' },
    asthma_controller_count: { type: 'INTEGER' },
    asthma_reliever_count: { type: 'INTEGER' },
    wait_time_mins: { type: 'INTEGER' },
    appointment_wait_days: { type: 'INTEGER' },
    hba1c_value: { type: 'REAL' },
    hba1c_date: { type: 'TEXT' },
    patient_dob: { type: 'TEXT' },
    month: { type: 'INTEGER' },
    visit_type: { type: 'TEXT' },
    physician_type: { type: 'TEXT' },
    physician_category: { type: 'TEXT' },
    icd10_primary: { type: 'TEXT' },
    icd10_secondary: { type: 'TEXT' },
    icd10_all: { type: 'TEXT' },
    cpt_all: { type: 'TEXT' },
    insurance_category: { type: 'TEXT' },
    is_thiqa: { type: 'INTEGER' },
    is_abm_mandate: { type: 'INTEGER' }
  });

  pgm.createTable('kpi_results', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    facility_id: { type: 'INTEGER', notNull: true, references: 'facilities', onDelete: 'CASCADE' },
    kpi_code: { type: 'TEXT', notNull: true, references: 'kpi_definitions', onDelete: 'CASCADE' },
    year: { type: 'INTEGER', notNull: true },
    quarter: { type: 'INTEGER', notNull: true },
    numerator: { type: 'REAL' },
    denominator: { type: 'REAL' },
    value: { type: 'REAL' },
    status: { type: 'TEXT' },
    notes: { type: 'TEXT' },
    calculated_at: { type: 'TEXT', default: 'datetime(\'now\')' }
  }, { constraints: { unique: ['facility_id', 'kpi_code', 'year', 'quarter'] } });

  pgm.createTable('manual_kpi_entries', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    facility_id: { type: 'INTEGER', notNull: true, references: 'facilities', onDelete: 'CASCADE' },
    kpi_code: { type: 'TEXT', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    quarter: { type: 'INTEGER', notNull: true },
    numerator: { type: 'REAL' },
    denominator: { type: 'REAL' },
    value: { type: 'REAL' },
    notes: { type: 'TEXT' },
    entered_at: { type: 'TEXT', default: 'datetime(\'now\')' }
  }, { constraints: { unique: ['facility_id', 'kpi_code', 'year', 'quarter'] } });

  pgm.createTable('app_settings', {
    id: { type: 'INTEGER', primaryKey: true, default: 1 },
    company_name: { type: 'TEXT', default: "'My Healthcare Consulting'" },
    active_year: { type: 'INTEGER', default: new Date().getFullYear() },
    active_quarter: { type: 'INTEGER', default: Math.ceil((new Date().getMonth() + 1) / 3) },
    active_facility_id: { type: 'INTEGER' }
  });

  pgm.createTable('app_meta', {
    key: { type: 'TEXT', primaryKey: true },
    value: { type: 'TEXT' }
  });

  pgm.createTable('clinician_licenses', {
    license_number: { type: 'TEXT', notNull: true },
    clinician_name: { type: 'TEXT' },
    major: { type: 'TEXT' },
    profession: { type: 'TEXT' },
    category: { type: 'TEXT' },
    facility_name: { type: 'TEXT' },
    facility_mf_no: { type: 'TEXT' }
  }, { constraints: { primaryKey: ['license_number', 'facility_mf_no'] } });

  pgm.createTable('manual_kpi_entries', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    facility_id: { type: 'INTEGER', notNull: true, references: 'facilities', onDelete: 'CASCADE' },
    kpi_code: { type: 'TEXT', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    quarter: { type: 'INTEGER', notNull: true },
    numerator: { type: 'REAL' },
    denominator: { type: 'REAL' },
    value: { type: 'REAL' },
    notes: { type: 'TEXT' },
    entered_at: { type: 'TEXT', default: pgm.func('datetime(\'now\')') }
  }, { constraints: { unique: ['facility_id', 'kpi_code', 'year', 'quarter'] } });

  pgm.createTable('app_settings', {
    id: { type: 'INTEGER', primaryKey: true, default: 1 },
    company_name: { type: 'TEXT', default: 'My Healthcare Consulting' },
    active_year: { type: 'INTEGER', default: new Date().getFullYear() },
    active_quarter: { type: 'INTEGER', default: Math.ceil((new Date().getMonth() + 1) / 3) },
    active_facility_id: { type: 'INTEGER' }
  });

  pgm.createTable('app_meta', {
    key: { type: 'TEXT', primaryKey: true },
    value: { type: 'TEXT' }
  });

  pgm.createTable('clinician_licenses', {
    license_number: { type: 'TEXT', notNull: true },
    clinician_name: { type: 'TEXT' },
    major: { type: 'TEXT' },
    profession: { type: 'TEXT' },
    category: { type: 'TEXT' },
    facility_name: { type: 'TEXT' },
    facility_mf_no: { type: 'TEXT' }
  }, { constraints: { primaryKey: ['license_number', 'facility_mf_no'] } });

  // Seed initial app_settings
  pgm.sql(`INSERT INTO app_settings (id) VALUES (1) ON CONFLICT DO NOTHING;`);
  pgm.sql(`INSERT INTO app_meta (key, value) VALUES ('schema_version', '1') ON CONFLICT DO NOTHING;`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('clinician_licenses');
  pgm.dropTable('app_meta');
  pgm.dropTable('app_settings');
  pgm.dropTable('manual_kpi_entries');
  pgm.dropTable('kpi_results');
  pgm.dropTable('locked_audit_records');
  pgm.dropTable('quarter_locks');
  pgm.dropTable('kpi_data');
  pgm.dropTable('code_mappings');
  pgm.dropTable('shafafiya_claim_lines');
  pgm.dropTable('shafafiya_data');
  pgm.dropTable('patients');
  pgm.dropTable('emr_data');
  pgm.dropTable('import_batches');
  pgm.dropTable('kpi_definitions');
  pgm.dropTable('facilities');
};