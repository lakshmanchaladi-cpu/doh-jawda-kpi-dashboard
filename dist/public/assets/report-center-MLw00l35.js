import{A as t}from"./main-DHmSEy9Y.js";const r={async render(e){t.state.facilityId&&(e.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0"><i class="bi bi-file-earmark-spreadsheet me-2"></i>Report Center</h2>
          <p class="text-muted mb-0">Instant Data Extracts & Auditor Proofs for Q${t.state.quarter} ${t.state.year}</p>
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
    `,window.ReportCenter=this,this.populateKpiDropdown())},async populateKpiDropdown(){try{const e=await fetch(`/api/kpi/results?facility_id=${t.state.facilityId}&year=${t.state.year}&quarter=${t.state.quarter}`);if(!e.ok)return;const a=await e.json(),s=document.getElementById("proofKpiSelect");if(!s)return;if(a.length===0){s.innerHTML='<option value="">No calculations found for Q'+t.state.quarter+"</option>";return}s.innerHTML=a.map(i=>`<option value="${i.kpi_code}">${i.kpi_code} - ${i.short_name||i.name}</option>`).join("")}catch(e){console.error("Error populating KPIs:",e)}},downloadJawda(){const e=`/api/reports/jawda-export?facility_id=${t.state.facilityId}&year=${t.state.year}&quarter=${t.state.quarter}`;window.open(e,"_blank")},downloadGaps(){const e=`/api/audit/download-gaps?facility_id=${t.state.facilityId}&year=${t.state.year}&quarter=${t.state.quarter}`;window.open(e,"_blank")},downloadProofs(){const e=document.getElementById("proofKpiSelect");if(!e||!e.value){t.toast("Please select a KPI first.","warning");return}const a=`/api/proofs/export?facility_id=${t.state.facilityId}&year=${t.state.year}&quarter=${t.state.quarter}&kpi_code=${e.value}`;window.open(a,"_blank")},downloadExceptions(){const e=`/api/audit/exceptions?facility_id=${t.state.facilityId}&year=${t.state.year}&quarter=${t.state.quarter}`;window.open(e,"_blank")}};export{r as ReportCenter};
