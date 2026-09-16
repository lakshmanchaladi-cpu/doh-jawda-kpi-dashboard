const fs = require('fs');
let code = fs.readFileSync('routes/kpi-engine.js', 'utf8');

const target = `if (kpi_code === 'PC014') {`;

const rep = `if (kpi_code === 'PC014' || kpi_code === 'PC009') {
      const ICD_FILTER = kpi_code === 'PC014' ? f.HTN_ICD_FILTER : f.DM_ICD_FILTER;`;

code = code.replace(target, rep);

// Replace f.HTN_ICD_FILTER with ICD_FILTER inside the waterfall route
code = code.replace(/AND \$\{f\.HTN_ICD_FILTER\}/g, 'AND ${ICD_FILTER}');

fs.writeFileSync('routes/kpi-engine.js', code);
console.log('Fixed PC009 waterfall support');
