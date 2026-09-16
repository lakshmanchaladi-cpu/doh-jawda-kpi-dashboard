const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target = `if (den === 0) {
        status = 'not-applicable';
      }`;
const rep = `if (den === 0) {
        status = 'met'; // User explicitly requested N/A to be treated as 'pass'
      }`;
      
code = code.replace(target, rep);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed status for den === 0');
