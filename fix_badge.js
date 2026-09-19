const fs = require('fs');
let code = fs.readFileSync('public/js/components/KPICard.js', 'utf8');

code = code.replace(/<span class="badge bg-light text-dark border pointer"/g, '<span class="badge bg-light text-dark border pointer" tabindex="0" role="button" aria-label="View Patients"');

fs.writeFileSync('public/js/components/KPICard.js', code);
console.log('Fixed KPICard a11y');
