import{A as i}from"./main-DHmSEy9Y.js";const d={activeBatchId:null,pollInterval:null,render(s){const a=i.state.facilities.find(e=>e.id===i.state.facilityId);s.innerHTML=`
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">${a.name} <span class="badge bg-secondary fs-6 ms-2">${a.mf_no}</span></h2>
          <p class="text-muted mb-0">Data Import &mdash; Auto-Detect Quarter</p>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white fw-bold">
              <i class="bi bi-file-earmark-medical text-primary"></i> Upload EMR Clinical Data
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <p class="text-muted small mb-0">Upload the raw Excel export from the medical center's EMR system.</p>
                <a href="/templates/EMR_Template.csv" download class="btn btn-sm btn-outline-primary"><i class="bi bi-download"></i> Download Template</a>
              </div>
              <form id="emrUploadForm">
                <input class="form-control mb-3" type="file" id="emrFile" accept=".csv" required>
                <button type="submit" class="btn btn-primary w-100"><i class="bi bi-upload"></i> Upload EMR Data</button>
              </form>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-white fw-bold">
              <i class="bi bi-file-earmark-spreadsheet text-success"></i> Upload Shafafiya Claims Data
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <p class="text-muted small mb-0 text-danger fw-bold">Upload the claim-level export from Shafafiya. MUST BE .CSV FORMAT!</p>
                <a href="/templates/Shafafiya_Template.csv" download class="btn btn-sm btn-outline-success"><i class="bi bi-download"></i> Download Template</a>
              </div>
              <form id="shafafiyaUploadForm">
                <input class="form-control mb-3" type="file" id="shafafiyaFile" accept=".csv" required>
                <button type="submit" class="btn btn-success w-100"><i class="bi bi-upload"></i> Upload Shafafiya Data</button>
              </form>
            </div>
          </div>
        </div>
      </div>



      <!-- Batch History -->
      <div id="batchHistoryContainer"></div>

      <!-- Import Progress UI -->
      <div id="importProgressContainer" class="card shadow-sm d-none mt-3 border-info">
        <div class="card-body text-center py-4">
          <h5 class="text-info"><i class="bi bi-gear-wide-connected spin"></i> Processing Import...</h5>
          <p class="text-muted mb-2" id="importStatusText">Parsing Excel file and mapping to database...</p>
          <div class="progress" style="height: 20px;">
            <div id="importProgressBar" class="progress-bar progress-bar-striped progress-bar-animated bg-info" style="width: 100%"></div>
          </div>
        </div>
      </div>
    `,document.getElementById("emrUploadForm").addEventListener("submit",e=>{e.preventDefault(),this.uploadFile("emr",document.getElementById("emrFile").files[0])}),document.getElementById("shafafiyaUploadForm").addEventListener("submit",e=>{e.preventDefault(),this.uploadFile("shafafiya",document.getElementById("shafafiyaFile").files[0])}),this.loadHistory()},async loadHistory(){try{const a=await(await fetch(`/api/import/history/${i.state.facilityId}`)).json();let e=`
        <div class="card shadow-sm border-0 mt-4">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0 fw-bold"><i class="bi bi-clock-history me-2 text-primary"></i> Import Batch History</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Year/Quarter</th>
                    <th>Status</th>
                    <th>Rows</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
      `;a.length===0?e+='<tr><td colspan="7" class="text-center text-muted py-4">No import history found.</td></tr>':a.forEach(t=>{let r="";t.status==="done"?r='<span class="badge bg-success">Success</span>':t.status==="error"?r='<span class="badge bg-danger">Failed</span>':r='<span class="badge bg-warning text-dark"><i class="bi bi-arrow-repeat spin"></i> Processing</span>';let o="";t.status==="error"&&t.errors_json&&(o=`<a href="data:application/json;base64,${btoa(unescape(encodeURIComponent(t.errors_json)))}" download="error_batch_${t.id}.json" class="btn btn-sm btn-outline-danger me-2" title="Download Error Log"><i class="bi bi-download"></i></a>`),e+=`
            <tr>
              <td>#${t.id}</td>
              <td class="fw-medium">${t.file_name}</td>
              <td><span class="badge bg-light text-dark border">${t.file_type.toUpperCase()}</span></td>
              <td>Q${t.quarter} ${t.year}</td>
              <td>${r}</td>
              <td>${t.row_count||0}</td>
              <td class="text-end">
                ${o}
                <button class="btn btn-sm btn-outline-danger" onclick="Import.deleteBatch(${t.id})" title="Delete Batch & Remove Data"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `}),e+="</tbody></table></div></div></div>",document.getElementById("batchHistoryContainer").innerHTML=e}catch(s){console.error(s)}},async deleteBatch(s){if(confirm("Are you sure you want to completely remove this upload batch and all its associated rows? The system will recalculate KPIs based on remaining data."))try{const e=await(await fetch(`/api/import/${s}`,{method:"DELETE"})).json();e.success?(i.toast("Batch deleted successfully.","success"),this.loadHistory()):i.toast(e.error||"Failed to delete","danger")}catch{i.toast("Delete error","danger")}},async uploadFile(s,a){if(!a)return;const e=new FormData;e.append("file",a),e.append("facility_id",i.state.facilityId),e.append("file_type",s),document.getElementById("importProgressContainer").classList.remove("d-none"),document.getElementById("importStatusText").innerText=`Uploading ${a.name}...`;try{const r=await(await fetch("/api/import",{method:"POST",body:e})).json();r.success?(this.activeBatchId=r.batch_id,document.getElementById("importStatusText").innerText="Processing rows in background... (this may take up to a minute for large files)",this.pollStatus()):(i.toast(r.error||"Upload failed","danger"),document.getElementById("importProgressContainer").classList.add("d-none"))}catch{i.toast("Upload error","danger"),document.getElementById("importProgressContainer").classList.add("d-none")}},pollStatus(){this.pollInterval&&clearInterval(this.pollInterval),this.pollInterval=setInterval(async()=>{try{const a=await(await fetch(`/api/import/status/${this.activeBatchId}`)).json();if(a.status==="done"){clearInterval(this.pollInterval),document.getElementById("importProgressContainer").classList.add("d-none"),i.toast(`Import complete! ${a.row_count} rows imported successfully.`,"success"),document.getElementById("emrFile").value="",document.getElementById("shafafiyaFile").value="",this.loadHistory();const e=document.getElementById("proceedBanner");e&&e.remove(),document.getElementById("app-content").insertAdjacentHTML("beforeend",`
            <div id="proceedBanner" class="card shadow mt-4 border-success">
              <div class="card-body text-center p-4">
                <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
                <h4 class="mt-3 fw-bold">Data Uploaded Successfully</h4>
                <p class="text-muted mb-4">The raw records have been mapped to the JAWDA architecture. You must now trigger the engine to run the calculations.</p>
                <button class="btn btn-lg btn-success px-5 rounded-pill shadow-sm" onclick="App.navigate('audit');">
                  <i class="bi bi-cpu me-2"></i> Proceed to Engine Calculation
                </button>
              </div>
            </div>
          `)}else if(a.status==="error"){clearInterval(this.pollInterval),document.getElementById("importProgressContainer").classList.add("d-none"),this.loadHistory();let e="Unknown error occurred.";try{e=JSON.parse(a.errors_json).message||a.errors_json}catch{e=a.errors_json}const t=document.getElementById("proceedBanner");t&&t.remove();const r=`
            <div id="proceedBanner" class="card shadow mt-4 border-danger">
              <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-exclamation-triangle-fill text-danger fs-3 me-3"></i>
                  <h5 class="mb-0 fw-bold text-danger">Upload Terminated: Format Validation Error</h5>
                </div>
                <p class="mb-0 text-dark">${e}</p>
              </div>
            </div>
          `;document.getElementById("app-content").insertAdjacentHTML("beforeend",r)}}catch(s){console.error("Polling error",s)}},2e3)}};window.Import=d;export{d as Import};
