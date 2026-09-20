const fs = require('fs');
let code = fs.readFileSync('routes/kpi-engine.js', 'utf8');

code = code.replace(/await db\.run\(\[\s\S]*?INSERT INTO locked_audit_records[\s\S]*?WHERE e\.facility_id = \? AND e\.year = \? AND e\.quarter = \?\n\s*\, \[facility, year, quarter\]\);/, function(match) {
  return "console.log('--- EXECUTING SQL ---'); console.log(" + match.substring(13, match.length - 27) + "); " + match;
});

fs.writeFileSync('routes/kpi-engine.js', code);
