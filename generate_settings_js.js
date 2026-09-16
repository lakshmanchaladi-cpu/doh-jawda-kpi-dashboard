const fs = require('fs');
const path = require('path');

const content = `const KPI_DETAILS = {
  'PC004': {
    title: 'Percentage of Patients Completing the PHQ-9 Within 24 Hours After a Positive PHQ-2 Result',
    denominator: 'All unique patients aged 18 years and older at the beginning of the reporting quarter who were screened positive on the PHQ-2.',
    numerator: 'Total number of unique patients from the denominator who completed the PHQ-9 screening documentation within exactly 24 hours of the positive PHQ-2.',
    exclusions: ['Established diagnosis of depression (e.g., ICD-10 F32.x, F33.x) or bipolar disorder (e.g., F31.x) prior to the index encounter.', 'Documented medical reason for not screening or patient refusal.', 'Encounters for Dental, Ayurvedic, or Homeopathic services.', 'Patients who were not assessed for vitals during the visit.'],
    emr_resp: 'Captures PHQ-2 score (>=3 triggers positive). Captures precise timestamps (PHQ2_Date_Time vs PHQ9_Date_Time) to prove the 24-hour rule. Confirms vitals were taken.',
    rcm_resp: 'Validates primary care face-to-face encounter (CPT 99201-99215). Flags historical exclusions (F32.x, F31.x) from prior claims. Filters THIQA payers if mandated.',
    cpt_icd: 'CPT: 99201-99215. Exclusions ICD-10: F31.x, F32.x, F33.x'
  },
  'PC005': {
    title: 'Depression Remission at Twelve Months',
    denominator: 'Patients 18+ with a diagnosis of major depression and an elevated PHQ-9 score (> 9) during the index visit.',
    numerator: 'Patients who achieved remission (PHQ-9 score < 5) at 12 months (± 60 days) after the index visit.',
    exclusions: ['Bipolar disorder, schizophrenia.', 'Hospice care.'],
    emr_resp: 'Tracks baseline PHQ-9 and follow-up PHQ-9.',
    rcm_resp: 'Confirms primary diagnosis via ICD-10.',
    cpt_icd: 'Inclusions ICD-10: F32.0-F32.5'
  },
  'PC009': {
    title: 'Comprehensive Diabetes Care: HbA1c Poor Control (>9.0%)',
    denominator: 'Patients 18-75 years of age with diabetes with at least two visits in the 9 months prior to the quarter.',
    numerator: 'Patients whose most recent HbA1c level is >9.0% or is missing.',
    exclusions: ['Gestational diabetes, ESRD, hospice.'],
    emr_resp: 'Extracts most recent HbA1c value and date.',
    rcm_resp: 'Identifies diabetic patients via DM_Inclusion ICD-10s. Checks Exclusions like DM_Gestational.',
    cpt_icd: 'Uses DM_Inclusion mapped codes'
  },
  'PC014': {
    title: 'Controlling High Blood Pressure',
    denominator: 'Patients 18-85 years of age who had a diagnosis of essential hypertension.',
    numerator: 'Patients whose most recent BP reading is adequately controlled (<130/80 mmHg).',
    exclusions: ['ESRD, dialysis, or renal transplant.'],
    emr_resp: 'Extracts most recent Systolic and Diastolic BP.',
    rcm_resp: 'Identifies HTN via HTN_Inclusion mapped codes.',
    cpt_icd: 'Uses HTN_Inclusion mapped codes'
  }
};

const Settings = {
  async render(container) {
    container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';
    
    try {
      const defRes = await fetch('/api/settings/definitions');
      const definitions = await defRes.json();
      
      const mapRes = await fetch('/api/settings/mappings');
      const mappings = await mapRes.json();

      let html = \`
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0 fw-bold text-dark">Primary Care (PC) JAWDA Regulatory & Quality Architecture</h2>
            <p class="text-muted mb-0">DOH Abu Dhabi Primary Care & Medical Center Guidance, Engine Rules & Code Reference</p>
          </div>
          <div class="d-flex gap-2">
            <span class="badge bg-primary px-3 py-2"><i class="bi bi-award me-1"></i> Core Standard: PC Guidance V9 (2026)</span>
            <span class="badge bg-success px-3 py-2"><i class="bi bi-shield-check me-1"></i> Enforced: Unified V1 (Effective Q3 2026)</span>
          </div>
        </div>

        <ul class="nav nav-tabs mb-4" id="settingsTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active fw-bold" id="guidelines-tab" data-bs-toggle="tab" data-bs-target="#guidelines" type="button" role="tab" aria-controls="guidelines" aria-selected="true">
              <i class="bi bi-book-half me-1 text-primary"></i> Guidelines & Version Guide
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="engine-tab" data-bs-toggle="tab" data-bs-target="#engine" type="button" role="tab" aria-controls="engine" aria-selected="false">
              <i class="bi bi-cpu me-1 text-info"></i> Engine Logic (14 PC KPIs)
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="mapping-tab" data-bs-toggle="tab" data-bs-target="#mapping" type="button" role="tab" aria-controls="mapping" aria-selected="false">
              <i class="bi bi-table me-1 text-success"></i> Mapping Reference
            </button>
          </li>
        </ul>

        <div class="tab-content" id="settingsTabsContent">
          
          <!-- ========================================== -->
          <!-- 1. GUIDELINES & VERSION GUIDE TAB          -->
          <!-- ========================================== -->
          <div class="tab-pane fade show active" id="guidelines" role="tabpanel" aria-labelledby="guidelines-tab">
            
            <!-- Architect Executive Banner -->
            <div class="card shadow-sm mb-4 border-0 text-white" style="background: linear-gradient(135deg, #0d3b66 0%, #001e3d 100%);">
              <div class="card-body p-4">
                <div class="row align-items-center">
                  <div class="col-lg-8">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <span class="badge bg-warning text-dark fw-bold"><i class="bi bi-hospital me-1"></i> Medical Center Agenda</span>
                      <span class="badge bg-light text-dark fw-bold">Primary Care (PC) Services</span>
                      <span class="badge bg-success text-white fw-bold">Muashir JAWDA 2026</span>
                    </div>
                    <h3 class="h4 fw-bold mb-2">DOH Primary Care (PC) Services JAWDA Framework</h3>
                    <p class="mb-2 text-white-50 small leading-relaxed">
                      Our system is engineered exclusively around the <strong>Primary Care (PC) Services</strong> mandate. The Department of Health (DOH) Abu Dhabi requires all licensed <strong>Medical Centers</strong> (Type: <em>Center</em>, Subtype: <em>Medical</em>) with General Practice, Internal Medicine, or Family Medicine physicians to report the official <strong>PC Indicator Series (PC004 through PC025)</strong>.
                    </p>
                    <div class="small text-light text-opacity-75">
                      <i class="bi bi-check-circle-fill text-success me-1"></i> <strong>Regulatory Bedrock:</strong> Rooted in <em>Primary Care (PC) Services Guidance V9 (2026)</em> and seamlessly unified into <em>Primary Care and Medical Center Services Guidance V1 (Effective Q3 2026)</em>.
                    </div>
                  </div>
                  <div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
                    <div class="bg-white bg-opacity-10 p-3 rounded text-center border border-light border-opacity-25">
                      <div class="small text-uppercase tracking-wider text-light mb-1">Current Active Standard</div>
                      <h5 class="fw-bold mb-0 text-warning">PC Guidance V9 & V1 Unified</h5>
                      <div class="badge bg-success mt-2 px-3 py-1">Effective: Q3 2026 Onward</div>
                      <div class="small text-white-50 mt-1" style="font-size: 0.75rem;">Next Revision (2027): <span class="text-warning">Pending Review</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Direct Official PDF Download Center -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-cloud-arrow-down-fill me-2 text-danger"></i>Direct Official DOH Guidance Document Downloads (Verified Links)</h6>
                  <span class="badge bg-light text-secondary border">Official DOH Abu Dhabi Publications</span>
                </div>
              </div>
              <div class="card-body">
                <p class="small text-muted mb-3">Click below to directly inspect or download the original Department of Health regulatory guidance PDFs from the official DOH Muashir portal:</p>
                <div class="row g-3">
                  
                  <!-- PDF 1: PC Guidance V9 2026 -->
                  <div class="col-md-4">
                    <div class="p-3 border rounded h-100 bg-light position-relative">
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-file-earmark-pdf-fill text-danger fs-2 me-2"></i>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark" style="font-size: 0.95rem;">Primary Care (PC) Services V9</h6>
                          <span class="badge bg-primary" style="font-size: 0.7rem;">Core PC Baseline (2026)</span>
                        </div>
                      </div>
                      <p class="small text-muted mb-3" style="font-size: 0.82rem;">
                        The foundational DOH manual codifying the 14 Primary Care (PC) performance indicators (PC004–PC025), denominator continuous enrollment, and clinical targets.
                      </p>
                      <a href="https://www.doh.gov.ae/-/media/Feature/Muashir/Jawda/2026/Primary-Care-PC-Services-Jawda-GuidanceVersion-92026.ashx" target="_blank" download class="btn btn-sm btn-primary w-100 fw-bold">
                        <i class="bi bi-download me-1"></i> Direct Download PDF (V9)
                      </a>
                    </div>
                  </div>

                  <!-- PDF 2: Primary Care & Medical Center Services V1 2026 (Effective Q3 2026) -->
                  <div class="col-md-4">
                    <div class="p-3 border border-success rounded h-100 bg-success bg-opacity-10 position-relative">
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-file-earmark-pdf-fill text-success fs-2 me-2"></i>
                        <div>
                          <h6 class="fw-bold mb-0 text-success" style="font-size: 0.95rem;">Primary Care & Medical Center V1</h6>
                          <span class="badge bg-success" style="font-size: 0.7rem;">Effective From Q3 2026</span>
                        </div>
                      </div>
                      <p class="small text-dark mb-3" style="font-size: 0.82rem;">
                        The latest unified guidance consolidating Outpatient Medical Centers and Primary Care under one unified rulebook. Enforces the 24h PHQ-9 turnaround and GP/IM/FM encounter gating.
                      </p>
                      <a href="https://www.doh.gov.ae/-/media/Feature/Muashir/Jawda/2026/Primary-Care-and-Medical-Center-Services-Jawda-Guidance_V1_2026_Effective-From-Q3-2026.ashx" target="_blank" download class="btn btn-sm btn-success w-100 fw-bold text-white">
                        <i class="bi bi-download me-1"></i> Direct Download PDF (V1 Q3)
                      </a>
                    </div>
                  </div>

                  <!-- PDF 3: Outpatient Medical Center V2 2026 & Portal -->
                  <div class="col-md-4">
                    <div class="p-3 border rounded h-100 bg-light position-relative">
                      <div class="d-flex align-items-center mb-2">
                        <i class="bi bi-globe2 text-info fs-2 me-2"></i>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark" style="font-size: 0.95rem;">Official DOH Guidelines Portal</h6>
                          <span class="badge bg-secondary" style="font-size: 0.7rem;">Regulatory Hub 2026</span>
                        </div>
                      </div>
                      <p class="small text-muted mb-3" style="font-size: 0.82rem;">
                        Official Department of Health portal containing circulars, submission guidelines, Outpatient V2 documentation, and annual Muashir reporting schedules.
                      </p>
                      <div class="d-flex gap-2">
                        <a href="https://www.doh.gov.ae/-/media/Feature/Muashir/Jawda/2026/Outpatient-Medical-Center-Jawda-Guidance_V2_2026.ashx" target="_blank" download class="btn btn-sm btn-outline-secondary w-50" title="Outpatient Center V2">
                          <i class="bi bi-download"></i> Outpatient V2
                        </a>
                        <a href="https://www.doh.gov.ae/en/programs-initiatives/muashir/jawda-indicators-submission-guidelines2026" target="_blank" class="btn btn-sm btn-outline-info text-dark w-50">
                          <i class="bi bi-box-arrow-up-right"></i> DOH Portal
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Primary Care Clinical Portfolio Breakdown (5 Domains) -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-diagram-3-fill me-2 text-primary"></i>Primary Care (PC) Clinical Portfolio — 5 Core Quality Domains</h6>
                  <span class="badge bg-primary">14 Standard PC Indicators</span>
                </div>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  
                  <div class="col-md-4">
                    <div class="p-3 border rounded h-100 bg-white">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-danger bg-opacity-10 text-danger p-2 me-2"><i class="bi bi-heart-pulse fs-5"></i></span>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">1. Diabetes Mellitus Care</h6>
                          <span class="small text-muted">Metabolic & Microvascular</span>
                        </div>
                      </div>
                      <ul class="small ps-3 mb-0 text-muted">
                        <li><strong>PC009:</strong> HbA1c Poor Control Rate (&gt;9.0% or missing) [Target &lt;30%]</li>
                        <li><strong>PC010:</strong> HbA1c Good Control Rate (&le;8.0%) [Target &ge;70%]</li>
                        <li><strong>PC011:</strong> Diabetic Annual Foot Exam Rate [Target &ge;80%]</li>
                        <li><strong>PC012:</strong> Diabetic Annual Retinal Eye Exam [Target &ge;75%]</li>
                        <li><strong>PC013:</strong> Diabetic Annual Nephropathy Screening [Target &ge;85%]</li>
                      </ul>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="p-3 border rounded h-100 bg-white">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-primary bg-opacity-10 text-primary p-2 me-2"><i class="bi bi-speedometer2 fs-5"></i></span>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">2. Cardiovascular & Renal</h6>
                          <span class="small text-muted">Hypertension & Dyslipidemia</span>
                        </div>
                      </div>
                      <ul class="small ps-3 mb-0 text-muted">
                        <li><strong>PC014:</strong> Controlling High Blood Pressure (&lt;130/80 mmHg) [Target &ge;70%]</li>
                        <li><strong>PC016:</strong> Hypertensive Annual Nephropathy Screening [Target &ge;80%]</li>
                        <li><strong>PC023:</strong> Poorly Controlled Hypertension (&ge;130/80 mmHg) [Target &lt;30%]</li>
                        <li><strong>PC024:</strong> High-Risk Adults Screened for Dyslipidemia [Target &ge;80%]</li>
                      </ul>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="p-3 border rounded h-100 bg-white">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-warning bg-opacity-10 text-warning p-2 me-2"><i class="bi bi-emoji-smile fs-5"></i></span>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">3. Mental & Behavioral Health</h6>
                          <span class="small text-muted">Depression Screening & Remission</span>
                        </div>
                      </div>
                      <ul class="small ps-3 mb-0 text-muted">
                        <li><strong>PC004:</strong> PHQ-9 Documentation within 24 Hours of Positive PHQ-2 [Target &ge;90%]</li>
                        <li><strong>PC005:</strong> Depression 30-Day Follow-Up & 12-Month Remission Rate (PHQ-9 &lt;5) [Target &ge;90%]</li>
                      </ul>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-white">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-success bg-opacity-10 text-success p-2 me-2"><i class="bi bi-person-check fs-5"></i></span>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">4. Preventive Medicine & Lifestyle Health</h6>
                          <span class="small text-muted">Pediatric & Weight Management</span>
                        </div>
                      </div>
                      <ul class="small ps-3 mb-0 text-muted">
                        <li><strong>PC021:</strong> Autism Screening in Toddlers between 18 to 24 Months (M-CHAT / CPT 96110 / Z13.4) [Target &ge;85%]</li>
                        <li><strong>PC025:</strong> Overweight / Obesity BMI Screening and Counseling Rate [Target &ge;80%]</li>
                      </ul>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-white">
                      <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-info bg-opacity-10 text-info p-2 me-2"><i class="bi bi-clock-history fs-5"></i></span>
                        <div>
                          <h6 class="fw-bold mb-0 text-dark">5. Primary Care Operations & Access</h6>
                          <span class="small text-muted">Wait Times & Appointment Access</span>
                        </div>
                      </div>
                      <ul class="small ps-3 mb-0 text-muted">
                        <li><strong>Wait Time at Point of Arrival:</strong> Outpatient physician consultation wait time [Target &le;30 mins]</li>
                        <li><strong>Third Available Appointment:</strong> Days to 3rd available appointment for Primary Care [Target &le;2 days]</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Year 2026: Quarterly Roadmap & Version Transition -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-calendar3-range me-2 text-primary"></i>Year 2026 Primary Care Quarterly Roadmap: Version Lineage & Transition</h6>
                  <span class="badge bg-dark">2026 Audit Matrix</span>
                </div>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  
                  <!-- Q1 2026 -->
                  <div class="col-md-3">
                    <div class="p-3 border rounded h-100 bg-light">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-secondary">Q1 2026 (Jan–Mar)</span>
                        <i class="bi bi-check-circle-fill text-muted"></i>
                      </div>
                      <h6 class="fw-bold mb-1">PC Guidance V9 (2026)</h6>
                      <p class="small text-muted mb-2">Primary Care baseline data collection; medical centers submitted retrospective Q1 PC indicator data under V9 rules.</p>
                      <div class="small">
                        <span class="text-muted">Submission:</span> <strong class="text-dark">Apr 30, 2026</strong><br>
                        <span class="text-muted">Status:</span> <span class="badge bg-secondary bg-opacity-25 text-secondary">Completed / Closed</span>
                      </div>
                    </div>
                  </div>

                  <!-- Q2 2026 -->
                  <div class="col-md-3">
                    <div class="p-3 border rounded h-100 bg-light">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-secondary">Q2 2026 (Apr–Jun)</span>
                        <i class="bi bi-check-circle-fill text-muted"></i>
                      </div>
                      <h6 class="fw-bold mb-1">PC Guidance V9 (2026)</h6>
                      <p class="small text-muted mb-2">Mid-year review cycle; DOH issued official circular announcing the unification with Medical Centers effective Q3.</p>
                      <div class="small">
                        <span class="text-muted">Submission:</span> <strong class="text-dark">Jul 31, 2026</strong><br>
                        <span class="text-muted">Status:</span> <span class="badge bg-secondary bg-opacity-25 text-secondary">Completed / Closed</span>
                      </div>
                    </div>
                  </div>

                  <!-- Q3 2026 -->
                  <div class="col-md-3">
                    <div class="p-3 border border-success border-2 rounded h-100 bg-success bg-opacity-10">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-success">Q3 2026 (Jul–Sep)</span>
                        <span class="spinner-grow spinner-grow-sm text-success" role="status"></span>
                      </div>
                      <h6 class="fw-bold mb-1 text-success">Unified Guidance V1 (2026)</h6>
                      <p class="small text-dark mb-2"><strong>MANDATORY UNIFICATION:</strong> Medical centers enforce the strict 24h PHQ-9 turnaround, GP/IM/FM gating, and Thiqa filters.</p>
                      <div class="small">
                        <span class="text-muted">Submission:</span> <strong class="text-dark">Oct 31, 2026</strong><br>
                        <span class="text-muted">Status:</span> <span class="badge bg-success text-white">Current Active Standard</span>
                      </div>
                    </div>
                  </div>

                  <!-- Q4 2026 -->
                  <div class="col-md-3">
                    <div class="p-3 border border-primary rounded h-100 bg-white">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-primary">Q4 2026 (Oct–Dec)</span>
                        <i class="bi bi-clock text-primary"></i>
                      </div>
                      <h6 class="fw-bold mb-1">Unified Guidance V1 (2026)</h6>
                      <p class="small text-muted mb-2">Full-year Muashir Star Rating consolidation; annual DOH quality inspections and score reconciliations.</p>
                      <div class="small">
                        <span class="text-muted">Submission:</span> <strong class="text-dark">Jan 31, 2027</strong><br>
                        <span class="text-muted">Status:</span> <span class="badge bg-primary bg-opacity-10 text-primary">Active Scheduled</span>
                      </div>
                    </div>
                  </div>

                </div>

                <!-- Next Version Pending Notice -->
                <div class="alert alert-warning d-flex align-items-center mt-3 mb-0 py-2">
                  <i class="bi bi-hourglass-split fs-4 me-3 text-warning"></i>
                  <div class="small">
                    <strong>Upcoming Version (2027+):</strong> <span class="badge bg-dark me-1">STATUS: PENDING DOH CIRCULAR</span>
                    The 2027 Primary Care & Medical Center Guidance revision is currently under review by the DOH Healthcare Quality Committee. While future versions may introduce automated Malaffi FHIR repository extractions, <strong>medical centers are legally audited against Version 1 (2026 Effective Q3) and V9</strong>.
                  </div>
                </div>

              </div>
            </div>

            <!-- Historical Chronicle by Years -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-hourglass-bottom me-2 text-primary"></i>Historical Evolution of Primary Care (PC) Guidance (2024 to 2027+)</h6>
              </div>
              <div class="card-body">
                <div class="timeline ps-2 border-start border-2 border-primary ms-3">
                  
                  <!-- 2024 -->
                  <div class="position-relative mb-4 ps-4">
                    <div class="position-absolute rounded-circle bg-secondary" style="width: 14px; height: 14px; left: -8px; top: 4px;"></div>
                    <span class="badge bg-secondary mb-1">2024: PC Guidance Version 7</span>
                    <h6 class="fw-bold mb-1">Foundational Ambulatory Metrics Established</h6>
                    <p class="small text-muted mb-0">
                      DOH introduced the first dedicated Primary Care Jawda manual. Mandated reporting on HbA1c control, blood pressure control, and basic preventive exams. Outpatient clinics and primary health centers were tracked on separate tracks.
                    </p>
                  </div>

                  <!-- 2025 -->
                  <div class="position-relative mb-4 ps-4">
                    <div class="position-absolute rounded-circle bg-info" style="width: 14px; height: 14px; left: -8px; top: 4px;"></div>
                    <span class="badge bg-info text-dark mb-1">2025: PC Guidance Version 8</span>
                    <h6 class="fw-bold mb-1">Continuous Enrollment & Encounter Frequency Criteria</h6>
                    <p class="small text-muted mb-0">
                      Refined denominator logic by requiring at least 2 visits in the 9 months prior to the quarter for chronic disease cohorts (DM and HTN). Piloted initial depression screening metrics (PHQ-2/PHQ-9).
                    </p>
                  </div>

                  <!-- 2026 V9 -->
                  <div class="position-relative mb-4 ps-4">
                    <div class="position-absolute rounded-circle bg-primary" style="width: 14px; height: 14px; left: -8px; top: 4px;"></div>
                    <span class="badge bg-primary mb-1">2026 (Q1–Q2): Primary Care (PC) Services Guidance V9</span>
                    <h6 class="fw-bold mb-1 text-primary">The Modern Primary Care (PC) Standard</h6>
                    <p class="small text-dark mb-0">
                      Codified the 14 official PC indicators (PC004 through PC025). Defined strict physician encounter restrictions (GP, Internal Medicine, Family Medicine only), established the 24-hour turnaround rule for PHQ-9, and introduced Thiqa insurance population reporting.
                    </p>
                  </div>

                  <!-- 2026 V1 Unified -->
                  <div class="position-relative mb-4 ps-4">
                    <div class="position-absolute rounded-circle bg-success" style="width: 14px; height: 14px; left: -8px; top: 4px;"></div>
                    <span class="badge bg-success mb-1">2026 (Q3–Q4 Onward): Primary Care & Medical Center Services V1</span>
                    <h6 class="fw-bold mb-1 text-success">Unified Medical Center Standard (Current Operational Baseline)</h6>
                    <p class="small text-dark mb-0">
                      Issued February 2026, effective Q3 2026. Merged Outpatient Medical Centers and Primary Care into a unified single rulebook. Retains all V9 PC indicator logic while mandating compliance across all licensed Medical Centers.
                    </p>
                  </div>

                  <!-- 2027+ -->
                  <div class="position-relative ps-4">
                    <div class="position-absolute rounded-circle bg-warning" style="width: 14px; height: 14px; left: -8px; top: 4px;"></div>
                    <span class="badge bg-warning text-dark mb-1">2027+: Next Generation PC Version</span>
                    <h6 class="fw-bold mb-1 text-muted">Version 2 (Status: Pending DOH Circular)</h6>
                    <p class="small text-muted mb-0">
                      Currently under draft review by the DOH Quality Directorate. Slated to integrate automated FHIR extraction pipelines, patient-reported outcome measures (PROMs), and expanded metabolic syndrome bundles.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            <!-- Quality Manager & Architect Comparison Matrix -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-table me-2 text-primary"></i>Senior Architect & Quality Manager: Multi-Version Comparison Matrix</h6>
                  <span class="badge bg-primary">DOH Regulatory Crosswalk</span>
                </div>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-bordered table-hover mb-0 align-middle small">
                    <thead class="table-dark">
                      <tr>
                        <th style="width: 20%;">Regulatory Dimension</th>
                        <th style="width: 18%;">Legacy PC Standards<br><span class="badge bg-secondary font-monospace">PC V7 (2024) / V8 (2025)</span></th>
                        <th style="width: 20%;">Core Baseline (2026 Q1–Q2)<br><span class="badge bg-primary font-monospace">PC Services V9 (2026)</span></th>
                        <th style="width: 24%;" class="table-success border-success text-success fw-bold">Active Unified (2026 Q3–Q4)<br><span class="badge bg-success font-monospace">V1 Unified (Effective Q3 2026)</span></th>
                        <th style="width: 18%;">Next Version<br><span class="badge bg-warning text-dark font-monospace">2027+ (Pending Review)</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="fw-bold bg-light">Regulatory Document</td>
                        <td>Separate manuals for Primary Health Centers vs Private Outpatient Clinics.</td>
                        <td><strong>Primary Care (PC) Services Jawda Guidance V9 (2026)</strong>.</td>
                        <td class="table-success fw-bold text-success"><strong>Primary Care & Medical Center Services Guidance V1 (Effective Q3 2026)</strong>.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Primary Care & Medical Center Guidance V2.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Facility Applicability</td>
                        <td>Primary Healthcare Centers only.</td>
                        <td>All facilities providing Primary Care Services within their service portfolio.</td>
                        <td class="table-success fw-bold">Type: <em>Center</em> | Subtype: <em>Medical</em>. Must have at least 1 GP, Internal Medicine, or Family Medicine MD.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Standalone multi-specialty polyclinics under evaluation.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Physician Encounter Scope</td>
                        <td>Any outpatient encounterbilled.</td>
                        <td>Restricted to face-to-face encounters with GP, Internal Medicine, or Family Medicine.</td>
                        <td class="table-success fw-bold text-success">Strictly applies only to encounters with General Practitioner, Internal Medicine, or Family Medicine MDs.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Telehealth and allied health visits evaluation.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Explicit Clinic Exclusions</td>
                        <td>Vague exemptions.</td>
                        <td>Dental clinics excluded.</td>
                        <td class="table-success fw-bold">Mandatory Exclusions: Dental Centers & Visa Screening Centers are strictly exempt from submitting PC data.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Cosmetic / aesthetic center exemptions under review.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">PHQ-9 Mental Health Rule (PC004)</td>
                        <td>Not mandated or tracked within quarter.</td>
                        <td>PHQ-9 completion recommended during the quarter following positive PHQ-2.</td>
                        <td class="table-success fw-bold text-success">Strict 24-Hour Rule: PHQ-9 screening must be completed and documented within exactly 24 hours of positive PHQ-2.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Digital self-assessment app completion inclusion.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Insurance Segmentation</td>
                        <td>All insured patients aggregated.</td>
                        <td>General health insurance coverage.</td>
                        <td class="table-success fw-bold">Mandates explicit identification and tracking of patients covered through THIQA Insurance.</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Stratified benchmark tiers (Thiqa vs Basic vs Enhanced).</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Diabetes Care (PC009 / PC010)</td>
                        <td>HbA1c Poor Control >9.0%. Missing HbA1c counted as failure.</td>
                        <td>Age 18–75 with diabetes, requiring &ge;2 visits in 9 months prior to reporting period.</td>
                        <td class="table-success fw-bold">Maintained 18–75 age range, &ge;2 visits in 9 months rule; updated gestational diabetes exclusions (O24.4x series).</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Time-in-Range (CGM) metrics integration.</td>
                      </tr>
                      <tr>
                        <td class="fw-bold bg-light">Hypertension Target (PC014)</td>
                        <td>Controlled BP defined as &lt;140/90 mmHg.</td>
                        <td>Controlled BP defined as &lt;130/80 mmHg.</td>
                        <td class="table-success fw-bold text-success">Controlled BP &lt;130/80 mmHg with explicit exclusions for ESRD (N18.6), dialysis (CPT 90935+), and transplant (Z94.0).</td>
                        <td class="text-muted"><span class="badge bg-warning text-dark">Pending</span> Home blood pressure monitoring integration.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Quality Manager Pre-Submission Audit Checklist -->
            <div class="card shadow-sm mb-4 border-0">
              <div class="card-header bg-white py-3">
                <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-clipboard-check-fill me-2 text-success"></i>Quality Manager's Pre-Submission Audit Checklist for Medical Centers</h6>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-light">
                      <h6 class="fw-bold small text-primary mb-2"><i class="bi bi-1-circle-fill me-1"></i> Verify Encounter Specialty Gating</h6>
                      <p class="small text-muted mb-0">Ensure all claim encounters billed under CPT 99201–99215 were performed by licensed <strong>General Practitioners, Internal Medicine, or Family Medicine</strong> physicians. Encounters with other specialties must be excluded from PC denominators.</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-light">
                      <h6 class="fw-bold small text-primary mb-2"><i class="bi bi-2-circle-fill me-1"></i> Audit the 24-Hour PHQ-9 Rule (PC004)</h6>
                      <p class="small text-muted mb-0">Cross-reference EMR timestamps: when a patient scores &ge;3 on PHQ-2, verify that the formal PHQ-9 assessment is completed within exactly 24 hours (86,400 seconds) to qualify for the numerator.</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-light">
                      <h6 class="fw-bold small text-primary mb-2"><i class="bi bi-3-circle-fill me-1"></i> Check Continuous Chronic Care Visits</h6>
                      <p class="small text-muted mb-0">For PC009, PC010, and PC014, verify that diabetic and hypertensive patients have at least <strong>two face-to-face visits</strong> in the 9 months prior to the reporting quarter to establish an active primary care relationship.</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 border rounded h-100 bg-light">
                      <h6 class="fw-bold small text-primary mb-2"><i class="bi bi-4-circle-fill me-1"></i> Crosswalk Shafafiya THIQA Payer IDs</h6>
                      <p class="small text-muted mb-0">Verify that all THIQA insured patients are mapped to official DOH license codes (e.g. <code>A001</code> / <code>D001</code>) in the Mapping Reference tab so the THIQA cohort is segregated accurately per DOH guidelines.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- ========================================== -->
          <!-- 2. ENGINE LOGIC TAB                        -->
          <!-- ========================================== -->
          <div class="tab-pane fade" id="engine" role="tabpanel" aria-labelledby="engine-tab">
            <div class="card shadow-sm mb-4 border-primary">
              <div class="card-body bg-light">
                <div class="d-flex align-items-center mb-2">
                  <i class="bi bi-cpu-fill fs-4 text-primary me-2"></i>
                  <h5 class="mb-0 fw-bold">Automated Primary Care (PC) Calculation Methodology</h5>
                </div>
                <p class="mb-0 small text-muted">
                  This engine calculates all DOH Jawda PC KPIs using a <strong>Hybrid EMR + Shafafiya Claims approach</strong>. Precise clinical assessment timestamps, vitals, and lab values are drawn from EMR records, while official encounter validity (CPT 99201–99215), diagnostic inclusions (ICD-10), and strict historical exclusions are joined against Shafafiya claims and our centralized Mapping Reference database.
                </p>
              </div>
            </div>
            
            <div class="accordion shadow-sm" id="kpiAccordion">
      \`;

      definitions.forEach((def, index) => {
        const details = KPI_DETAILS[def.code] || {
          title: def.name,
          denominator: def.denominator_desc || 'Standard definition',
          numerator: def.numerator_desc || 'Standard definition',
          exclusions: ['Refer to Mapping Reference for standard exclusions'],
          emr_resp: 'Extracts lab results, vitals, and encounter timestamps.',
          rcm_resp: 'Identifies diagnostic inclusions (ICD-10) and primary care face-to-face visits (CPT).',
          cpt_icd: 'Refer to Mapping Reference tab'
        };

        html += \`
          <div class="accordion-item">
            <h2 class="accordion-header" id="heading\${index}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse\${index}">
                <strong class="text-primary me-2">\${def.code}</strong> — \${details.title}
              </button>
            </h2>
            <div id="collapse\${index}" class="accordion-collapse collapse" data-bs-parent="#kpiAccordion">
              <div class="accordion-body">
                <div class="row mb-4">
                  <div class="col-md-6">
                    <div class="bg-light p-3 rounded h-100">
                      <p class="small mb-2"><strong class="text-dark">Denominator:</strong><br>\${details.denominator}</p>
                      <p class="small mb-2"><strong class="text-dark">Numerator:</strong><br>\${details.numerator}</p>
                      <p class="small mb-0"><strong class="text-dark">Target:</strong> <span class="badge bg-success">\${def.target_dir === 'gte' ? '>=' : '<='} \${def.target}\${def.unit}</span></p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="bg-light p-3 rounded h-100">
                      <p class="small mb-2"><strong class="text-danger">Exclusions:</strong></p>
                      <ul class="small text-muted ps-3 mb-2">
                        \${details.exclusions.map(ex => \`<li>\${ex}</li>\`).join('')}
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="border border-info border-start-0 border-end-0 border-bottom-0 border-3 p-3 bg-white shadow-sm h-100">
                      <h6 class="text-info fw-bold small text-uppercase"><i class="bi bi-file-earmark-medical me-1"></i>EMR Data Handles</h6>
                      <p class="small text-muted mb-0">\${details.emr_resp}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="border border-success border-start-0 border-end-0 border-bottom-0 border-3 p-3 bg-white shadow-sm h-100">
                      <h6 class="text-success fw-bold small text-uppercase"><i class="bi bi-receipt-cutoff me-1"></i>RCM / Shafafiya Data Handles</h6>
                      <p class="small text-muted mb-0">\${details.rcm_resp}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        \`;
      });

      html += \`
            </div>
          </div>

          <!-- ========================================== -->
          <!-- 3. MAPPING REFERENCE TAB                   -->
          <!-- ========================================== -->
          <div class="tab-pane fade" id="mapping" role="tabpanel" aria-labelledby="mapping-tab">
            <div class="card shadow-sm">
              <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 class="mb-0 fw-bold">Clinical & Payer Codes Mapping Reference</h5>
                    <p class="text-muted small mb-0">Centralized database crosswalk joined directly to calculations to eliminate code mismatches.</p>
                  </div>
                  <span class="badge bg-primary px-3 py-2">Dynamic Database Join</span>
                </div>
              </div>
              <div class="card-body bg-light">
                <ul class="nav nav-pills mb-3" id="mappingSubTabs" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-enc" type="button" role="tab">Encounters</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-inc" type="button" role="tab">Dx-Inclusions</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-exc" type="button" role="tab">Dx-Exclusions</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-mh" type="button" role="tab">Mental Health</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm me-2 fw-semibold" data-bs-toggle="pill" data-bs-target="#map-act" type="button" role="tab">Action Table</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link btn-sm fw-semibold" data-bs-toggle="pill" data-bs-target="#map-ins" type="button" role="tab">Insurance</button>
                  </li>
                </ul>

                <div class="tab-content bg-white border p-0 rounded shadow-sm" id="mappingSubTabsContent">
                  
                  <!-- Encounters -->
                  <div class="tab-pane fade show active" id="map-enc" role="tabpanel">
                    <table class="table table-hover table-sm mb-0 align-middle">
                      <thead class="table-light"><tr><th>Category</th><th>Code Type</th><th>Code</th><th>Description</th><th class="text-end">Actions</th></tr></thead>
                      <tbody>
                        \${mappings.filter(m => m.mapping_type === 'Category').map(m => \`
                          <tr><td class="fw-bold">\${m.group_name}</td><td>\${m.code_type}</td><td><span class="badge bg-secondary">\${m.code}</span></td><td class="small text-muted">\${m.description || ''}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(\${m.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                        \`).join('')}
                      </tbody>
                    </table>
                  </div>

                  <!-- Inclusions -->
                  <div class="tab-pane fade" id="map-inc" role="tabpanel">
                    <table class="table table-hover table-sm mb-0 align-middle">
                      <thead class="table-light"><tr><th>Disease Group</th><th>Code Type</th><th>Code</th><th>Description</th><th class="text-end">Actions</th></tr></thead>
                      <tbody>
                        \${mappings.filter(m => m.mapping_type === 'Disease_Group' && m.group_name !== 'Depression_Inc').map(m => \`
                          <tr><td class="fw-bold text-success">\${m.group_name}</td><td>\${m.code_type}</td><td><span class="badge bg-secondary">\${m.code}</span></td><td class="small text-muted">\${m.description || ''}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(\${m.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                        \`).join('')}
                      </tbody>
                    </table>
                  </div>

                  <!-- Exclusions -->
                  <div class="tab-pane fade" id="map-exc" role="tabpanel">
                    <table class="table table-hover table-sm mb-0 align-middle">
                      <thead class="table-light"><tr><th>Exclusion Group</th><th>Code Type</th><th>Code</th><th>Description</th><th class="text-end">Actions</th></tr></thead>
                      <tbody>
                        \${mappings.filter(m => m.mapping_type === 'Exclusion_Group' && m.group_name !== 'Bipolar_Exc').map(m => \`
                          <tr><td class="fw-bold text-danger">\${m.group_name}</td><td>\${m.code_type}</td><td><span class="badge bg-secondary">\${m.code}</span></td><td class="small text-muted">\${m.description || ''}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(\${m.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                        \`).join('')}
                      </tbody>
                    </table>
                  </div>

                  <!-- Mental Health -->
                  <div class="tab-pane fade" id="map-mh" role="tabpanel">
                    <table class="table table-hover table-sm mb-0 align-middle">
                      <thead class="table-light"><tr><th>Mental Health Group</th><th>Code Type</th><th>Code</th><th>Description</th><th class="text-end">Actions</th></tr></thead>
                      <tbody>
                        \${mappings.filter(m => m.group_name === 'Depression_Inc' || m.group_name === 'Bipolar_Exc').map(m => \`
                          <tr><td class="fw-bold text-warning">\${m.group_name}</td><td>\${m.code_type}</td><td><span class="badge bg-secondary">\${m.code}</span></td><td class="small text-muted">\${m.description || ''}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(\${m.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                        \`).join('')}
                      </tbody>
                    </table>
                  </div>

                  <!-- Action Table -->
                  <div class="tab-pane fade" id="map-act" role="tabpanel">
                    <table class="table table-hover table-sm mb-0 align-middle">
                      <thead class="table-light"><tr><th>Action Type</th><th>Code Type</th><th>Target KPI</th><th>Code</th><th>Description</th><th class="text-end">Actions</th></tr></thead>
                      <tbody>
                        \${mappings.filter(m => m.mapping_type === 'Action_Table').map(m => \`
                          <tr><td class="fw-bold text-info">\${m.group_name}</td><td>\${m.code_type}</td><td><span class="badge bg-secondary">\${m.target_kpi || '-'}</span></td><td><span class="badge bg-primary">\${m.code}</span></td><td class="small text-muted">\${m.description || ''}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(\${m.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                        \`).join('')}
                      </tbody>
                    </table>
                  </div>

                  <!-- Insurance -->
                  <div class="tab-pane fade" id="map-ins" role="tabpanel">
                    <div style="max-height: 400px; overflow-y: auto;">
                      <table class="table table-hover table-sm mb-0 align-middle">
                        <thead class="table-light" style="position: sticky; top: 0; z-index: 1;"><tr><th>Classification</th><th>License Type</th><th>Auth No (Code)</th><th>Company Name</th><th class="text-end">Actions</th></tr></thead>
                        <tbody>
                          \${mappings.filter(m => m.mapping_type === 'Insurance').map(m => \`
                            <tr><td class="fw-bold text-primary">\${m.group_name}</td><td>\${m.code_type}</td><td><span class="badge bg-secondary">\${m.code}</span></td><td class="small text-muted">\${m.description || ''}</td><td class="text-end"><button class="btn btn-sm text-danger p-0" onclick="Settings.deleteMapping(\${m.id})"><i class="bi bi-x-circle"></i></button></td></tr>
                          \`).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            
            <div class="card shadow-sm mt-4 border-0">
              <div class="card-header bg-white py-3">
                <h6 class="mb-0 fw-bold"><i class="bi bi-plus-circle text-primary me-2"></i>Add New Mapping Code</h6>
              </div>
              <div class="card-body bg-light">
                <form id="mappingForm" class="row g-2 align-items-end">
                  <div class="col-md-2">
                    <label class="small fw-bold text-muted">Type</label>
                    <select id="mapType" class="form-select form-select-sm" onchange="document.getElementById('mapTargetCol').classList.toggle('d-none', this.value !== 'Action_Table')">
                      <option value="Category">Encounters</option>
                      <option value="Disease_Group">Dx-Inclusion</option>
                      <option value="Exclusion_Group">Dx-Exclusion</option>
                      <option value="Action_Table">Action Table</option>
                      <option value="Insurance">Insurance</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="small fw-bold text-muted">Group Name</label>
                    <input type="text" id="mapGroup" class="form-control form-control-sm" placeholder="e.g. DM_Inclusion" required>
                  </div>
                  <div class="col-md-1">
                    <label class="small fw-bold text-muted">Code Type</label>
                    <select id="mapCodeType" class="form-select form-select-sm">
                      <option value="ICD-10">ICD-10</option>
                      <option value="CPT">CPT</option>
                      <option value="DOH_License">DOH License</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="small fw-bold text-muted">Code</label>
                    <input type="text" id="mapCode" class="form-control form-control-sm" placeholder="e.g. E11.9" required>
                  </div>
                  <div class="col-md-2 d-none" id="mapTargetCol">
                    <label class="small fw-bold text-muted">Target KPI</label>
                    <input type="text" id="mapTargetKpi" class="form-control form-control-sm" placeholder="e.g. PC012">
                  </div>
                  <div class="col-md-2">
                    <label class="small fw-bold text-muted">Description</label>
                    <input type="text" id="mapDesc" class="form-control form-control-sm" placeholder="Description...">
                  </div>
                  <div class="col-md-1 text-end">
                    <button type="button" class="btn btn-sm btn-primary w-100" onclick="Settings.addMapping()"><i class="bi bi-plus-lg"></i> Add</button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      \`;

      container.innerHTML = html;

    } catch (e) {
      container.innerHTML = \`<div class="alert alert-danger">Error loading settings: \${e.message}</div>\`;
    }
  },

  async addMapping() {
    const data = {
      mapping_type: document.getElementById('mapType').value,
      group_name: document.getElementById('mapGroup').value,
      code_type: document.getElementById('mapCodeType').value,
      code: document.getElementById('mapCode').value,
      description: document.getElementById('mapDesc').value,
      target_kpi: document.getElementById('mapTargetKpi') ? document.getElementById('mapTargetKpi').value : ''
    };

    if (!data.group_name || !data.code) return App.toast('Group and Code are required', 'danger');

    try {
      const res = await fetch('/api/settings/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        App.toast('Mapping code added successfully');
        App.refreshCurrentPage();
      } else {
        App.toast(result.error || 'Failed to add mapping', 'danger');
      }
    } catch (e) {
      App.toast('Error adding mapping', 'danger');
    }
  },

  async deleteMapping(id) {
    if (!confirm('Are you sure you want to delete this mapping code?')) return;
    try {
      const res = await fetch(\`/api/settings/mappings/\${id}\`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        App.toast('Mapping deleted');
        App.refreshCurrentPage();
      } else {
        App.toast('Failed to delete mapping', 'danger');
      }
    } catch (e) {
      App.toast('Error deleting mapping', 'danger');
    }
  }
};
`;

fs.writeFileSync(path.join(__dirname, 'public', 'js', 'settings.js'), content, 'utf8');
console.log('Successfully updated settings.js with Primary Care (PC) focus and direct download links');
