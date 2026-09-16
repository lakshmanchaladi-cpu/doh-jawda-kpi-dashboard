const fs = require('fs');
let code = fs.readFileSync('routes/reports.js', 'utf8');

code = code.replace(/FROM kpi_results r\s+WHERE r\.facility_id = \? AND r\.year = \? AND r\.quarter = \?/g, 
  "FROM kpi_results r\n        WHERE r.facility_id = ? AND r.year = ? AND r.quarter = ? AND r.denominator > 0 AND r.value IS NOT NULL");

fs.writeFileSync('routes/reports.js', code);
console.log('Fixed Jawda Export query');
