const fs = require('fs');
let code = fs.readFileSync('public/js/settings.js', 'utf8');

// 1. Inject the table container HTML
const mapDrRegex = /<div id="uploadStatus" class="mt-2 small"><\/div>[\s\S]*?<\/div>/;
const replacementHtml = `<div id="uploadStatus" class="mt-2 small"></div>
                      <hr>
                      <div class="d-flex justify-content-between align-items-center mb-2">
                         <h6 class="fw-bold mb-0">Dictionary Data Preview</h6>
                         <span class="badge bg-secondary" id="clinicianCountBadge">Total: 0</span>
                      </div>
                      <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                        <table class="table table-sm table-bordered table-hover" style="font-size: 0.8rem;">
                          <thead class="table-light sticky-top">
                            <tr>
                              <th>License #</th>
                              <th>Name</th>
                              <th>Major</th>
                              <th>Profession</th>
                              <th>Category</th>
                              <th>Facility MF</th>
                            </tr>
                          </thead>
                          <tbody id="clinicianTableBody">
                            <tr><td colspan="6" class="text-center text-muted">No data loaded</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>`;

if (code.match(mapDrRegex)) {
  code = code.replace(mapDrRegex, replacementHtml);
} else {
  console.log('Regex 1 failed');
}

// 2. Inject the JS to load the table
const eventListenerRegex = /\/\/ Load current version[\s\S]*?fetch\('\/api\/settings'\)[\s\S]*?\}\)\.catch\(e => console\.error\(e\)\);/;
const fetchLogic = `// Load current version and table data
      const loadClinicianData = () => {
        fetch('/api/settings').then(r=>r.json()).then(data => {
          const bdg = document.getElementById('dictVersionBadge');
          if (bdg) bdg.innerText = data.clinician_dict_version || 'Not Uploaded';
        }).catch(e => console.error(e));

        fetch('/api/settings/clinicians').then(r=>r.json()).then(data => {
          const tbody = document.getElementById('clinicianTableBody');
          const countBadge = document.getElementById('clinicianCountBadge');
          if (countBadge && data.total !== undefined) countBadge.innerText = 'Total Records: ' + data.total.toLocaleString();
          
          if (tbody && data.rows && data.rows.length > 0) {
            tbody.innerHTML = data.rows.map(r => \`
              <tr>
                <td class="fw-bold">\${r.license_number}</td>
                <td>\${r.clinician_name}</td>
                <td><span class="badge bg-info text-dark">\${r.major}</span></td>
                <td>\${r.profession}</td>
                <td>\${r.category}</td>
                <td>\${r.facility_mf_no}</td>
              </tr>
            \`).join('');
            if (data.total > 100) {
              tbody.innerHTML += \`<tr><td colspan="6" class="text-center text-muted fst-italic">... showing first 100 of \${data.total.toLocaleString()} records ...</td></tr>\`;
            }
          } else if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No clinician records found in database.</td></tr>';
          }
        }).catch(e => console.error(e));
      };
      
      loadClinicianData();`;

if (code.match(eventListenerRegex)) {
  code = code.replace(eventListenerRegex, fetchLogic);
} else {
  console.log('Regex 2 failed');
}

// Ensure the table refreshes after successful upload
code = code.replace(/setTimeout\(\(\) => \{ status\.innerHTML = ''; \}, 5000\);/g, 
  "setTimeout(() => { status.innerHTML = ''; }, 5000);\n          loadClinicianData();");

fs.writeFileSync('public/js/settings.js', code);
console.log('Updated settings UI with table');
