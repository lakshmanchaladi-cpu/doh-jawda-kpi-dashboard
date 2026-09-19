const fs = require('fs');
let code = fs.readFileSync('tests/kpi-calculator.test.js', 'utf8');

const targetMainStart = code.indexOf('async function main()');
if (targetMainStart !== -1) {
  code = code.substring(0, targetMainStart);
  fs.writeFileSync('tests/kpi-calculator.test.js', code);
  console.log('Removed main block');
} else {
  console.log('Main block not found');
}
