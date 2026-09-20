const fs = require('fs');
let code = fs.readFileSync('routes/kpi-engine.js', 'utf8');

code = code.replace('try {\n          await db.run("UPDATE job_queue', 'setImmediate(async () => {\n        try {\n          await db.run("UPDATE job_queue');

fs.writeFileSync('routes/kpi-engine.js', code);
