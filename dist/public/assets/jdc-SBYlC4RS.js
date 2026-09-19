import{A as a}from"./main-q3P2gCcD.js";const I={async render(o){o.innerHTML='<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';try{const[e,d]=await Promise.all([fetch(`/api/jdc/preview?facility_id=${a.state.facilityId}&year=${a.state.year}&quarter=${a.state.quarter}`),fetch(`/api/jdc/status?facility_id=${a.state.facilityId}&year=${a.state.year}&quarter=${a.state.quarter}`)]);if(!e.ok){const s=await e.json();throw new Error(s.error||`HTTP ${e.status}`)}const n=await e.json(),p=d.ok?await d.json():{submission:null,quarterLocked:n.quarterLocked};n._status=p,this.renderPage(o,n)}catch(e){o.innerHTML=`<div class="alert alert-danger">Error: ${e.message}</div>`}},renderPage(o,e){var u,v,f;const d=e.facility,n=t=>!t||t==="no-data"?'<span class="badge bg-secondary">No Data</span>':t==="met"?'<span class="badge bg-success">Met</span>':t==="near"?'<span class="badge bg-warning text-dark">Near</span>':'<span class="badge bg-danger">Not Met</span>',p=e.quarterLocked?`<span class="badge bg-success"><i class="bi bi-lock-fill"></i> Locked (${e.lockedAt})</span>`:'<span class="badge bg-danger"><i class="bi bi-unlock-fill"></i> Not Locked</span>',s=(u=e._status)==null?void 0:u.submission,b=(s==null?void 0:s.status)||"draft",h=[{id:"draft",label:"Prepare",icon:"bi-clipboard-plus"},{id:"validated",label:"Validate",icon:"bi-check2-square"},{id:"submitted",label:"Finalize & Sign",icon:"bi-pen-fill"}],m=h.findIndex(t=>t.id===b),g=[{label:"Quarter locked & records frozen",pass:e.quarterLocked,detail:e.quarterLocked?`Locked ${e.lockedAt}`:"Lock the quarter before submitting"},{label:`Data imports recorded (${e.importCount})`,pass:e.importCount>0,detail:e.imports.map(t=>`${t.file_type||"?"} (${t.row_count||0} rows)`).join(", ")||"No imports found"},{label:"All KPIs have data",pass:e.noDataKPIs===0,detail:e.noDataKPIs===0?"All calculated":`${e.noDataKPIs} with no data`}],w=((v=e._status)==null?void 0:v.canValidate)===!0,$=((f=e._status)==null?void 0:f.canFinalize)===!0;let x=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0"><i class="bi bi-file-earmark-spreadsheet me-2"></i>JDC Export & Submission</h2>
          <p class="text-muted mb-0">${d.name} (MF: ${d.mf_no}) — Q${e.quarter} ${e.year}</p>
        </div>
        <button class="btn btn-primary" id="jdcExportBtn" ${e.results.length===0?"disabled":""}>
          <i class="bi bi-download me-1"></i> Download JDC Workbook
        </button>
      </div>

      <!-- Workflow Stepper -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            ${h.map((t,i)=>`
                <div class="d-flex align-items-center gap-2 flex-grow-1">
                  <div class="step-circle ${i<m||b==="submitted"?"step-done":""} ${i===m?"step-active":""} ${i<m?"bg-success text-white":""}">
                    <i class="bi ${i<m?"bi-check-lg":t.icon}"></i>
                  </div>
                  <div>
                    <div class="fw-bold small">${t.label}</div>
                    <div class="text-muted small">
                      ${t.id==="draft"?s!=null&&s.prepared_at?"Prepared "+new Date(s.prepared_at).toLocaleDateString():"Not prepared":""}
                      ${t.id==="validated"?s!=null&&s.validated_at?"Validated "+new Date(s.validated_at).toLocaleDateString():"Not validated":""}
                      ${t.id==="submitted"?s!=null&&s.submitted_at?"Submitted "+new Date(s.submitted_at).toLocaleDateString():"Not submitted":""}
                    </div>
                  </div>
                  ${i<h.length-1?`<div class="flex-grow-1 border-top border-2 ${i<m?"border-success":""} mb-3"></div>`:""}
                </div>
              `).join("")}
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
              <input type="text" class="form-control form-control-sm" id="ceoNameInput" placeholder="Full name of CEO" value="${(s==null?void 0:s.ceo_name)||""}">
            </div>
            <button class="btn btn-outline-primary btn-sm" id="jdcValidateBtn" ${w?"":"disabled"}>
              <i class="bi bi-check2-square me-1"></i> Validate Submission
            </button>
            <button class="btn btn-outline-success btn-sm" id="jdcFinalizeBtn" ${$?"":"disabled"}>
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
              <h2 class="display-6 fw-bold mb-0">${e.totalKPIs}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-success text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Met Target</h6>
              <h2 class="display-6 fw-bold mb-0">${e.metKPIs}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-warning text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Near Target</h6>
              <h2 class="display-6 fw-bold mb-0">${e.nearKPIs}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card bg-danger text-white h-100">
            <div class="card-body text-center">
              <h6 class="text-uppercase opacity-75">Not Met / No Data</h6>
              <h2 class="display-6 fw-bold mb-0">${e.notMetKPIs+e.noDataKPIs}</h2>
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
                  <tr><th style="width:40%">Name</th><td>${d.name}</td></tr>
                  <tr><th>MF Number</th><td>${d.mf_no}</td></tr>
                  <tr><th>License No.</th><td>${d.license_no||"-"}</td></tr>
                  <tr><th>Facility Type</th><td>${e.facilityType}</td></tr>
                  <tr><th>Coordinator</th><td>${d.coordinator||"-"}</td></tr>
                  <tr><th>Company</th><td>${e.company||"-"}</td></tr>
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
                  <tr><th style="width:40%">Quarter Status</th><td>${p}</td></tr>
                  <tr><th>Workflow Status</th><td><span class="badge text-bg-${b==="submitted"?"success":b==="validated"?"info":"secondary"}">${b}</span></td></tr>
                  <tr><th>Registry Version</th><td>${e.registryVersion}</td></tr>
                  <tr><th>KPIs Submitted</th><td>${e.totalKPIs}</td></tr>
                  <tr><th>Imports Recorded</th><td>${e.importCount}</td></tr>
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
              ${g.map(t=>`
                <tr>
                  <td>${t.label}</td>
                  <td>${t.pass?'<span class="badge bg-success">PASS</span>':'<span class="badge bg-danger">FAIL</span>'}</td>
                  <td class="text-muted small">${t.detail}</td>
                </tr>
              `).join("")}
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
                ${e.results.map(t=>`
                  <tr>
                    <td class="fw-bold">${t.kpi_code}</td>
                    <td class="small">${t.short_name}</td>
                    <td class="text-center">${t.target!=null?t.target+"%":"-"}</td>
                    <td class="text-center">${t.numerator??"-"}</td>
                    <td class="text-center">${t.denominator??"-"}</td>
                    <td class="text-center fw-bold">${t.value!=null?t.value+"%":"-"}</td>
                    <td class="text-center">${n(t.status)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;o.innerHTML=x,document.getElementById("jdcExportBtn").addEventListener("click",async()=>{const t=document.getElementById("jdcExportBtn");t.disabled=!0,t.innerHTML='<span class="spinner-border spinner-border-sm"></span> Generating...';try{const i=await fetch(`/api/jdc/export?facility_id=${a.state.facilityId}&year=${a.state.year}&quarter=${a.state.quarter}`);if(!i.ok){const y=await i.json();throw new Error(y.error||`HTTP ${i.status}`)}const c=await i.blob(),l=URL.createObjectURL(c),r=document.createElement("a");r.href=l,r.download=`JDC_${d.name.replace(/[^a-zA-Z0-9_-]/g,"_")}_Q${e.quarter}_${e.year}.xlsx`,document.body.appendChild(r),r.click(),r.remove(),URL.revokeObjectURL(l);try{await fetch("/api/jdc/prepare",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:a.state.facilityId,year:a.state.year,quarter:a.state.quarter})})}catch{}a.toast("JDC workbook downloaded","success"),a.refreshCurrentPage()}catch(i){a.toast("Export failed: "+i.message,"danger"),console.error("JDC export error:",i)}finally{t.disabled=!1,t.innerHTML='<i class="bi bi-download me-1"></i> Download JDC Workbook'}}),document.getElementById("jdcValidateBtn").addEventListener("click",async()=>{const t=document.getElementById("jdcValidateBtn");t.disabled=!0;try{const c=await(await fetch("/api/jdc/validate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:a.state.facilityId,year:a.state.year,quarter:a.state.quarter})})).json(),l=document.getElementById("workflowMsg");c.validated?(l.innerHTML='<span class="text-success fw-bold"><i class="bi bi-check-circle-fill me-1"></i>Validation passed — all checks complete.</span>',a.toast("Validation passed","success")):(l.innerHTML=`<span class="text-danger fw-bold"><i class="bi bi-x-circle-fill me-1"></i>Validation failed.</span> <span class="text-muted">${(c.checks||[]).filter(r=>!r.pass).map(r=>r.label).join("; ")}</span>`,a.toast("Validation failed","danger")),a.refreshCurrentPage()}catch(i){a.toast("Validate failed: "+i.message,"danger")}finally{t.disabled=!1}}),document.getElementById("jdcFinalizeBtn").addEventListener("click",async()=>{const t=document.getElementById("ceoNameInput").value.trim();if(!confirm(`Finalize & sign JDC submission for Q${e.quarter} ${e.year}?${t?`
CEO: ${t}`:`
No CEO name provided`}`))return;const i=document.getElementById("jdcFinalizeBtn");i.disabled=!0;try{const l=await(await fetch("/api/jdc/finalize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:a.state.facilityId,year:a.state.year,quarter:a.state.quarter,ceo_name:t})})).json();l.success?(a.toast("Submission finalized & signed","success"),a.refreshCurrentPage()):a.toast("Finalize failed: "+(l.error||"unknown"),"danger")}catch(c){a.toast("Finalize failed: "+c.message,"danger")}finally{i.disabled=!1}})}};export{I as Jdc};
