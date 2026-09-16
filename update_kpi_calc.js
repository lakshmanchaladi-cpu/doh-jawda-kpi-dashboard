const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// Replace COUNT(DISTINCT mrn) as cnt with both the count and the group concat
code = code.replace(/COUNT\(DISTINCT mrn\) as cnt/g, "COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list");

// Some queries use COUNT(*) as cnt (like PC028)
code = code.replace(/COUNT\(\*\) as cnt FROM locked_audit_records/g, "COUNT(*) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records");

// Now replace all return statements
// From: return { numerator: num.cnt, denominator: den.cnt };
// To: return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };

code = code.replace(/return \{ numerator: num\.cnt, denominator: den\.cnt \};/g, 
  "return { numerator: num.cnt, denominator: den.cnt, num_list: num.mrn_list ? num.mrn_list.split(',') : [], den_list: den.mrn_list ? den.mrn_list.split(',') : [] };");

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Updated KPI Calculator returns');
