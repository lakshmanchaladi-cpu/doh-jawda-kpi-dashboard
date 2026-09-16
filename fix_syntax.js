const fs = require('fs');
let code = fs.readFileSync('routes/kpi-engine.js', 'utf8');
code = code.replace(' to display dynamically in Proofs', '// GET all clinical mappings to display dynamically in Proofs');
fs.writeFileSync('routes/kpi-engine.js', code);
console.log('Fixed syntax error');
