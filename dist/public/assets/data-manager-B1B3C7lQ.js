const m={state:{activeTab:"vault",facilityId:null,pollInterval:null,activeBatchId:null},async render(a){this.state.facilityId=window.App.state.facilityId,a.innerHTML=`
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
    `,this.renderActiveTab()},switchTab(a,t){this.state.activeTab=a,document.querySelectorAll("#dataManagerTabs .nav-link").forEach(s=>s.classList.remove("active")),t?t.classList.add("active"):document.querySelector(`#dataManagerTabs a[onclick*="${a}"]`).classList.add("active"),this.renderActiveTab()},renderActiveTab(){const a=document.getElementById("dm-content-area");this.state.activeTab==="vault"?this.renderVault(a):this.renderUpload(a)},async renderVault(a){a.innerHTML='<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-3 text-muted">Loading Data Vault...</p></div>';try{const t=await fetch(`/api/audit/vault-summary?facility_id=${this.state.facilityId}`);if(!t.ok)throw new Error("Failed to load vault");const s=await t.json();if(!s||s.length===0){a.innerHTML=`
          <div class="card shadow-sm border-0 bg-light py-5 text-center">
            <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
            <h5>No Data Found</h5>
            <p class="text-muted">You haven't uploaded any data for this facility yet.</p>
            <button class="btn btn-primary mt-3" onclick="DataManager.switchTab('upload')">Go to Upload Data</button>
          </div>
        `;return}const r={};s.forEach(d=>{r[d.year]||(r[d.year]=[]),r[d.year].push(d)});let e="";Object.keys(r).sort((d,i)=>i-d).forEach(d=>{e+=`<h4 class="mt-4 mb-3 fw-bold border-bottom pb-2 text-dark"><i class="bi bi-calendar4 text-primary me-2"></i>Year ${d}</h4>`,e+='<div class="row g-3 mb-4">',r[d].sort((i,n)=>n.quarter-i.quarter).forEach(i=>{const n=parseFloat(i.match_rate);let l="bg-danger",o="Critical";n>=95?(l="bg-success",o="Excellent"):n>=80&&(l="bg-warning text-dark",o="Needs Review");const c=`Q${i.quarter} ${i.year}`,p=i.last_calculated_at?new Date(i.last_calculated_at).toLocaleString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"Never calculated";e+=`
            <div class="col-12 col-md-6 col-xl-3">
              <div class="card shadow-sm border-0 h-100">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold"><i class="bi bi-calendar3 me-2 text-primary"></i> ${c}</h6>
                  <span class="badge ${l}">${o} (${i.match_rate}%)</span>
                </div>
                <div class="card-body px-3 py-4">
                  <div class="d-flex justify-content-between text-center mb-3">
                    <div>
                      <div class="text-muted text-uppercase mb-1" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;">EMR Records</div>
                      <div class="fs-5 fw-bold">${i.emr_count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div class="text-muted text-uppercase mb-1" style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.5px;">RCM Claims</div>
                      <div class="fs-5 fw-bold">${i.rcm_count.toLocaleString()}</div>
                    </div>
                  </div>
                  <div class="progress mb-2" style="height: 6px;">
                    <div class="progress-bar ${l.split(" ")[0]}" style="width: ${i.match_rate}%"></div>
                  </div>
                  <div class="d-flex justify-content-between text-muted" style="font-size: 0.75rem;">
                    <span>Rate: ${i.match_rate}%</span>
                    <span>Last Calc: <span id="calc-date-${i.year}-${i.quarter}">${p}</span></span>
                  </div>
                </div>
                <div class="card-footer bg-light p-2 d-flex justify-content-between gap-1">
                  <button class="btn btn-outline-secondary btn-sm flex-fill" onclick="DataManager.downloadExceptions(${i.year}, ${i.quarter})" title="Download Exceptions">
                    <i class="bi bi-download"></i> Exceptions
                  </button>
                  <button class="btn btn-primary btn-sm flex-fill fw-semibold" id="btn-calc-${i.year}-${i.quarter}" onclick="DataManager.calculateKpis(${i.year}, ${i.quarter})">
                    <i class="bi bi-cpu"></i> Calculate
                  </button>
                </div>
              </div>
            </div>
          `}),e+="</div>"}),a.innerHTML=e}catch(t){a.innerHTML=`<div class="alert alert-danger">Error loading vault summary: ${t.message}</div>`}},async downloadExceptions(a,t){window.location.href=`/api/audit/exceptions?facility_id=${this.state.facilityId}&year=${a}&quarter=${t}`},async calculateKpis(a,t){const s=document.getElementById(`btn-calc-${a}-${t}`),r=s.innerHTML;s.innerHTML='<span class="spinner-border spinner-border-sm me-2"></span> Calculating...',s.disabled=!0;try{const d=await(await fetch("/api/kpi/calculate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({facility_id:this.state.facilityId,year:a,quarter:t})})).json();if(!d.success)throw new Error(d.error||"Failed to start calculation");this.pollCalculation(d.job_id,a,t,s,r)}catch(e){window.App.toast("Calculation error: "+e.message,"danger"),s.innerHTML=r,s.disabled=!1}},pollCalculation(a,t,s,r,e){const d=setInterval(async()=>{var i;try{const l=await(await fetch(`/api/kpi/job-status?job_id=${a}`)).json();(l.status==="done"||l.status==="error")&&(clearInterval(d),r.innerHTML=e,r.disabled=!1,l.status==="done"?(window.App.toast(`Calculations complete for Q${s} ${t}!`,"success"),document.getElementById(`calc-date-${t}-${s}`).innerText=new Date().toLocaleDateString()):window.App.toast(`Calculation failed: ${((i=l.result)==null?void 0:i.error)||"Unknown error"}`,"danger"))}catch{clearInterval(d),r.innerHTML=e,r.disabled=!1}},1500)},renderUpload(a){a.innerHTML=`
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
    `,document.getElementById("emrUploadForm").addEventListener("submit",t=>{t.preventDefault(),this.uploadFile("emr",document.getElementById("emrFile").files[0])}),document.getElementById("shafafiyaUploadForm").addEventListener("submit",t=>{t.preventDefault(),this.uploadFile("shafafiya",document.getElementById("shafafiyaFile").files[0])}),this.loadHistory()},async loadHistory(){try{const t=await(await fetch(`/api/import/history/${this.state.facilityId}`)).json();let s='<div class="card shadow-sm border-0"><div class="card-header bg-white py-3"><h5 class="mb-0 fw-bold"><i class="bi bi-clock-history me-2 text-primary"></i> Upload History</h5></div><div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr><th>ID</th><th>File Name</th><th>Type</th><th>Quarters Detected</th><th>Inserted</th><th>Updated</th><th>Skipped</th><th class="text-end">Actions</th></tr></thead><tbody>';t.length===0?s+='<tr><td colspan="8" class="text-center text-muted py-4">No import history found.</td></tr>':t.forEach(e=>{let d=e.status==="done"?'<span class="badge bg-success">Success</span>':e.status==="error"?'<span class="badge bg-danger">Failed</span>':'<span class="badge bg-warning"><i class="bi bi-arrow-repeat spin"></i></span>',i="[]";try{i=JSON.parse(e.quarters_json||"[]").join(", ")}catch{}let n=e.status==="error"&&e.errors_json?`<a href="data:application/json;base64,${btoa(unescape(encodeURIComponent(e.errors_json)))}" download="error_batch_${e.id}.json" class="btn btn-sm btn-outline-danger me-2"><i class="bi bi-download"></i></a>`:"";s+=`<tr>
            <td>#${e.id}</td>
            <td class="fw-medium">${e.file_name} ${d}</td>
            <td><span class="badge bg-light text-dark border">${e.file_type.toUpperCase()}</span></td>
            <td>${i}</td>
            <td>${e.row_count||0}</td>
            <td>${e.replaced_count||0}</td>
            <td>${e.skipped_count||0}</td>
            <td class="text-end">
              ${n}
              <button class="btn btn-sm btn-outline-danger" onclick="DataManager.deleteBatch(${e.id})"><i class="bi bi-trash"></i></button>
            </td>
          </tr>`}),s+="</tbody></table></div></div>";const r=document.getElementById("batchHistoryContainer");r&&(r.innerHTML=s)}catch(a){console.error(a)}},async deleteBatch(a){if(confirm("Delete this batch? The system will recalculate KPIs based on remaining data."))try{(await(await fetch(`/api/import/${a}`,{method:"DELETE"})).json()).success&&(window.App.toast("Batch deleted","success"),this.loadHistory())}catch{window.App.toast("Delete error","danger")}},async uploadFile(a,t){if(!t)return;const s=new FormData;s.append("file",t),s.append("facility_id",this.state.facilityId),s.append("file_type",a),document.getElementById("importProgressContainer").classList.remove("d-none"),document.getElementById("importStatusText").innerText=`Uploading ${t.name}...`;try{const e=await(await fetch("/api/import",{method:"POST",body:s})).json();e.success?(this.state.activeBatchId=e.batch_id,document.getElementById("importStatusText").innerText="Processing rows in background...",this.pollStatus()):(window.App.toast(e.error||"Upload failed","danger"),document.getElementById("importProgressContainer").classList.add("d-none"))}catch{window.App.toast("Upload error","danger"),document.getElementById("importProgressContainer").classList.add("d-none")}},pollStatus(){this.state.pollInterval&&clearInterval(this.state.pollInterval),this.state.pollInterval=setInterval(async()=>{try{const t=await(await fetch(`/api/import/status/${this.state.activeBatchId}`)).json();if(t.status==="done"||t.status==="error")if(clearInterval(this.state.pollInterval),document.getElementById("importProgressContainer").classList.add("d-none"),this.loadHistory(),t.status==="done"){let s=[];try{s=JSON.parse(t.quarters_json||"[]")}catch{}window.App.toast(`Upload complete. ${t.row_count||0} inserted. ${t.replaced_count||0} updated. ${t.skipped_count||0} skipped. Quarters detected: ${s.join(", ")}`,"success");const r=document.getElementById("emrFile");r&&(r.value="");const e=document.getElementById("shafafiyaFile");e&&(e.value=""),setTimeout(()=>{this.switchTab("vault")},2e3)}else{let s="Unknown error";try{s=JSON.parse(t.errors_json).message||t.errors_json}catch{s=t.errors_json}window.App.toast(`Upload Failed: ${s}`,"danger")}}catch(a){console.error("Polling error",a)}},2e3)}};window.DataManager=m;export{m as DataManager};
