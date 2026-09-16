const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');
code = code.replace('async async showWaterfall', 'async showWaterfall');
fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed double async syntax error');
