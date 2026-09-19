const fs = require('fs');
let code = fs.readFileSync('tests/kpi-calculator.test.js', 'utf8');

// The closing brace for each test function has a blank line after it, or another test() starts.
// But we can just use a regex:
code = code.replace(/^}$/gm, '});');

// We also need to fix assert -> expect since the regex missed those with objects.
code = code.replace(/assert\.strictEqual\((mod\.kpiStatus\([^)]+\)),\s*'([^']+)',\s*'[^']+'\);/g, "expect($1).toBe('$2');");
code = code.replace(/assert\.strictEqual\((mod\.kpiStatus\([^)]+\)),\s*'([^']+)'\);/g, "expect($1).toBe('$2');");

// Also replace require('assert') with nothing since jest doesn't need it (though it's fine to keep)
fs.writeFileSync('tests/kpi-calculator.test.js', code);
console.log('Fixed kpi-calculator.test.js');
