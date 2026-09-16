const fs = require('fs');
let code = fs.readFileSync('routes/import.js', 'utf8');

code = code.replace("row['CPT_Codes']", "row['CPT'] || row['CPT_Codes']");
code = code.replace("row['CPT Code'] || row['All_CPT_Codes']", "row['CPT'] || row['CPT Code'] || row['All_CPT_Codes']");
code = code.replace("row['ICD10_All']", "row['ICD'] || row['ICD10_All'] || row['ICD_Codes']");

fs.writeFileSync('routes/import.js', code);
console.log('Patched import.js to accept basic CPT and ICD headers');
