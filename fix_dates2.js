const fs = require('fs');
let code = fs.readFileSync('routes/import.js', 'utf8');

code = code.replace(/row\['HbA1c_Date'\] \|\| null/g, "parseExcelDate(row['HbA1c_Date']) || null");
code = code.replace(/row\['BP_Date'\] \|\| null/g, "parseExcelDate(row['BP_Date']) || null");
code = code.replace(/row\['PHQ9 Time'\] \|\| row\['PHQ9_Date'\] \|\| null/g, "parseExcelDate(row['PHQ9 Time'] || row['PHQ9_Date']) || null");
code = code.replace(/row\['PHQ9_Followup_Date'\] \|\| null/g, "parseExcelDate(row['PHQ9_Followup_Date']) || null");
code = code.replace(/row\['Depression_DX_Date'\] \|\| null/g, "parseExcelDate(row['Depression_DX_Date']) || null");
code = code.replace(/row\['eGFR_Date'\] \|\| null/g, "parseExcelDate(row['eGFR_Date']) || null");

fs.writeFileSync('routes/import.js', code);
console.log('Fixed dates');
