import{A as d}from"./main-q3P2gCcD.js";function b(t,a){const e=t.closest("table"),s=e.querySelector("tbody"),n=Array.from(s.querySelectorAll("tr"));let c=t.dataset.dir||"asc";n.sort((i,r)=>{const l=i.cells[a].textContent.trim(),h=r.cells[a].textContent.trim();return c==="asc"?l.localeCompare(h,void 0,{numeric:!0}):h.localeCompare(l,void 0,{numeric:!0})}),t.dataset.dir=c==="asc"?"desc":"asc",n.forEach(i=>s.appendChild(i)),e.querySelectorAll("th span").forEach(i=>i.textContent="")}window.sortAuditTable=b;const m={state:{monthlyData:[],activeTab:"monthly",reconciliation:null,thiqaPage:1,thiqaPageSize:50},isLocked:!1,render(t){if(!d.state.facilityId){t.innerHTML='<div class="alert alert-warning"><i class="bi bi-exclamation-triangle"></i> Please select a facility first.</div>';return}t.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0 fw-bold">Data Audit & Locking <span class="badge bg-secondary fs-6 ms-2">Q${d.state.quarter} ${d.state.year}</span></h2>
          <p class="text-muted mb-0">Reconcile EMR clinical data with RCM claims data before calculating KPIs.</p>
        </div>
        <div>
          <button class="btn btn-success btn-sm me-2 d-none" id="audit-calc-kpi-btn" onclick="Audit.calculateKPIs()">
            <i class="bi bi-play-circle me-1"></i>Calculate KPIs
          </button>
          <button class="btn btn-outline-danger btn-sm me-2" id="audit-lock-btn" onclick="Audit.toggleLock()">
            <i class="bi bi-lock me-1"></i>Save & Lock Audit
          </button>
          <button class="btn btn-outline-primary btn-sm me-2" onclick="Audit.refreshData()">
            <i class="bi bi-arrow-clockwise me-1"></i>Recalculate Audit Data
          </button>
          <button class="btn btn-outline-success btn-sm" onclick="Audit.exportCsv()">
            <i class="bi bi-download me-1"></i>Export Audit CSV
          </button>
        </div>
      </div>

      <ul class="nav nav-tabs mb-4 border-bottom-0 gap-2">
        <li class="nav-item">
          <a class="nav-link active" href="#" data-audit-tab="monthly" onclick="Audit.switchTab('monthly',this)">
            <i class="bi bi-calendar3 me-1"></i>Monthly Coverage Grid
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-audit-tab="reconcile" onclick="Audit.switchTab('reconcile',this)">
            <i class="bi bi-arrow-left-right me-1"></i>Reconciliation
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-audit-tab="thiqa" onclick="Audit.switchTab('thiqa',this)">
            <i class="bi bi-shield-check me-1"></i>Full Audit Log
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-audit-tab="batches" onclick="Audit.switchTab('batches',this)">
            <i class="bi bi-box-arrow-in-down me-1"></i>Import Batches
          </a>
        </li>
      </ul>
      <div id="audit-tab-content"></div>
    `,this.checkLock(),this.switchTab("monthly"),this._loadMonthly(d.state.facilityId).then(()=>{this.state.activeTab==="monthly"&&this._renderMonthly(document.getElementById("audit-tab-content"))})},async _loadMonthly(t){try{const a=await fetch(`/api/audit/monthly?facility_id=${t}`),e=await a.json();if(!a.ok||!Array.isArray(e))throw new Error(e.error||"Monthly audit request failed");this.state.monthlyData=e}catch{this.state.monthlyData=[]}},switchTab(t,a){this.state.activeTab=t,document.querySelectorAll("[data-audit-tab]").forEach(s=>s.classList.remove("active")),a?a.classList.add("active"):document.querySelector(`[data-audit-tab="${t}"]`).classList.add("active");const e=document.getElementById("audit-tab-content");t==="monthly"?this._renderMonthly(e):t==="reconcile"?this._loadAndRenderReconciliation(e):t==="thiqa"?this._loadAndRenderThiqa(e):t==="batches"&&this._loadAndRenderBatches(e)},_statusBadge(t){return t==="received"?'<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-check-circle me-1"></i>Data Received</span>':'<span class="badge bg-danger-subtle text-danger border border-danger"><i class="bi bi-exclamation-triangle me-1"></i>MISSING</span>'},_matchRateBadge(t){return t===null?'<span class="text-muted">?"</span>':`<span class="badge bg-${t>=80?"success":t>=50?"warning":"danger"}">${t}%</span>`},_renderMonthly(t){const a=this.state.monthlyData;if(!a.length){t.innerHTML='<div class="alert alert-info">No data loaded. Please import EMR or RCM data first.</div>';return}const e=a.map(s=>`<tr class="${s.emrStatus==="received"&&s.rcmStatus==="received"?"":s.emrStatus==="received"||s.rcmStatus==="received"?"table-warning bg-warning-subtle":"table-danger bg-danger-subtle"}">
        <td class="fw-semibold">${s.label}</td>
        <td class="text-center">${s.emrVisits.toLocaleString()}</td>
        <td class="text-center">${s.rcmClaims.toLocaleString()}</td>
        <td class="text-center">${s.matched.toLocaleString()}</td>
        <td class="text-center">${this._matchRateBadge(s.matchRate)}</td>
        <td class="text-center"><span class="badge bg-primary">${s.thiqa}</span></td>
        <td class="text-center"><span class="badge bg-secondary">${s.abm}</span></td>
        <td class="text-center"><span class="badge bg-info text-dark">${s.commercial}</span></td>
        <td class="text-center"><span class="badge bg-light text-dark border">${s.selfPay}</span></td>
        <td>${this._statusBadge(s.emrStatus)}</td>
        <td>${this._statusBadge(s.rcmStatus)}</td>
      </tr>`).join("");t.innerHTML=`
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white pt-3 pb-2">
          <h6 class="mb-0 fw-bold"><i class="bi bi-calendar3 me-2 text-primary"></i>Historical Coverage Grid</h6>
          <div class="small text-muted mt-1 float-end" style="margin-top: -20px;">
            Match key: MRN + Encounter Date | Green = both present | Yellow = partial | Red = both missing
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-bordered table-hover mb-0 align-middle" style="font-size:0.82rem;">
            <thead class="table-dark">
              <tr>
                <th>Month</th>
                <th class="text-center">EMR<br>Visits</th>
                <th class="text-center">RCM<br>Claims</th>
                <th class="text-center">Matched</th>
                <th class="text-center">Match<br>Rate</th>
                <th class="text-center text-primary">THIQA</th>
                <th class="text-center">ABM<br>Mandate</th>
                <th class="text-center">Commercial</th>
                <th class="text-center">Self-Pay</th>
                <th>EMR Status</th>
                <th>RCM Status</th>
              </tr>
            </thead>
            <tbody>${e}</tbody>
          </table>
        </div>
      </div>`},async _loadAndRenderReconciliation(t){t.innerHTML='<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading reconciliation data...</p></div>';try{const a=d.state.facilityId,e=await fetch(`/api/audit/reconciliation?facility_id=${a}&year=${d.state.year}&quarter=${d.state.quarter}`),s=await e.json();if(!e.ok||s.error)throw new Error(s.error||"Audit log request failed");this.state.reconciliation=s;const n=s.emrOnly.map(i=>`
        <tr>
          <td class="font-monospace small">${i.mrn}</td>
          <td>${i.encounter_date}</td>
          <td class="font-monospace small">${i.physician_id}</td>
          <td>${i.physician_category}</td>
          <td class="small">${i.icd10_primary||""}</td>
          <td>${i.patient_age||""}</td>
          <td>${i.gender||""}</td>
          <td class="text-danger small fw-semibold"><i class="bi bi-exclamation-circle me-1"></i>Missing RCM Claim</td>
        </tr>`).join("")||'<tr><td colspan="8" class="text-center text-muted">No missing RCM claims</td></tr>',c=s.rcmOnly.map(i=>`
        <tr>
          <td class="font-monospace small">${i.claim_id}</td>
          <td class="font-monospace small">${i.mrn}</td>
          <td>${i.encounter_date}</td>
          <td class="font-monospace small">${i.physician_id||""}</td>
          <td>${i.physician_category}</td>
          <td class="font-monospace small">${i.ordering_physician_id||""}</td>
          <td>${i.ordering_physician_type||""}</td>
          <td class="small">${i.icd10_primary||""}</td>
          <td>${i.insurance_type}</td>
          <td>${i.insurance_category}</td>
          <td class="text-danger small fw-semibold"><i class="bi bi-exclamation-circle me-1"></i>Missing EMR Record</td>
        </tr>`).join("")||'<tr><td colspan="11" class="text-center text-muted">No missing EMR records</td></tr>';t.innerHTML=`
        <div class="alert alert-warning border-0 shadow-sm small">
          <i class="bi bi-exclamation-triangle me-2"></i>
          <strong>Reconciliation Required:</strong> The following tables highlight records that exist in one system but are missing in the other. 
          Unmatched claims will NOT be evaluated by the JAWDA KPI Engine. Please review and update your source systems if necessary before locking the quarter.
        </div>
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-warning-subtle">
            <strong><i class="bi bi-clipboard-x me-2"></i>EMR Visits Without Matching Claim (top 100)</strong>
          </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
              <thead class="table-light"><tr>
                <th>MRN</th><th>Encounter Date</th><th>Physician ID</th><th>Physician Type</th>
                <th>ICD-10</th><th>Age</th><th>Gender</th><th>Issue</th>
              </tr></thead>
              <tbody>${n}</tbody>
            </table>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-header bg-danger-subtle">
            <strong><i class="bi bi-receipt-cutoff me-2"></i>RCM Claims Without Matching EMR Visit (top 100)</strong>
          </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
              <thead class="table-light"><tr>
                <th>Claim ID</th><th>MRN</th><th>Date</th><th>Physician ID</th><th>Physician Type</th>
                <th>Ordering ID</th><th>Ordering Type</th><th>ICD-10</th><th>Payer Code</th><th>Category</th><th>Issue</th>
              </tr></thead>
              <tbody>${c}</tbody>
            </table>
          </div>
        </div>`}catch(a){t.innerHTML=`<div class="alert alert-danger">Failed to load reconciliation data: ${a.message}</div>`}},async _loadAndRenderThiqa(t){t.innerHTML='<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading Data Audit...</p></div>';try{const a=d.state.facilityId;let e=this.state.reconciliation;if(!e){const s=await fetch(`/api/audit/reconciliation?facility_id=${a}&year=${d.state.year}&quarter=${d.state.quarter}`);if(e=await s.json(),!s.ok||e.error)throw new Error(e.error||"Audit log request failed");this.state.reconciliation=e}this._renderPaginatedThiqaTable()}catch(a){document.getElementById("audit-tab-content").innerHTML=`<div class="alert alert-danger">Failed to load THIQA data: ${a.message}</div>`}},setThiqaPage(t){this.state.thiqaPage=t,this._renderPaginatedThiqaTable()},_renderPaginatedThiqaTable(){var h;const t=document.getElementById("audit-tab-content"),a=((h=this.state.reconciliation)==null?void 0:h.thiqaRecords)||[],e=a.filter(o=>o.emr_match==="Matched").length,s=a.filter(o=>o.emr_match!=="Matched").length,n=Math.ceil(a.length/this.state.thiqaPageSize)||1;this.state.thiqaPage>n&&(this.state.thiqaPage=n);const c=(this.state.thiqaPage-1)*this.state.thiqaPageSize,r=a.slice(c,c+this.state.thiqaPageSize).map(o=>`
      <tr class="${o.emr_match!=="Matched"?"table-warning":""}">
        <td class="font-monospace small">${o.claim_id||'?"'}</td>
        <td class="font-monospace small">${o.mrn||'?"'}</td>
        <td>${o.encounter_date||'?"'}</td>
        <td class="font-monospace small">${o.physician_id||'?"'}</td>
        <td>${o.physician_category||"Other / Unknown"}</td>
        <td class="font-monospace small">${o.ordering_physician_id||'?"'}</td>
        <td>${o.ordering_physician_type||'?"'}</td>
        <td><span class="badge bg-secondary">${o.insurance_type||"Self-Pay"}</span></td>
        <td class="small">${o.icd10_primary||'?"'}</td>
        <td>${o.emr_match==="Matched"?'<span class="badge bg-success">o. Matched</span>':'<span class="badge bg-danger">s,? No EMR Record</span>'}</td>
      </tr>`).join("")||'<tr><td colspan="10" class="text-center text-muted py-4">No encounters found</td></tr>';let l="";n>1&&(l=`
        <nav aria-label="Table pagination" class="mt-3">
          <ul class="pagination pagination-sm justify-content-center mb-0">
            <li class="page-item ${this.state.thiqaPage===1?"disabled":""}">
              <a class="page-link" href="#" onclick="event.preventDefault(); window.Audit.setThiqaPage(${this.state.thiqaPage-1})">Previous</a>
            </li>
            <li class="page-item disabled"><span class="page-link">Page ${this.state.thiqaPage} of ${n}</span></li>
            <li class="page-item ${this.state.thiqaPage===n?"disabled":""}">
              <a class="page-link" href="#" onclick="event.preventDefault(); window.Audit.setThiqaPage(${this.state.thiqaPage+1})">Next</a>
            </li>
          </ul>
        </nav>`),t.innerHTML=`
      <div class="row g-3 mb-3">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center border-top border-primary border-3">
            <div class="card-body py-3">
              <i class="bi bi-shield-check fs-2 text-primary"></i>
              <div class="fw-bold fs-4">${a.length}</div>
              <div class="text-muted small">Total Encounters</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center border-top border-success border-3">
            <div class="card-body py-3">
              <i class="bi bi-check2-circle fs-2 text-success"></i>
              <div class="fw-bold fs-4">${e}</div>
              <div class="text-muted small">EMR + RCM Matched</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center border-top border-danger border-3">
            <div class="card-body py-3">
              <i class="bi bi-exclamation-triangle fs-2 text-danger"></i>
              <div class="fw-bold fs-4">${s}</div>
              <div class="text-muted small">No EMR Record</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm text-center border-top border-info border-3">
            <div class="card-body py-3">
              <i class="bi bi-percent fs-2 text-info"></i>
              <div class="fw-bold fs-4">${a.length?Math.round(e/a.length*100):0}%</div>
              <div class="text-muted small">Overall Match Rate</div>
            </div>
          </div>
        </div>
      </div>
      <div class="alert alert-info border-0 shadow-sm small">
        <i class="bi bi-info-circle me-2"></i>
        <strong>Data Audit Log:</strong> This table lists all uploaded claims. Every claim must have a corresponding EMR clinical record to be valid for JAWDA KPI calculation. Unmatched claims will be highlighted.
      </div>
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <strong><i class="bi bi-shield-check text-primary me-2"></i>All Claims Audit Log</strong>
          <span class="badge bg-secondary text-white">Showing ${c+1}-${Math.min(c+this.state.thiqaPageSize,a.length)} of ${a.length}</span>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.82rem;">
            <thead class="table-light"><tr>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 0)">Claim ID</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 1)">MRN</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 2)">Encounter Date</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 3)">Physician ID</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 4)">Physician Type</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 5)">Ordering ID</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 6)">Ordering Type</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 7)">Insurance</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 8)">ICD-10 Primary</th>
              <th style="cursor:pointer" onclick="window.sortAuditTable(this, 9)">EMR Match Status</th>
            </tr></thead>
            <tbody>${r}</tbody>
          </table>
        </div>
        ${l?`<div class="card-footer bg-white border-0 pt-0 pb-3">${l}</div>`:""}
      </div>`},async _loadAndRenderBatches(t){t.innerHTML='<div class="text-center py-5 text-muted"><i class="bi bi-hourglass-split fs-2"></i><p class="mt-2">Loading batch history...</p></div>';try{const a=d.state.facilityId,e=await fetch(`/api/audit/batches?facility_id=${a}`),s=await e.json();if(!e.ok)throw new Error(s.error||"Failed to fetch batches");const n=s.map(c=>`
        <tr>
          <td class="font-monospace small">#${c.id}</td>
          <td><span class="badge ${c.file_type==="emr"?"bg-primary":"bg-info text-dark"} text-uppercase">${c.file_type}</span></td>
          <td class="small fw-semibold">${c.file_name}</td>
          <td class="text-center">Q${c.quarter} ${c.year}</td>
          <td class="text-center">${c.row_count}</td>
          <td class="text-center ${c.error_count>0?"text-danger fw-bold":"text-muted"}">${c.error_count}</td>
          <td>${c.status==="done"?'<span class="badge bg-success">Complete</span>':c.status==="processing"?'<span class="badge bg-warning text-dark">Processing</span>':'<span class="badge bg-danger">Failed</span>'}</td>
          <td class="small text-muted">${new Date(c.imported_at).toLocaleString()}</td>
        </tr>`).join("")||'<tr><td colspan="8" class="text-center text-muted">No imports found</td></tr>';t.innerHTML=`
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <strong><i class="bi bi-cloud-arrow-up text-primary me-2"></i>Recent Import Batches</strong>
          </div>
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle" style="font-size:0.85rem;">
              <thead class="table-light"><tr>
                <th>Batch</th><th>Type</th><th>File Name</th><th class="text-center">Quarter</th>
                <th class="text-center">Records</th><th class="text-center">Errors</th>
                <th>Status</th><th>Imported At</th>
              </tr></thead>
              <tbody>${n}</tbody>
            </table>
          </div>
          <div class="card-footer bg-white text-muted small">
            <i class="bi bi-info-circle me-1"></i>
            EMR batches = clinical data (MRN, diagnoses, vitals, labs) |
            RCM batches = claim data (Claim ID, insurance code, CPTs)
          </div>
        </div>`}catch(a){t.innerHTML=`<div class="alert alert-danger">Failed to load batch history: ${a.message}</div>`}},async calculateKPIs(){if(!document.getElementById("kpiProgressModal")){const r=document.createElement("div");r.innerHTML=`<div class="modal fade" id="kpiProgressModal" data-bs-backdrop="static" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white border-0">
              <h5 class="modal-title fw-bold"><i class="bi bi-cpu me-2"></i> JAWDA Engine</h5>
            </div>
            <div class="modal-body p-4">
              <h6 id="kpi-prog-text" class="text-center text-primary mb-3 fw-bold">Initializing Engine...</h6>
              <div class="progress mb-3" style="height: 25px;">
                <div id="kpi-prog-bar" class="progress-bar progress-bar-striped progress-bar-animated bg-primary" style="width: 5%"></div>
              </div>
              <div id="kpi-prog-log" class="small text-muted font-monospace" style="height: 100px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                > Connecting to database...<br>
              </div>
            </div>
            <div class="modal-footer border-0 d-none" id="kpi-prog-footer">
              <button type="button" class="btn btn-primary w-100" data-bs-dismiss="modal" onclick="App.navigate('dashboard')">View Results in Dashboard</button>
            </div>
          </div>
        </div>
      </div>`,document.body.appendChild(r.firstChild)}new bootstrap.Modal(document.getElementById("kpiProgressModal")).show();const a=document.getElementById("kpi-prog-text"),e=document.getElementById("kpi-prog-bar"),s=document.getElementById("kpi-prog-log"),n=document.getElementById("kpi-prog-footer");n.classList.add("d-none"),e.style.width="10%",e.classList.add("progress-bar-animated"),e.classList.remove("bg-success","bg-danger"),e.classList.add("bg-primary"),s.innerHTML="> Engine Locked & Ready.<br>> Executing batch KPI calculation...<br>",a.innerText="Scanning EMR & RCM Records...";let c=10;const i=setInterval(()=>{c<85&&(c+=5,e.style.width=c+"%"),c===30&&(s.innerHTML+="> Resolving Clinical Rules...<br>"),c===60&&(s.innerHTML+="> Matching DOH Dictionaries...<br>")},400);try{const r=await fetch("/api/kpi/calculate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:d.state.facilityId,year:d.state.year,quarter:d.state.quarter,version:d.state.version})}),l=await r.json();if(clearInterval(i),!r.ok)throw new Error(l.error||"Failed to calculate");e.style.width="100%",e.classList.remove("progress-bar-animated","bg-primary"),e.classList.add("bg-success"),a.innerText="Calculation Complete!",a.className="text-center text-success mb-3 fw-bold",s.innerHTML+=`<span class="text-success">> SUCCESS: Calculated ${l.results.length} KPIs successfully!</span><br>`,n.classList.remove("d-none"),window._forceDashboardReload=!0,window._forceComparisonReload=!0}catch(r){clearInterval(i),e.style.width="100%",e.classList.remove("progress-bar-animated","bg-primary"),e.classList.add("bg-danger"),a.innerText="Engine Error",a.className="text-center text-danger mb-3 fw-bold",s.innerHTML+=`<span class="text-danger">> FATAL: ${r.message}</span><br>`,n.innerHTML='<button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">Close</button>',n.classList.remove("d-none")}},async checkLock(){try{const a=await(await fetch(`/api/kpi/lock-status?facility_id=${d.state.facilityId}&year=${d.state.year}&quarter=${d.state.quarter}`)).json();this.isLocked=a.is_locked;const e=document.getElementById("audit-lock-btn");this.isLocked?(e.innerHTML='<i class="bi bi-unlock"></i> Unlock Data',e.className="btn btn-outline-secondary btn-sm me-2",document.getElementById("audit-calc-kpi-btn").classList.remove("d-none")):(e.innerHTML='<i class="bi bi-lock"></i> Save & Lock Audit',e.className="btn btn-outline-danger btn-sm me-2",document.getElementById("audit-calc-kpi-btn").classList.add("d-none"))}catch(t){console.error(t)}},async toggleLock(){try{(await(await fetch("/api/kpi/toggle-lock",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:d.state.facilityId,year:d.state.year,quarter:d.state.quarter,lock:!this.isLocked})})).json()).success&&(window._forceAuditReload=!0,window._forceDashboardReload=!0,d.toast(this.isLocked?"Audit Unlocked!":"Audit Saved & Locked! KPI Engine is now unlocked.","success"),this.checkLock())}catch{d.toast("Failed to toggle lock","danger")}},refreshData(){this.state.reconciliation=null,this.state.monthlyData=[];const t=document.getElementById("app-content");d.toast("Recalculating Data Audit...","info"),this.render(t)},exportCsv(){const t=this.state.monthlyData;if(!t.length){d.toast("No monthly data to export","warning");return}const a=["Month","EMR Visits","RCM Claims","Matched","Match Rate %","THIQA","ABM Mandate","Commercial","Self-Pay","EMR Status","RCM Status"],e=t.map(l=>[l.label,l.emrVisits,l.rcmClaims,l.matched,l.matchRate!==null?l.matchRate:"",l.thiqa,l.abm,l.commercial,l.selfPay,l.emrStatus==="received"?"Data Received":"MISSING",l.rcmStatus==="received"?"Data Received":"MISSING"]),s=l=>`"${String(l??"").replace(/"/g,'""')}"`,n=[a,...e].map(l=>l.map(s).join(",")).join(`
`),c=new Blob([n],{type:"text/csv"}),i=URL.createObjectURL(c),r=document.createElement("a");r.href=i,r.download=`jawda_data_audit_${d.state.facilityId}_${new Date().toISOString().slice(0,10)}.csv`,r.click(),URL.revokeObjectURL(i),d.toast("Audit CSV exported","success")}};window.Audit=m;export{m as Audit,b as sortAuditTable};
