const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// 1. Remove the old static constants at the top
const constRegex = /const PC_PHY_FILTER = [\s\S]*?const ABM_EXCL = `AND \(is_abm_mandate = 0 OR is_abm_mandate IS NULL\)`;/g;
code = code.replace(constRegex, `
// Filters are now generated dynamically in calculateAllKPIs
`);

// 2. Add generateDynamicFilters function
const dynamicFunc = `
async function generateDynamicFilters(db) {
  const mapRows = await db.all("SELECT group_name, code FROM code_mappings");
  const dict = {};
  for (let r of mapRows) {
    if(!dict[r.group_name]) dict[r.group_name] = [];
    dict[r.group_name].push(r.code.toUpperCase().trim());
  }

  function buildLikeOr(col, codes) {
    if (!codes || codes.length === 0) return '(1=0)';
    const conds = codes.map(c => \`\${col} LIKE '%\${c}%'\`);
    return '(' + conds.join(' OR ') + ')';
  }
  function buildLikeAndNot(col, codes) {
    if (!codes || codes.length === 0) return '';
    const conds = codes.map(c => \`\${col} NOT LIKE '%\${c}%'\`);
    return ' AND (' + conds.join(' AND ') + ')';
  }

  const filters = {};

  // DM Inclusions
  filters.DM_ICD_FILTER = buildLikeOr('icd10_all', dict['DM_Inclusion']);
  // DM Exclusions (Gestational, PCOS, Pregnancy)
  let dmExc = [];
  if(dict['DM_Gestational']) dmExc.push(...dict['DM_Gestational']);
  if(dict['DM_PCOS']) dmExc.push(...dict['DM_PCOS']);
  if(dict['Pregnancy_Exc']) dmExc.push(...dict['Pregnancy_Exc']);
  filters.DM_EXCL = buildLikeAndNot('icd10_all', dmExc);

  // HTN Inclusions
  filters.HTN_ICD_FILTER = buildLikeOr('icd10_all', dict['HTN_Inclusion']);
  // HTN Exclusions (ESRD, Transplant, Pregnancy)
  let htnExc = [];
  if(dict['HTN_ESRD']) htnExc.push(...dict['HTN_ESRD']);
  if(dict['HTN_Transplant']) htnExc.push(...dict['HTN_Transplant']);
  if(dict['Pregnancy_Exc']) htnExc.push(...dict['Pregnancy_Exc']);
  filters.HTN_EXCL = buildLikeAndNot('icd10_all', htnExc);

  // ABM Exclusions
  filters.ABM_EXCL = \` AND (is_abm_mandate = 0 OR is_abm_mandate IS NULL) \`;

  // EM CPT Filter
  filters.EM_CPT_FILTER = buildLikeOr('cpt_all', dict['Valid_EM']);

  // PC_PHY_FILTER using clinician_licenses!
  // If physician_type explicitly matches the string in PC_Valid, OR if it's a license number in clinician_licenses that maps to a PC profession
  filters.PC_PHY_FILTER = \`(
    UPPER(TRIM(physician_type)) IN (SELECT UPPER(TRIM(code)) FROM code_mappings WHERE group_name = 'PC_Valid')
    OR physician_type IN (SELECT license_number FROM clinician_licenses WHERE category IN ('General Practitioner', 'Family Medicine', 'Internal Medicine') OR profession IN ('General Practitioner', 'Family Medicine', 'Internal Medicine'))
  )\`;

  filters.PC_PHY_PAED_FILTER = \`(
    UPPER(TRIM(physician_type)) IN (SELECT UPPER(TRIM(code)) FROM code_mappings WHERE group_name IN ('PC_Valid', 'PC_Paed'))
    OR physician_type IN (SELECT license_number FROM clinician_licenses WHERE category IN ('General Practitioner', 'Family Medicine', 'Internal Medicine', 'Pediatrics') OR profession IN ('General Practitioner', 'Family Medicine', 'Internal Medicine', 'Pediatrics'))
  )\`;

  return filters;
}
`;

// Insert after codesOverlap
code = code.replace(/function codesOverlap.*?}/s, dynamicFunc);

// 3. Update function signatures
code = code.replace(/async function calc_([A-Z0-9_]+)\(db, facilityId, year, quarter\)/g, "async function calc_$1(db, facilityId, year, quarter, filters)");

// 4. Update the template literals everywhere
const filterNames = ['HTN_ICD_FILTER', 'HTN_EXCL', 'ABM_EXCL', 'PC_PHY_FILTER', 'DM_ICD_FILTER', 'DM_EXCL', 'EM_CPT_FILTER', 'PC_PHY_PAED_FILTER'];
for (let fn of filterNames) {
  const r = new RegExp(`\\$\\{${fn}\\}`, 'g');
  code = code.replace(r, `\${filters.${fn}}`);
}

// 5. Update calculateAllKPIs to generate and pass filters
const calcRegex = /const r = await calc\(db, facilityId, year, quarter\);/g;
const calcRep = `
        if(!db._dynamicFilters) db._dynamicFilters = await generateDynamicFilters(db);
        const r = await calc(db, facilityId, year, quarter, db._dynamicFilters);`;
code = code.replace(calcRegex, calcRep);

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Successfully refactored kpi-calculator.js to use dynamic filters!');
