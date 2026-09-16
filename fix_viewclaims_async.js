const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');
code = code.replace('  viewClaims(kpiCode) {', '  async viewClaims(kpiCode) {');
fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed missing async on viewClaims');
