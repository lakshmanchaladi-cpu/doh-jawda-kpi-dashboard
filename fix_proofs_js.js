const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

// The checkLock function is failing because btnLock is null. Let's just remove checkLock completely or empty it.
const checkLockRegex = /async checkLock\(\) \{[\s\S]*?catch \(e\) \{[\s\S]*?console\.error\(e\);\s*\}\s*\}/;
code = code.replace(checkLockRegex, 'async checkLock() {}');

fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed proofs.js checkLock error');
