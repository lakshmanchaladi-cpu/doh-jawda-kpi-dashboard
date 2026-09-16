const fs = require('fs');
let code = fs.readFileSync('public/js/dashboard.js', 'utf8');

const targetLine = "if (r.facility_type && r.facility_type !== 'Both' && r.facility_type !== facility.facility_type) return;";
code = code.replace(targetLine, ""); // Completely remove the filter

fs.writeFileSync('public/js/dashboard.js', code);
console.log('Removed strict facility_type filter from Dashboard');
