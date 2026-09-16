const fs = require('fs');
let code = fs.readFileSync('routes/settings.js', 'utf8');

code = code.replace(/await stmt\.run\(lic, name, major, prof, cat, facName, facLic\);/g, "await stmt.run([lic, name, major, prof, cat, facName, facLic]);");

fs.writeFileSync('routes/settings.js', code);
console.log('Fixed stmt array');
