import { App } from './app.js';

export const Facilities = {
  render(container) {
    let html = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">Manage Facilities</h2>
          <p class="text-muted mb-0">Add or edit medical centers you manage</p>
        </div>
        <button class="btn btn-primary" onclick="Facilities.toggleAddForm()">
          <i class="bi bi-plus-lg"></i> Add New Facility
        </button>
      </div>

      <!-- Add Form (Hidden by default) -->
      <div id="addFacilityCard" class="card shadow-sm border-primary mb-4 d-none">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">Add Medical Center</h5>
        </div>
        <div class="card-body">
          <form id="facilityForm">
            <input type="hidden" id="facId" value="">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted small fw-bold">Facility Name *</label>
                <input type="text" id="facName" class="form-control" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted small fw-bold">MF Number (License) *</label>
                <input type="text" id="facMfNo" class="form-control" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted small fw-bold">Facility Type</label>
                <select id="facType" class="form-select">
                  <option value="Primary Care">Primary Care</option>
                  <option value="Medical Center">Medical Center</option>
                </select>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted small fw-bold">Coordinator Name</label>
                <input type="text" id="facCoord" class="form-control">
              </div>
            </div>
            <div class="text-end mt-3">
              <button type="button" class="btn btn-light me-2" onclick="Facilities.toggleAddForm()">Cancel</button>
              <button type="button" class="btn btn-primary" onclick="Facilities.save()">Save Facility</button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="card shadow-sm">
        <div class="card-body p-0">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>Facility Name</th>
                <th>MF Number</th>
                <th>Type</th>
                <th>Coordinator</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
    `;

    if (App.state.facilities.length === 0) {
      html += '<tr><td colspan="6" class="text-center py-4 text-muted">No facilities found. Add your first medical center.</td></tr>';
    } else {
      App.state.facilities.forEach(f => {
        html += `
          <tr>
            <td class="fw-bold">${f.name}</td>
            <td><span class="badge bg-secondary">${f.mf_no}</span></td>
            <td>${f.facility_type}</td>
            <td>${f.coordinator || '-'}</td>
            <td>
              ${f.active 
                ? '<span class="badge bg-success bg-opacity-10 text-success border border-success">Active</span>' 
                : '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger">Inactive</span>'}
            </td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-${f.active ? 'secondary' : 'success'} me-1" title="Toggle Active Status" onclick="Facilities.toggleStatus(${f.id})"><i class="bi bi-power"></i></button>
              <button class="btn btn-sm btn-outline-primary me-1" onclick="Facilities.edit(${f.id})"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="Facilities.delete(${f.id})"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `;
      });
    }

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  toggleAddForm() {
    const card = document.getElementById('addFacilityCard');
    if (card.classList.contains('d-none')) {
      card.classList.remove('d-none');
      document.getElementById('facilityForm').reset();
    } else {
      card.classList.add('d-none');
    }
  },

  edit(id) {
    const f = App.state.facilities.find(fac => fac.id === id);
    if (!f) return;
    document.getElementById('facId').value = f.id;
    document.getElementById('facName').value = f.name;
    document.getElementById('facMfNo').value = f.mf_no;
    document.getElementById('facType').value = f.facility_type === 'Primary Care Center' ? 'Primary Care' : f.facility_type;
    document.getElementById('facCoord').value = f.coordinator || '';
    
    const card = document.getElementById('addFacilityCard');
    card.classList.remove('d-none');
    window.scrollTo(0, 0);
  },

  async save() {
    const id = document.getElementById('facId').value;
    const data = {
      name: document.getElementById('facName').value,
      mf_no: document.getElementById('facMfNo').value,
      facility_type: document.getElementById('facType').value,
      coordinator: document.getElementById('facCoord').value
    };

    if (!data.name || !data.mf_no) return App.toast('Name and MF number required', 'danger');

    try {
      let url = '/api/facilities';
      let method = 'POST';
      
      if (id) {
        url = `/api/facilities/${id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        App.toast(id ? 'Facility updated successfully' : 'Facility added successfully');
        await App.loadFacilities();
        App.refreshCurrentPage();
      } else {
        App.toast(result.error || 'Failed to save facility', 'danger');
      }
    } catch (e) {
      App.toast('Error saving facility', 'danger');
    }
  },

  
  async toggleStatus(id) {
    try {
      const res = await fetch(`/api/facilities/${id}/toggle`, { method: 'POST' });
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

  async delete(id) {
    if (!confirm('Are you sure you want to delete this facility? All related data will be inaccessible.')) return;
    try {
      await fetch(`/api/facilities/${id}`, { method: 'DELETE' });
      App.toast('Facility deleted');
      
      // Clear global facility ID if the deleted one was selected
      if (App.state.facilityId === id) {
        App.state.facilityId = null;
      }
      
      await App.loadFacilities();
      App.refreshCurrentPage();
    } catch (e) {
      App.toast('Error deleting facility', 'danger');
    }
  }
};

window.Facilities = Facilities;
