const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');
code = code.replace("filters.ABM_EXCL = ` AND (is_abm_mandate = 0 OR is_abm_mandate IS NULL) `;", "filters.ABM_EXCL = ` AND (is_abm_mandate = 0 OR is_abm_mandate IS NULL) `;\n  filters.DEP_EXCL_FILTER = buildLikeOr('icd10_all', dict['Depression_Exc']);\n  filters.BIPOLAR_EXCL_FILTER = buildLikeOr('icd10_all', dict['Bipolar_Exc']);");
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Added DEP_EXCL_FILTER and BIPOLAR_EXCL_FILTER back');
