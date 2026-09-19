import { App } from './app.js';

export const ManualEntry = {
  render(container) {
    const facility = App.state.facilities.find(f => f.id === App.state.facilityId);
    
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">${facility.name} <span class="badge bg-secondary fs-6 ms-2">${facility.mf_no}</span></h2>
          <p class="text-muted mb-0">Manual KPI Entry — Q${App.state.quarter} ${App.state.year}</p>
        </div>
      </div>

      <div class="alert alert-info">
        <i class="bi bi-info-circle"></i> Some KPIs cannot be fully calculated from claims data and require manual measurement per DOH guidelines. Enter them here.
      </div>

      <div class="row">
        <!-- PC028 Wait Time -->
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white fw-bold">
              PC028: Outpatient Wait Time (≤30 min)
            </div>
            <div class="card-body">
              <p class="text-muted small">Target: ≥90%. If Malaffi auto-collection is not available, measure manually.</p>
              <form onsubmit="event.preventDefault(); ManualEntry.save('PC028', 'pc028-num', 'pc028-den', 'pc028-val')">
                <div class="row mb-3">
                  <div class="col">
                    <label class="form-label small text-muted">Patients Seen ≤30min</label>
                    <input type="number" id="pc028-num" class="form-control" onchange="ManualEntry.autoCalcPercent('pc028-num','pc028-den','pc028-val')">
                  </div>
                  <div class="col">
                    <label class="form-label small text-muted">Total Outpatients</label>
                    <input type="number" id="pc028-den" class="form-control" onchange="ManualEntry.autoCalcPercent('pc028-num','pc028-den','pc028-val')">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold">Result (%)</label>
                  <input type="number" step="0.01" id="pc028-val" class="form-control bg-light" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Save PC028</button>
              </form>
            </div>
          </div>
        </div>

        <!-- PC030 3rd Next Appointment -->
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white fw-bold">
              PC030: Days to 3rd Next Available Appointment
            </div>
            <div class="card-body">
              <p class="text-muted small">Measure manually once per quarter on the same day/time. Enter the average number of days.</p>
              <form onsubmit="event.preventDefault(); ManualEntry.save('PC030', null, null, 'pc030-val')">
                <div class="mb-3">
                  <label class="form-label small fw-bold">Average Days</label>
                  <input type="number" step="0.1" id="pc030-val" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Save PC030</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  autoCalcPercent(nId, dId, vId) {
    const n = parseFloat(document.getElementById(nId).value);
    const d = parseFloat(document.getElementById(dId).value);
    if (!isNaN(n) && !isNaN(d) && d > 0) {
      document.getElementById(vId).value = ((n / d) * 100).toFixed(2);
    }
  },

  async save(kpiCode, numId, denId, valId) {
    const data = {
      facility_id: App.state.facilityId,
      year: App.state.year,
      quarter: App.state.quarter,
      kpi_code: kpiCode,
      value: parseFloat(document.getElementById(valId).value)
    };
    if (numId && document.getElementById(numId).value) data.numerator = parseFloat(document.getElementById(numId).value);
    if (denId && document.getElementById(denId).value) data.denominator = parseFloat(document.getElementById(denId).value);

    try {
      const res = await fetch('/api/kpi/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) App.toast(`${kpiCode} saved successfully`);
      else App.toast(result.error, 'danger');
    } catch (e) {
      App.toast('Error saving', 'danger');
    }
  }
};
