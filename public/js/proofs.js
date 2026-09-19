import { App } from './app.js';

export const Proofs = {
  async render(container) {
    if (!App.state.facilityId) return;
    
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">KPI Calculation Proofs <span id="lock-badge"></span></h2>
          <p class="text-muted mb-0">Verification and formulas for Q${App.state.quarter} ${App.state.year}</p>
        </div>
        
      </div>
      
      <!-- Claims Modal -->
      <div class="modal fade" id="claimsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Claim IDs Review <span id="claims-kpi-title" class="badge bg-primary ms-2"></span></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <ul class="nav nav-tabs mb-3" id="claimsTabs" role="tablist">
                <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" href="#tab-missing">Failed/Missing Data <span id="badge-gap" class="badge bg-danger ms-1"></span></a></li>
                <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" href="#tab-passed">Passed Target <span id="badge-num" class="badge bg-success ms-1"></span></a></li>
              </ul>
              <div class="tab-content">
                <div class="tab-pane fade show active" id="tab-missing">
                  <div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>MRN / Claim ID</th><th>Status</th></tr></thead><tbody id="tbody-gap"></tbody></table></div>
                </div>
                <div class="tab-pane fade" id="tab-passed">
                  <div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>MRN / Claim ID</th><th>Status</th></tr></thead><tbody id="tbody-num"></tbody></table></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Waterfall Modal -->
        <div class="modal fade" id="waterfallModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Denominator Waterfall Breakdown</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body" id="waterfall-body">
                Loading breakdown...
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-bordered align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th style="width: 10%" class="text-center">Indicator</th>
                  <th style="width: 25%">Requirement As per DOH</th>
                  <th style="width: 25%">As per the system</th>
                  <th style="width: 40%">Audit Review (Missing Data)</th>
                </tr>
              </thead>
              <tbody id="proofs-tbody">
                <tr><td colspan="4" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    this.loadData();
  },

  async loadData() {
    try {
      const res = await fetch(`/api/kpi/results?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const results = await res.json();
      
      const mapRes = await fetch(`/api/kpi/proof-mappings`);
      const dbMaps = await mapRes.json();

      const tbody = document.getElementById('proofs-tbody');
      if (!results || results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No calculations found for this quarter. Run the engine first.</td></tr>';
        return;
      }
      
      let html = "";
      results.forEach(kpi => {
        const ProofsMapping = {
          'PC004': {
            doh_req: 'Age >= 18, PHQ-2 Result, PHQ-9 Score, PHQ-9 Date, Encounter Date',
            system_req: 'EMR Fields: patient_age, phq2_result, phq9_score, phq9_date',
            neum_formula: 'COUNT(patients with phq2_result=1 AND phq9_score > 0 AND phq9_date within 24h of encounter)',
            deno_formula: 'COUNT(patients >= 18 with phq2_result=1)'
          },
          'PC005': {
            doh_req: 'Age >= 18, PHQ-9 Score, Depression Diagnosis Date, Follow-up Visit Date',
            system_req: `EMR Fields: patient_age, phq9_score (5-14), depression_dx_date, followup_within_30d<br><br><b>RCM Diagnosis Fallback:</b> (${dbMaps['Depression_Inc'] || 'F32, F33'})`,
            neum_formula: 'COUNT(patients with followup_within_30d = 1)',
            deno_formula: 'COUNT(patients >= 18 with phq9_score between 5 and 14 AND new depression diagnosis)'
          },
          'PC009': {
  doh_req: 'Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, HbA1c Lab > 9.0%',
  system_req: `<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${dbMaps['Valid_EM'] || '99201-99215'})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${dbMaps['DM_Inclusion'] || 'E10-E13'}</div></details><br>
  3. Seen by Primary Care: (${dbMaps['PC_Valid']} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${dbMaps['Pregnancy_Exc']}<br>
  <b>Gestational:</b> ${dbMaps['DM_Gestational']}<br>
  <b>Steroid-Induced DM:</b> ${dbMaps['DM_Steroid']}<br>
  <b>PCOS:</b> ${dbMaps['DM_PCOS']}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,
  neum_formula: 'COUNT(Eligible patients with HbA1c > 9.0% OR missing result). <br><small class="text-muted"><i>UAE Outpatient Rule: If explicit lab date is missing, encounter_date is used as fallback.</i></small>',
  deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
},
          'PC010': {
  doh_req: 'Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, HbA1c Lab <= 8.0%',
  system_req: `<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${dbMaps['Valid_EM'] || '99201-99215'})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${dbMaps['DM_Inclusion'] || 'E10-E13'}</div></details><br>
  3. Seen by Primary Care: (${dbMaps['PC_Valid']} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${dbMaps['Pregnancy_Exc']}<br>
  <b>Gestational:</b> ${dbMaps['DM_Gestational']}<br>
  <b>Steroid-Induced DM:</b> ${dbMaps['DM_Steroid']}<br>
  <b>PCOS:</b> ${dbMaps['DM_PCOS']}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,
  neum_formula: 'COUNT(Eligible patients with HbA1c <= 8.0%). <br><small class="text-muted"><i>UAE Outpatient Rule: If explicit lab date is missing, encounter_date is used as fallback.</i></small>',
  deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
},
          'PC011': {
  doh_req: 'Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Foot Exam',
  system_req: `<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${dbMaps['Valid_EM'] || '99201-99215'})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${dbMaps['DM_Inclusion'] || 'E10-E13'}</div></details><br>
  3. Seen by Primary Care: (${dbMaps['PC_Valid']} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${dbMaps['Pregnancy_Exc']}<br>
  <b>Gestational:</b> ${dbMaps['DM_Gestational']}<br>
  <b>Steroid-Induced DM:</b> ${dbMaps['DM_Steroid']}<br>
  <b>PCOS:</b> ${dbMaps['DM_PCOS']}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,
  neum_formula: 'COUNT(Eligible patients with foot_exam_done = 1 OR claim contains Foot Exam CPT)',
  deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
},
          'PC012': {
  doh_req: 'Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Eye Exam',
  system_req: `<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${dbMaps['Valid_EM'] || '99201-99215'})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${dbMaps['DM_Inclusion'] || 'E10-E13'}</div></details><br>
  3. Seen by Primary Care: (${dbMaps['PC_Valid']} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${dbMaps['Pregnancy_Exc']}<br>
  <b>Gestational:</b> ${dbMaps['DM_Gestational']}<br>
  <b>Steroid-Induced DM:</b> ${dbMaps['DM_Steroid']}<br>
  <b>PCOS:</b> ${dbMaps['DM_PCOS']}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,
  neum_formula: 'COUNT(Eligible patients with eye_exam_done = 1 OR claim contains Eye Exam CPT)',
  deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
},
          'PC013': {
  doh_req: 'Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Nephropathy Exam',
  system_req: `<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${dbMaps['Valid_EM'] || '99201-99215'})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${dbMaps['DM_Inclusion'] || 'E10-E13'}</div></details><br>
  3. Seen by Primary Care: (${dbMaps['PC_Valid']} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${dbMaps['Pregnancy_Exc']}<br>
  <b>Gestational:</b> ${dbMaps['DM_Gestational']}<br>
  <b>Steroid-Induced DM:</b> ${dbMaps['DM_Steroid']}<br>
  <b>PCOS:</b> ${dbMaps['DM_PCOS']}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,
  neum_formula: 'COUNT(Eligible patients with nephropathy_exam_done = 1 OR claim contains Nephropathy Exam CPT)',
  deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
},
          'PC014': {
              doh_req: 'Age 18-85, Essential Hypertension, Face-to-Face Consult, BP < 130/80',
              system_req: `<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
              1. CPT Face-to-Face Consult: (${dbMaps['Valid_EM'] || '99201-99215'})<br>
              2. Hypertension Diagnosis: (${dbMaps['HTN_Inclusion'] || 'I10-I13'})<br>
              3. Seen by Primary Care: (${dbMaps['PC_Valid']} OR clinician_licenses join)<br><br>
              <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary><div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;"><b>Pregnancy:</b> ${dbMaps['Pregnancy_Exc']}<br><b>ESRD:</b> ${dbMaps['HTN_ESRD']}<br><b>Transplant:</b> ${dbMaps['HTN_Transplant']}<br><b>Dialysis:</b> ${dbMaps['Dialysis']}<br><b>ABM Mandate</b></div></details>`,
              neum_formula: 'COUNT(Eligible Denominator patients whose MOST RECENT BP reading in the quarter was < 130/80)',
              deno_formula: '<b>Step 1:</b> COUNT(Unique patients 18-85 meeting Q2 Intersection requirement)<br><b>Step 2 (Lookback filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)'
            },
          'PC016': {
            doh_req: 'Hypertension Diagnosis (ICD-10), Nephropathy Exam Record',
            system_req: `EMR: nephropathy_exam_done=1 OR egfr_value & uacr_done<br><br><b>RCM Fallback:</b><br>CPT: (${dbMaps['Nephropathy'] || '3060F'})`,
            neum_formula: 'COUNT(HTN patients with nephropathy screening completed)',
            deno_formula: 'COUNT(HTN patients 18-85 with >= 2 visits)'
          },
          'PC021': {
            doh_req: 'Age 18-24 Months, Autism Screening Record',
            system_req: `EMR: patient_age_months, autism_screened=1<br><br><b>RCM Fallback:</b><br>CPT: (${dbMaps['Autism_Screen'] || '96110'})`,
            neum_formula: 'COUNT(toddlers with autism_screened = 1)',
            deno_formula: 'COUNT(toddlers aged exactly 18 to 24 months)'
          },
          'PC023': {
            doh_req: 'Hypertension Diagnosis (ICD-10), BP Systolic, BP Diastolic',
            system_req: `EMR: bp_systolic, bp_diastolic (numeric values)<br><br><b>RCM Diagnosis:</b> (${dbMaps['HTN_Inclusion'] || 'I10-I15'})`,
            neum_formula: 'COUNT(HTN patients with BP >= 140/90, or >= 130/80 if diabetic)',
            deno_formula: 'COUNT(HTN patients 18-85 with >= 2 visits)'
          },
          'PC024': {
            doh_req: 'High Risk (DM/HTN/CVD/Obese), Lipid Profile Lab',
            system_req: `EMR: lipid_profile_done=1, ICD-10 risk codes<br><br><b>RCM Fallback:</b><br>CPT: (${dbMaps['Dyslipidemia'] || '80061'})`,
            neum_formula: 'COUNT(high-risk patients with lipid_profile_done = 1)',
            deno_formula: 'COUNT(patients >= 18 with high-risk diagnoses and >= 2 visits)'
          },
          'PC025': {
            doh_req: 'BMI Value, Age >= 18',
            system_req: `EMR: bmi (numeric)<br><br><b>RCM Exclusions:</b> (${dbMaps['Pregnancy_Exc'] || 'O00-O9A'}, ${dbMaps['Amputation_Limb'] || 'Z89'})`,
            neum_formula: 'COUNT(adult patients with BMI >= 25 OR BMI is missing)',
            deno_formula: 'COUNT(adult patients without exclusions)'
          }
        };

        const map = ProofsMapping[kpi.kpi_code] || {
            doh_req: "Consult DOH Guidelines",
            system_req: "Consult System Code",
            neum_formula: "Numerator Count",
            deno_formula: "Denominator Count"
        };
        
        let perfText = kpi.value !== null ? kpi.value + (kpi.unit === "%" ? "%" : "") : "N/A";
        
        let missingSentence = '';
        if (kpi.denominator > 0 && kpi.numerator !== null) {
            let gap = kpi.denominator - kpi.numerator;
            if (gap < 0) gap = 0;
            if (kpi.target_dir === 'lt' || kpi.target_dir === 'lte') {
                missingSentence = gap > 0 ? `<b>${kpi.numerator} patients</b> met the numerator condition, which is a negative outcome. Review these patients.` : `All ${kpi.denominator} eligible patients met the target (no negative outcomes)!`;
            } else {
                missingSentence = gap > 0 ? `<span class="text-danger"><i class="bi bi-exclamation-triangle-fill"></i> <b>${gap} eligible patients</b> (${((gap/kpi.denominator)*100).toFixed(1)}%) are missing valid data.</span>` : `<span class="text-success"><i class="bi bi-check-circle-fill"></i> All ${kpi.denominator} eligible patients successfully met this KPI!</span>`;
            }
            if (kpi.kpi_code === 'PC025') {
               missingSentence += "<br><br><small class='text-muted'>*Note: If BMI is completely missing in EMR, Jawda standards assume the patient falls into the overweight bucket (numerator) automatically.</small>";
            }
        } else if (kpi.denominator === 0) {
            missingSentence = "<span class='text-muted'>Denominator is 0. No eligible patients found for this quarter.</span>";
        }
        
        html += `
          <tr>
            <td rowspan="2" class="fw-bold align-middle bg-light text-center fs-5 text-primary">
              ${kpi.kpi_code}
              <div class="fs-6 fw-normal text-muted mt-2 lh-sm">(${kpi.short_name || kpi.name})</div>
            </td>
            <td class="p-3 text-break lh-sm"><strong>Fields Needed:</strong> <br>${map.doh_req}</td>
            <td class="p-3 text-break lh-sm"><strong>System Mapping:</strong> <br>${map.system_req}</td>
            <td class="p-3 lh-sm">${missingSentence}<br><br><button class="btn btn-sm btn-outline-secondary mt-2 w-100 mb-2" onclick="Proofs.viewClaims('${kpi.kpi_code}')"><i class="bi bi-search"></i> View Claim IDs (MRNs)</button>
                
              </td>
          </tr>
          <tr>
            <td colspan="3" class="bg-light p-3 border-top-0">
              <div class="fw-bold mb-3 text-secondary border-bottom pb-2">Present Calculation Formula</div>
              <div class="row">
                <div class="col-md-4 mb-2"><span class="fw-bold text-muted">Neum:</span> <span class="fs-6 fw-bold">${kpi.numerator}</span> <div class="small text-muted mt-1">${map.neum_formula}</div></div>
                <div class="col-md-4 mb-2"><span class="fw-bold text-muted">Deno:</span> <span class="fs-6 fw-bold">${kpi.denominator}</span> <div class="small text-muted mt-1">${map.deno_formula}</div></div>
                <div class="col-md-4 mb-2">
                  <span class="fw-bold text-muted">Current Quarter Performance %:</span> <br><span class="badge bg-primary fs-6 mt-1">${perfText}</span>
                  <div class="small text-muted mt-2 fw-bold">Formula: ${kpi.formula || '(Neum / Deno) * 100'}</div>
                </div>
              </div>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (e) {
      console.error(e);
      document.getElementById('proofs-tbody').innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Error loading data.</td></tr>';
    }
    
    this.checkLock();
  },

  async checkLock() {},

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
        App.toast(this.isLocked ? 'Data Unlocked!' : 'Data Saved & Locked!', 'success');
        this.checkLock();
      }
    } catch (e) {
      App.toast('Failed to toggle lock', 'danger');
    }
  },

  async showWaterfall(kpiCode) {
    const wfModal = new bootstrap.Modal(document.getElementById('waterfallModal'));
    wfModal.show();
    const body = document.getElementById('waterfall-body');
    body.innerHTML = '<div class="text-center p-4"><div class="spinner-border text-primary"></div></div>';
    try {
      const res = await fetch(`/api/kpi/waterfall?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}&kpi_code=${kpiCode}`);
      if(!res.ok) throw new Error('Not implemented for this KPI yet');
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      
      body.innerHTML = `
        <table class="table table-bordered table-sm mb-0">
          <thead class="table-light"><tr><th>Denominator Calculation Step</th><th class="text-end">No of Patients</th></tr></thead>
          <tbody>
            <tr><td>${data.step1.label}</td><td class="text-end fw-bold">${data.step1.count}</td></tr>
            <tr><td>${data.step2.label}</td><td class="text-end fw-bold">${data.step2.count}</td></tr>
            <tr class="table-secondary"><td colspan="2"><strong>Denominator Exclusions</strong></td></tr>
            <tr><td>ESRD</td><td class="text-end text-danger">${data.exclusions.ESRD}</td></tr>
            <tr><td>Renal transplant</td><td class="text-end text-danger">${data.exclusions.Renal_Transplant}</td></tr>
            <tr><td>Pregnancy</td><td class="text-end text-danger">${data.exclusions.Pregnancy}</td></tr>
            <tr><td>ABM</td><td class="text-end text-danger">${data.exclusions.ABM}</td></tr>
            <tr class="table-success border-top border-2"><td class="fs-5"><strong>Final Denominator Pool</strong></td><td class="text-end fs-5"><strong>${data.final}</strong></td></tr>
          </tbody>
        </table>
      `;
    } catch(e) {
      body.innerHTML = `<div class="alert alert-warning">${e.message}</div>`;
    }
  },
  async viewClaims(kpiCode) {
    try {
      const res = await fetch(`/api/kpi/claims?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}&kpi_code=${kpiCode}`);
      const data = await res.json();
      
      document.getElementById('claims-kpi-title').textContent = kpiCode;
      document.getElementById('badge-num').textContent = data.numerator.length;
      document.getElementById('badge-gap').textContent = data.gap.length;
      
      document.getElementById('tbody-num').innerHTML = data.numerator.length ? data.numerator.map(m => `<tr><td>${m}</td><td><span class="badge bg-success">Passed</span></td></tr>`).join('') : '<tr><td colspan="2" class="text-center text-muted">No records found</td></tr>';
      document.getElementById('tbody-gap').innerHTML = data.gap.length ? data.gap.map(m => `<tr><td>${m}</td><td><span class="badge bg-danger">Missing Data</span></td></tr>`).join('') : '<tr><td colspan="2" class="text-center text-muted">No records found</td></tr>';
      
      const modal = new bootstrap.Modal(document.getElementById('claimsModal'));
      modal.show();
    } catch (e) {
      App.toast('Failed to load claims', 'danger');
    }
  }
};