const fs = require('fs');
let code = fs.readFileSync('routes/kpi-engine.js', 'utf8');

const target = `      const fn = engine.CALCULATORS[kpi_code];
      if (!fn) return res.status(400).json({ error: 'Unsupported KPI Code for drill-down' });
      
      const result = await fn(db, facility_id, year, quarter);`;

const rep = `      const fn = engine.CALCULATORS[kpi_code];
      if (!fn) return res.status(400).json({ error: 'Unsupported KPI Code for drill-down' });
      
      if (!db._dynamicFilters) db._dynamicFilters = await engine.generateDynamicFilters(db);
      const result = await fn(db, facility_id, year, quarter, db._dynamicFilters);`;

code = code.replace(target, rep);
fs.writeFileSync('routes/kpi-engine.js', code);
console.log('Fixed /claims signature');
