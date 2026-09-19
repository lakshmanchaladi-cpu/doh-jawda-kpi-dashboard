/**
 * Migration: Schema cleanup - remove redundant tables
 * Removes: kpi_data (old), facility (singular), patient_measurements
 * Keeps: kpi_results (new), facilities (plural)
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Drop redundant tables
  pgm.dropTable('kpi_data');
  pgm.dropTable('facility');
  pgm.dropTable('patient_measurements');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Recreate tables if needed (basic structure only)
  pgm.createTable('patient_measurements', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true }
  });
  
  pgm.createTable('facility', {
    id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
    name: { type: 'TEXT' },
    license_no: { type: 'TEXT' },
    coordinator: { type: 'TEXT' },
    active_year: { type: 'INTEGER' },
    active_quarter: { type: 'INTEGER' }
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
    created_at: { type: 'TEXT' },
    updated_at: { type: 'TEXT' }
  });
};