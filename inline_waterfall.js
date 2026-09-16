const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

// 1. Inject the hidden row right after the second <tr> ends.
const trTarget = `                  </div>
                </div>
              </td>
            </tr>
          \`;`;

const trRep = `                  </div>
                </div>
              </td>
            </tr>
            <tr id="wf-row-\${kpi.kpi_code}" style="display:none;">
              <td colspan="4" class="p-0">
                <div class="bg-light p-3 border-bottom shadow-inner" style="box-shadow: inset 0 3px 5px rgba(0,0,0,0.05);">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="text-primary mb-0"><i class="bi bi-table"></i> Denominator Breakdown (\${kpi.kpi_code})</h6>
                    <button class="btn btn-sm btn-close" onclick="document.getElementById('wf-row-\${kpi.kpi_code}').style.display='none'"></button>
                  </div>
                  <div id="wf-container-\${kpi.kpi_code}"></div>
                </div>
              </td>
            </tr>
          \`;`;

code = code.replace(trTarget, trRep);


// 2. Rewrite showWaterfall function
const funcTarget = `async showWaterfall(kpiCode) {
    const wfModal = new bootstrap.Modal(document.getElementById('waterfallModal'));
    wfModal.show();
    const body = document.getElementById('waterfall-body');
    body.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary"></div></div>';
    try {
      const res = await fetch(\`/api/kpi/waterfall?facility_id=\${App.state.facilityId}&year=\${App.state.year}&quarter=\${App.state.quarter}&kpi_code=\${kpiCode}\`);
      if(!res.ok) throw new Error('Not implemented for this KPI yet');
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      
      body.innerHTML = \`
        <table class="table table-bordered table-sm mb-0">
          <thead class="table-light"><tr><th>Denominator Calculation Step</th><th class="text-end">No of Patients</th></tr></thead>
          <tbody>
            <tr><td>\${data.step1.label}</td><td class="text-end fw-bold">\${data.step1.count}</td></tr>
            <tr><td>\${data.step2.label}</td><td class="text-end fw-bold">\${data.step2.count}</td></tr>
            <tr class="table-secondary"><td colspan="2"><strong>Denominator Exclusions</strong></td></tr>
            \${Object.entries(data.exclusions).map(([key, val]) => \`<tr><td>\${key}</td><td class="text-end text-danger">\${val}</td></tr>\`).join('')}
            <tr class="table-success border-top border-2"><td class="fs-5"><strong>Final Denominator Pool</strong></td><td class="text-end fs-5"><strong>\${data.final}</strong></td></tr>
          </tbody>
        </table>
      \`;
    } catch(e) {
      body.innerHTML = \`<div class="alert alert-warning">\${e.message}</div>\`;
    }
  },`;

const funcRep = `async showWaterfall(kpiCode) {
    const row = document.getElementById(\`wf-row-\${kpiCode}\`);
    const container = document.getElementById(\`wf-container-\${kpiCode}\`);
    
    // Toggle visibility if already open
    if (row.style.display === 'table-row') {
      row.style.display = 'none';
      return;
    }
    
    row.style.display = 'table-row';
    container.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary"></div></div>';
    
    try {
      const res = await fetch(\`/api/kpi/waterfall?facility_id=\${App.state.facilityId}&year=\${App.state.year}&quarter=\${App.state.quarter}&kpi_code=\${kpiCode}\`);
      if(!res.ok) throw new Error('Not implemented for this KPI yet');
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      
      container.innerHTML = \`
        <table class="table table-bordered table-sm mb-0 bg-white">
          <thead class="table-light"><tr><th>Denominator Calculation Step</th><th class="text-end">No of Patients</th></tr></thead>
          <tbody>
            <tr><td>\${data.step1.label}</td><td class="text-end fw-bold">\${data.step1.count}</td></tr>
            <tr><td>\${data.step2.label}</td><td class="text-end fw-bold">\${data.step2.count}</td></tr>
            <tr class="table-secondary"><td colspan="2"><strong>Denominator Exclusions</strong></td></tr>
            \${Object.entries(data.exclusions).map(([key, val]) => \`<tr><td>\${key}</td><td class="text-end text-danger">\${val}</td></tr>\`).join('')}
            <tr class="table-success border-top border-2"><td><strong>Final Denominator Pool</strong></td><td class="text-end fw-bold"><strong>\${data.final}</strong></td></tr>
          </tbody>
        </table>
      \`;
    } catch(e) {
      container.innerHTML = \`<div class="alert alert-warning">\${e.message}</div>\`;
    }
  },`;

code = code.replace(funcTarget, funcRep);
fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed waterfall to display inline');
