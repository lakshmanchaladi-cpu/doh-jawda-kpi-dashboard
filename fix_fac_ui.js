const fs = require('fs');
let code = fs.readFileSync('public/js/facilities.js', 'utf8');

// Add the toggle button
const targetHtml = `<td class="text-end">
              <button class="btn btn-sm btn-outline-primary me-1" onclick="Facilities.edit(\${f.id})"><i class="bi bi-pencil"></i></button>`;
const newHtml = `<td class="text-end">
              <button class="btn btn-sm btn-outline-\${f.active ? 'secondary' : 'success'} me-1" title="Toggle Active Status" onclick="Facilities.toggleStatus(\${f.id})"><i class="bi bi-power"></i></button>
              <button class="btn btn-sm btn-outline-primary me-1" onclick="Facilities.edit(\${f.id})"><i class="bi bi-pencil"></i></button>`;

code = code.replace(targetHtml, newHtml);

// Add the toggleStatus method
const toggleMethod = `
  async toggleStatus(id) {
    try {
      const res = await fetch(\`/api/facilities/\${id}/toggle\`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        App.toast('Facility status updated', 'success');
        await App.loadFacilities(); // global refresh
        this.render(document.getElementById('facilities-page'));
      } else {
        App.toast(data.error || 'Failed to toggle status', 'danger');
      }
    } catch (e) {
      App.toast('Network error', 'danger');
    }
  },
`;

code = code.replace('async delete(id) {', toggleMethod + '\n  async delete(id) {');

fs.writeFileSync('public/js/facilities.js', code);
console.log('Fixed Facilities UI');
