const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

code = code.replace(/PC021: calc_PC021, PC023: calc_PC023, PC024: calc_PC024, PC025: calc_PC025,\s*PC026: calc_PC026, PC027: calc_PC027, PC028: calc_PC028,\s*PC029: calc_PC029, PC030: calc_PC030/g, "");

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Stripped missing KPIs from map temporarily');
