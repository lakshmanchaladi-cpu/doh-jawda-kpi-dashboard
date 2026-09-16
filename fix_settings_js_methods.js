const fs = require('fs');
let code = fs.readFileSync('public/js/settings.js', 'utf8');

// 1. Fix the form HTML
code = code.replace('<form id="clinicianUploadForm" class="d-flex align-items-center gap-2 mt-3">', 
  '<form id="clinicianUploadForm" class="d-flex align-items-center gap-2 mt-3" onsubmit="event.preventDefault(); Settings.uploadClinicians();">');

// 2. Inject the methods into the Settings object
const newMethods = `
  async uploadClinicians() {
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
      const bdg = document.getElementById('dictVersionBadge');
      if (bdg) bdg.innerText = json.version;
      
      setTimeout(() => { status.innerHTML = ''; }, 5000);
      document.getElementById('clinicianUploadForm').reset();
      
      // Refresh the table
      if (Settings.loadClinicianData) Settings.loadClinicianData();
      
    } catch (err) {
      status.innerHTML = \`<span class="text-danger"><i class="bi bi-exclamation-triangle"></i> \${err.message}</span>\`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-cloud-arrow-up me-1"></i> Sync Dictionary';
    }
  },

  async loadClinicianData() {
    try {
      const r1 = await fetch('/api/settings');
      const data1 = await r1.json();
      const bdg = document.getElementById('dictVersionBadge');
      if (bdg) bdg.innerText = data1.clinician_dict_version || 'Not Uploaded';

      const r2 = await fetch('/api/settings/clinicians');
      const data2 = await r2.json();
      
      const tbody = document.getElementById('clinicianTableBody');
      const countBadge = document.getElementById('clinicianCountBadge');
      if (countBadge && data2.total !== undefined) countBadge.innerText = 'Total Records: ' + data2.total.toLocaleString();
      
      if (tbody && data2.rows && data2.rows.length > 0) {
        tbody.innerHTML = data2.rows.map(r => \`
          <tr>
            <td class="fw-bold">\${r.license_number}</td>
            <td>\${r.clinician_name}</td>
            <td><span class="badge bg-info text-dark">\${r.major}</span></td>
            <td>\${r.profession}</td>
            <td>\${r.category}</td>
            <td>\${r.facility_mf_no}</td>
          </tr>
        \`).join('');
        if (data2.total > 100) {
          tbody.innerHTML += \`<tr><td colspan="6" class="text-center text-muted fst-italic">... showing first 100 of \${data2.total.toLocaleString()} records ...</td></tr>\`;
        }
      } else if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No clinician records found in database.</td></tr>';
      }
    } catch (e) {
      console.error(e);
    }
  },
`;

// Insert the methods before "async addMapping()"
code = code.replace("  async addMapping() {", newMethods + "\n  async addMapping() {");

// Also, we need to call loadClinicianData() at the end of render()
// render() ends with container.innerHTML = html; catch (e) ... }
code = code.replace("container.innerHTML = html;", "container.innerHTML = html;\n      setTimeout(() => Settings.loadClinicianData(), 100);");

fs.writeFileSync('public/js/settings.js', code);
console.log('Successfully injected methods');
