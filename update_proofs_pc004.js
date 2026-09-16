const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const target = `'PC004': {
              doh_req: 'Age >= 18, PHQ-2 Result, PHQ-9 Score, PHQ-9 Date, Encounter Date',
              system_req: 'EMR Fields: patient_age, phq2_result, phq9_score, phq9_date',
              neum_formula: 'COUNT(patients with phq2_result=1 AND phq9_score > 0 AND phq9_date within 24h of encounter)',
              deno_formula: 'COUNT(patients >= 18 with phq2_result=1)'
            },`;

const rep = `'PC004': {
              doh_req: 'Age 18+, THIQA Insurance, Positive PHQ-2, PHQ-9 within 24hrs',
              system_req: \`<b>Denominator Base:</b><br>
              1. Age >= 18<br>
              2. THIQA Insurance (is_thiqa=1)<br>
              3. Positive PHQ-2 (phq2_result=1) - *Uses FIRST positive date if multiple exist*<br>
              <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
              <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
              <b>Prior Depression:</b> \${dbMaps['Depression_Exc']}<br>
              <b>Prior Bipolar:</b> \${dbMaps['Bipolar_Exc']}<br>
              <b>Patient Refused:</b> patient_refused = 1<br>
              <b>ABM Mandate:</b> is_abm_mandate = 1<br>
              <b>No Vitals:</b> bp_systolic IS NULL<br>
              <b>Invalid Visit:</b> Dental/Ayurvedic/Homeopathic
              </div></details>\`,
              neum_formula: 'COUNT(Eligible Denom patients where PHQ-9 completed <= 24 hours of first PHQ-2)',
              deno_formula: 'COUNT(Unique patients meeting Base requirement minus Exclusions)'
            },`;

code = code.replace(target, rep);
fs.writeFileSync('public/js/proofs.js', code);
console.log('Updated PC004 in proofs');
