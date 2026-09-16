const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const regex009 = /'PC009': \{[\s\S]*?deno_formula: '.*?COUNT\(patients with >= 2 visits in the 9 months prior\)'\s*\},/g;

const rep009 = `'PC009': {
  doh_req: 'Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, HbA1c Lab > 9.0%',
  system_req: \`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (\${dbMaps['Valid_EM'] || '99201-99215'})<br>
  2. Diabetes Diagnosis: (\${dbMaps['DM_Inclusion'] || 'E10-E13'})<br>
  3. Seen by Primary Care: (\${dbMaps['PC_Valid']} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> \${dbMaps['Pregnancy_Exc']}<br>
  <b>Gestational:</b> \${dbMaps['DM_Gestational']}<br>
  <b>Steroid-Induced DM:</b> \${dbMaps['DM_Steroid']}<br>
  <b>PCOS:</b> \${dbMaps['DM_PCOS']}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>\`,
  neum_formula: 'COUNT(Eligible patients with HbA1c > 9.0% OR missing result). <br><small class="text-muted"><i>UAE Outpatient Rule: If explicit lab date is missing, encounter_date is used as fallback.</i></small>',
  deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
},`;

const regex010 = /'PC010': \{[\s\S]*?deno_formula: 'COUNT\(diabetic patients >= 18 with >= 2 visits\)'\s*\},/g;

const rep010 = `'PC010': {
  doh_req: 'Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, HbA1c Lab <= 8.0%',
  system_req: \`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (\${dbMaps['Valid_EM'] || '99201-99215'})<br>
  2. Diabetes Diagnosis: (\${dbMaps['DM_Inclusion'] || 'E10-E13'})<br>
  3. Seen by Primary Care: (\${dbMaps['PC_Valid']} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> \${dbMaps['Pregnancy_Exc']}<br>
  <b>Gestational:</b> \${dbMaps['DM_Gestational']}<br>
  <b>Steroid-Induced DM:</b> \${dbMaps['DM_Steroid']}<br>
  <b>PCOS:</b> \${dbMaps['DM_PCOS']}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>\`,
  neum_formula: 'COUNT(Eligible patients with HbA1c <= 8.0%). <br><small class="text-muted"><i>UAE Outpatient Rule: If explicit lab date is missing, encounter_date is used as fallback.</i></small>',
  deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
},`;

code = code.replace(regex009, rep009);
code = code.replace(regex010, rep010);
fs.writeFileSync('public/js/proofs.js', code);
console.log('Updated PC009 and PC010 in proofs.js');
