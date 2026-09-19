const c={state:{activeTab:"vault",facilityId:null,pollInterval:null,activeBatchId:null},async render(e){this.state.facilityId=window.App.state.facilityId,e.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-1 fw-bold text-dark"><i class="bi bi-database-check text-primary me-2"></i>Data Manager</h2>
          <p class="text-muted mb-0">Upload new data files or review your previously imported data vault.</p>
        </div>
      </div>
      
      <ul class="nav nav-pills mb-4" id="dataManagerTabs">
        <li class="nav-item">
          <a class="nav-link ${this.state.activeTab==="vault"?"active":""}" href="#" onclick="DataManager.switchTab('vault', this); return false;">
            <i class="bi bi-safe2"></i> Data Vault
          </a>
        </li>
        <li class="nav-item ms-2">
          <a class="nav-link ${this.state.activeTab==="upload"?"active":""}" href="#" onclick="DataManager.switchTab('upload', this); return false;">
            <i class="bi bi-cloud-upload"></i> Upload Data
          </a>
        </li>
      </ul>
      
      <div id="dm-content-area"></div>
    `,this.renderActiveTab()},switchTab(e,a){this.state.activeTab=e,document.querySelectorAll("#dataManagerTabs .nav-link").forEach(s=>s.classList.remove("active")),a?a.classList.add("active"):document.querySelector(`#dataManagerTabs a[onclick*="${e}"]`).classList.add("active"),this.renderActiveTab()},renderActiveTab(){const e=document.getElementById("dm-content-area");this.state.activeTab==="vault"?this.renderVault(e):this.renderUpload(e)},async renderVault(e){e.innerHTML='<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-3 text-muted">Loading Data Vault...</p></div>';try{const a=await fetch(`/api/audit/vault-summary?facility_id=${this.state.facilityId}`);if(!a.ok)throw new Error("Failed to load vault");const s=await a.json();if(!s||s.length===0){e.innerHTML=`
          <div class="card shadow-sm border-0 bg-light py-5 text-center">
            <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
            <h5>No Data Found</h5>
            <p class="text-muted">You haven't uploaded any data for this facility yet.</p>
            <button class="btn btn-primary mt-3" onclick="DataManager.switchTab('upload')">Go to Upload Data</button>
          </div>
        `;return}let i='<div class="row g-4">';s.forEach(t=>{const r=parseFloat(t.match_rate);let d="bg-danger",l="Critical";r>=95?(d="bg-success",l="Excellent"):r>=80&&(d="bg-warning text-dark",l="Needs Review");const n=`Q${t.quarter} ${t.year}`,o=t.last_calculated_at?new Date(t.last_calculated_at).toLocaleDateString():"Never calculated";i+=`
          <div class="col-12 col-xl-6">
            <div class="card shadow-sm border-0 h-100">
              <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold"><i class="bi bi-calendar3 me-2 text-primary"></i> ${n}</h5>
                <span class="badge ${d} fs-6">${l} (${t.match_rate}%)</span>
              </div>
              <div class="card-body">
                <div class="row text-center mb-4">
                  <div class="col">
                    <div class="text-muted small text-uppercase mb-1">EMR Records</div>
                    <div class="fs-4 fw-bold">${t.emr_count.toLocaleString()}</div>
                  </div>
                  <div class="col">
                    <div class="text-muted small text-uppercase mb-1">RCM Claims</div>
                    <div class="fs-4 fw-bold">${t.rcm_count.toLocaleString()}</div>
                  </div>
                </div>
                <div class="progress mb-3" style="height: 10px;">
                  <div class="progress-bar ${d.split(" ")[0]}" style="width: ${t.match_rate}%"></div>
                </div>
                <div class="d-flex justify-content-between text-muted small">
                  <span>Match Rate: ${t.match_rate}%</span>
                  <span>Last Calculated: <span id="calc-date-${t.year}-${t.quarter}">${o}</span></span>
                </div>
              </div>
              <div class="card-footer bg-light p-3 d-flex justify-content-between gap-2">
                <button class="btn btn-outline-secondary btn-sm" onclick="DataManager.downloadExceptions(${t.year}, ${t.quarter})">
                  <i class="bi bi-download"></i> Exceptions
                </button>
                <button class="btn btn-primary btn-sm flex-grow-1" id="btn-calc-${t.year}-${t.quarter}" onclick="DataManager.calculateKpis(${t.year}, ${t.quarter})">
                  <i class="bi bi-cpu"></i> Calculate KPIs
                </button>
              </div>
            </div>
          </div>
        `}),i+="</div>",e.innerHTML=i}catch(a){e.innerHTML=`<div class="alert alert-danger">Error loading vault summary: ${a.message}</div>`}},async downloadExceptions(e,a){window.location.href=`/api/audit/exceptions?facility_id=${this.state.facilityId}&year=${e}&quarter=${a}`},async calculateKpis(e,a){const s=document.getElementById(`btn-calc-${e}-${a}`),i=s.innerHTML;s.innerHTML='<span class="spinner-border spinner-border-sm me-2"></span> Calculating...',s.disabled=!0;try{const r=await(await fetch("/api/kpi/calculate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:this.state.facilityId,year:e,quarter:a})})).json();if(!r.success)throw new Error(r.error||"Failed to start calculation");this.pollCalculation(r.job_id,e,a,s,i)}catch(t){window.App.toast("Calculation error: "+t.message,"danger"),s.innerHTML=i,s.disabled=!1}},pollCalculation(e,a,s,i,t){const r=setInterval(async()=>{var d;try{const n=await(await fetch(`/api/kpi/job-status?job_id=${e}`)).json();(n.status==="done"||n.status==="error")&&(clearInterval(r),i.innerHTML=t,i.disabled=!1,n.status==="done"?(window.App.toast(`Calculations complete for Q${s} ${a}!`,"success"),document.getElementById(`calc-date-${a}-${s}`).innerText=new Date().toLocaleDateString()):window.App.toast(`Calculation failed: ${((d=n.result)==null?void 0:d.error)||"Unknown error"}`,"danger"))}catch{clearInterval(r),i.innerHTML=t,i.disabled=!1}},1500)},renderUpload(e){e.innerHTML=`
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold"><i class="bi bi-file-medical text-primary me-2"></i> EMR Data Upload</h5></div>
            <div class="card-body">
              <form id="emrUploadForm">
                <input type="file" id="emrFile" class="form-control mb-3" accept=".xlsx,.xls,.csv" required>
                <button type="submit" class="btn btn-primary w-100">Upload EMR File</button>
              </form>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold"><i class="bi bi-receipt text-success me-2"></i> RCM / Shafafiya Upload</h5></div>
            <div class="card-body">
              <form id="shafafiyaUploadForm">
                <input type="file" id="shafafiyaFile" class="form-control mb-3" accept=".xlsx,.xls,.csv" required>
                <button type="submit" class="btn btn-success w-100">Upload RCM File</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div id="importProgressContainer" class="card shadow-sm border-0 border-top border-primary border-4 mt-4 d-none">
        <div class="card-body text-center py-4">
          <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
          <h5 id="importStatusText">Uploading file...</h5>
        </div>
      </div>

      <div id="batchHistoryContainer" class="mt-4"></div>
    `,document.getElementById("emrUploadForm").addEventListener("submit",a=>{a.preventDefault(),this.uploadFile("emr",document.getElementById("emrFile").files[0])}),document.getElementById("shafafiyaUploadForm").addEventListener("submit",a=>{a.preventDefault(),this.uploadFile("shafafiya",document.getElementById("shafafiyaFile").files[0])}),this.loadHistory()},async loadHistory(){try{const a=await(await fetch(`/api/import/history/${this.state.facilityId}`)).json();let s='<div class="card shadow-sm border-0"><div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold"><i class="bi bi-clock-history me-2 text-primary"></i> Upload History</h5></div><div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr><th>ID</th><th>File Name</th><th>Type</th><th>Quarters Detected</th><th>Inserted</th><th>Updated</th><th>Skipped</th><th class="text-end">Actions</th></tr></thead><tbody>';a.length===0?s+='<tr><td colspan="8" class="text-center text-muted py-4">No import history found.</td></tr>':a.forEach(t=>{let r=t.status==="done"?'<span class="badge bg-success">Success</span>':t.status==="error"?'<span class="badge bg-danger">Failed</span>':'<span class="badge bg-warning"><i class="bi bi-arrow-repeat spin"></i></span>',d="[]";try{d=JSON.parse(t.quarters_json||"[]").join(", ")}catch{}let l=t.status==="error"&&t.errors_json?`<a href="data:application/json;base64,${btoa(unescape(encodeURIComponent(t.errors_json)))}" download="error_batch_${t.id}.json" class="btn btn-sm btn-outline-danger me-2"><i class="bi bi-download"></i></a>`:"";s+=`<tr>
            <td>#${t.id}</td>
            <td class="fw-medium">${t.file_name} ${r}</td>
            <td><span class="badge bg-light text-dark border">${t.file_type.toUpperCase()}</span></td>
            <td>${d}</td>
            <td>${t.row_count||0}</td>
            <td>${t.replaced_count||0}</td>
            <td>${t.skipped_count||0}</td>
            <td class="text-end">
              ${l}
              <button class="btn btn-sm btn-outline-danger" onclick="DataManager.deleteBatch(${t.id})"><i class="bi bi-trash"></i></button>
            </td>
          </tr>`}),s+="</tbody></table></div></div>";const i=document.getElementById("batchHistoryContainer");i&&(i.innerHTML=s)}catch(e){console.error(e)}},async deleteBatch(e){if(confirm("Delete this batch? The system will recalculate KPIs based on remaining data."))try{(await(await fetch(`/api/import/${e}`,{method:"DELETE"})).json()).success&&(window.App.toast("Batch deleted","success"),this.loadHistory())}catch{window.App.toast("Delete error","danger")}},async uploadFile(e,a){if(!a)return;const s=new FormData;s.append("file",a),s.append("facility_id",this.state.facilityId),s.append("file_type",e),document.getElementById("importProgressContainer").classList.remove("d-none"),document.getElementById("importStatusText").innerText=`Uploading ${a.name}...`;try{const t=await(await fetch("/api/import",{method:"POST",body:s})).json();t.success?(this.state.activeBatchId=t.batch_id,document.getElementById("importStatusText").innerText="Processing rows in background...",this.pollStatus()):(window.App.toast(t.error||"Upload failed","danger"),document.getElementById("importProgressContainer").classList.add("d-none"))}catch{window.App.toast("Upload error","danger"),document.getElementById("importProgressContainer").classList.add("d-none")}},pollStatus(){this.state.pollInterval&&clearInterval(this.state.pollInterval),this.state.pollInterval=setInterval(async()=>{try{const a=await(await fetch(`/api/import/status/${this.state.activeBatchId}`)).json();if(a.status==="done"||a.status==="error")if(clearInterval(this.state.pollInterval),document.getElementById("importProgressContainer").classList.add("d-none"),this.loadHistory(),a.status==="done"){let s=[];try{s=JSON.parse(a.quarters_json||"[]")}catch{}window.App.toast(`Upload complete. ${a.row_count||0} inserted. ${a.replaced_count||0} updated. ${a.skipped_count||0} skipped. Quarters detected: ${s.join(", ")}`,"success");const i=document.getElementById("emrFile");i&&(i.value="");const t=document.getElementById("shafafiyaFile");t&&(t.value=""),setTimeout(()=>{this.switchTab("vault")},2e3)}else{let s="Unknown error";try{s=JSON.parse(a.errors_json).message||a.errors_json}catch{s=a.errors_json}window.App.toast(`Upload Failed: ${s}`,"danger")}}catch(e){console.error("Polling error",e)}},2e3)}};window.DataManager=c;export{c as DataManager};
