const fs = require('fs');
let code = fs.readFileSync('public/js/audit.js', 'utf8');

// 1. Add the Calculate KPIs button
code = code.replace(
  '<button class="btn btn-outline-danger btn-sm me-2" id="audit-lock-btn" onclick="Audit.toggleLock()">',
  `<button class="btn btn-success btn-sm me-2 d-none" id="audit-calc-kpi-btn" onclick="Audit.calculateKPIs()">
     <i class="bi bi-play-circle me-1"></i>Calculate KPIs
   </button>
   <button class="btn btn-outline-danger btn-sm me-2" id="audit-lock-btn" onclick="Audit.toggleLock()">`
);

// 2. Add the checkLock logic
code = code.replace(
  "btnLock.className = 'btn btn-outline-secondary btn-sm me-2';",
  "btnLock.className = 'btn btn-outline-secondary btn-sm me-2';\n          document.getElementById('audit-calc-kpi-btn').classList.remove('d-none');"
);
code = code.replace(
  "btnLock.className = 'btn btn-outline-danger btn-sm me-2';",
  "btnLock.className = 'btn btn-outline-danger btn-sm me-2';\n          document.getElementById('audit-calc-kpi-btn').classList.add('d-none');"
);

// 3. Add the calculateKPIs method
const calcMethod = `
  async calculateKPIs() {
    App.toast('Calculating KPIs... Please wait.', 'info');
    document.getElementById('audit-calc-kpi-btn').disabled = true;
    document.getElementById('audit-calc-kpi-btn').innerHTML = '<span class="spinner-border spinner-border-sm"></span> Calculating...';
    try {
      const res = await fetch('/api/kpi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: App.state.facilityId,
          year: App.state.year,
          quarter: App.state.quarter
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to calculate');
      App.toast('KPIs Calculated Successfully! Go to Dashboard to view results.', 'success');
      window._forceDashboardReload = true;
    } catch (err) {
      App.toast(err.message, 'danger');
    } finally {
      document.getElementById('audit-calc-kpi-btn').disabled = false;
      document.getElementById('audit-calc-kpi-btn').innerHTML = '<i class="bi bi-play-circle me-1"></i>Calculate KPIs';
    }
  },
`;

// Insert it before checkLock
code = code.replace('  async checkLock() {', calcMethod + '\n  async checkLock() {');

fs.writeFileSync('public/js/audit.js', code);
console.log('Added Calculate KPIs button to Audit');
