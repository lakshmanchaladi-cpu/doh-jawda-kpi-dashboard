const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const pc014TargetRegex = /'PC014':\s*\{\s*doh_req:.*?deno_formula:.*?\},/s;

const pc014Rep = `'PC014': {
              doh_req: 'Age 18-85, Essential Hypertension, Face-to-Face Consult, BP < 130/80',
              system_req: \`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
              1. CPT Face-to-Face Consult: (\${dbMaps['Valid_EM'] || '99201-99215'})<br>
              2. Hypertension Diagnosis: (\${dbMaps['HTN_Inclusion'] || 'I10-I13'})<br>
              3. Seen by Primary Care: (\${dbMaps['PC_Valid']} OR clinician_licenses join)<br><br>
              <b>Exclusions Applied:</b> Pregnancy (\${dbMaps['Pregnancy_Exc']}), ESRD (\${dbMaps['HTN_ESRD']}), Transplant (\${dbMaps['HTN_Transplant']}), Dialysis (\${dbMaps['Dialysis']}), ABM Mandate\`,
              neum_formula: 'COUNT(Eligible Denominator patients whose MOST RECENT BP reading in the quarter was < 130/80)',
              deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-85 meeting Q2 Intersection requirement)<br><b>Step 2 (Lookback filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
            },`;

code = code.replace(pc014TargetRegex, pc014Rep);

const pc009TargetRegex = /'PC009':\s*\{\s*doh_req:.*?deno_formula:.*?\},/s;

const pc009Rep = `'PC009': {
              doh_req: 'Age 18-85, Diabetes Diagnosis, Face-to-Face Consult, HbA1c Lab',
              system_req: \`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
              1. CPT Face-to-Face Consult: (\${dbMaps['Valid_EM'] || '99201-99215'})<br>
              2. Diabetes Diagnosis: (\${dbMaps['DM_Inclusion'] || 'E10-E13'})<br>
              3. Seen by Primary Care: (\${dbMaps['PC_Valid']} OR clinician_licenses join)<br><br>
              <b>Exclusions Applied:</b> Pregnancy (\${dbMaps['Pregnancy_Exc']}), Gestational (\${dbMaps['DM_Gestational']}), PCOS (\${dbMaps['DM_PCOS']}), ABM Mandate\`,
              neum_formula: 'COUNT(Eligible Denominator patients with HbA1c > 9.0% OR no test result recorded)',
              deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-85 meeting Q2 Intersection requirement)<br><b>Step 2 (Lookback filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
            },`;

code = code.replace(pc009TargetRegex, pc009Rep);

fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed proofs.js UI mappings completely');
