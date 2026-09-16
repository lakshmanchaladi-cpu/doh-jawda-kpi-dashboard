const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const target = `<button class="btn btn-sm btn-outline-secondary mt-2" onclick="Proofs.viewClaims('\${kpi.kpi_code}')"><i class="bi bi-search"></i> View Claim IDs</button></td>`;
const rep = `<button class="btn btn-sm btn-outline-secondary mt-2 w-100 mb-2" onclick="Proofs.viewClaims('\${kpi.kpi_code}')"><i class="bi bi-search"></i> View Claim IDs (MRNs)</button>
                \${['PC014', 'PC009'].includes(kpi.kpi_code) ? \`<button class="btn btn-sm btn-outline-info w-100" onclick="Proofs.showWaterfall('\${kpi.kpi_code}')"><i class="bi bi-table"></i> Denominator Breakdown</button>\` : ''}
              </td>`;

code = code.replace(target, rep);
fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed button placement');
