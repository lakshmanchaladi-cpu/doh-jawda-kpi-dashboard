import { App } from './app.js';

export function sortAuditTable(th, colIndex) {
  const table = th.closest('table');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  let dir = th.dataset.dir || 'asc';

  rows.sort((a, b) => {
    const aVal = a.cells[colIndex].textContent.trim();
    const bVal = b.cells[colIndex].textContent.trim();
    return dir === 'asc' ? aVal.localeCompare(bVal, undefined, { numeric: true }) : bVal.localeCompare(aVal, undefined, { numeric: true });
  });

  th.dataset.dir = dir === 'asc' ? 'desc' : 'asc';
  rows.forEach(r => tbody.appendChild(r));
  table.querySelectorAll('th span').forEach(s => s.textContent = '');
}
window.sortAuditTable = sortAuditTable;

export const Audit = {
  state: { monthlyData: [], activeTab: 'monthly', reconciliation: null, thiqaPage: 1, thiqaPageSize: 50 },
  isLocked: false,

  render(container) {
    if (!App.state.facilityId) {
      container.innerHTML = `<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> Please select a facility first.</div>`;
      return;
    }
    
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0 fw-bold">Data Audit & Locking <span class="badge bg-secondary fs-6 ms-2">Q${App.state.quarter} ${App.state.year}</span></h2>
          <p class="text-muted mb-0">Reconcile EMR clinical data with RCM claims data before calculating KPIs.</p>
        </div>
        <div>
          <button class="btn btn-success btn-sm me-2 d-none" id="audit-calc-kpi-btn" onclick="Audit.calculateKPIs()">
            <i class="bi bi-play-circle me-1"></i>Calculate KPIs
          </button>
          <button class="btn btn-outline-danger btn-sm me-2" id="audit-lock-btn" onclick="Audit.toggleLock()">
            <i class="bi bi-lock me-1"></i>Save & Lock Audit
          </button>
          <button class="btn btn-outline-primary btn-sm me-2" onclick="Audit.refreshData()">
            <i class="bi bi-arrow-clockwise me-1"></i>Recalculate Audit Data
          </button>
          <button class="btn btn-outline-success btn-sm" onclick="Audit.exportCsv()">
            <i class="bi bi-download me-1"></i>Export Audit CSV
          </button>
        </div>
      </div>

      <ul class="nav nav-tabs mb-4 border-bottom-0 gap-2">
        <li class="nav-item">
          <a class="nav-link active" href="#" data-audit-tab="monthly" onclick="Audit.switchTab('monthly',this)">
            <i class="bi bi-calendar3 me-1"></i>Monthly Coverage Grid
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-audit-tab="reconcile" onclick="Audit.switchTab('reconcile',this)">
            <i class="bi bi-arrow-left-right me-1"></i>Reconciliation
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-audit-tab="thiqa" onclick="Audit.switchTab('thiqa',this)">
            <i class="bi bi-shield-check me-1"></i>Full Audit Log
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-audit-tab="batches" onclick="Audit.switchTab('batches',this)">
            <i class="bi bi-box-arrow-in-down me-1"></i>Import Batches
          </a>
        </li>
      </ul>
      <div id="audit-tab-content"></div>
    `;

    this.checkLock();
    this.switchTab('monthly');
    this._loadMonthly(App.state.facilityId).then(() => {
      if (this.state.activeTab === 'monthly') {
        this._renderMonthly(document.getElementById('audit-tab-content'));
      }
    });
  },

  async _loadMonthly(fid) {
    try {
      const r = await fetch(`/api/audit/monthly?facility_id=${fid}`);
      const data = await r.json();
      if (!r.ok || !Array.isArray(data)) throw new Error(data.error || 'Monthly audit request failed');
      this.state.monthlyData = data;
    } catch (e) {
      this.state.monthlyData = [];
    }
  },

  switchTab(tab, el) {
    this.state.activeTab = tab;
    document.querySelectorAll('[data-audit-tab]').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');
    else document.querySelector(`[data-audit-tab="${tab}"]`).classList.add('active');
    const content = document.getElementById('audit-tab-content');
    if (tab === 'monthly') this._renderMonthly(content);
    else if (tab === 'reconcile') this._loadAndRenderReconciliation(content);
    else if (tab === 'thiqa') this._loadAndRenderThiqa(content);
    else if (tab === 'batches') this._loadAndRenderBatches(content);
  },

  _statusBadge(status) {
    if (status === 'received') return `<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check-circle me-1"></i>Data Received</span>`;
    return `<span class="badge bg-danger-subtle text-danger border border-danger"><i class="bi bi-exclamation-triangle me-1"></i>MISSING</span>`;
  },

  _matchRateBadge(rate) {
    if (rate === null) return '<span class="text-muted">?"</span>';
    const color = rate >= 80 ? 'success' : rate >= 50 ? 'warning' : 'danger';
    return `<span class="badge bg-${color}">${rate}%</span>`;
  },

  _renderMonthly(content) {
    const data = this.state.monthlyData;
    if (!data.length) {
      content.innerHTML = `<div class="alert alert-info">No data loaded. Please import EMR or RCM data first.</div>`;
      return;
    }

    const rows = data.map(m => {
      const rowClass = m.emrStatus === 'received' && m.rcmStatus === 'received'
        ? '' : m.emrStatus === 'received' || m.rcmStatus === 'received'
        ? 'table-warning bg-warning-subtle' : 'table-danger bg-danger-subtle';
      return `<tr class="${rowClass}">
        <td class="fw-semibold">${m.label}</td>
        <td class="text-center">${m.emrVisits.toLocaleString()}</td>
        <td class="text-center">${m.rcmClaims.toLocaleString()}</td>
        <td class="text-center">${m.matched.toLocaleString()}</td>
        <td class="text-center">${this._matchRateBadge(m.matchRate)}</td>
        <td class="text-center"><span class="badge bg-primary">${m.thiqa}</span></td>
        <td class="text-center"><span class="badge bg-secondary">${m.abm}</span></td>
        <td class="text-center"><span class="badge bg-info text-dark">${m.commercial}</span></td>
        <td class="text-center"><span class="badge bg-light text-dark border">${m.selfPay}</span></td>
        <td>${this._statusBadge(m.emrStatus)}</td>
        <td>${this._statusBadge(m.rcmStatus)}</td>
      </tr>`;
    }).join('');

    content.innerHTML = `
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white pt-3 pb-2">
          <h6 class="mb-0 fw-bold"><i class="bi bi-calendar3 me-2 text-primary"></i>Historical Coverage Grid</h6>
          <div class="small text-muted mt-1 float-end" style="margin-top: -20px;">
            Match key: MRN + Encounter Date | Green = both present | Yellow = partial | Red = both missing
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-bordered table-hover mb-0 align-middle" style="font-size:0.82rem;">
            <thead class="table-dark">
              <tr>
                <th>Month</th>
                <th class="text-center">EMR<br>Visits</th>
                <th class="text-center">RCM<br>Claims</th>
                <th class="text-center">Matched</th>
                <th class="text-center">Match<br>Rate</th>
                <th class="text-center text-primary">THIQA</th>
                <th class="text-center">ABM<br>Mandate</th>
                <th class="text-center">Commercial</th>
                <th class="text-center">Self-Pay</th>
                <th>EMR Status</th>
                <th>RCM Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  },

  async _loadAndRenderReconciliation(content) {
    content.innerHTML = `<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading reconciliation data...</p></div>`;
    try {
      const fid = App.state.facilityId;
      const r = await fetch(`/api/audit/reconciliation?facility_id=${fid}&year=${App.state.year}&quarter=${App.state.quarter}`);
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error || 'Audit log request failed');
      this.state.reconciliation = d;

      const emrOnlyRows = d.emrOnly.map(r => `
        <tr>
          <td class="font-monospace small">${r.mrn}</td>
          <td>${r.encounter_date}</td>
          <td class="font-monospace small">${r.physician_id}</td>
          <td>${r.physician_category}</td>
          <td class="small">${r.icd10_primary || ''}</td>
          <td>${r.patient_age || ''}</td>
          <td>${r.gender || ''}</td>
          <td class="text-danger small fw-semibold"><i class="bi bi-exclamation-circle me-1"></i>Missing RCM Claim</td>
        </tr>`).join('') || `<tr><td colspan="8" class="text-center text-muted">No missing RCM claims</td></tr>`;

      const rcmOnlyRows = d.rcmOnly.map(r => `
        <tr>
          <td class="font-monospace small">${r.claim_id}</td>
          <td class="font-monospace small">${r.mrn}</td>
          <td>${r.encounter_date}</td>
          <td class="font-monospace small">${r.physician_id || ''}</td>
          <td>${r.physician_category}</td>
          <td class="font-monospace small">${r.ordering_physician_id || ''}</td>
          <td>${r.ordering_physician_type || ''}</td>
          <td class="small">${r.icd10_primary || ''}</td>
          <td>${r.insurance_type}</td>
          <td>${r.insurance_category}</td>
          <td class="text-danger small fw-semibold"><i class="bi bi-exclamation-circle me-1"></i>Missing EMR Record</td>
        </tr>`).join('') || `<tr><td colspan="11" class="text-center text-muted">No missing EMR records</td></tr>`;

      content.innerHTML = `
        <div class="alert alert-warning border-0 shadow-sm small">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <strong>Reconciliation Required:</strong> The following tables highlight records that exist in one system but are missing in the other. 
          Unmatched claims will NOT be evaluated by the JAWDA KPI Engine. Please review and update your source systems if necessary before locking the quarter.
        </div>
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-warning-subtle">
            <strong><i class="bi bi-clipboard-x me-2"></i>EMR Visits Without Matching Claim (top 100)</strong>
          </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
              <thead class="table-light"><tr>
                <th>MRN</th><th>Encounter Date</th><th>Physician ID</th><th>Physician Type</th>
                <th>ICD-10</th><th>Age</th><th>Gender</th><th>Issue</th>
              </tr></thead>
              <tbody>${emrOnlyRows}</tbody>
            </table>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-header bg-danger-subtle">
            <strong><i class="bi bi-receipt-cutoff me-2"></i>RCM Claims Without Matching EMR Visit (top 100)</strong>
          </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
              <thead class="table-light"><tr>
                <th>Claim ID</th><th>MRN</th><th>Date</th><th>Physician ID</th><th>Physician Type</th>
                <th>Ordering ID</th><th>Ordering Type</th><th>ICD-10</th><th>Payer Code</th><th>Category</th><th>Issue</th>
              </tr></thead>
              <tbody>${rcmOnlyRows}</tbody>
            </table>
          </div>
        </div>`;
    } catch (e) {
      content.innerHTML = `<div class="alert alert-danger">Failed to load reconciliation data: ${e.message}</div>`;
    }
  },

  async _loadAndRenderThiqa(content) {
    content.innerHTML = `<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading Data Audit...</p></div>`;
    try {
      const fid = App.state.facilityId;
      let d = this.state.reconciliation;
      if (!d) {
        const r = await fetch(`/api/audit/reconciliation?facility_id=${fid}&year=${App.state.year}&quarter=${App.state.quarter}`);
        d = await r.json();
        if (!r.ok || d.error) throw new Error(d.error || 'Audit log request failed');
        this.state.reconciliation = d;
      }
      this._renderPaginatedThiqaTable();
    } catch (e) {
      document.getElementById('audit-tab-content').innerHTML = `<div class="alert alert-danger">Failed to load THIQA data: ${e.message}</div>`;
    }
  },

  setThiqaPage(page) {
    this.state.thiqaPage = page;
    this._renderPaginatedThiqaTable();
  },

  _renderPaginatedThiqaTable() {
    const content = document.getElementById('audit-tab-content');
    const records = this.state.reconciliation?.thiqaRecords || [];
    const matched = records.filter(r => r.emr_match === 'Matched').length;
    const unmatched = records.filter(r => r.emr_match !== 'Matched').length;

    // Pagination logic
    const totalPages = Math.ceil(records.length / this.state.thiqaPageSize) || 1;
    if (this.state.thiqaPage > totalPages) this.state.thiqaPage = totalPages;
    const startIdx = (this.state.thiqaPage - 1) * this.state.thiqaPageSize;
    const paginatedRecords = records.slice(startIdx, startIdx + this.state.thiqaPageSize);

    const rows = paginatedRecords.map(r => `
      <tr class="${r.emr_match !== 'Matched' ? 'table-warning' : ''}">
        <td class="font-monospace small">${r.claim_id || '?"'}</td>
        <td class="font-monospace small">${r.mrn || '?"'}</td>
        <td>${r.encounter_date || '?"'}</td>
        <td class="font-monospace small">${r.physician_id || '?"'}</td>
        <td>${r.physician_category || 'Other / Unknown'}</td>
        <td class="font-monospace small">${r.ordering_physician_id || '?"'}</td>
        <td>${r.ordering_physician_type || '?"'}</td>
        <td><span class="badge bg-secondary">${r.insurance_type || 'Self-Pay'}</span></td>
        <td class="small">${r.icd10_primary || '?"'}</td>
        <td>${r.emr_match === 'Matched' ? '<span class="badge bg-success">o. Matched</span>' : '<span class="badge bg-danger">s,? No EMR Record</span>'}</td>
      </tr>`).join('') || `<tr><td colspan="10" class="text-center text-muted py-4">No encounters found</td></tr>`;

    let paginationHtml = '';
    if (totalPages > 1) {
      paginationHtml = `
        <nav aria-label="Table pagination" class="mt-3">
          <ul class="pagination pagination-sm justify-content-center mb-0">
            <li class="page-item ${this.state.thiqaPage === 1 ? 'disabled' : ''}">
              <a class="page-link" href="#" onclick="event.preventDefault(); window.Audit.setThiqaPage(${this.state.thiqaPage - 1})">Previous</a>
            </li>
            <li class="page-item disabled"><span class="page-link">Page ${this.state.thiqaPage} of ${totalPages}</span></li>
            <li class="page-item ${this.state.thiqaPage === totalPages ? 'disabled' : ''}">
              <a class="page-link" href="#" onclick="event.preventDefault(); window.Audit.setThiqaPage(${this.state.thiqaPage + 1})">Next</a>
            </li>
          </ul>
        </nav>`;
    }

    content.innerHTML = `
      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center border-top border-primary border-3">
            <div class="card-body py-3">
              <i class="bi bi-shield-check fs-2 text-primary"></i>
              <div class="fw-bold fs-4">${records.length}</div>
              <div class="text-muted small">Total Encounters</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center border-top border-success border-3">
            <div class="card-body py-3">
              <i class="bi bi-check2-circle fs-2 text-success"></i>
              <div class="fw-bold fs-4">${matched}</div>
              <div class="text-muted small">EMR + RCM Matched</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center border-top border-danger border-3">
            <div class="card-body py-3">
              <i class="bi bi-exclamation-triangle fs-2 text-danger"></i>
              <div class="fw-bold fs-4">${unmatched}</div>
              <div class="text-muted small">No EMR Record</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center border-top border-info border-3">
            <div class="card-body py-3">
              <i class="bi bi-percent fs-2 text-info"></i>
              <div class="fw-bold fs-4">${records.length ? Math.round((matched/records.length)*100) : 0}%</div>
              <div class="text-muted small">Overall Match Rate</div>
            </div>
          </div>
        </div>
      </div>
      <div class="alert alert-info border-0 shadow-sm small">
        <i class="bi bi-info-circle me-2"></i>
        <strong>Data Audit Log:</strong> This table lists all uploaded claims. Every claim must have a corresponding EMR clinical record to be valid for JAWDA KPI calculation. Unmatched claims will be highlighted.
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <strong><i class="bi bi-shield-check text-primary me-2"></i>All Claims Audit Log</strong>
          <span class="badge bg-secondary text-white">Showing ${startIdx + 1}-${Math.min(startIdx + this.state.thiqaPageSize, records.length)} of ${records.length}</span>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
            <thead class="table-light"><tr>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 0)">Claim ID</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 1)">MRN</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 2)">Encounter Date</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 3)">Physician ID</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 4)">Physician Type</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 5)">Ordering ID</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 6)">Ordering Type</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 7)">Insurance</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 8)">ICD-10 Primary</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 9)">EMR Match Status</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${paginationHtml ? `<div class="card-footer bg-white border-0 pt-0 pb-3">${paginationHtml}</div>` : ''}
      </div>`;
  },

  async _loadAndRenderBatches(content) {
    content.innerHTML = `<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading batch history...</p></div>`;
    try {
      const fid = App.state.facilityId;
      const r = await fetch(`/api/audit/batches?facility_id=${fid}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to fetch batches');

      const rows = data.map(b => `
        <tr>
          <td class="font-monospace small">#${b.id}</td>
          <td><span class="badge ${b.file_type==='emr'?'bg-primary':'bg-info text-dark'} text-uppercase">${b.file_type}</span></td>
          <td class="small fw-semibold">${b.file_name}</td>
          <td class="text-center">Q${b.quarter} ${b.year}</td>
          <td class="text-center">${b.row_count}</td>
          <td class="text-center ${b.error_count > 0 ? 'text-danger fw-bold' : 'text-muted'}">${b.error_count}</td>
          <td>${b.status === 'done' ? '<span class="badge bg-success">Complete</span>' : b.status === 'processing' ? '<span class="badge bg-warning text-dark">Processing</span>' : '<span class="badge bg-danger">Failed</span>'}</td>
          <td class="small text-muted">${new Date(b.imported_at).toLocaleString()}</td>
        </tr>`).join('') || `<tr><td colspan="8" class="text-center text-muted">No imports found</td></tr>`;
      
      content.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <strong><i class="bi bi-cloud-arrow-up text-primary me-2"></i>Recent Import Batches</strong>
          </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.85rem;">
              <thead class="table-light"><tr>
                <th>Batch</th><th>Type</th><th>File Name</th><th class="text-center">Quarter</th>
                <th class="text-center">Records</th><th class="text-center">Errors</th>
                <th>Status</th><th>Imported At</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="card-footer bg-white text-muted small">
            <i class="bi bi-info-circle me-1"></i>
            EMR batches = clinical data (MRN, diagnoses, vitals, labs) |
            RCM batches = claim data (Claim ID, insurance code, CPTs)
          </div>
        </div>`;
    } catch (e) {
      content.innerHTML = `<div class="alert alert-danger">Failed to load batch history: ${e.message}</div>`;
    }
  },

  async calculateKPIs() {
    if (!document.getElementById('kpiProgressModal')) {
      const m = document.createElement('div');
      m.innerHTML = `<div class="modal fade" id="kpiProgressModal" data-bs-backdrop="static" tabindex="-1">
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
      </div>`;
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
          quarter: App.state.quarter,
          version: App.state.version
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
      
      log.innerHTML += `<span class="text-success">> SUCCESS: Calculated ${data.results.length} KPIs successfully!</span><br>`;
      footer.classList.remove('d-none');
      
      window._forceDashboardReload = true;
      window._forceComparisonReload = true; 
      
    } catch (err) {
      clearInterval(pTimer);
      bar.style.width = '100%';
      bar.classList.remove('progress-bar-animated', 'bg-primary');
      bar.classList.add('bg-danger');
      text.innerText = 'Engine Error';
      text.className = 'text-center text-danger mb-3 fw-bold';
      log.innerHTML += `<span class="text-danger">> FATAL: ${err.message}</span><br>`;
      footer.innerHTML = '<button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">Close</button>';
      footer.classList.remove('d-none');
    }
  },

  async checkLock() {
    try {
      const res = await fetch(`/api/kpi/lock-status?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`);
      const data = await res.json();
      this.isLocked = data.is_locked;
      const btnLock = document.getElementById('audit-lock-btn');
      
      if (this.isLocked) {
        btnLock.innerHTML = '<i class="bi bi-unlock"></i> Unlock Data';
        btnLock.className = 'btn btn-outline-secondary btn-sm me-2';
        document.getElementById('audit-calc-kpi-btn').classList.remove('d-none');
      } else {
        btnLock.innerHTML = '<i class="bi bi-lock"></i> Save & Lock Audit';
        btnLock.className = 'btn btn-outline-danger btn-sm me-2';
        document.getElementById('audit-calc-kpi-btn').classList.add('d-none');
      }
    } catch (e) {
      console.error(e);
    }
  },

  async toggleLock() {
    try {
      const res = await fetch('/api/kpi/toggle-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: App.state.facilityId,
          year: App.state.year,
          quarter: App.state.quarter,
          lock: !this.isLocked
        })
      });
      const data = await res.json();
      if (data.success) {
        window._forceAuditReload = true; window._forceDashboardReload = true;
        App.toast(this.isLocked ? 'Audit Unlocked!' : 'Audit Saved & Locked! KPI Engine is now unlocked.', 'success');
        this.checkLock();
      }
    } catch (e) {
      App.toast('Failed to toggle lock', 'danger');
    }
  },

  refreshData() {
    this.state.reconciliation = null;
    this.state.monthlyData = [];
    const container = document.getElementById('app-content');
    App.toast('Recalculating Data Audit...', 'info');
    this.render(container);
  },

  exportCsv() {
    const data = this.state.monthlyData;
    if (!data.length) { App.toast('No monthly data to export', 'warning'); return; }
    const headers = ['Month','EMR Visits','RCM Claims','Matched','Match Rate %','THIQA','ABM Mandate','Commercial','Self-Pay','EMR Status','RCM Status'];
    const rows = data.map(m => [
      m.label, m.emrVisits, m.rcmClaims, m.matched,
      m.matchRate !== null ? m.matchRate : '',
      m.thiqa, m.abm, m.commercial, m.selfPay,
      m.emrStatus === 'received' ? 'Data Received' : 'MISSING',
      m.rcmStatus === 'received' ? 'Data Received' : 'MISSING'
    ]);
    const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `jawda_data_audit_${App.state.facilityId}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    App.toast('Audit CSV exported', 'success');
  }
};

window.Audit = Audit;
