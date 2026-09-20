import{A as s}from"./main-DHmSEy9Y.js";const m={async render(i){s.state.facilityId&&(i.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">KPI Calculation Proofs <span id="lock-badge"></span></h2>
          <p class="text-muted mb-0">Verification and formulas for Q${s.state.quarter} ${s.state.year}</p>
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
    `,this.loadData())},async loadData(){try{const i=await fetch(`/api/kpi/results?facility_id=${s.state.facilityId}&year=${s.state.year}&quarter=${s.state.quarter}`);if(!i.ok)throw new Error("HTTP "+i.status);const r=await i.json(),t=await(await fetch("/api/kpi/proof-mappings")).json(),a=document.getElementById("proofs-tbody");if(!r||r.length===0){a.innerHTML='<tr><td colspan="4" class="text-center py-4 text-muted">No calculations found for this quarter. Run the engine first.</td></tr>';return}let b="";r.forEach(e=>{const d={PC004:{doh_req:"Age >= 18, PHQ-2 Result, PHQ-9 Score, PHQ-9 Date, Encounter Date",system_req:"EMR Fields: patient_age, phq2_result, phq9_score, phq9_date",neum_formula:"COUNT(patients with phq2_result=1 AND phq9_score > 0 AND phq9_date within 24h of encounter)",deno_formula:"COUNT(patients >= 18 with phq2_result=1)"},PC005:{doh_req:"Age >= 18, PHQ-9 Score, Depression Diagnosis Date, Follow-up Visit Date",system_req:`EMR Fields: patient_age, phq9_score (5-14), depression_dx_date, followup_within_30d<br><br><b>RCM Diagnosis Fallback:</b> (${t.Depression_Inc||"F32, F33"})`,neum_formula:"COUNT(patients with followup_within_30d = 1)",deno_formula:"COUNT(patients >= 18 with phq9_score between 5 and 14 AND new depression diagnosis)"},PC009:{doh_req:"Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, HbA1c Lab > 9.0%",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${t.Valid_EM||"99201-99215"})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${t.DM_Inclusion||"E10-E13"}</div></details><br>
  3. Seen by Primary Care: (${t.PC_Valid} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${t.Pregnancy_Exc}<br>
  <b>Gestational:</b> ${t.DM_Gestational}<br>
  <b>Steroid-Induced DM:</b> ${t.DM_Steroid}<br>
  <b>PCOS:</b> ${t.DM_PCOS}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,neum_formula:'COUNT(Eligible patients with HbA1c > 9.0% OR missing result). <br><small class="text-muted"><i>UAE Outpatient Rule: If explicit lab date is missing, encounter_date is used as fallback.</i></small>',deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC010:{doh_req:"Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, HbA1c Lab <= 8.0%",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${t.Valid_EM||"99201-99215"})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${t.DM_Inclusion||"E10-E13"}</div></details><br>
  3. Seen by Primary Care: (${t.PC_Valid} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${t.Pregnancy_Exc}<br>
  <b>Gestational:</b> ${t.DM_Gestational}<br>
  <b>Steroid-Induced DM:</b> ${t.DM_Steroid}<br>
  <b>PCOS:</b> ${t.DM_PCOS}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,neum_formula:'COUNT(Eligible patients with HbA1c <= 8.0%). <br><small class="text-muted"><i>UAE Outpatient Rule: If explicit lab date is missing, encounter_date is used as fallback.</i></small>',deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC011:{doh_req:"Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Foot Exam",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${t.Valid_EM||"99201-99215"})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${t.DM_Inclusion||"E10-E13"}</div></details><br>
  3. Seen by Primary Care: (${t.PC_Valid} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${t.Pregnancy_Exc}<br>
  <b>Gestational:</b> ${t.DM_Gestational}<br>
  <b>Steroid-Induced DM:</b> ${t.DM_Steroid}<br>
  <b>PCOS:</b> ${t.DM_PCOS}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,neum_formula:"COUNT(Eligible patients with foot_exam_done = 1 OR claim contains Foot Exam CPT)",deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC012:{doh_req:"Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Eye Exam",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${t.Valid_EM||"99201-99215"})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${t.DM_Inclusion||"E10-E13"}</div></details><br>
  3. Seen by Primary Care: (${t.PC_Valid} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${t.Pregnancy_Exc}<br>
  <b>Gestational:</b> ${t.DM_Gestational}<br>
  <b>Steroid-Induced DM:</b> ${t.DM_Steroid}<br>
  <b>PCOS:</b> ${t.DM_PCOS}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,neum_formula:"COUNT(Eligible patients with eye_exam_done = 1 OR claim contains Eye Exam CPT)",deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC013:{doh_req:"Age 18-75, Diabetes Diagnosis, Face-to-Face Consult, Nephropathy Exam",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
  1. CPT Face-to-Face Consult: (${t.Valid_EM||"99201-99215"})<br>
  2. Diabetes Diagnosis: <details style="display:inline-block; margin-left: 5px; vertical-align: top;"><summary class="text-primary" style="cursor:pointer; display:inline-block;"><b>View Codes</b></summary><div style="max-height: 80px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 5px; border-radius: 4px; margin-top: 2px;">${t.DM_Inclusion||"E10-E13"}</div></details><br>
  3. Seen by Primary Care: (${t.PC_Valid} OR clinician_licenses join)<br><br>
  <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary>
  <div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;">
  <b>Pregnancy:</b> ${t.Pregnancy_Exc}<br>
  <b>Gestational:</b> ${t.DM_Gestational}<br>
  <b>Steroid-Induced DM:</b> ${t.DM_Steroid}<br>
  <b>PCOS:</b> ${t.DM_PCOS}<br>
  <b>ABM Mandate:</b> is_abm_mandate = 1
  </div></details>`,neum_formula:"COUNT(Eligible patients with nephropathy_exam_done = 1 OR claim contains Nephropathy Exam CPT)",deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-75 meeting Q2 Intersection requirement)<br><b>Step 2 (Established Filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC014:{doh_req:"Age 18-85, Essential Hypertension, Face-to-Face Consult, BP < 130/80",system_req:`<b>Q2 Reporting Quarter Requirement (Intersection):</b><br>
              1. CPT Face-to-Face Consult: (${t.Valid_EM||"99201-99215"})<br>
              2. Hypertension Diagnosis: (${t.HTN_Inclusion||"I10-I13"})<br>
              3. Seen by Primary Care: (${t.PC_Valid} OR clinician_licenses join)<br><br>
              <details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary><div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;"><b>Pregnancy:</b> ${t.Pregnancy_Exc}<br><b>ESRD:</b> ${t.HTN_ESRD}<br><b>Transplant:</b> ${t.HTN_Transplant}<br><b>Dialysis:</b> ${t.Dialysis}<br><b>ABM Mandate</b></div></details>`,neum_formula:"COUNT(Eligible Denominator patients whose MOST RECENT BP reading in the quarter was < 130/80)",deno_formula:"<b>Step 1:</b> COUNT(Unique patients 18-85 meeting Q2 Intersection requirement)<br><b>Step 2 (Lookback filter):</b> Out of Step 1, COUNT(patients with >= 2 visits in the 9 months prior)"},PC016:{doh_req:"Hypertension Diagnosis (ICD-10), Nephropathy Exam Record",system_req:`EMR: nephropathy_exam_done=1 OR egfr_value & uacr_done<br><br><b>RCM Fallback:</b><br>CPT: (${t.Nephropathy||"3060F"})`,neum_formula:"COUNT(HTN patients with nephropathy screening completed)",deno_formula:"COUNT(HTN patients 18-85 with >= 2 visits)"},PC021:{doh_req:"Age 18-24 Months, Autism Screening Record",system_req:`EMR: patient_age_months, autism_screened=1<br><br><b>RCM Fallback:</b><br>CPT: (${t.Autism_Screen||"96110"})`,neum_formula:"COUNT(toddlers with autism_screened = 1)",deno_formula:"COUNT(toddlers aged exactly 18 to 24 months)"},PC023:{doh_req:"Hypertension Diagnosis (ICD-10), BP Systolic, BP Diastolic",system_req:`EMR: bp_systolic, bp_diastolic (numeric values)<br><br><b>RCM Diagnosis:</b> (${t.HTN_Inclusion||"I10-I15"})`,neum_formula:"COUNT(HTN patients with BP >= 140/90, or >= 130/80 if diabetic)",deno_formula:"COUNT(HTN patients 18-85 with >= 2 visits)"},PC024:{doh_req:"High Risk (DM/HTN/CVD/Obese), Lipid Profile Lab",system_req:`EMR: lipid_profile_done=1, ICD-10 risk codes<br><br><b>RCM Fallback:</b><br>CPT: (${t.Dyslipidemia||"80061"})`,neum_formula:"COUNT(high-risk patients with lipid_profile_done = 1)",deno_formula:"COUNT(patients >= 18 with high-risk diagnoses and >= 2 visits)"},PC025:{doh_req:"BMI Value, Age >= 18",system_req:`EMR: bmi (numeric)<br><br><b>RCM Exclusions:</b> (${t.Pregnancy_Exc||"O00-O9A"}, ${t.Amputation_Limb||"Z89"})`,neum_formula:"COUNT(adult patients with BMI >= 25 OR BMI is missing)",deno_formula:"COUNT(adult patients without exclusions)"}}[e.kpi_code]||{doh_req:"Consult DOH Guidelines",system_req:"Consult System Code",neum_formula:"Numerator Count",deno_formula:"Denominator Count"};let c=e.value!==null?e.value+(e.unit==="%"?"%":""):"N/A",l="";if(e.denominator>0&&e.numerator!==null){let o=e.denominator-e.numerator;o<0&&(o=0),e.target_dir==="lt"||e.target_dir==="lte"?l=o>0?`<b>${e.numerator} patients</b> met the numerator condition, which is a negative outcome. Review these patients.`:`All ${e.denominator} eligible patients met the target (no negative outcomes)!`:l=o>0?`<span class="text-danger"><i class="bi bi-exclamation-triangle-fill"></i> <b>${o} eligible patients</b> (${(o/e.denominator*100).toFixed(1)}%) are missing valid data.</span>`:`<span class="text-success"><i class="bi bi-check-circle-fill"></i> All ${e.denominator} eligible patients successfully met this KPI!</span>`,e.kpi_code==="PC025"&&(l+="<br><br><small class='text-muted'>*Note: If BMI is completely missing in EMR, Jawda standards assume the patient falls into the overweight bucket (numerator) automatically.</small>")}else e.denominator===0&&(l="<span class='text-muted'>Denominator is 0. No eligible patients found for this quarter.</span>");b+=`
          <tr>
            <td rowspan="2" class="fw-bold align-middle bg-light text-center fs-5 text-primary">
              ${e.kpi_code}
              <div class="fs-6 fw-normal text-muted mt-2 lh-sm">(${e.short_name||e.name})</div>
            </td>
            <td class="p-3 text-break lh-sm"><strong>Fields Needed:</strong> <br>${d.doh_req}</td>
            <td class="p-3 text-break lh-sm"><strong>System Mapping:</strong> <br>${d.system_req}</td>
            <td class="p-3 lh-sm">${l}<br><br><button class="btn btn-sm btn-outline-secondary mt-2 w-100 mb-2" onclick="Proofs.viewClaims('${e.kpi_code}')"><i class="bi bi-search"></i> View Claim IDs (MRNs)</button>
                
              </td>
          </tr>
          <tr>
            <td colspan="3" class="bg-light p-3 border-top-0">
              <div class="fw-bold mb-3 text-secondary border-bottom pb-2">Present Calculation Formula</div>
              <div class="row">
                <div class="col-md-4 mb-2"><span class="fw-bold text-muted">Neum:</span> <span class="fs-6 fw-bold">${e.numerator}</span> <div class="small text-muted mt-1">${d.neum_formula}</div></div>
                <div class="col-md-4 mb-2"><span class="fw-bold text-muted">Deno:</span> <span class="fs-6 fw-bold">${e.denominator}</span> <div class="small text-muted mt-1">${d.deno_formula}</div></div>
                <div class="col-md-4 mb-2">
                  <span class="fw-bold text-muted">Current Quarter Performance %:</span> <br><span class="badge bg-primary fs-6 mt-1">${c}</span>
                  <div class="small text-muted mt-2 fw-bold">Formula: ${e.formula||"(Neum / Deno) * 100"}</div>
                </div>
              </div>
            </td>
          </tr>
        `}),a.innerHTML=b}catch(i){console.error(i),document.getElementById("proofs-tbody").innerHTML='<tr><td colspan="4" class="text-center py-4 text-danger">Error loading data.</td></tr>'}this.checkLock()},async showWaterfall(i){new bootstrap.Modal(document.getElementById("waterfallModal")).show();const n=document.getElementById("waterfall-body");n.innerHTML='<div class="text-center p-4"><div class="spinner-border text-primary"></div></div>';try{const t=await fetch(`/api/kpi/waterfall?facility_id=${s.state.facilityId}&year=${s.state.year}&quarter=${s.state.quarter}&kpi_code=${i}`);if(!t.ok)throw new Error("Not implemented for this KPI yet");const a=await t.json();if(a.error)throw new Error(a.error);n.innerHTML=`
        <table class="table table-bordered table-sm mb-0">
          <thead class="table-light"><tr><th>Denominator Calculation Step</th><th class="text-end">No of Patients</th></tr></thead>
          <tbody>
            <tr><td>${a.step1.label}</td><td class="text-end fw-bold">${a.step1.count}</td></tr>
            <tr><td>${a.step2.label}</td><td class="text-end fw-bold">${a.step2.count}</td></tr>
            <tr class="table-secondary"><td colspan="2"><strong>Denominator Exclusions</strong></td></tr>
            <tr><td>ESRD</td><td class="text-end text-danger">${a.exclusions.ESRD}</td></tr>
            <tr><td>Renal transplant</td><td class="text-end text-danger">${a.exclusions.Renal_Transplant}</td></tr>
            <tr><td>Pregnancy</td><td class="text-end text-danger">${a.exclusions.Pregnancy}</td></tr>
            <tr><td>ABM</td><td class="text-end text-danger">${a.exclusions.ABM}</td></tr>
            <tr class="table-success border-top border-2"><td class="fs-5"><strong>Final Denominator Pool</strong></td><td class="text-end fs-5"><strong>${a.final}</strong></td></tr>
          </tbody>
        </table>
      `}catch(t){n.innerHTML=`<div class="alert alert-warning">${t.message}</div>`}},async viewClaims(i){try{const n=await(await fetch(`/api/kpi/claims?facility_id=${s.state.facilityId}&year=${s.state.year}&quarter=${s.state.quarter}&kpi_code=${i}`)).json();document.getElementById("claims-kpi-title").textContent=i,document.getElementById("badge-num").textContent=n.numerator.length,document.getElementById("badge-gap").textContent=n.gap.length,document.getElementById("tbody-num").innerHTML=n.numerator.length?n.numerator.map(a=>`<tr><td>${a}</td><td><span class="badge bg-success">Passed</span></td></tr>`).join(""):'<tr><td colspan="2" class="text-center text-muted">No records found</td></tr>',document.getElementById("tbody-gap").innerHTML=n.gap.length?n.gap.map(a=>`<tr><td>${a}</td><td><span class="badge bg-danger">Missing Data</span></td></tr>`).join(""):'<tr><td colspan="2" class="text-center text-muted">No records found</td></tr>',new bootstrap.Modal(document.getElementById("claimsModal")).show()}catch{s.toast("Failed to load claims","danger")}}};window.Proofs=m;export{m as Proofs};
