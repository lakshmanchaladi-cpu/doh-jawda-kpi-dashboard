const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const target = "2. Diabetes Diagnosis: (${dbMaps['DM_Inclusion'] || 'E10-E13'})<br>";
const replacementLiteral = '2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${dbMaps[\'DM_Inclusion\'] || \'E10-E13\'}</div></details><br>';

code = code.split(target).join(replacementLiteral);
fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed wall of text for DM_Inclusion');
