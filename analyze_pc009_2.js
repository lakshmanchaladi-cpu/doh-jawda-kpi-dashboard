const { generateDynamicFilters } = require('./engine/kpi-calculator.js');
const { initDb } = require('./database/db');

(async () => {
  try {
    const db = await initDb();
    const filters = await generateDynamicFilters(db);
    console.log("Filters generated");
    
    const facilityId = 2; const year = 2026; const quarter = 2;
    const lb9  = '2025-07-01'; 
    const qStart = '2026-04-01';
    const lb12 = '2025-07-01';

    const all = (query, params = []) => new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
    });

    const q1 = `
      SELECT DISTINCT mrn FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
        AND patient_age >= 18 AND patient_age <= 75
        AND ${filters.DM_ICD_FILTER}
        AND ${filters.PC_PHY_FILTER}
        AND ${filters.EM_CPT_FILTER}
    `;
    const baseDenom = await all(q1, [facilityId, year, quarter]);
    console.log(`1. Base Q2 Denom (Age 18-75, DM, CPT, PC): ${baseDenom.length}`);

    const q2 = `
      SELECT DISTINCT mrn FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=?
        AND patient_age >= 18 AND patient_age <= 75
        AND ${filters.DM_ICD_FILTER}
        AND ${filters.PC_PHY_FILTER}
        AND ${filters.EM_CPT_FILTER}
        AND mrn IN (
          SELECT mrn FROM locked_audit_records
          WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
            AND ${filters.DM_ICD_FILTER}
          GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
        )
    `;
    const lookbackDenom = await all(q2, [facilityId, year, quarter, facilityId, lb9, qStart]);
    console.log(`2. After 9-month established patient lookback: ${lookbackDenom.length}`);

    const q3 = `
      SELECT DISTINCT mrn FROM locked_audit_records
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
    const finalDenom = await all(q3, [facilityId, year, quarter, facilityId, lb9, qStart]);
    console.log(`3. Final Denominator (after Exclusions): ${finalDenom.length}`);

    const q4 = `
      SELECT COUNT(DISTINCT mrn) as cnt FROM (
        SELECT mrn,
               MAX(CASE WHEN hba1c_date >= ? THEN hba1c_value ELSE NULL END) as latest_hba1c,
               MAX(CASE WHEN hba1c_date >= ? THEN hba1c_date ELSE NULL END) as latest_hba1c_date
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
    `;
    const finalNum = await all(q4, [lb12, lb12, facilityId, facilityId, year, quarter, facilityId, lb9, qStart]);
    console.log(`4. Final Numerator: ${finalNum[0].cnt}`);

  } catch(e) {
    console.error("Error:", e.message);
  }
})();
