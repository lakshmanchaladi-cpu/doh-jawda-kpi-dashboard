import { App } from './app.js';

export const Jdc = {
  async render(container) {
    container.innerHTML = `<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>`;

    try {
      const [previewRes, statusRes] = await Promise.all([
        fetch(`/api/jdc/preview?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`),
        fetch(`/api/jdc/status?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`)
      ]);
      if (!previewRes.ok) {
        const err = await previewRes.json();
        throw new Error(err.error || `HTTP ${previewRes.status}`);
      }
      const data = await previewRes.json();
      const status = statusRes.ok ? await statusRes.json() : { submission: null, quarterLocked: data.quarterLocked };
      data._status = status;
      this.renderPage(container, data);
    } catch (e) {
      container.innerHTML = `<div class="alert alert-danger">Error: ${e.message}</div>`;
    }
  },

  renderPage(container, data) {
    const f = data.facility;
    const statusBadge = status => {
      if (!status || status === 'no-data') return '<span class="badge bg-secondary">No Data</span>';
      if (status === 'met') return '<span class="badge bg-success">Met</span>';
      if (status === 'near') return '<span class="badge bg-warning text-dark">Near</span>';
      return '<span class="badge bg-danger">Not Met</span>';
    };

    const lockBadge = data.quarterLocked
      ? `<span class="badge bg-success"><i class="bi bi-lock-fill"></i> Locked (${data.lockedAt})</span>`
      : `<span class="badge bg-danger"><i class="bi bi-unlock-fill"></i> Not Locked</span>`;

    // Workflow status
    const sub = data._status?.submission;
    const stepStatus = sub?.status || 'draft';
    const steps = [
      { id: 'draft', label: 'Prepare', icon: 'bi-clipboard-plus' },
      { id: 'validated', label: 'Validate', icon: 'bi-check2-square' },
      { id: 'submitted', label: 'Finalize & Sign', icon: 'bi-pen-fill' }
    ];
    const currentStepIdx = steps.findIndex(s => s.id === stepStatus);

    const validationChecks = [
      { label: 'Quarter locked & records frozen', pass: data.quarterLocked, detail: data.quarterLocked ? `Locked ${data.lockedAt}` : 'Lock the quarter before submitting' },
      { label: `Data imports recorded (${data.importCount})`, pass: data.importCount > 0, detail: data.imports.map(i => `${i.file_type || '?'} (${i.row_count || 0} rows)`).join(', ') || 'No imports found' },
      { label: 'All KPIs have data', pass: data.noDataKPIs === 0, detail: data.noDataKPIs === 0 ? 'All calculated' : `${data.noDataKPIs} with no data` },
    ];

    const canValidate = data._status?.canValidate === true;
    const canFinalize = data._status?.canFinalize === true;

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0"><i class="bi bi-file-earmark-spreadsheet me-2"></i>JDC Export & Submission</h2>
          <p class="text-muted mb-0">${f.name} (MF: ${f.mf_no}) — Q${data.quarter} ${data.year}</p>
        </div>
        <button class="btn btn-primary" id="jdcExportBtn" ${data.results.length === 0 ? 'disabled' : ''}>
          <i class="bi bi-download me-1"></i> Download JDC Workbook
        </button>
      </div>

      <!-- Workflow Stepper -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            ${steps.map((s, i) => {
              const done = i < currentStepIdx || stepStatus === 'submitted' ? 'step-done' : '';
              const active = i === currentStepIdx ? 'step-active' : '';
              return `
                <div class="d-flex align-items-center gap-2 flex-grow-1">
                  <div class="step-circle ${done} ${active} ${i < currentStepIdx ? 'bg-success text-white' : ''}">
                    <i class="bi ${i < currentStepIdx ? 'bi-check-lg' : s.icon}"></i>
                  </div>
                  <div>
                    <div class="fw-bold small">${s.label}</div>
                    <div class="text-muted small">
                      ${s.id === 'draft' ? (sub?.prepared_at ? 'Prepared ' + new Date(sub.prepared_at).toLocaleDateString() : 'Not prepared') : ''}
                      ${s.id === 'validated' ? (sub?.validated_at ? 'Validated ' + new Date(sub.validated_at).toLocaleDateString() : 'Not validated') : ''}
                      ${s.id === 'submitted' ? (sub?.submitted_at ? 'Submitted ' + new Date(sub.submitted_at).toLocaleDateString() : 'Not submitted') : ''}
                    </div>
                  </div>
                  ${i < steps.length - 1 ? `<div class="flex-grow-1 border-top border-2 ${i < currentStepIdx ? 'border-success' : ''} mb-3"></div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
          <div class="alert alert-info mt-3 mb-0 py-2 small">
            <i class="bi bi-info-circle me-1"></i>
            Workflow: <strong>Prepare</strong> (download workbook) → <strong>Validate</strong> (completeness checks) → <strong>Finalize & Sign</strong> (CEO approval, locks quarter)
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex gap-2 flex-wrap align-items-end">
            <div class="flex-grow-1" style="max-width: 320px">
              <label class="form-label small fw-bold" for="ceoNameInput">CEO Name (for sign-off)</label>
              <input type="text" class="form-control form-control-sm" id="ceoNameInput" placeholder="Full name of CEO" value="${sub?.ceo_name || ''}">
            </div>
            <button class="btn btn-outline-primary btn-sm" id="jdcValidateBtn" ${canValidate ? '' : 'disabled'}>
              <i class="bi bi-check2-square me-1"></i> Validate Submission
            </button>
            <button class="btn btn-outline-success btn-sm" id="jdcFinalizeBtn" ${canFinalize ? '' : 'disabled'}>
              <i class="bi bi-pen-fill me-1"></i> Finalize & Sign
            </button>
          </div>
          <div id="workflowMsg" class="mt-2 small"></div>
        </div>
      </div>

      <!-- Facility Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card bg-primary text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Total KPIs</h6>
              <h2 class="display-6 fw-bold mb-0">${data.totalKPIs}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Met Target</h6>
              <h2 class="display-6 fw-bold mb-0">${data.metKPIs}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Near Target</h6>
              <h2 class="display-6 fw-bold mb-0">${data.nearKPIs}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-danger text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Not Met / No Data</h6>
              <h2 class="display-6 fw-bold mb-0">${data.notMetKPIs + data.noDataKPIs}</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white fw-bold">Facility Information</div>
            <div class="card-body">
              <table class="table table-sm mb-0">
                <tbody>
                  <tr><th style="width:40%">Name</th><td>${f.name}</td></tr>
                  <tr><th>MF Number</th><td>${f.mf_no}</td></tr>
                  <tr><th>License No.</th><td>${f.license_no || '-'}</td></tr>
                  <tr><th>Facility Type</th><td>${data.facilityType}</td></tr>
                  <tr><th>Coordinator</th><td>${f.coordinator || '-'}</td></tr>
                  <tr><th>Company</th><td>${data.company || '-'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white fw-bold">Submission Status</div>
            <div class="card-body">
              <table class="table table-sm mb-0">
                <tbody>
                  <tr><th style="width:40%">Quarter Status</th><td>${lockBadge}</td></tr>
                  <tr><th>Workflow Status</th><td><span class="badge text-bg-${stepStatus === 'submitted' ? 'success' : stepStatus === 'validated' ? 'info' : 'secondary'}">${stepStatus}</span></td></tr>
                  <tr><th>Registry Version</th><td>${data.registryVersion}</td></tr>
                  <tr><th>KPIs Submitted</th><td>${data.totalKPIs}</td></tr>
                  <tr><th>Imports Recorded</th><td>${data.importCount}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Validation Checklist -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white fw-bold"><i class="bi bi-clipboard-check me-2"></i>Data Validation Checklist</div>
        <div class="card-body p-0">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr><th>Check</th><th style="width:90px">Status</th><th>Details</th></tr>
            </thead>
            <tbody>
              ${validationChecks.map(c => `
                <tr>
                  <td>${c.label}</td>
                  <td>${c.pass ? '<span class="badge bg-success">PASS</span>' : '<span class="badge bg-danger">FAIL</span>'}</td>
                  <td class="text-muted small">${c.detail}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- KPI Results -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white fw-bold"><i class="bi bi-table me-2"></i>KPI Results (submitted)</div>
        <div class="card-body p-0">
          <div style="max-height:420px;overflow:auto">
            <table class="table table-sm table-striped mb-0">
              <thead class="table-dark sticky-top">
                <tr>
                  <th>Code</th>
                  <th>Indicator</th>
                  <th class="text-center">Target</th>
                  <th class="text-center">Num</th>
                  <th class="text-center">Denom</th>
                  <th class="text-center">Value</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.results.map(r => `
                  <tr>
                    <td class="fw-bold">${r.kpi_code}</td>
                    <td class="small">${r.short_name}</td>
                    <td class="text-center">${r.target != null ? r.target + '%' : '-'}</td>
                    <td class="text-center">${r.numerator ?? '-'}</td>
                    <td class="text-center">${r.denominator ?? '-'}</td>
                    <td class="text-center fw-bold">${r.value != null ? r.value + '%' : '-'}</td>
                    <td class="text-center">${statusBadge(r.status)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Export button handler - also records "prepare" step
    document.getElementById('jdcExportBtn').addEventListener('click', async () => {
      const btn = document.getElementById('jdcExportBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Generating...';
      try {
        const res = await fetch(`/api/jdc/export?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `JDC_${f.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Q${data.quarter}_${data.year}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        // Log prepare
        try {
          await fetch('/api/jdc/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ facility_id: App.state.facilityId, year: App.state.year, quarter: App.state.quarter })
          });
        } catch (e) { /* non-critical */ }

        App.toast('JDC workbook downloaded', 'success');
        App.refreshCurrentPage();
      } catch (e) {
        App.toast('Export failed: ' + e.message, 'danger');
        console.error('JDC export error:', e);
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-download me-1"></i> Download JDC Workbook';
      }
    });

    // Validate button
    document.getElementById('jdcValidateBtn').addEventListener('click', async () => {
      const btn = document.getElementById('jdcValidateBtn');
      btn.disabled = true;
      try {
        const res = await fetch('/api/jdc/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ facility_id: App.state.facilityId, year: App.state.year, quarter: App.state.quarter })
        });
        const r = await res.json();
        const msg = document.getElementById('workflowMsg');
        if (r.validated) {
          msg.innerHTML = `<span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i>Validation passed — all checks complete.</span>`;
          App.toast('Validation passed', 'success');
        } else {
          msg.innerHTML = `<span class="text-danger fw-bold"><i class="bi bi-x-circle-fill me-1"></i>Validation failed.</span> <span class="text-muted">${(r.checks || []).filter(c=>!c.pass).map(c=>c.label).join('; ')}</span>`;
          App.toast('Validation failed', 'danger');
        }
        App.refreshCurrentPage();
      } catch (e) {
        App.toast('Validate failed: ' + e.message, 'danger');
      } finally {
        btn.disabled = false;
      }
    });

    // Finalize button
    document.getElementById('jdcFinalizeBtn').addEventListener('click', async () => {
      const ceoName = document.getElementById('ceoNameInput').value.trim();
      if (!confirm(`Finalize & sign JDC submission for Q${data.quarter} ${data.year}?${ceoName ? `\nCEO: ${ceoName}` : '\nNo CEO name provided'}`)) return;

      const btn = document.getElementById('jdcFinalizeBtn');
      btn.disabled = true;
      try {
        const res = await fetch('/api/jdc/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ facility_id: App.state.facilityId, year: App.state.year, quarter: App.state.quarter, ceo_name: ceoName })
        });
        const r = await res.json();
        if (r.success) {
          App.toast('Submission finalized & signed', 'success');
          App.refreshCurrentPage();
        } else {
          App.toast('Finalize failed: ' + (r.error || 'unknown'), 'danger');
        }
      } catch (e) {
        App.toast('Finalize failed: ' + e.message, 'danger');
      } finally {
        btn.disabled = false;
      }
    });
  }
};