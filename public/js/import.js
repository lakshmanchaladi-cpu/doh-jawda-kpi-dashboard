import { App } from './app.js';

export const Import = {
  activeBatchId: null,
  pollInterval: null,

  render(container) {
    const facility = App.state.facilities.find(f => f.id === App.state.facilityId);
    
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">${facility.name} <span class="badge bg-secondary fs-6 ms-2">${facility.mf_no}</span></h2>
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
    `;

    document.getElementById('emrUploadForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.uploadFile('emr', document.getElementById('emrFile').files[0]);
    });

    document.getElementById('shafafiyaUploadForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.uploadFile('shafafiya', document.getElementById('shafafiyaFile').files[0]);
    });

    this.loadHistory();
  },

  async loadHistory() {
    try {
      const res = await fetch(`/api/import/history/${App.state.facilityId}`);
      const batches = await res.json();
      
      let html = `
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
      `;

      if (batches.length === 0) {
        html += `<tr><td colspan="7" class="text-center text-muted py-4">No import history found.</td></tr>`;
      } else {
        batches.forEach(b => {
          let statusBadge = '';
          if (b.status === 'done') statusBadge = '<span class="badge bg-success">Success</span>';
          else if (b.status === 'error') statusBadge = '<span class="badge bg-danger">Failed</span>';
          else statusBadge = `<span class="badge bg-warning text-dark"><i class="bi bi-arrow-repeat spin"></i> Processing</span>`;

          let errorBtn = '';
          if (b.status === 'error' && b.errors_json) {
            const b64 = btoa(unescape(encodeURIComponent(b.errors_json)));
            errorBtn = `<a href="data:application/json;base64,${b64}" download="error_batch_${b.id}.json" class="btn btn-sm btn-outline-danger me-2" title="Download Error Log"><i class="bi bi-download"></i></a>`;
          }

          html += `
            <tr>
              <td>#${b.id}</td>
              <td class="fw-medium">${b.file_name}</td>
              <td><span class="badge bg-light text-dark border">${b.file_type.toUpperCase()}</span></td>
              <td>Q${b.quarter} ${b.year}</td>
              <td>${statusBadge}</td>
              <td>${b.row_count || 0}</td>
              <td class="text-end">
                ${errorBtn}
                <button class="btn btn-sm btn-outline-danger" onclick="Import.deleteBatch(${b.id})" title="Delete Batch & Remove Data"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          `;
        });
      }

      html += `</tbody></table></div></div></div>`;
      document.getElementById('batchHistoryContainer').innerHTML = html;
    } catch (err) {
      console.error(err);
    }
  },

  async deleteBatch(batchId) {
    if (!confirm('Are you sure you want to completely remove this upload batch and all its associated rows? The system will recalculate KPIs based on remaining data.')) return;
    try {
      const res = await fetch(`/api/import/${batchId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        App.toast('Batch deleted successfully.', 'success');
        this.loadHistory();
      } else {
        App.toast(data.error || 'Failed to delete', 'danger');
      }
    } catch(err) {
      App.toast('Delete error', 'danger');
    }
  },

  async uploadFile(type, file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('facility_id', App.state.facilityId);
    formData.append('file_type', type);

    document.getElementById('importProgressContainer').classList.remove('d-none');
    document.getElementById('importStatusText').innerText = `Uploading ${file.name}...`;

    try {
      const res = await fetch('/api/import', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.success) {
        this.activeBatchId = data.batch_id;
        document.getElementById('importStatusText').innerText = 'Processing rows in background... (this may take up to a minute for large files)';
        this.pollStatus();
      } else {
        App.toast(data.error || 'Upload failed', 'danger');
        document.getElementById('importProgressContainer').classList.add('d-none');
      }
    } catch (e) {
      App.toast('Upload error', 'danger');
      document.getElementById('importProgressContainer').classList.add('d-none');
    }
  },

  pollStatus() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    
    this.pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/import/status/${this.activeBatchId}`);
        const batch = await res.json();
        
        if (batch.status === 'done') {
          clearInterval(this.pollInterval);
          document.getElementById('importProgressContainer').classList.add('d-none');
          App.toast(`Import complete! ${batch.row_count} rows imported successfully.`, 'success');
          // Clear inputs
          document.getElementById('emrFile').value = '';
          document.getElementById('shafafiyaFile').value = '';
          this.loadHistory();

          // Show Proceed to Calculation banner
          const oldBanner = document.getElementById('proceedBanner');
          if (oldBanner) oldBanner.remove();

          const bannerHtml = `
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
          `;
          document.getElementById('app-content').insertAdjacentHTML('beforeend', bannerHtml);

        } else if (batch.status === 'error') {
          clearInterval(this.pollInterval);
          document.getElementById('importProgressContainer').classList.add('d-none');
          this.loadHistory();
          
          let errMsg = 'Unknown error occurred.';
          try {
            const errObj = JSON.parse(batch.errors_json);
            errMsg = errObj.message || batch.errors_json;
          } catch(e) {
            errMsg = batch.errors_json;
          }
          
          // Show professional error banner
          const oldBanner = document.getElementById('proceedBanner');
          if (oldBanner) oldBanner.remove();

          const bannerHtml = `
            <div id="proceedBanner" class="card shadow mt-4 border-danger">
              <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                  <i class="bi bi-exclamation-triangle-fill text-danger fs-3 me-3"></i>
                  <h5 class="mb-0 fw-bold text-danger">Upload Terminated: Format Validation Error</h5>
                </div>
                <p class="mb-0 text-dark">${errMsg}</p>
              </div>
            </div>
          `;
          document.getElementById('app-content').insertAdjacentHTML('beforeend', bannerHtml);
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 2000);
  }
};

window.Import = Import;
