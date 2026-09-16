const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// Replace the DM_EXCL line
const targetDMExcl = `// "?"?"? Gestational diabetes exclusion (O24.4x) per V9 "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?
const DM_EXCL = \`AND icd10_primary NOT LIKE 'O24.4%' AND (icd10_all NOT LIKE '%O24.4%' OR icd10_all IS NULL)\`;`;

const repDMExcl = `// DOH Jawda Diabetes Exclusions (Gestational, Polycystic, Steroid-induced)
const DM_EXCL = \`
  AND (icd10_all NOT LIKE '%O24.4%' OR icd10_all IS NULL)
  AND (icd10_all NOT LIKE '%E28.2%' OR icd10_all IS NULL)
  AND (icd10_all NOT LIKE '%E09%' OR icd10_all IS NULL)
\`;`;

if (code.includes('O24.4%')) {
  // It might not match the exact comment string due to charset issues in the comment
  const regexDMExcl = /\/\/.*?Gestational diabetes exclusion.*?\nconst DM_EXCL = `.*?`;/g;
  code = code.replace(regexDMExcl, repDMExcl);
}

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed DM_EXCL logic');
