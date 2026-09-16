const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// The duplicates start at the second calc_PC009.
// Let's find the index of the FIRST calc_PC009.
const first009 = code.indexOf('async function calc_PC009');
const second009 = code.indexOf('async function calc_PC009', first009 + 1);

if (second009 > -1) {
  // Let's find where the duplicate block ends. It probably duplicates everything up to `CALCULATORS = {`
  const calculatorsDecl = code.indexOf('const CALCULATORS = {');
  if (second009 < calculatorsDecl) {
     // Delete everything from the second calc_PC009 up to the start of CALCULATORS = {
     code = code.substring(0, second009) + code.substring(calculatorsDecl);
     fs.writeFileSync('engine/kpi-calculator.js', code);
     console.log('Removed duplicate KPI block!');
  } else {
     console.log('Duplicate structure not as expected');
  }
} else {
  console.log('No duplicates found');
}
