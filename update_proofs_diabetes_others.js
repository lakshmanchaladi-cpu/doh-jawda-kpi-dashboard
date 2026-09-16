const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const regex011 = /'PC011': \{[\s\S]*?deno_formula: 'COUNT\(diabetic patients >= 18 with >= 2 visits\)'\s*\},/g;
const rep011 = `'PC011': {
  doh_req: 'Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Foot Exam',
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
  neum_formula: 'COUNT(Eligible patients with foot_exam_done = 1 OR claim contains Foot Exam CPT)',
  deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
},`;

const regex012 = /'PC012': \{[\s\S]*?deno_formula: 'COUNT\(diabetic patients >= 18 with >= 2 visits\)'\s*\},/g;
const rep012 = `'PC012': {
  doh_req: 'Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Eye Exam',
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
  neum_formula: 'COUNT(Eligible patients with eye_exam_done = 1 OR claim contains Eye Exam CPT)',
  deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
},`;

const regex013 = /'PC013': \{[\s\S]*?deno_formula: 'COUNT\(diabetic patients >= 18 with >= 2 visits\)'\s*\},/g;
const rep013 = `'PC013': {
  doh_req: 'Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Nephropathy Exam',
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
  neum_formula: 'COUNT(Eligible patients with nephropathy_exam_done = 1 OR claim contains Nephropathy Exam CPT)',
  deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
},`;


code = code.replace(regex011, rep011);
code = code.replace(regex012, rep012);
code = code.replace(regex013, rep013);
fs.writeFileSync('public/js/proofs.js', code);
console.log('Updated PC011, PC012, PC013 in proofs.js');
