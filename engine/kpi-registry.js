/**
 * Versioned KPI Registry
 * Manages multiple KPI versions (V9 Q1 2026, V1 Q3 2026) with facility-type awareness
 */

const { initDb } = require('../database/db');

// Normalize facility type variants so registry matching is robust
const FACILITY_TYPE_SYNONYMS = {
  'primary care center': 'Primary Care',
  'primary healthcare center': 'Primary Care',
  'primary health care center': 'Primary Care',
  'primary care clinic': 'Primary Care',
  'primary care': 'Primary Care',
  'medical center': 'Medical Center',
  'medical centre': 'Medical Center',
  'outpatient center': 'Medical Center',
  'outpatient medical center': 'Medical Center',
};

function normalizeFacilityType(type) {
  const key = String(type || '').toLowerCase().trim();
  return FACILITY_TYPE_SYNONYMS[key] || String(type || '').trim();
}

class KPIRegistry {
  constructor() {
    this.cache = null;
  }

  /**
   * Get the active registry version for a given facility type and quarter
   * @param {string} facilityType - 'Primary Care' | 'Medical Center'
   * @param {number} year
   * @param {number} quarter
   * @param {string|null} version - optional explicit version code override (e.g. 'v1-2026-q3')
   * @returns {Promise<Object>} Registry version object
   */
  async getActiveVersion(facilityType, year, quarter, version = null) {
    const db = await initDb();
    const type = normalizeFacilityType(facilityType);

    // Explicit version override (bypasses date/facility-type resolution)
    if (version) {
      const override = await db.get(
        'SELECT * FROM kpi_registry_versions WHERE version = ?',
        [version]
      );
      if (override) return override;
    }
    
    // Build quarter date for comparison (local time, avoids UTC shift)
    const quarterStart = new Date(year, (quarter - 1) * 3, 1);
    const quarterDate = `${quarterStart.getFullYear()}-${String(quarterStart.getMonth() + 1).padStart(2, '0')}-${String(quarterStart.getDate()).padStart(2, '0')}`;
    
    const versions = await db.all(`
      SELECT * FROM kpi_registry_versions
      WHERE effective_from <= ?
        AND (effective_to IS NULL OR effective_to >= ?)
        AND JSON_EXTRACT(facility_types, '$') LIKE '%' || ? || '%'
      ORDER BY effective_from DESC
      LIMIT 1
    `, [quarterDate, quarterDate, type]);
    
    if (versions.length === 0) {
      // Fallback to latest version
      const fallback = await db.get(`
        SELECT * FROM kpi_registry_versions
        WHERE JSON_EXTRACT(facility_types, '$') LIKE '%' || ? || '%'
        ORDER BY effective_from DESC
        LIMIT 1
      `, [type]);
      return fallback;
    }
    
    return versions[0];
  }

  /**
   * Get all KPI codes for a facility type and quarter
   * @param {string} facilityType
   * @param {number} year
   * @param {number} quarter
   * @param {string|null} version - optional explicit version code override
   * @returns {Promise<string[]>} Array of KPI codes
   */
  async getKPICodes(facilityType, year, quarter, version = null) {
    const type = normalizeFacilityType(facilityType);
    const resolved = await this.getActiveVersion(type, year, quarter, version);
    if (!resolved) return [];

    // An explicit override is authoritative: apply its KPI set regardless of facility type
    try {
      return JSON.parse(resolved.kpi_codes);
    } catch (e) {
      console.error('Failed to parse kpi_codes:', e);
      return [];
    }
  }

  /**
   * Get full registry version details
   * @param {string} facilityType
   * @param {number} year
   * @param {number} quarter
   * @param {string|null} version - optional explicit version code override
   * @returns {Promise<Object|null>}
   */
  async getRegistry(facilityType, year, quarter, version = null) {
    return this.getActiveVersion(facilityType, year, quarter, version);
  }

  /**
   * Get all available registry versions
   * @returns {Promise<Array>}
   */
  async getAllVersions() {
    const db = await initDb();
    return db.all('SELECT * FROM kpi_registry_versions ORDER BY effective_from DESC');
  }

  /**
   * Clear cache (call after registry updates)
   */
  clearCache() {
    this.cache = null;
  }
}

// Singleton instance
const registry = new KPIRegistry();

module.exports = { KPIRegistry, registry };