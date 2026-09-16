const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target = `function pc026DenominatorQuarter(year, quarter) {
  let denQ = quarter - 2;
  let denY = year;
  if (denQ <= 0) { denQ += 4; denY -= 1; }
  return { denYear: denY, denQuarter: denQ }

function kpiStatus(value, kpi) {`;

const rep = `function pc026DenominatorQuarter(year, quarter) {
  let denQ = quarter - 2;
  let denY = year;
  if (denQ <= 0) { denQ += 4; denY -= 1; }
  return { denYear: denY, denQuarter: denQ };
}

function kpiStatus(value, kpi) {`;

code = code.replace(target, rep);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed missing brace on pc026DenominatorQuarter');
