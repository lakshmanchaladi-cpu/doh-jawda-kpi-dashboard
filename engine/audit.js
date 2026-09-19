/**
 * Audit Trail Utility
 * Logs all critical operations for JDC compliance
 */

const { initDb } = require('../database/db');

const ACTION_TYPES = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  CALCULATE: 'CALCULATE',
  LOCK: 'LOCK',
  UNLOCK: 'UNLOCK',
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
  MANUAL_ENTRY: 'MANUAL_ENTRY',
  SUBMISSION: 'SUBMISSION'
};

/**
 * Log an audit event
 * @param {Object} params
 * @param {string} params.tableName - Table name
 * @param {number|string} params.recordId - Record ID
 * @param {string} params.action - Action type (from ACTION_TYPES)
 * @param {Object|null} params.oldData - Old record data (for UPDATE/DELETE)
 * @param {Object|null} params.newData - New record data (for INSERT/UPDATE)
 * @param {string} params.userId - User ID
 * @param {string} params.userRole - User role
 * @param {string} params.description - Human-readable description
 */
async function logAudit({ tableName, recordId, action, oldData = null, newData = null, userId = 'local', userRole = 'admin', description = '' }) {
  const db = await initDb();
  
  await db.run(`
    INSERT INTO audit_log (table_name, record_id, action, old_json, new_json, user_id, user_role, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    tableName,
    recordId,
    action,
    oldData ? JSON.stringify(oldData) : null,
    newData ? JSON.stringify(newData) : null,
    userId,
    userRole,
    description
  ]);
}

/**
 * Log KPI calculation
 */
async function logKPICalculation(facilityId, year, quarter, kpiCode, result, userId = 'local') {
  const db = await initDb();
  
  await db.run(`
    INSERT INTO audit_log (table_name, record_id, action, new_json, user_id, user_role, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    'kpi_results',
    `${facilityId}-${kpiCode}-${year}-${quarter}`,
    ACTION_TYPES.CALCULATE,
    JSON.stringify({ facilityId, year, quarter, kpiCode, ...result }),
    userId,
    'admin',
    `Calculated KPI ${kpiCode} for facility ${facilityId}, Q${quarter} ${year}: N=${result.numerator}, D=${result.denominator}, V=${result.value}%`
  ]);
}

/**
 * Log quarter lock/unlock
 */
async function logQuarterLock(facilityId, year, quarter, locked, userId = 'local') {
  const db = await initDb();
  
  await db.run(`
    INSERT INTO audit_log (table_name, record_id, action, new_json, user_id, user_role, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    'quarter_locks',
    `${facilityId}-${year}-${quarter}`,
    locked ? ACTION_TYPES.LOCK : ACTION_TYPES.UNLOCK,
    JSON.stringify({ facilityId, year, quarter, is_locked: locked ? 1 : 0 }),
    userId,
    'admin',
    `${locked ? 'Locked' : 'Unlocked'} quarter Q${quarter} ${year} for facility ${facilityId}`
  ]);
}

/**
 * Log data import
 */
async function logImport(batchId, facilityId, fileType, year, quarter, rowCount, userId = 'local') {
  const db = await initDb();
  
  await db.run(`
    INSERT INTO audit_log (table_name, record_id, action, new_json, user_id, user_role, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    'import_batches',
    batchId,
    ACTION_TYPES.IMPORT,
    JSON.stringify({ batchId, facilityId, fileType, year, quarter, rowCount }),
    userId,
    'admin',
    `Imported ${fileType} data: batch ${batchId}, facility ${facilityId}, Q${quarter} ${year}, ${rowCount} rows`
  ]);
}

/**
 * Log manual KPI entry
 */
async function logManualEntry(facilityId, kpiCode, year, quarter, value, numerator, denominator, userId = 'local') {
  const db = await initDb();
  
  await db.run(`
    INSERT INTO audit_log (table_name, record_id, action, new_json, user_id, user_role, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    'manual_kpi_entries',
    `${facilityId}-${kpiCode}-${year}-${quarter}`,
    ACTION_TYPES.MANUAL_ENTRY,
    JSON.stringify({ facilityId, kpiCode, year, quarter, value, numerator, denominator }),
    userId,
    'admin',
    `Manual entry for KPI ${kpiCode}: facility ${facilityId}, Q${quarter} ${year}, value=${value}`
  ]);
}

/**
 * Get audit trail for a record
 */
async function getAuditTrail(tableName, recordId, limit = 100) {
  const db = await initDb();
  
  return db.all(`
    SELECT * FROM audit_log
    WHERE table_name = ? AND record_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `, [tableName, recordId, limit]);
}

/**
 * Get audit trail for a facility/quarter
 */
async function getAuditTrailByFacilityQuarter(facilityId, year, quarter, limit = 200) {
  const db = await initDb();
  
  return db.all(`
    SELECT * FROM audit_log
    WHERE (new_json LIKE ? OR old_json LIKE ?)
    ORDER BY timestamp DESC
    LIMIT ?
  `, [`%${facilityId}-${year}-${quarter}%`, `%${facilityId}-${year}-${quarter}%`, limit]);
}

module.exports = { logAudit, logKPICalculation, logQuarterLock, logImport, logManualEntry, getAuditTrail, getAuditTrailByFacilityQuarter, ACTION_TYPES };