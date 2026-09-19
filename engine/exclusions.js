/**
 * Exclusions Engine
 * Centralized exclusion logic for all JAWDA KPIs
 * Based on DOH JAWDA Primary Care V9 & V1 2026 Guidance
 */

const { initDb } = require('../database/db');

/**
 * Build standard exclusion WHERE clause for a KPI
 * @param {Object} db - Database connection
 * @param {string} kpiCode - KPI code
 * @param {Object} filters - Dynamic filters from generateDynamicFilters
 * @returns {Promise<string>} SQL WHERE clause for exclusions
 */
async function buildExclusionClause(db, kpiCode, filters) {
  const exclusions = [];

  // 1. ABM Mandate Exclusion - Applies to ALL chronic disease KPIs
  const chronicDiseaseKPIs = ['PC009','PC010','PC011','PC012','PC013','PC014','PC016','PC021','PC023','PC024','PC025','PC026','PC027','PC029'];
  if (chronicDiseaseKPIs.includes(kpiCode)) {
    exclusions.push(filters.ABM_EXCL || "AND (is_abm_mandate = 0 OR is_abm_mandate IS NULL)");
  }

  // 2. Pregnancy Exclusion - Applies to most chronic disease KPIs
  // Note: PC009-PC013 exclude pregnancy-related DM (Gestational)
  // PC014, PC016, PC023 exclude all pregnancy
  const pregnancyExclKPIs = ['PC009','PC010','PC011','PC012','PC013','PC014','PC016','PC023','PC024','PC025','PC029'];
  if (pregnancyExclKPIs.includes(kpiCode)) {
    // Use the dynamic filter if available, otherwise build from code_mappings
    if (filters.DM_EXCL && kpiCode.startsWith('PC00')) {
      exclusions.push(filters.DM_EXCL);
    } else if (filters.HTN_EXCL && kpiCode.startsWith('PC01')) {
      exclusions.push(filters.HTN_EXCL);
    } else {
      // Generic pregnancy exclusion
      exclusions.push("AND icd10_all NOT LIKE '%O%'");
    }
  }

  // 3. ESRD Exclusion - HTN KPIs only (PC014, PC016, PC023)
  const esrdKPIs = ['PC014','PC016','PC023'];
  if (esrdKPIs.includes(kpiCode)) {
    exclusions.push(filters.HTN_EXCL || "AND icd10_all NOT LIKE '%N18.6%'");
  }

  // 4. Renal Transplant Exclusion - HTN KPIs only
  if (esrdKPIs.includes(kpiCode)) {
    exclusions.push("AND icd10_all NOT LIKE '%Z94.0%'");
  }

  // 5. Gestational DM Exclusion - DM KPIs only (PC009-PC013)
  const dmKPIs = ['PC009','PC010','PC011','PC012','PC013'];
  if (dmKPIs.includes(kpiCode)) {
    exclusions.push(filters.DM_EXCL || "AND icd10_all NOT LIKE '%O24.4%'");
  }

  // 6. PCOS Exclusion - DM KPIs only
  if (dmKPIs.includes(kpiCode)) {
    exclusions.push("AND icd10_all NOT LIKE '%E28.2%'");
  }

  // 7. Steroid-induced DM Exclusion - DM KPIs only
  if (dmKPIs.includes(kpiCode)) {
    exclusions.push("AND icd10_all NOT LIKE '%E09%'");
  }

  // 8. Bipolar Exclusion - Mental Health KPIs (PC004, PC005)
  const mhKPIs = ['PC004','PC005'];
  if (mhKPIs.includes(kpiCode)) {
    exclusions.push(filters.BIPOLAR_EXCL_FILTER || "AND icd10_all NOT LIKE '%F31.%'");
  }

  // 9. Palliative Care Exclusion - Applies to most KPIs
  const palliativeExclKPIs = ['PC004','PC005','PC009','PC010','PC011','PC012','PC013','PC014','PC016','PC021','PC023','PC024','PC025','PC026','PC027','PC029'];
  if (palliativeExclKPIs.includes(kpiCode)) {
    exclusions.push("AND (is_palliative = 0 OR is_palliative IS NULL)");
  }

  // 10. Patient Refused Exclusion - Applies to most KPIs
  if (palliativeExclKPIs.includes(kpiCode)) {
    exclusions.push("AND (patient_refused = 0 OR patient_refused IS NULL)");
  }

  // 11. Asthma Exclusions - PC027 only
  if (kpiCode === 'PC027') {
    exclusions.push(filters.ASTHMA_EXCL || "AND NOT (icd10_all LIKE '%J43%' OR icd10_all LIKE '%J44%' OR icd10_all LIKE '%E84.0%' OR icd10_all LIKE '%J96.0%')");
  }

  // 12. Dialysis Exclusion - HTN KPIs (PC014, PC016)
  if (['PC014','PC016'].includes(kpiCode)) {
    exclusions.push("AND cpt_all NOT LIKE '%90935%' AND cpt_all NOT LIKE '%90937%' AND cpt_all NOT LIKE '%90945%' AND cpt_all NOT LIKE '%90947%'");
  }

  return exclusions.length > 0 ? exclusions.join(' ') : '';
}

/**
 * Get exclusion descriptions for documentation/audit
 * @param {string} kpiCode - KPI code
 * @returns {string[]} Array of exclusion descriptions
 */
function getExclusionDescriptions(kpiCode) {
  const descriptions = [];

  const chronicDiseaseKPIs = ['PC009','PC010','PC011','PC012','PC013','PC014','PC016','PC021','PC023','PC024','PC025','PC026','PC027','PC029'];
  if (chronicDiseaseKPIs.includes(kpiCode)) {
    descriptions.push('ABM Mandate patients excluded');
  }

  const pregnancyExclKPIs = ['PC009','PC010','PC011','PC012','PC013','PC014','PC016','PC023','PC024','PC025','PC029'];
  if (pregnancyExclKPIs.includes(kpiCode)) {
    descriptions.push('Pregnancy-related diagnoses excluded');
  }

  const esrdKPIs = ['PC014','PC016','PC023'];
  if (esrdKPIs.includes(kpiCode)) {
    descriptions.push('ESRD (N18.6) excluded');
    descriptions.push('Renal transplant (Z94.0) excluded');
  }

  const dmKPIs = ['PC009','PC010','PC011','PC012','PC013'];
  if (dmKPIs.includes(kpiCode)) {
    descriptions.push('Gestational DM (O24.4) excluded');
    descriptions.push('PCOS (E28.2) excluded');
    descriptions.push('Steroid-induced DM (E09) excluded');
  }

  const mhKPIs = ['PC004','PC005'];
  if (mhKPIs.includes(kpiCode)) {
    descriptions.push('Bipolar disorder (F31) excluded');
  }

  const palliativeExclKPIs = ['PC004','PC005','PC009','PC010','PC011','PC012','PC013','PC014','PC016','PC021','PC023','PC024','PC025','PC026','PC027','PC029'];
  if (palliativeExclKPIs.includes(kpiCode)) {
    descriptions.push('Palliative care patients excluded');
    descriptions.push('Patient refused excluded');
  }

  if (kpiCode === 'PC027') {
    descriptions.push('COPD/CF/Bronchiectasis/Respiratory failure excluded');
  }

  if (['PC014','PC016'].includes(kpiCode)) {
    descriptions.push('Dialysis patients excluded');
  }

  return descriptions;
}

module.exports = { buildExclusionClause, getExclusionDescriptions };