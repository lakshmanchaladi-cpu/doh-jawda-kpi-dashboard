const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const pc014Target = `'PC014': {
              doh_req: 'Age 18-85, Essential Hypertension Diagnosis, BP < 130/80',
              system_req: \`EMR: bp_systolic, bp_diastolic<br><br><b>RCM Fallback:</b><br>Diagnosis: (\${dbMaps['HTN_Inclusion'] || 'I10-I13'})\`,
              neum_formula: 'COUNT(hypertensive patients with BP < 130/80)',
              deno_formula: 'COUNT(patients 18-85 with HTN diagnosis and >= 2 visits)'
            },`;

const pc014Rep = `'PC014': {
              doh_req: 'Age 18-85, Essential Hypertension Diagnosis, BP < 130/80',
              system_req: \`EMR: bp_systolic, bp_diastolic<br><br><b>RCM Fallback:</b><br>Diagnosis: (\${dbMaps['HTN_Inclusion'] || 'I10-I13'})<br><b>Exclusions Applied:</b> Pregnancy (\${dbMaps['Pregnancy_Exc']}), ESRD (\${dbMaps['HTN_ESRD']}), Transplant (\${dbMaps['HTN_Transplant']}), Dialysis (\${dbMaps['Dialysis']})<br><b>Physician Filters:</b> Joined with clinician_licenses for GP, FM, IM + PC_Valid (\${dbMaps['PC_Valid']})\`,
              neum_formula: 'COUNT(hypertensive patients with BP < 130/80 on their MOST RECENT Q2 visit)',
              deno_formula: 'COUNT(patients 18-85 with HTN diagnosis and >= 2 visits in prior 9 months)'
            },`;

code = code.replace(pc014Target, pc014Rep);

const pc009Target = `'PC009': {
              doh_req: 'Diabetes Diagnosis (ICD-10), HbA1c Lab Value',
              system_req: \`EMR: hba1c_value<br><br><b>RCM Fallback:</b><br>Diagnosis: (\${dbMaps['DM_Inclusion'] || 'E10, E11'})<br>CPT: (\${dbMaps['HbA1c'] || '83036'})\`,
              neum_formula: 'COUNT(diabetic patients with HbA1c > 9.0% OR no test result)',
              deno_formula: 'COUNT(diabetic patients >= 18 with >= 2 visits)'
            },`;

const pc009Rep = `'PC009': {
              doh_req: 'Diabetes Diagnosis (ICD-10), HbA1c Lab Value',
              system_req: \`EMR: hba1c_value<br><br><b>RCM Fallback:</b><br>Diagnosis: (\${dbMaps['DM_Inclusion'] || 'E10, E11'})<br>CPT: (\${dbMaps['HbA1c'] || '83036'})<br><b>Exclusions Applied:</b> Pregnancy (\${dbMaps['Pregnancy_Exc']}), Gestational (\${dbMaps['DM_Gestational']}), PCOS (\${dbMaps['DM_PCOS']})<br><b>Physician Filters:</b> Joined with clinician_licenses for GP, FM, IM + PC_Valid (\${dbMaps['PC_Valid']})\`,
              neum_formula: 'COUNT(diabetic patients with HbA1c > 9.0% OR no test result)',
              deno_formula: 'COUNT(diabetic patients >= 18 with >= 2 visits in prior 9 months)'
            },`;

code = code.replace(pc009Target, pc009Rep);

fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed proofs.js UI mappings');
