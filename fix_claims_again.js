const fs = require('fs');
let code = fs.readFileSync('routes/kpi-engine.js', 'utf8');

const target = `const result = await fn(db, facility_id, year, quarter);`;
const rep = `if (!db._dynamicFilters) db._dynamicFilters = await engine.generateDynamicFilters(db);
      const result = await fn(db, facility_id, year, quarter, db._dynamicFilters);`;

code = code.replace(target, rep);
fs.writeFileSync('routes/kpi-engine.js', code);
console.log('Fixed /claims properly');
