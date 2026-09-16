const fs = require('fs');
const code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');
const matches = [...code.matchAll(/async function calc_PC009/g)];
console.log("Found", matches.length, "copies of calc_PC009");
