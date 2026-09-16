/* ═══════════════════════════════════════════════════════════════════════════
   patients.js — Patient Management Page
   ═══════════════════════════════════════════════════════════════════════════ */

App.registerPage('patients', async (container) => {
  const [patients, stats] = await Promise.all([
    App.GET('/api/patients?active=1'),
    App.GET('/api/patients/stats/summary')
  ]);

  const conditionOpts = ['Diabetes','Hypertension','Asthma','Diabetes + Hypertension','Other'];

  container.innerHTML = `
    <div class="page-header">
      <h4><i class="bi bi-people-fill me-2"></i>Patient Management</h4>
      <p>Track individual patients for clinical KPI monitoring (PC-01 through PC-04)</p>
    </div>

    <!-- Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="summary-stat">
          <div class="stat-num">${patients.length}</div>
          <div class="stat-lbl">Active Patients</div>
        </div>
      </div>
      ${stats.slice(0,3).map(s => `
        <div class="col-6 col-md-3">
          <div class="summary-stat">
            <div class="stat-num">${s.active_count}</div>
            <div class="stat-lbl">${s.condition || 'Unknown'}</div>
          </div>
        </div>`).join('')}
    </div>

    <!-- Patient Table -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title"><i class="bi bi-table"></i> Patient List</div>
        <div class="d-flex gap-2">
          <input type="text" class="form-control form-control-sm" id="patientSearch"
                 placeholder="Search by name or MRN..." style="width:220px">
          <button class="btn btn-sm btn-doh" data-bs-toggle="modal" data-bs-target="#addPatientModal">
            <i class="bi bi-plus-circle"></i> Add Patient
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>MRN</th><th>Name</th><th>Condition</th><th>DOB</th><th>Gender</th><th>Actions</th>
            </tr>
          </thead>
          <tbody id="patientTableBody">
            ${patients.length === 0 ? `
              <tr><td colspan="6">
                <div class="empty-state">
                  <i class="bi bi-people text-muted"></i>
                  <p>No patients added yet. Click "Add Patient" to get started.</p>
                </div>
              </td></tr>` :
              patients.map(p => `
                <tr>
                  <td><code>${p.mrn}</code></td>
                  <td><strong>${p.name}</strong></td>
                  <td><span class="badge bg-secondary-subtle text-secondary-emphasis">${p.condition || '—'}</span></td>
                  <td>${p.dob || '—'}</td>
                  <td>${p.gender || '—'}</td>
                  <td>
                    <button class="btn btn-xs btn-outline-primary btn-sm me-1"
                            onclick="openPatientDetail(${p.id})">
                      <i class="bi bi-eye"></i> View
                    </button>
                    <button class="btn btn-xs btn-outline-success btn-sm"
                            onclick="addMeasurementModal(${p.id}, '${p.name}', '${p.condition}')">
                      <i class="bi bi-plus"></i> Measurement
                    </button>
                  </td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Patient Modal -->
    <div class="modal fade" id="addPatientModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" style="background:var(--doh-teal-dark);color:#fff">
            <h5 class="modal-title">Add New Patient</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">MRN <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="newMrn" placeholder="e.g. MRN-00123">
            </div>
            <div class="mb-3">
              <label class="form-label">Full Name <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="newName" placeholder="Patient full name">
            </div>
            <div class="row g-2">
              <div class="col-6">
                <label class="form-label">Date of Birth</label>
                <input type="date" class="form-control" id="newDob">
              </div>
              <div class="col-6">
                <label class="form-label">Gender</label>
                <select class="form-select" id="newGender">
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label">Primary Condition</label>
              <select class="form-select" id="newCondition">
                <option value="">Select...</option>
                ${conditionOpts.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-doh" onclick="savePatient()">
              <i class="bi bi-floppy-fill"></i> Save Patient
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Measurement Modal -->
    <div class="modal fade" id="measurementModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" style="background:var(--doh-teal-dark);color:#fff">
            <h5 class="modal-title" id="measurementModalTitle">Add Measurement</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="measPatientId">
            <div class="mb-3">
              <label class="form-label">KPI</label>
              <select class="form-select" id="measKpiCode" onchange="updateMeasurementPlaceholder()">
                <option value="PC-01">PC-01 — HbA1c (%)</option>
                <option value="PC-02">PC-02 — Blood Pressure (systolic/diastolic)</option>
                <option value="PC-04">PC-04 — BMI</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" id="measValueLabel">Value</label>
              <input type="number" class="form-control" id="measValue" step="0.1" placeholder="">
            </div>
            <div class="mb-3">
              <label class="form-label">Date</label>
              <input type="date" class="form-control" id="measDate" value="${new Date().toISOString().slice(0,10)}">
            </div>
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <input type="text" class="form-control" id="measNotes" placeholder="Optional">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-doh" onclick="saveMeasurement()">
              <i class="bi bi-floppy-fill"></i> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Search filter
  document.getElementById('patientSearch').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    document.querySelectorAll('#patientTableBody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
});

window.savePatient = async function() {
  const mrn       = document.getElementById('newMrn').value.trim();
  const name      = document.getElementById('newName').value.trim();
  const dob       = document.getElementById('newDob').value;
  const gender    = document.getElementById('newGender').value;
  const condition = document.getElementById('newCondition').value;

  if (!mrn || !name) { App.toast('MRN and Name are required', 'danger'); return; }

  try {
    await App.POST('/api/patients', { mrn, name, dob, gender, condition });
    bootstrap.Modal.getInstance(document.getElementById('addPatientModal')).hide();
    App.toast('Patient added successfully', 'success');
    App.navigate('patients');
  } catch(e) {
    App.toast('Error: ' + e.message, 'danger');
  }
};

window.addMeasurementModal = function(id, name, condition) {
  document.getElementById('measPatientId').value = id;
  document.getElementById('measurementModalTitle').textContent = `Add Measurement — ${name}`;

  // Pre-select KPI based on condition
  const sel = document.getElementById('measKpiCode');
  if (condition?.includes('Diabetes'))     sel.value = 'PC-01';
  else if (condition?.includes('Hypertension')) sel.value = 'PC-02';
  else sel.value = 'PC-04';

  updateMeasurementPlaceholder();
  new bootstrap.Modal(document.getElementById('measurementModal')).show();
};

window.updateMeasurementPlaceholder = function() {
  const code  = document.getElementById('measKpiCode').value;
  const label = document.getElementById('measValueLabel');
  const input = document.getElementById('measValue');
  const map = {
    'PC-01': ['HbA1c (%)', '7.5'],
    'PC-02': ['Systolic BP (mmHg)', '128'],
    'PC-04': ['BMI (kg/m²)', '25.4']
  };
  const [lbl, ph] = map[code] || ['Value', ''];
  label.textContent = lbl;
  input.placeholder = `e.g. ${ph}`;
};

window.saveMeasurement = async function() {
  const patientId       = document.getElementById('measPatientId').value;
  const kpi_code        = document.getElementById('measKpiCode').value;
  const value           = parseFloat(document.getElementById('measValue').value);
  const measurement_date= document.getElementById('measDate').value;
  const notes           = document.getElementById('measNotes').value;

  if (isNaN(value)) { App.toast('Please enter a valid value', 'danger'); return; }

  try {
    await App.POST(`/api/patients/${patientId}/measurements`, { kpi_code, measurement_date, value, notes });
    bootstrap.Modal.getInstance(document.getElementById('measurementModal')).hide();
    App.toast('Measurement saved', 'success');
  } catch(e) {
    App.toast('Error: ' + e.message, 'danger');
  }
};

window.openPatientDetail = async function(id) {
  const p = await App.GET(`/api/patients/${id}`);
  const rows = p.measurements.slice(0,10).map(m => `
    <tr>
      <td>${m.kpi_code}</td>
      <td>${m.measurement_date}</td>
      <td>${m.value ?? '—'}</td>
      <td>${m.meets_target === 1 ? '<span class="badge bg-success">Met</span>' :
           m.meets_target === 0 ? '<span class="badge bg-danger">Not Met</span>' :
           '<span class="badge bg-secondary">Unknown</span>'}</td>
      <td class="text-muted">${m.notes || '—'}</td>
    </tr>`).join('');

  const existing = document.getElementById('patientDetailModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal fade" id="patientDetailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" style="background:var(--doh-teal-dark);color:#fff">
            <h5 class="modal-title">${p.name} — ${p.mrn}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-2 mb-3">
              <div class="col-md-4"><small class="text-muted">Condition</small><br><strong>${p.condition || '—'}</strong></div>
              <div class="col-md-4"><small class="text-muted">DOB</small><br><strong>${p.dob || '—'}</strong></div>
              <div class="col-md-4"><small class="text-muted">Gender</small><br><strong>${p.gender || '—'}</strong></div>
            </div>
            <h6>Recent Measurements (Last 10)</h6>
            <table class="table table-sm table-hover">
              <thead><tr><th>KPI</th><th>Date</th><th>Value</th><th>Status</th><th>Notes</th></tr></thead>
              <tbody>${rows || '<tr><td colspan="5" class="text-center text-muted">No measurements recorded</td></tr>'}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  new bootstrap.Modal(document.getElementById('patientDetailModal')).show();
};
