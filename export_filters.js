const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');
code = code.replace('module.exports = { calculateAllKPIs, kpiStatus, CALCULATORS };', 'module.exports = { calculateAllKPIs, kpiStatus, CALCULATORS, generateDynamicFilters };');
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Exported generateDynamicFilters');
