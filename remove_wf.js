const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const targetBtn = `\\$\\{\\['PC014', 'PC009'\\]\\.includes\\(kpi\\.kpi_code\\) \\? \\\`<button class="btn btn-sm btn-outline-info w-100" onclick="Proofs\\.showWaterfall\\('\\$\\{kpi\\.kpi_code\\}'\\)"><i class="bi bi-table"></i> Denominator Breakdown</button>\\\` : ''\\}`;

code = code.replace(new RegExp(targetBtn, 'g'), '');

fs.writeFileSync('public/js/proofs.js', code);
console.log('Removed denominator breakdown button');
