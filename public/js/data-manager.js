export const DataManager = {
  state: {
    activeTab: 'vault',
    facilityId: null,
    pollInterval: null,
    activeBatchId: null
  },

  async render(container) {
    this.state.facilityId = window.App.state.facilityId;
    
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-1 fw-bold text-dark"><i class="bi bi-database-check text-primary me-2"></i>Data Manager</h2>
          <p class="text-muted mb-0">Upload new data files or review your previously imported data vault.</p>
        </div>
      </div>
      
      <ul class="nav nav-pills mb-4" id="dataManagerTabs">
        <li class="nav-item">
          <a class="nav-link ${this.state.activeTab === 'vault' ? 'active' : ''}" href="#" onclick="DataManager.switchTab('vault', this); return false;">
            <i class="bi bi-safe2"></i> Data Vault
          </a>
        </li>
        <li class="nav-item ms-2">
          <a class="nav-link ${this.state.activeTab === 'upload' ? 'active' : ''}" href="#" onclick="DataManager.switchTab('upload', this); return false;">
            <i class="bi bi-cloud-upload"></i> Upload Data
          </a>
        </li>
      </ul>
      
      <div id="dm-content-area"></div>
    `;
    
    this.renderActiveTab();
  },

  switchTab(tab, el) {
    this.state.activeTab = tab;
    document.querySelectorAll('#dataManagerTabs .nav-link').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');
    else document.querySelector(`#dataManagerTabs a[onclick*="${tab}"]`).classList.add('active');
    
    this.renderActiveTab();
  },

  renderActiveTab() {
    const area = document.getElementById('dm-content-area');
    if (this.state.activeTab === 'vault') {
      this.renderVault(area);
    } else {
      this.renderUpload(area);
    }
  },

      async renderVault(container) {
    container.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-3 text-muted">Loading Data Vault...</p></div>`;
    try {
      const res = await fetch(`/api/audit/vault-summary?facility_id=${this.state.facilityId}`);
      if (!res.ok) throw new Error('Failed to load vault');
      const data = await res.json();
      
      if (!data || data.length === 0) {
        container.innerHTML = `
          <div class="card shadow-sm border-0 bg-light py-5 text-center">
            <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
            <h5>No Data Found</h5>
            <p class="text-muted">You haven't uploaded any data for this facility yet.</p>
            <button class="btn btn-primary mt-3" onclick="DataManager.switchTab('upload')">Go to Upload Data</button>
          </div>
        `;
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
        html += `<h4 class="mt-4 mb-3 fw-bold border-bottom pb-2 text-dark"><i class="bi bi-calendar4 text-primary me-2"></i>Year ${year}</h4>`;
        html += `<div class="row g-3 mb-4">`;
        
        byYear[year].sort((a,b) => b.quarter - a.quarter).forEach(q => {
          const rate = parseFloat(q.match_rate);
          let badgeClass = 'bg-danger';
          let statusText = 'Critical';
          if (rate >= 95) { badgeClass = 'bg-success'; statusText = 'Excellent'; }
          else if (rate >= 80) { badgeClass = 'bg-warning text-dark'; statusText = 'Needs Review'; }
          
          const qLabel = `Q${q.quarter} ${q.year}`;
          
          // FORMAT DATE AND TIME
          const lastCalc = q.last_calculated_at ? new Date(q.last_calculated_at).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          }) : 'Never calculated';
          
          html += `
            <div class="col-12 col-md-6 col-xl-3">
              <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold"><i class="bi bi-calendar3 me-2 text-primary"></i> ${qLabel}</h6>
                  <span class="badge ${badgeClass}">${statusText} (${q.match_rate}%)</span>
                </div>
                <div class="card-body px-3 py-4">
                  <div class="d-flex justify-content-between text-center mb-3">
                    <div>
                      <div class="text-muted text-uppercase mb-1" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;">EMR Records</div>
                      <div class="fs-5 fw-bold">${q.emr_count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div class="text-muted text-uppercase mb-1" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;">RCM Claims</div>
                      <div class="fs-5 fw-bold">${q.rcm_count.toLocaleString()}</div>
                    </div>
                  </div>
                  <div class="progress mb-2" style="height: 6px;">
                    <div class="progress-bar ${badgeClass.split(' ')[0]}" style="width: ${q.match_rate}%"></div>
                  </div>
                  <div class="d-flex justify-content-between text-muted" style="font-size: 0.75rem;">
                    <span>Rate: ${q.match_rate}%</span>
                    <span>Last Calc: <span id="calc-date-${q.year}-${q.quarter}">${lastCalc}</span></span>
                  </div>
                </div>
                <div class="card-footer bg-light p-2 d-flex justify-content-between gap-1">
                  <button class="btn btn-outline-secondary btn-sm flex-fill" onclick="DataManager.downloadExceptions(${q.year}, ${q.quarter})" title="Download Exceptions">
                    <i class="bi bi-download"></i> Exceptions
                  </button>
                  <button class="btn btn-primary btn-sm flex-fill fw-semibold" id="btn-calc-${q.year}-${q.quarter}" onclick="DataManager.calculateKpis(${q.year}, ${q.quarter})">
                    <i class="bi bi-cpu"></i> Calculate
                  </button>
                </div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      });
      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = `<div class="alert alert-danger">Error loading vault summary: ${e.message}</div>`;
    }
  },

  async downloadExceptions(year, quarter) {
    window.location.href = `/api/audit/exceptions?facility_id=${this.state.facilityId}&year=${year}&quarter=${quarter}`;
  },

  async calculateKpis(year, quarter) {
    const btn = document.getElementById(`btn-calc-${year}-${quarter}`);
    const originalHtml = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Calculating...`;
    btn.disabled = true;

    try {
      const res = await fetch('/api/kpi/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facility_id: this.state.facilityId, year, quarter })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to start calculation');

      this.pollCalculation(data.job_id, year, quarter, btn, originalHtml);
    } catch (e) {
      window.App.toast('Calculation error: ' + e.message, 'danger');
      btn.innerHTML = originalHtml;
      btn.disabled = false;
    }
  },

  pollCalculation(jobId, year, quarter, btn, originalHtml) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/kpi/job-status?job_id=${jobId}`);
        const data = await res.json();
        if (data.status === 'done' || data.status === 'error') {
          clearInterval(interval);
          btn.innerHTML = originalHtml;
          btn.disabled = false;
          if (data.status === 'done') {
            window.App.toast(`Calculations complete for Q${quarter} ${year}!`, 'success');
            document.getElementById(`calc-date-${year}-${quarter}`).innerText = new Date().toLocaleDateString();
          } else {
            window.App.toast(`Calculation failed: ${data.result?.error || 'Unknown error'}`, 'danger');
          }
        }
      } catch (e) {
        clearInterval(interval);
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    }, 1500);
  },

  renderUpload(container) {
    container.innerHTML = `
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold"><i class="bi bi-file-medical text-primary me-2"></i> EMR Data Upload</h5></div>
            <div class="card-body">
              <form id="emrUploadForm">
                <input type="file" id="emrFile" class="form-control mb-3" accept=".xlsx,.xls,.csv" required>
                <button type="submit" class="btn btn-primary w-100">Upload EMR File</button>
              </form>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold"><i class="bi bi-receipt text-success me-2"></i> RCM / Shafafiya Upload</h5></div>
            <div class="card-body">
              <form id="shafafiyaUploadForm">
                <input type="file" id="shafafiyaFile" class="form-control mb-3" accept=".xlsx,.xls,.csv" required>
                <button type="submit" class="btn btn-success w-100">Upload RCM File</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div id="importProgressContainer" class="card shadow-sm border-0 border-top border-primary border-4 mt-4 d-none">
        <div class="card-body text-center py-4">
          <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
          <h5 id="importStatusText">Uploading file...</h5>
        </div>
      </div>

      <div id="batchHistoryContainer" class="mt-4"></div>
    `;

    document.getElementById('emrUploadForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.uploadFile('emr', document.getElementById('emrFile').files[0]);
    });

    document.getElementById('shafafiyaUploadForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.uploadFile('shafafiya', document.getElementById('shafafiyaFile').files[0]);
    });

    this.loadHistory();
  },

  async loadHistory() {
    try {
      const res = await fetch(`/api/import/history/${this.state.facilityId}`);
      const batches = await res.json();
      
      let html = `<div class="card shadow-sm border-0"><div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold"><i class="bi bi-clock-history me-2 text-primary"></i> Upload History</h5></div><div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr><th>ID</th><th>File Name</th><th>Type</th><th>Quarters Detected</th><th>Inserted</th><th>Updated</th><th>Skipped</th><th class="text-end">Actions</th></tr></thead><tbody>`;

      if (batches.length === 0) {
        html += `<tr><td colspan="8" class="text-center text-muted py-4">No import history found.</td></tr>`;
      } else {
        batches.forEach(b => {
          let statusBadge = b.status === 'done' ? '<span class="badge bg-success">Success</span>' : 
                            b.status === 'error' ? '<span class="badge bg-danger">Failed</span>' : 
                            '<span class="badge bg-warning"><i class="bi bi-arrow-repeat spin"></i></span>';
          let qJson = '[]';
          try { qJson = JSON.parse(b.quarters_json || '[]').join(', '); } catch(e){}
          
          let errorBtn = b.status === 'error' && b.errors_json ? `<a href="data:application/json;base64,${btoa(unescape(encodeURIComponent(b.errors_json)))}" download="error_batch_${b.id}.json" class="btn btn-sm btn-outline-danger me-2"><i class="bi bi-download"></i></a>` : '';
          
          html += `<tr>
            <td>#${b.id}</td>
            <td class="fw-medium">${b.file_name} ${statusBadge}</td>
            <td><span class="badge bg-light text-dark border">${b.file_type.toUpperCase()}</span></td>
            <td>${qJson}</td>
            <td>${b.row_count || 0}</td>
            <td>${b.replaced_count || 0}</td>
            <td>${b.skipped_count || 0}</td>
            <td class="text-end">
              ${errorBtn}
              <button class="btn btn-sm btn-outline-danger" onclick="DataManager.deleteBatch(${b.id})"><i class="bi bi-trash"></i></button>
            </td>
          </tr>`;
        });
      }
      html += `</tbody></table></div></div>`;
      const container = document.getElementById('batchHistoryContainer');
      if (container) container.innerHTML = html;
    } catch (e) {
      console.error(e);
    }
  },

  async deleteBatch(batchId) {
    if (!confirm('Delete this batch? The system will recalculate KPIs based on remaining data.')) return;
    try {
      const res = await fetch(`/api/import/${batchId}`, { method: 'DELETE' });
      if ((await res.json()).success) {
        window.App.toast('Batch deleted', 'success');
        this.loadHistory();
      }
    } catch(err) { window.App.toast('Delete error', 'danger'); }
  },

  async uploadFile(type, file) {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('facility_id', this.state.facilityId);
    formData.append('file_type', type);

    document.getElementById('importProgressContainer').classList.remove('d-none');
    document.getElementById('importStatusText').innerText = `Uploading ${file.name}...`;

    try {
      const res = await fetch('/api/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        this.state.activeBatchId = data.batch_id;
        document.getElementById('importStatusText').innerText = 'Processing rows in background...';
        this.pollStatus();
      } else {
        window.App.toast(data.error || 'Upload failed', 'danger');
        document.getElementById('importProgressContainer').classList.add('d-none');
      }
    } catch (e) {
      window.App.toast('Upload error', 'danger');
      document.getElementById('importProgressContainer').classList.add('d-none');
    }
  },

  pollStatus() {
    if (this.state.pollInterval) clearInterval(this.state.pollInterval);
    this.state.pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/import/status/${this.state.activeBatchId}`);
        const batch = await res.json();
        
        if (batch.status === 'done' || batch.status === 'error') {
          clearInterval(this.state.pollInterval);
          document.getElementById('importProgressContainer').classList.add('d-none');
          this.loadHistory();
          
          if (batch.status === 'done') {
            let quarters = [];
            try { quarters = JSON.parse(batch.quarters_json || '[]'); } catch(e){}
            window.App.toast(`Upload complete. ${batch.row_count || 0} inserted. ${batch.replaced_count || 0} updated. ${batch.skipped_count || 0} skipped. Quarters detected: ${quarters.join(', ')}`, 'success');
            
            const e1 = document.getElementById('emrFile'); if (e1) e1.value = '';
            const e2 = document.getElementById('shafafiyaFile'); if (e2) e2.value = '';

            setTimeout(() => { this.switchTab('vault'); }, 2000);
          } else {
            let errMsg = 'Unknown error';
            try { errMsg = JSON.parse(batch.errors_json).message || batch.errors_json; } catch(e) { errMsg = batch.errors_json; }
            window.App.toast(`Upload Failed: ${errMsg}`, 'danger');
          }
        }
      } catch (e) { console.error('Polling error', e); }
    }, 2000);
  }
};

window.DataManager = DataManager;

