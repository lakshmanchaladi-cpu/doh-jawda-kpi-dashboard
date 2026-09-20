import { App } from './app.js';

export const ReportCenter = {
  async render(container) {
    if (!App.state.facilityId) return;
    
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Report Center</h2>
          <p class="text-muted mb-0">Instant Data Extracts & Auditor Proofs for Q${App.state.quarter} ${App.state.year}</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- 1. JAWDA DOH Submission Export -->
        <div class="col-md-6 col-xl-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="bg-primary bg-opacity-10 p-3 rounded me-3 text-primary">
                  <i class="bi bi-cloud-arrow-down fs-3"></i>
                </div>
                <h5 class="card-title mb-0">JAWDA Submission Export</h5>
              </div>
              <p class="card-text text-muted small">Standard DOH-formatted aggregate KPI results for the selected quarter. This file can be uploaded directly to the JAWDA portal.</p>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0 pb-3">
              <button class="btn btn-primary w-100" onclick="window.ReportCenter.downloadJawda()">
                <i class="bi bi-download me-1"></i> Download CSV
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Revenue / EMR Gap Analysis -->
        <div class="col-md-6 col-xl-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="bg-warning bg-opacity-10 p-3 rounded me-3 text-warning">
                  <i class="bi bi-cash-coin fs-3"></i>
                </div>
                <h5 class="card-title mb-0">Billing Gap Analysis</h5>
              </div>
              <p class="card-text text-muted small">Cross-reference EMR encounters against RCM claims to identify unbilled visits and potential revenue leakage.</p>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0 pb-3">
              <button class="btn btn-warning w-100 text-dark" onclick="window.ReportCenter.downloadGaps()">
                <i class="bi bi-download me-1"></i> Download CSV
              </button>
            </div>
          </div>
        </div>

        <!-- 3. Patient-Level Auditor Proofs -->
        <div class="col-md-6 col-xl-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="bg-success bg-opacity-10 p-3 rounded me-3 text-success">
                  <i class="bi bi-person-lines-fill fs-3"></i>
                </div>
                <h5 class="card-title mb-0">Auditor Proofs</h5>
              </div>
              <p class="card-text text-muted small mb-2">Export the patient MRNs that make up the Numerator and Denominator for a specific KPI.</p>
              <select id="proofKpiSelect" class="form-select form-select-sm mb-2">
                <option value="">Loading KPIs...</option>
              </select>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0 pb-3">
              <button class="btn btn-success w-100" onclick="window.ReportCenter.downloadProofs()">
                <i class="bi bi-download me-1"></i> Export Patient List
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Data Quality Exceptions -->
        <div class="col-md-6 col-xl-4">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="bg-danger bg-opacity-10 p-3 rounded me-3 text-danger">
                  <i class="bi bi-exclamation-triangle fs-3"></i>
                </div>
                <h5 class="card-title mb-0">Data Quality Exceptions</h5>
              </div>
              <p class="card-text text-muted small">Identify rows skipped or flagged during ETL import (e.g., missing dates, negative ages, invalid mapping codes).</p>
            </div>
            <div class="card-footer bg-transparent border-0 pt-0 pb-3">
              <button class="btn btn-danger w-100" onclick="window.ReportCenter.downloadExceptions()">
                <i class="bi bi-download me-1"></i> Download Report
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    // Expose handlers globally so onclick attributes work
    window.ReportCenter = this;

    // Populate KPI Dropdown
    this.populateKpiDropdown();
  },

  async populateKpiDropdown() {
    try {
      const res = await fetch(`/api/kpi/results?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`);
      if (!res.ok) return;
      const data = await res.json();
      const select = document.getElementById('proofKpiSelect');
      if (!select) return;

      if (data.length === 0) {
        select.innerHTML = '<option value="">No calculations found for Q' + App.state.quarter + '</option>';
        return;
      }

      select.innerHTML = data.map(k => `<option value="${k.kpi_code}">${k.kpi_code} - ${k.short_name || k.name}</option>`).join('');
    } catch (e) {
      console.error('Error populating KPIs:', e);
    }
  },

  downloadJawda() {
    const url = `/api/reports/jawda-export?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`;
    window.open(url, '_blank');
  },

  downloadGaps() {
    const url = `/api/audit/download-gaps?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`;
    window.open(url, '_blank');
  },

  downloadProofs() {
    const select = document.getElementById('proofKpiSelect');
    if (!select || !select.value) {
      App.toast('Please select a KPI first.', 'warning');
      return;
    }
    const url = `/api/proofs/export?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}&kpi_code=${select.value}`;
    window.open(url, '_blank');
  },

  downloadExceptions() {
    const url = `/api/audit/exceptions?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`;
    window.open(url, '_blank');
  }
};
