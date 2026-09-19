
const fs = require('fs');
const file = 'public/js/proofs.js';
let content = fs.readFileSync(file, 'utf8');

// Remove toggleLock and checkLock entirely
content = content.replace(/async checkLock\(\) \{\},\s*async toggleLock\(\) \{[\s\S]*?\},\s*async showWaterfall/m, 'async showWaterfall');

fs.writeFileSync(file, content);

