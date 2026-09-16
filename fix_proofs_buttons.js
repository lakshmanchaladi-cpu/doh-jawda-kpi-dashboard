const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

// Remove the HTML buttons
const buttonRegex = /<div>\s*<button class="btn btn-outline-primary" id="btn-recalc"[\s\S]*?<\/button>\s*<\/div>/;
code = code.replace(buttonRegex, '');

// Remove the toggleLock method and references in checkLock
code = code.replace(/async toggleLock\(\) \{[\s\S]*?\},\s*exportCsv/, 'exportCsv');

// In checkLock, it tries to modify btnLock and btnRecalc. Let's strip that logic out.
const checkLockBodyRegex = /const btnLock = document\.getElementById\('btn-lock'\);[\s\S]*?btnRecalc\.disabled = false;\n        }/;
code = code.replace(checkLockBodyRegex, '');

fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed proofs buttons');
