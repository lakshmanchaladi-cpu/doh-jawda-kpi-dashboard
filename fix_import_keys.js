const fs = require('fs');
let code = fs.readFileSync('routes/import.js', 'utf8');

// Update Shafafiya parser for Clinician License
code = code.replace(/physicianType: row\['Clinician Specialty'\] \|\| row\['Ordering Clinician Specialty'\] \|\| row\['Physician_Type'\] \|\| 'Unknown',/g, 
  "physicianType: row['Clinician License'] || row['Physician ID'] || row['Physician_Type'] || 'Unknown',");

fs.writeFileSync('routes/import.js', code);
console.log('Fixed RCM clinician license parsing');
