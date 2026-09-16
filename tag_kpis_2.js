const fs = require('fs');
let content = fs.readFileSync('./engine/kpi-definitions.js', 'utf8');

content = content.replace(/data_source: 'EMR\+Manual'(\r?\n|\s*\})/g, "data_source: 'EMR+Manual',\n    facility_type: 'Medical Center'$1");

fs.writeFileSync('./engine/kpi-definitions.js', content);
console.log('Fixed!');
