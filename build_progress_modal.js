const fs = require('fs');
let code = fs.readFileSync('public/js/audit.js', 'utf8');

// We need to inject the modal HTML into the DOM if it doesn't exist.
// We can just add it to the render method or build it dynamically in Javascript.
const calcMethod = `
  async calculateKPIs() {
    // Inject modal into DOM if it doesn't exist
    if (!document.getElementById('kpiProgressModal')) {
      const m = document.createElement('div');
      m.innerHTML = \`<div class="modal fade" id="kpiProgressModal" data-bs-backdrop="static" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white border-0">
              <h5 class="modal-title fw-bold"><i class="bi bi-cpu me-2"></i> JAWDA Engine</h5>
            </div>
            <div class="modal-body p-4">
              <h6 id="kpi-prog-text" class="text-center text-primary mb-3 fw-bold">Initializing Engine...</h6>
              <div class="progress mb-3" style="height: 25px;">
                <div id="kpi-prog-bar" class="progress-bar progress-bar-striped progress-bar-animated bg-primary" style="width: 5%"></div>
              </div>
              <div id="kpi-prog-log" class="small text-muted font-monospace" style="height: 100px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                > Connecting to database...<br>
              </div>
            </div>
            <div class="modal-footer border-0 d-none" id="kpi-prog-footer">
              <button type="button" class="btn btn-primary w-100" data-bs-dismiss="modal" onclick="App.navigate('dashboard')">View Results in Dashboard</button>
            </div>
          </div>
        </div>
      </div>\`;
      document.body.appendChild(m.firstChild);
    }
    
    const progModal = new bootstrap.Modal(document.getElementById('kpiProgressModal'));
    progModal.show();
    
    const text = document.getElementById('kpi-prog-text');
    const bar = document.getElementById('kpi-prog-bar');
    const log = document.getElementById('kpi-prog-log');
    const footer = document.getElementById('kpi-prog-footer');
    
    footer.classList.add('d-none');
    bar.style.width = '10%';
    bar.classList.add('progress-bar-animated');
    bar.classList.remove('bg-success', 'bg-danger');
    bar.classList.add('bg-primary');
    log.innerHTML = '> Engine Locked & Ready.<br>> Executing batch KPI calculation...<br>';
    text.innerText = 'Scanning EMR & RCM Records...';
    
    // Simulate some visual progress while waiting for the server
    let p = 10;
    const pTimer = setInterval(() => {
      if (p < 85) { p += 5; bar.style.width = p + '%'; }
      if (p === 30) log.innerHTML += '> Resolving Clinical Rules...<br>';
      if (p === 60) log.innerHTML += '> Matching DOH Dictionaries...<br>';
    }, 400);

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
      
      clearInterval(pTimer);
      
      if (!res.ok) throw new Error(data.error || 'Failed to calculate');
      
      bar.style.width = '100%';
      bar.classList.remove('progress-bar-animated', 'bg-primary');
      bar.classList.add('bg-success');
      text.innerText = 'Calculation Complete!';
      text.className = 'text-center text-success mb-3 fw-bold';
      
      log.innerHTML += \`<span class="text-success">> SUCCESS: Calculated \${data.results.length} KPIs successfully!</span><br>\`;
      footer.classList.remove('d-none');
      
      window._forceDashboardReload = true;
      // Also force comparison reload just in case
      window._forceComparisonReload = true; 
      
    } catch (err) {
      clearInterval(pTimer);
      bar.style.width = '100%';
      bar.classList.remove('progress-bar-animated', 'bg-primary');
      bar.classList.add('bg-danger');
      text.innerText = 'Engine Error';
      text.className = 'text-center text-danger mb-3 fw-bold';
      log.innerHTML += \`<span class="text-danger">> FATAL: \${err.message}</span><br>\`;
      footer.innerHTML = '<button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">Close</button>';
      footer.classList.remove('d-none');
    }
  },
`;

code = code.replace(/async calculateKPIs\(\) \{[\s\S]*?\},[\s\S]*?async checkLock\(\)/, calcMethod + '\n  async checkLock()');

fs.writeFileSync('public/js/audit.js', code);
console.log('Progress modal built');
