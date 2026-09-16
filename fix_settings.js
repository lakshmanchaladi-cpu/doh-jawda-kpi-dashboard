const fs = require('fs');
let code = fs.readFileSync('public/js/settings.js', 'utf8');

const mapDrRegex = /<div class="tab-pane fade p-4 text-center text-muted" id="map-dr" role="tabpanel">[\s\S]*?<\/div>/;

const newHtml = `<div class="tab-pane fade p-4 text-muted" id="map-dr" role="tabpanel">
                    <h5 class="text-dark fw-bold mb-3"><i class="bi bi-person-badge me-2"></i>DOH Clinician Licenses Upload</h5>
                    <p class="small">Upload the official <code>ClinicianLicenses.xlsx</code> dictionary downloaded from the DOH Shafafiya Portal to sync all physician specialties automatically.</p>
                    <div class="alert alert-info py-2 small">
                      <strong>Current Dictionary Version:</strong> <span id="dictVersionBadge">Loading...</span>
                    </div>
                    <form id="clinicianUploadForm" class="d-flex align-items-center gap-2 mt-3">
                      <input type="file" class="form-control form-control-sm" id="clinicianFile" accept=".xlsx" required style="max-width:300px;">
                      <button type="submit" class="btn btn-primary btn-sm" id="uploadBtn">
                        <i class="bi bi-cloud-arrow-up me-1"></i> Sync Dictionary
                      </button>
                    </form>
                    <div id="uploadStatus" class="mt-2 small"></div>
                  </div>`;

if (mapDrRegex.test(code)) {
    code = code.replace(mapDrRegex, newHtml);
    console.log('Successfully replaced HTML.');
} else {
    console.log('Could not find HTML block to replace.');
}

// Ensure the event listener logic is there (I might have already appended it, but I'll check).
if (!code.includes('clinicianUploadForm')) {
    console.log('Form ID missing even after replace? Check regex.');
}

if (!code.includes('document.getElementById(\'clinicianUploadForm\')')) {
const eventListenerCode = `
    // Upload Clinician Dictionary
    const clinicianForm = document.getElementById('clinicianUploadForm');
    if (clinicianForm) {
      clinicianForm.onsubmit = async (e) => {
        e.preventDefault();
        const file = document.getElementById('clinicianFile').files[0];
        if (!file) return;
        
        const btn = document.getElementById('uploadBtn');
        const status = document.getElementById('uploadStatus');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Uploading...';
        status.innerHTML = '<span class="text-primary">Parsing Excel file (this may take a minute for 30k+ rows)...</span>';
        
        const fd = new FormData();
        fd.append('file', file);
        
        try {
          const res = await fetch('/api/settings/upload-clinicians', { method: 'POST', body: fd });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || 'Upload failed');
          
          status.innerHTML = \`<span class="text-success"><i class="bi bi-check-circle"></i> Success! Synced \${json.count} licenses. Version: \${json.version}</span>\`;
          document.getElementById('dictVersionBadge').innerText = json.version;
          setTimeout(() => { status.innerHTML = ''; }, 5000);
          clinicianForm.reset();
        } catch (err) {
          status.innerHTML = \`<span class="text-danger"><i class="bi bi-exclamation-triangle"></i> \${err.message}</span>\`;
        } finally {
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-cloud-arrow-up me-1"></i> Sync Dictionary';
        }
      };
      
      // Load current version
      fetch('/api/settings').then(r=>r.json()).then(data => {
        const bdg = document.getElementById('dictVersionBadge');
        if (bdg) bdg.innerText = data.clinician_dict_version || 'Not Uploaded';
      }).catch(e => console.error(e));
    }
`;

  code = code.replace(/document\.getElementById\('mappingForm'\)\.onsubmit = async \(e\) => \{/, eventListenerCode + '\n\n    document.getElementById(\'mappingForm\').onsubmit = async (e) => {');
  console.log('Injected event listener logic.');
}

fs.writeFileSync('public/js/settings.js', code);
