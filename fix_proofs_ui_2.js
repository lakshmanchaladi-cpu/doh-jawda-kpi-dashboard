const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const target = `</div>
            </div>
          </div>
        </div>`;

const rep = `</div>
            </div>
          </div>
        </div>
        
        <!-- Waterfall Modal -->
        <div class="modal fade" id="waterfallModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Denominator Waterfall Breakdown</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body" id="waterfall-body">
                Loading breakdown...
              </div>
            </div>
          </div>
        </div>`;

code = code.replace(target, rep);

const renderTarget = `html += \`<tr>
            <td><span class="badge bg-secondary">\${kpi.code}</span></td>
            <td><strong>\${kpi.name}</strong><br><small class="text-muted">\${mapping ? mapping.doh_req : 'N/A'}</small></td>
            <td><small>\${mapping ? mapping.system_req : 'N/A'}</small></td>
            <td>
              <div class="text-success mb-1"><strong>N:</strong> \${mapping ? mapping.neum_formula : 'N/A'}</div>
              <div class="text-primary"><strong>D:</strong> \${mapping ? mapping.deno_formula : 'N/A'}</div>
            </td>
          </tr>\`;`;

const renderRep = `
          let waterfallBtn = '';
          if (kpi.code === 'PC014' || kpi.code === 'PC009') {
             waterfallBtn = \`<br><button class="btn btn-sm btn-outline-info mt-2" onclick="Proofs.showWaterfall('\${kpi.code}')"><i class="bi bi-table"></i> View Denominator Breakdown</button>\`;
          }
          html += \`<tr>
            <td><span class="badge bg-secondary">\${kpi.code}</span></td>
            <td><strong>\${kpi.name}</strong><br><small class="text-muted">\${mapping ? mapping.doh_req : 'N/A'}</small>\${waterfallBtn}</td>
            <td><small>\${mapping ? mapping.system_req : 'N/A'}</small></td>
            <td>
              <div class="text-success mb-1"><strong>N:</strong> \${mapping ? mapping.neum_formula : 'N/A'}</div>
              <div class="text-primary"><strong>D:</strong> \${mapping ? mapping.deno_formula : 'N/A'}</div>
            </td>
          </tr>\`;`;

code = code.replace(renderTarget, renderRep);

const funcTarget = `showClaims(kpiCode) {`;
const funcRep = `async showWaterfall(kpiCode) {
    const wfModal = new bootstrap.Modal(document.getElementById('waterfallModal'));
    wfModal.show();
    const body = document.getElementById('waterfall-body');
    body.innerHTML = 'Loading breakdown...';
    try {
      const res = await fetch(\`/api/kpi/waterfall?facility_id=\${App.state.facilityId}&year=\${App.state.year}&quarter=\${App.state.quarter}&kpi_code=\${kpiCode}\`);
      if(!res.ok) throw new Error('Not implemented for this KPI yet');
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      
      body.innerHTML = \`
        <table class="table table-bordered table-sm">
          <thead class="table-light"><tr><th>Denominator</th><th>No of Patients</th></tr></thead>
          <tbody>
            <tr><td>\${data.step1.label}</td><td>\${data.step1.count}</td></tr>
            <tr><td>\${data.step2.label}</td><td>\${data.step2.count}</td></tr>
            <tr class="table-secondary"><td colspan="2"><strong>Denominator Exclusions</strong></td></tr>
            <tr><td>ESRD</td><td>\${data.exclusions.ESRD}</td></tr>
            <tr><td>Renal transplant</td><td>\${data.exclusions.Renal_Transplant}</td></tr>
            <tr><td>Pregnancy</td><td>\${data.exclusions.Pregnancy}</td></tr>
            <tr><td>ABM</td><td>\${data.exclusions.ABM}</td></tr>
            <tr class="table-success"><td><strong>Total patients</strong></td><td><strong>\${data.final}</strong></td></tr>
          </tbody>
        </table>
      \`;
    } catch(e) {
      body.innerHTML = \`<div class="alert alert-warning">\${e.message}</div>\`;
    }
  },
  showClaims(kpiCode) {`;

code = code.replace(funcTarget, funcRep);

fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed proofs UI to show waterfall modal');
