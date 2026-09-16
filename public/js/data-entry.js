/* ═══════════════════════════════════════════════════════════════════════════
   data-entry.js — Monthly KPI Data Entry Forms
   ═══════════════════════════════════════════════════════════════════════════ */

App.registerPage('data-entry', async (container) => {
  const { year, quarter } = App.state;
  const [kpiDefs, existingData] = await Promise.all([
    App.GET('/api/kpi/definitions'),
    App.GET(`/api/kpi/data?year=${year}&quarter=${quarter}`)
  ]);

  const months = App.quarterMonths(quarter);

  // Build lookup of existing data by kpi_code+month
  const existing = {};
  existingData.forEach(d => { existing[`${d.kpi_code}_${d.month}`] = d; });

  container.innerHTML = `
    <div class="page-header">
      <h4><i class="bi bi-pencil-square me-2"></i>Monthly Data Entry</h4>
      <p>Enter KPI data for Q${quarter} ${year}. Values are saved automatically per entry.</p>
    </div>

    <!-- Period Tabs -->
    <div class="section-card mb-4">
      <div class="section-header">
        <div class="section-title"><i class="bi bi-calendar3"></i> Reporting Period</div>
        <div class="badge bg-primary-subtle text-primary-emphasis fs-6 px-3 py-2">
          Q${quarter} ${year} · ${months.map(m => App.MONTHS[m-1]).join(', ')}
        </div>
      </div>

      <ul class="nav nav-tabs" id="monthTabs">
        ${months.map((m,i) => `
          <li class="nav-item">
            <button class="nav-link ${i===0?'active':''}" data-month="${m}">
              ${App.MONTHS[m-1]} ${year}
            </button>
          </li>`).join('')}
      </ul>

      ${months.map((m,i) => `
        <div class="month-panel pt-4 ${i===0?'':'d-none'}" id="panel-${m}">
          <div class="row g-3" id="kpi-forms-${m}"></div>
        </div>`).join('')}
    </div>

    <!-- CSV Import -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title"><i class="bi bi-upload"></i> Bulk Import (CSV)</div>
        <button class="btn btn-sm btn-outline-secondary" onclick="downloadTemplate()">
          <i class="bi bi-download"></i> Download Template
        </button>
      </div>
      <p class="text-muted" style="font-size:13px">
        Upload a CSV file to populate multiple KPI entries at once.
        Download the template to see the required format.
      </p>
      <div class="d-flex gap-3 align-items-center">
        <input type="file" class="form-control" id="csvInput" accept=".csv" style="max-width:320px">
        <button class="btn btn-doh" onclick="importCSV()">
          <i class="bi bi-cloud-upload"></i> Import
        </button>
      </div>
      <div id="importResult" class="mt-3"></div>
    </div>
  `;

  // ── Build KPI entry forms per month ──────────────────────────────────────
  months.forEach(m => {
    const container2 = document.getElementById(`kpi-forms-${m}`);
    kpiDefs.forEach(kpi => {
      const saved = existing[`${kpi.code}_${m}`];
      const isRatio = kpi.unit === 'ratio';

      container2.innerHTML += `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="kpi-card" id="card-${kpi.code}-${m}">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="kpi-code">${kpi.code}</span>
              <span class="domain-pill ${App.domainClass(kpi.domain)}" style="font-size:10px">${kpi.domain}</span>
            </div>
            <div class="kpi-name mb-3">${kpi.name}</div>

            <div class="mb-2">
              <label class="form-label">
                ${isRatio ? 'Controller Medications (Numerator)' : 'Numerator'}
                <span class="text-muted fw-normal" style="font-size:11px">
                  ${isRatio ? '(controller meds count)' : '(patients meeting criteria)'}
                </span>
              </label>
              <input type="number" class="form-control form-control-sm"
                     id="num-${kpi.code}-${m}"
                     value="${saved?.numerator ?? ''}"
                     placeholder="${isRatio ? 'e.g. 45' : 'e.g. 85'}"
                     min="0" step="any">
            </div>

            ${kpi.unit === 'min' ? '' : `
            <div class="mb-3">
              <label class="form-label">
                ${isRatio ? 'Total Asthma Medications (Denominator)' : 'Denominator'}
                <span class="text-muted fw-normal" style="font-size:11px">
                  ${isRatio ? '(all asthma meds)' : '(total eligible patients)'}
                </span>
              </label>
              <input type="number" class="form-control form-control-sm"
                     id="den-${kpi.code}-${m}"
                     value="${saved?.denominator ?? ''}"
                     placeholder="${isRatio ? 'e.g. 80' : 'e.g. 120'}"
                     min="0" step="any">
            </div>`}

            ${kpi.unit === 'min' ? `
            <div class="mb-3">
              <label class="form-label">Average Wait Time (minutes)</label>
              <input type="number" class="form-control form-control-sm"
                     id="num-${kpi.code}-${m}"
                     value="${saved?.numerator ?? ''}"
                     placeholder="e.g. 22.5"
                     min="0" step="0.1">
            </div>` : ''}

            <div class="mb-3">
              <label class="form-label">Notes <span class="text-muted fw-normal">(optional)</span></label>
              <input type="text" class="form-control form-control-sm"
                     id="notes-${kpi.code}-${m}"
                     value="${saved?.notes ?? ''}"
                     placeholder="Any remarks...">
            </div>

            <div class="d-flex align-items-center justify-content-between">
              <div id="result-${kpi.code}-${m}" class="text-muted" style="font-size:13px">
                ${saved?.value != null ? `Saved: <strong>${App.fmtValue(saved.value, kpi.unit)}</strong>` : 'Not entered yet'}
              </div>
              <button class="btn btn-sm btn-doh" onclick="saveEntry('${kpi.code}',${m},'${kpi.unit}')">
                <i class="bi bi-floppy-fill"></i> Save
              </button>
            </div>
          </div>
        </div>`;
    });
  });

  // ── Month tab switching ──────────────────────────────────────────────────
  document.querySelectorAll('#monthTabs .nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#monthTabs .nav-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.month-panel').forEach(p => p.classList.add('d-none'));
      document.getElementById(`panel-${btn.dataset.month}`).classList.remove('d-none');
    });
  });
});

