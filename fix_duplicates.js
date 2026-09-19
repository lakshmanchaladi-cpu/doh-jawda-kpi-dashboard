const fs = require('fs');
let code = fs.readFileSync('routes/import.js', 'utf8');

code = code.replace(/INSERT INTO emr_data/g, 'INSERT OR REPLACE INTO emr_data');
code = code.replace(/INSERT INTO shafafiya_data/g, 'INSERT OR REPLACE INTO shafafiya_data');
code = code.replace(/INSERT INTO shafafiya_claim_lines/g, 'INSERT OR REPLACE INTO shafafiya_claim_lines');

fs.writeFileSync('routes/import.js', code);
console.log('Fixed duplicates handling in import.js');
