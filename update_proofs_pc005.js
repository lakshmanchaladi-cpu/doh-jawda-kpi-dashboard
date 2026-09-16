const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const target = `'PC005': {
              doh_req: 'Age >= 18, PHQ-9 Score, Depression Diagnosis Date, Follow-up Visit Date',
              system_req: \`EMR Fields: patient_age, phq9_score (5-14), depression_dx_date, followup_within_30d<br><br><b>RCM Diagnosis Fallback:</b> (\${dbMaps['Depression_Inc'] || 'F32, F33'})\`,
              neum_formula: 'COUNT(patients with followup_within_30d = 1)',
              deno_formula: 'COUNT(patients >= 18 with phq9_score between 5 and 14 AND new depression diagnosis)'
            },`;

const rep = `'PC005': {
              doh_req: 'Age >= 18, PHQ-9 Score (5-14), First Follow-up <= 30 Days',
              system_req: \`<b>Denominator Base:</b><br>
              1. Age >= 18<br>
              2. New Depression Diagnosis this quarter (\${dbMaps['Depression_Exc']})<br>
              3. Positive PHQ-9 (5-14 score)<br>
              <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
              <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
              <b>Prior Established Depression:</b> Historical encounter with \${dbMaps['Depression_Exc']}<br>
              <b>Bipolar Disorder:</b> \${dbMaps['Bipolar_Exc']}<br>
              <b>PHQ-9 >= 15:</b> Handled by 5-14 inclusion filter<br>
              <b>Patient Refused:</b> patient_refused = 1<br>
              <b>ABM Mandate:</b> is_abm_mandate = 1
              </div></details>\`,
              neum_formula: 'COUNT(Eligible Denominator patients who completed a follow up visit <= 30 days of diagnosis)',
              deno_formula: 'COUNT(Unique patients meeting Base requirement minus Exclusions)'
            },`;

code = code.replace(target, rep);
fs.writeFileSync('public/js/proofs.js', code);
console.log('Updated PC005 in proofs.js');
