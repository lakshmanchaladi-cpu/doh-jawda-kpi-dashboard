const fs = require('fs');
let code = fs.readFileSync('public/js/data-manager.js', 'utf8');

const replacement = `  async renderVault(container) {
    container.innerHTML = \`<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-3 text-muted">Loading Data Vault...</p></div>\`;
    try {
      const res = await fetch(\`/api/audit/vault-summary?facility_id=\${this.state.facilityId}\`);
      if (!res.ok) throw new Error('Failed to load vault');
      const data = await res.json();
      
      if (!data || data.length === 0) {
        container.innerHTML = \`
          <div class="card shadow-sm border-0 bg-light py-5 text-center">
            <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
            <h5>No Data Found</h5>
            <p class="text-muted">You haven't uploaded any data for this facility yet.</p>
            <button class="btn btn-primary mt-3" onclick="DataManager.switchTab('upload')">Go to Upload Data</button>
          </div>
        \`;
        return;
      }
      
      // Group by year
      const byYear = {};
      data.forEach(q => {
        if (!byYear[q.year]) byYear[q.year] = [];
        byYear[q.year].push(q);
      });
      
      let html = '';
      Object.keys(byYear).sort((a,b) => b - a).forEach(year => {
        html += \`<h4 class="mt-4 mb-3 fw-bold border-bottom pb-2 text-dark"><i class="bi bi-calendar4 text-primary me-2"></i>Year \${year}</h4>\`;
        html += \`<div class="row g-3 mb-4">\`;
        
        byYear[year].sort((a,b) => b.quarter - a.quarter).forEach(q => {
          const rate = parseFloat(q.match_rate);
          let badgeClass = 'bg-danger';
          let statusText = 'Critical';
          if (rate >= 95) { badgeClass = 'bg-success'; statusText = 'Excellent'; }
          else if (rate >= 80) { badgeClass = 'bg-warning text-dark'; statusText = 'Needs Review'; }
          
          const qLabel = \`Q\${q.quarter} \${q.year}\`;
          
          // FORMAT DATE AND TIME
          const lastCalc = q.last_calculated_at ? new Date(q.last_calculated_at).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : 'Never calculated';
          
          html += \`
            <div class="col-12 col-md-6 col-xl-3">
              <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold"><i class="bi bi-calendar3 me-2 text-primary"></i> \${qLabel}</h6>
                  <span class="badge \${badgeClass}">\${statusText} (\${q.match_rate}%)</span>
                </div>
                <div class="card-body px-3 py-4">
                  <div class="d-flex justify-content-between text-center mb-3">
                    <div>
                      <div class="text-muted text-uppercase mb-1" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;">EMR Records</div>
                      <div class="fs-5 fw-bold">\${q.emr_count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div class="text-muted text-uppercase mb-1" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;">RCM Claims</div>
                      <div class="fs-5 fw-bold">\${q.rcm_count.toLocaleString()}</div>
                    </div>
                  </div>
                  <div class="progress mb-2" style="height: 6px;">
                    <div class="progress-bar \${badgeClass.split(' ')[0]}" style="width: \${q.match_rate}%"></div>
                  </div>
                  <div class="d-flex justify-content-between text-muted" style="font-size: 0.75rem;">
                    <span>Rate: \${q.match_rate}%</span>
                    <span>Last Calc: <span id="calc-date-\${q.year}-\${q.quarter}">\${lastCalc}</span></span>
                  </div>
                </div>
                <div class="card-footer bg-light p-2 d-flex justify-content-between gap-1">
                  <button class="btn btn-outline-secondary btn-sm flex-fill" onclick="DataManager.downloadExceptions(\${q.year}, \${q.quarter})" title="Download Exceptions">
                    <i class="bi bi-download"></i> Exceptions
                  </button>
                  <button class="btn btn-primary btn-sm flex-fill fw-semibold" id="btn-calc-\${q.year}-\${q.quarter}" onclick="DataManager.calculateKpis(\${q.year}, \${q.quarter})">
                    <i class="bi bi-cpu"></i> Calculate
                  </button>
                </div>
              </div>
            </div>
          \`;
        });
        html += \`</div>\`;
      });
      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = \`<div class="alert alert-danger">Error loading vault summary: \${e.message}</div>\`;
    }
  },`;

code = code.replace(/async renderVault\(container\) \{[\s\S]*?\},(?=\s*async downloadExceptions)/, replacement);
fs.writeFileSync('public/js/data-manager.js', code);
