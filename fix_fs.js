const fs = require('fs');
let code = fs.readFileSync('routes/settings.js', 'utf8');

if (!code.includes("const fs = require('fs');")) {
  code = "const fs = require('fs');\n" + code;
  fs.writeFileSync('routes/settings.js', code);
  console.log('Added fs require');
} else {
  console.log('fs already required');
}
