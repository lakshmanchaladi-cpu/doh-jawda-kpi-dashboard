const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

const targetFunc = `viewClaims(kpiCode) {`;
const repFunc = `async showWaterfall(kpiCode) {
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
            <tr><td>ESRD</td><td class="text-end text-danger">\${data.exclusions.ESRD}</td></tr>
            <tr><td>Renal transplant</td><td class="text-end text-danger">\${data.exclusions.Renal_Transplant}</td></tr>
            <tr><td>Pregnancy</td><td class="text-end text-danger">\${data.exclusions.Pregnancy}</td></tr>
            <tr><td>ABM</td><td class="text-end text-danger">\${data.exclusions.ABM}</td></tr>
            <tr class="table-success border-top border-2"><td class="fs-5"><strong>Final Denominator Pool</strong></td><td class="text-end fs-5"><strong>\${data.final}</strong></td></tr>
          </tbody>
        </table>
      \`;
    } catch(e) {
      body.innerHTML = \`<div class="alert alert-warning">\${e.message}</div>\`;
    }
  },
  viewClaims(kpiCode) {`;

code = code.replace(targetFunc, repFunc);
fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed waterfall function');