// ── Save single entry ─────────────────────────────────────────────────────────
window.saveEntry = async function(code, month, unit) {
  const numEl  = document.getElementById(`num-${code}-${month}`);
  const denEl  = document.getElementById(`den-${code}-${month}`);
  const notesEl= document.getElementById(`notes-${code}-${month}`);
  const resEl  = document.getElementById(`result-${code}-${month}`);
  const { year } = App.state;

  const numerator   = numEl?.value !== '' ? parseFloat(numEl.value) : null;
  const denominator = denEl?.value !== '' ? parseFloat(denEl.value) : null;

  if (numerator === null) { App.toast('Please enter a numerator value', 'danger'); return; }

  try {
    const res = await App.POST('/api/kpi/data', {
      kpi_code: code, year, month,
      numerator, denominator,
      notes: notesEl?.value || null
    });
    resEl.innerHTML = `Saved: <strong class="text-success">${App.fmtValue(res.data.value, unit)}</strong>`;
    App.toast(`${code} data saved for ${App.MONTHS[month-1]}`, 'success');
  } catch(e) {
    App.toast('Error saving: ' + e.message, 'danger');
  }
};

// ── CSV Download Template ──────────────────────────────────────────────────────
window.downloadTemplate = function() {
  const { year, quarter } = App.state;
  const months = App.quarterMonths(quarter);
  const rows = [['kpi_code','year','month','numerator','denominator','notes']];
  const codes = ['PC-01','PC-02','PC-03','PC-04','PC-05','PC-06','PC-07'];
  months.forEach(m => codes.forEach(c => rows.push([c, year, m, '', '', ''])));

  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `kpi_template_Q${quarter}_${year}.csv`;
  a.click();
};

// ── CSV Import ────────────────────────────────────────────────────────────────
window.importCSV = async function() {
  const file = document.getElementById('csvInput').files[0];
  if (!file) { App.toast('Please select a CSV file', 'warning'); return; }

  const text = await file.text();
  const lines = text.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const resultEl = document.getElementById('importResult');

  const idx = k => header.indexOf(k);
  if (idx('kpi_code') < 0) {
    resultEl.innerHTML = '<div class="alert alert-danger">Invalid CSV. Download the template first.</div>';
    return;
  }

  let ok = 0, fail = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const row = {
      kpi_code:    cols[idx('kpi_code')]?.trim(),
      year:        parseInt(cols[idx('year')]?.trim()),
      month:       parseInt(cols[idx('month')]?.trim()),
      numerator:   cols[idx('numerator')]?.trim() !== '' ? parseFloat(cols[idx('numerator')]) : null,
      denominator: idx('denominator') >= 0 && cols[idx('denominator')]?.trim() !== '' ? parseFloat(cols[idx('denominator')]) : null,
      notes:       idx('notes') >= 0 ? cols[idx('notes')]?.trim() : null
    };
    if (!row.kpi_code || isNaN(row.year) || isNaN(row.month)) { fail++; continue; }
    try { await App.POST('/api/kpi/data', row); ok++; } catch { fail++; }
  }

  resultEl.innerHTML = `<div class="alert alert-${fail===0?'success':'warning'}">
    Imported: <strong>${ok}</strong> records. Failed: <strong>${fail}</strong>.
  </div>`;
  if (ok > 0) App.navigate('data-entry');
};
