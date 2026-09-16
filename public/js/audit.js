window.sortAuditTable = function(th, colIndex) {
  const table = th.closest('table');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  let dir = th.dataset.dir || 'asc';
  
  rows.sort((a, b) => {
    let A = a.children[colIndex].textContent.trim();
    let B = b.children[colIndex].textContent.trim();
    return dir === 'asc' ? A.localeCompare(B) : B.localeCompare(A);
  });
  
  dir = dir === 'asc' ? 'desc' : 'asc';
  th.dataset.dir = dir;
  
  // Add arrows for UI feedback
  table.querySelectorAll('th span').forEach(s => s.textContent = '');
  if (!th.querySelector('span')) th.innerHTML += ' <span class="ms-1"></span>';
  th.querySelector('span').innerHTML = dir === 'asc' ? '&uarr;' : '&darr;';

  rows.forEach(r => tbody.appendChild(r));
};

const Audit = {

  state: { monthlyData: [], activeTab: 'monthly', reconciliation: null },

  async render(container) {
    const fid = App.state.facilityId;
    const year = App.state.year;
    const quarter = App.state.quarter;

    container.innerHTML = `
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 class="mb-0 fw-bold"><i class="bi bi-clipboard2-data text-primary me-2"></i>Data Audit & Reconciliation</h4>
          <small class="text-muted">EMR vs RCM completeness &mdash; Whole Facility History</small>
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
      <div id="audit-alert-banner"></div>
      <div id="audit-summary-cards" class="row g-3 mb-4">
        ${this._loadingCards()}
      </div>
      <div id="audit-score-row" class="mb-4"></div>
      <ul class="nav nav-tabs mb-3" id="auditTabs">
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
      <div id="audit-tab-content">
        <div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading...</p></div>
      </div>`;

    await Promise.all([
      this._loadSummary(fid, year, quarter),
      this._loadMonthly(fid)
    ]);
    this.switchTab('monthly', document.querySelector('[data-audit-tab="monthly"]'));
    this.checkLock();
  },

  _loadingCards() {
    return Array(6).fill(0).map(() =>
      `<div class="col-6 col-md-4 col-xl-2">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body text-center py-3">
            <div class="placeholder-glow"><span class="placeholder col-8 mb-2"></span><span class="placeholder col-5"></span></div>
          </div>
        </div>
      </div>`
    ).join('');
  },

  async _loadSummary(fid, year, quarter) {
    try {
      const r = await fetch(`/api/audit/summary?facility_id=${fid}&year=${year}&quarter=${quarter}&_t=${Date.now()}`);
      const d = await r.json();
      this._renderSummaryCards(d);
      this._renderScoreRow(d);
      this._renderAlertBanner(d, quarter, year);
    } catch (e) {
      document.getElementById('audit-summary-cards').innerHTML =
        `<div class="col-12"><div class="alert alert-danger">Failed to load audit summary: ${e.message}</div></div>`;
    }
  },

  _renderAlertBanner(d, quarter, year) {
    const banner = document.getElementById('audit-alert-banner');
    const msgs = [];
    if (d.emrMonths < d.rcmMonths) msgs.push(`⚠️ EMR data only covers <strong>${d.emrMonths}</strong> months compared to <strong>${d.rcmMonths}</strong> months of RCM data.`);
    if (d.rcmMonths < d.emrMonths) msgs.push(`⚠️ RCM/Claims data only covers <strong>${d.rcmMonths}</strong> months compared to <strong>${d.emrMonths}</strong> months of EMR data.`);
    if (d.matchRate !== null && d.matchRate < 50 && (d.emr > 0 || d.rcm > 0)) msgs.push(`⚠️ Match rate is only <strong>${d.matchRate}%</strong> — significant EMR/RCM mismatch detected.`);
    banner.innerHTML = msgs.length
      ? `<div class="alert alert-danger border-danger fw-semibold mb-3">${msgs.join('<br>')}</div>`
      : `<div class="alert alert-success border-success mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i>Data audit complete — displaying matches and gaps across the entire facility history.</div>`;
  },

  _renderSummaryCards(d) {
    const matchColor = d.matchRate >= 80 ? 'success' : d.matchRate >= 50 ? 'warning' : 'danger';
    const cards = [
      { label: 'EMR Records', value: d.emr.toLocaleString(), icon: 'bi-hospital', color: d.emr > 0 ? 'primary' : 'danger', sub: `${d.emrMonths} months` },
      { label: 'RCM Claims', value: d.rcm.toLocaleString(), icon: 'bi-receipt', color: d.rcm > 0 ? 'info' : 'danger', sub: `${d.rcmMonths} months` },
      { label: 'Matched', value: d.matched.toLocaleString(), icon: 'bi-check2-circle', color: matchColor, sub: `${d.matchRate}% match rate` },
      { label: 'EMR-Only', value: d.emrOnly.toLocaleString(), icon: 'bi-exclamation-triangle', color: d.emrOnly > 0 ? 'warning' : 'secondary', sub: 'No claim found' },
      { label: 'RCM-Only', value: d.rcmOnly.toLocaleString(), icon: 'bi-exclamation-diamond', color: d.rcmOnly > 0 ? 'warning' : 'secondary', sub: 'No EMR record' },
      { label: 'THIQA', value: d.thiqa.toLocaleString(), icon: 'bi-shield-check', color: 'primary', sub: 'Verified claims' }
    ];

    document.getElementById('audit-summary-cards').innerHTML = cards.map(c => `
      <div class="col-6 col-md-4 col-xl-2">
        <div class="card border-0 shadow-sm h-100 border-top border-${c.color} border-3">
          <div class="card-body text-center py-3">
            <i class="bi ${c.icon} fs-2 text-${c.color} mb-1"></i>
            <div class="fw-bold fs-5">${c.value}</div>
            <div class="small text-muted">${c.label}</div>
            <div class="text-${c.color} small fw-semibold">${c.sub}</div>
          </div>
        </div>
      </div>`).join('');
  },

  _renderScoreRow(d) {
    const s = d.completenessScore;
    const color = s >= 80 ? '#198754' : s >= 50 ? '#fd7e14' : '#dc3545';
    
    const maxMonths = Math.max(d.emrMonths, d.rcmMonths, 1);
    
    const breakdown = [
      { label: 'EMR Coverage', pts: Math.round((d.emrMonths / maxMonths) * 50), max: 50 },
      { label: 'RCM Coverage', pts: Math.round((d.rcmMonths / maxMonths) * 25), max: 25 },
      { label: 'Match Rate ≥80%', pts: d.matchRate >= 80 ? 25 : Math.round((d.matchRate / 80) * 25), max: 25 }
    ];

    const insRows = [
      { label: '🔵 THIQA', val: d.thiqa },
      { label: '🏛️ ABM Mandate', val: d.abm },
      { label: '🏥 Commercial', val: d.commercial },
      { label: '💳 Self-Pay', val: d.selfPay }
    ];

    document.getElementById('audit-score-row').innerHTML = `
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
              <div class="fw-bold text-muted mb-2 small text-uppercase">Data Completeness Score</div>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e9ecef" stroke-width="12"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="${color}" stroke-width="12"
                  stroke-dasharray="${2 * Math.PI * 50}"
                  stroke-dashoffset="${2 * Math.PI * 50 * (1 - s / 100)}"
                  stroke-linecap="round" transform="rotate(-90 60 60)"/>
                <text x="60" y="55" text-anchor="middle" font-size="22" font-weight="bold" fill="${color}">${s}</text>
                <text x="60" y="72" text-anchor="middle" font-size="11" fill="#6c757d">/ 100</text>
              </svg>
              <div class="mt-2">
                ${breakdown.map(b => `
                  <div class="d-flex justify-content-between small mb-1">
                    <span class="text-muted">${b.label}</span>
                    <span class="fw-bold">${b.pts}/${b.max} pts</span>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="fw-bold text-muted mb-3 small text-uppercase">
                <i class="bi bi-pie-chart me-1"></i>Insurance Breakdown (Whole Facility)
              </div>
              <div class="row g-2">
                ${insRows.map(r => {
                  const total = d.rcm || 1;
                  const pct = Math.round((r.val / total) * 100);
                  return `<div class="col-12">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <small class="fw-semibold">${r.label}</small>
                      <small class="text-muted">${r.val.toLocaleString()} (${pct}%)</small>
                    </div>
                    <div class="progress" style="height:8px;">
                      <div class="progress-bar" style="width:${pct}%"></div>
                    </div>
                  </div>`;
                }).join('')}
              </div>
              <hr class="my-2">
                <div class="row text-center mt-1">
                  <div class="col"><small class="text-muted d-block">Match Key</small><small class="fw-semibold">MRN + Encounter Date</small></div>
                  <div class="col"><small class="text-muted d-block">Insurance Map</small><small class="fw-semibold">DOH Dictionary</small></div>
                  <div class="col"><small class="text-muted d-block">Scope</small><small class="fw-semibold">All Claims</small></div>
                </div>
            </div>
          </div>
        </div>
      </div>`;
  },

  async _loadMonthly(fid) {
    try {
      const r = await fetch(`/api/audit/monthly?facility_id=${fid}`);
      this.state.monthlyData = await r.json();
    } catch (e) {
      this.state.monthlyData = [];
    }
  },

  switchTab(tab, el) {
    this.state.activeTab = tab;
    document.querySelectorAll('[data-audit-tab]').forEach(a => a.classList.remove('active'));
    if (el) el.classList.add('active');
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
    if (rate === null) return '<span class="text-muted">—</span>';
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
        <div class="card-footer bg-white small text-muted">
          <i class="bi bi-info-circle me-1"></i>
          Insurance categories are assigned dynamically based on the DOH Dictionary mapping table.
        </div>
      </div>`;
  },

  async _loadAndRenderReconciliation(content) {
    content.innerHTML = `<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading reconciliation data...</p></div>`;
    try {
      const fid = App.state.facilityId;
      const r = await fetch(`/api/audit/reconciliation?facility_id=${fid}&year=${App.state.year}&quarter=${App.state.quarter}`);
      const d = await r.json();
      this.state.reconciliation = d;
      this._renderReconciliation(content, d);
    } catch (e) {
      content.innerHTML = `<div class="alert alert-danger">Failed to load reconciliation: ${e.message}</div>`;
    }
  },

  _renderReconciliation(content, d) {
    const emrOnlyRows = (d.emrOnly || []).map(r => `
      <tr>
        <td class="font-monospace small">${r.mrn || '—'}</td>
        <td>${r.encounter_date || '—'}</td>
        <td>${r.physician_type || '—'}</td>
        <td class="small">${r.icd10_primary || '—'}</td>
        <td>${r.patient_age || '—'}</td>
        <td>${r.gender || '—'}</td>
        <td><span class="badge bg-warning text-dark">No Claim Found</span></td>
      </tr>`).join('') || `<tr><td colspan="7" class="text-center text-muted py-3">✅ No EMR-only records — all visits have matching claims</td></tr>`;

    const rcmOnlyRows = (d.rcmOnly || []).map(r => `
      <tr>
        <td class="font-monospace small">${r.claim_id || '—'}</td>
        <td class="font-monospace small">${r.mrn || '—'}</td>
        <td>${r.encounter_date || '—'}</td>
        <td>${r.physician_type || '—'}</td>
        <td class="small">${r.icd10_primary || '—'}</td>
        <td>${r.insurance_type || '—'}</td>
        <td><span class="badge bg-secondary">${r.insurance_category || '—'}</span></td>
        <td><span class="badge bg-danger">No EMR Record</span></td>
      </tr>`).join('') || `<tr><td colspan="8" class="text-center text-muted py-3">✅ No RCM-only records — all claims have matching EMR visits</td></tr>`;

    content.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
         <h6 class="mb-0 text-muted">Showing a preview of mismatches (Max 200 records)</h6>
         <a href="/api/audit/download-gaps?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}" target="_blank" class="btn btn-outline-primary btn-sm">
           <i class="bi bi-download me-2"></i>Download Full Mismatch Report (CSV)
         </a>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <div class="alert alert-warning border-warning mb-0 py-2">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>EMR-Only (${d.emrOnly?.length || 0} records shown)</strong> — Visits with no matching claim.
            Risk: unsubmitted claims, JAWDA KPI denominator gap.
          </div>
        </div>
        <div class="col-md-6">
          <div class="alert alert-danger border-danger mb-0 py-2">
            <i class="bi bi-exclamation-diamond me-2"></i>
            <strong>RCM-Only (${d.rcmOnly?.length || 0} records shown)</strong> — Claims with no clinical EMR record.
            Risk: unverifiable KPI numerators, DOH audit exposure.
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-warning-subtle">
          <strong><i class="bi bi-clipboard-x me-2"></i>EMR Visits Without Matching Claim (top 100)</strong>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
            <thead class="table-light"><tr>
              <th>MRN</th><th>Encounter Date</th><th>Physician Type</th>
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
              <th>Claim ID</th><th>MRN</th><th>Date</th><th>Physician</th>
              <th>ICD-10</th><th>Payer Code</th><th>Category</th><th>Issue</th>
            </tr></thead>
            <tbody>${rcmOnlyRows}</tbody>
          </table>
        </div>
      </div>`;
  },

  async _loadAndRenderThiqa(content) {
    content.innerHTML = `<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading Data Audit...</p></div>`;
    try {
      const fid = App.state.facilityId;
      let d = this.state.reconciliation;
      if (!d) {
        const r = await fetch(`/api/audit/reconciliation?facility_id=${fid}&year=${App.state.year}&quarter=${App.state.quarter}`);
        d = await r.json();
        this.state.reconciliation = d;
      }
      const records = d.thiqaRecords || [];
      const matched = records.filter(r => r.emr_match === 'Matched').length;
      const unmatched = records.filter(r => r.emr_match !== 'Matched').length;

      const rows = records.map(r => `
        <tr class="${r.emr_match !== 'Matched' ? 'table-warning' : ''}">
          <td class="font-monospace small">${r.claim_id || '—'}</td>
          <td class="font-monospace small">${r.mrn || '—'}</td>
          <td>${r.encounter_date || '—'}</td>
          <td>${r.physician_type || '—'}</td>
          <td><span class="badge bg-secondary">${r.insurance_type || 'Self-Pay'}</span></td>
          <td class="small">${r.icd10_primary || '—'}</td>
          <td>${r.emr_match === 'Matched'
            ? '<span class="badge bg-success">✅ Matched</span>'
            : '<span class="badge bg-danger">⚠️ No EMR Record</span>'}
          </td>
        </tr>`).join('') || `<tr><td colspan="7" class="text-center text-muted py-4">No encounters found</td></tr>`;

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
            <div class="card-header bg-white">
              <strong><i class="bi bi-shield-check text-primary me-2"></i>All Claims Audit Log (Up to 500 records)</strong>
            </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
                <thead class="table-dark"><tr>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 0)">Claim ID</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 1)">MRN</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 2)">Encounter Date</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 3)">Physician Type</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 4)">Insurance</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 5)">ICD-10 Primary</th>
                  <th style="cursor:pointer" onclick="window.sortAuditTable(this, 6)">EMR Match Status</th>
                </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>`;
    } catch (e) {
      content.innerHTML = `<div class="alert alert-danger">Failed to load THIQA data: ${e.message}</div>`;
    }
  },

  async _loadAndRenderBatches(content) {
    content.innerHTML = `<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading import history...</p></div>`;
    try {
      const r = await fetch(`/api/audit/batches?facility_id=${App.state.facilityId}`);
      const batches = await r.json();

      const rows = batches.map(b => {
        const statusBadge = (b.status === 'completed' || b.status === 'done')
          ? `<span class="badge bg-success">✅ Completed</span>`
          : b.status === 'partial'
          ? `<span class="badge bg-warning text-dark">⚠️ Partial</span>`
          : b.status === 'error' || b.status === 'failed'
          ? `<span class="badge bg-danger">❌ Error</span>`
          : `<span class="badge bg-secondary">${b.status}</span>`;
        const typeBadge = (b.file_type || '').toLowerCase().includes('rcm') || (b.file_type || '').toLowerCase().includes('shaf')
          ? `<span class="badge bg-info text-dark">RCM/Shafafiya</span>`
          : `<span class="badge bg-primary">EMR</span>`;
        return `<tr>
          <td class="text-muted small">#${b.id}</td>
          <td>${typeBadge}</td>
          <td class="small">${b.file_name || '—'}</td>
          <td class="text-center">Q${b.quarter} ${b.year}</td>
          <td class="text-center fw-bold">${(b.row_count || 0).toLocaleString()}</td>
          <td class="text-center ${b.error_count > 0 ? 'text-danger fw-bold' : 'text-muted'}">${b.error_count || 0}</td>
          <td>${statusBadge}</td>
          <td class="small text-muted">${b.imported_at ? b.imported_at.substring(0, 16).replace('T', ' ') : '—'}</td>
        </tr>`;
      }).join('') || `<tr><td colspan="8" class="text-center py-4 text-muted">No import batches found. Use Data Import to upload EMR or RCM files.</td></tr>`;

      content.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <strong><i class="bi bi-box-arrow-in-down me-2"></i>Import Batch History (Last 20)</strong>
          </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle">
              <thead class="table-dark"><tr>
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
    // Inject modal into DOM if it doesn't exist
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
      
      log.innerHTML += `<span class="text-success">> SUCCESS: Calculated ${data.results.length} KPIs successfully!</span><br>`;
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
      if (data.success) { window._forceAuditReload = true; window._forceDashboardReload = true;
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
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `jawda_data_audit_${App.state.facilityId}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    App.toast('Audit CSV exported', 'success');
  }
};
