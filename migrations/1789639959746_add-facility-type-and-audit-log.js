/**
 * Migration: Add facility_type to facilities, add audit_log table, add versioned KPI registry
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // 1. Add facility_type column to facilities (if not exists - already has it but ensure proper values)
  // The column already exists from initial schema, but we ensure it has proper constraint
  pgm.sql(`
    UPDATE facilities SET facility_type = 'Primary Care' 
    WHERE facility_type IS NULL OR facility_type = 'Medical Center';
  `);

  // 2. Add facility_type column to kpi_definitions (already exists, ensure proper values)
  pgm.sql(`
    UPDATE kpi_definitions SET facility_type = 'Both' WHERE facility_type IS NULL;
  `);

  // 3. Create audit_log table for JDC compliance
  pgm.createTable('audit_log', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    table_name: { type: 'TEXT', notNull: true },
    record_id: { type: 'INTEGER', notNull: true },
    action: { type: 'TEXT', notNull: true }, // INSERT, UPDATE, DELETE, CALCULATE, LOCK, UNLOCK, IMPORT
    old_json: { type: 'TEXT' },
    new_json: { type: 'TEXT' },
    user_id: { type: 'TEXT', default: "'local'" },
    user_role: { type: 'TEXT', default: "'admin'" },
    timestamp: { type: 'TEXT', default: 'datetime(\'now\')' },
    description: { type: 'TEXT' }
  });

  pgm.createIndex('audit_log', ['table_name', 'record_id'], { name: 'idx_audit_log_table_record' });
  pgm.createIndex('audit_log', ['timestamp'], { name: 'idx_audit_log_timestamp' });
  pgm.createIndex('audit_log', ['user_id'], { name: 'idx_audit_log_user' });

  // 4. Create versioned KPI registry table
  pgm.createTable('kpi_registry_versions', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    version: { type: 'TEXT', notNull: true, unique: true }, // e.g., v9-2026-q1, v1-2026-q3
    name: { type: 'TEXT', notNull: true },
    effective_from: { type: 'TEXT', notNull: true }, // ISO date
    effective_to: { type: 'TEXT' }, // null = current
    facility_types: { type: 'TEXT', notNull: true }, // JSON array: ["Primary Care", "Medical Center"]
    kpi_codes: { type: 'TEXT', notNull: true }, // JSON array: ["PC004", "PC005", ...]
    description: { type: 'TEXT' },
    created_at: { type: 'TEXT', default: 'datetime(\'now\')' }
  });

  // 5. Seed initial KPI registry versions
  pgm.sql(`
    INSERT INTO kpi_registry_versions (version, name, effective_from, effective_to, facility_types, kpi_codes, description) VALUES
    ('v9-2026-q1', 'Primary Care V9', '2026-01-01', '2026-09-30', 
     '["Primary Care"]', 
     '["PC004","PC005","PC009","PC010","PC011","PC012","PC013","PC014","PC016","PC021","PC023","PC024","PC025","PC026","PC027","PC028","PC029","PC030"]',
     'Primary Care JAWDA Guidance V9 2026 - Effective Q1 2026'),
    ('v1-2026-q3', 'Primary Care & Medical Center V1', '2026-07-01', null,
     '["Primary Care", "Medical Center"]',
     '["PC004","PC005","PC009","PC010","PC011","PC012","PC013","PC014","PC016","PC021","PC023","PC024","PC025","PC026","PC027","PC028","PC029","PC030"]',
     'Primary Care and Medical Center Services JAWDA Guidance V1 2026 - Effective Q3 2026')
    ON CONFLICT(version) DO UPDATE SET
      name=excluded.name,
      effective_from=excluded.effective_from,
      effective_to=excluded.effective_to,
      facility_types=excluded.facility_types,
      kpi_codes=excluded.kpi_codes,
      description=excluded.description;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('kpi_registry_versions');
  pgm.dropTable('audit_log');
  // Note: facility_type columns not removed as they existed before
};