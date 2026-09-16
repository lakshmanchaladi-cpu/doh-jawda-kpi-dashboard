const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');
code = code.replace('};\n}', '}');
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed extra brace');
