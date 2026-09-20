import{A as e}from"./main-DHmSEy9Y.js";const d={render(i){let t=`
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
    `;e.state.facilities.length===0?t+='<tr><td colspan="6" class="text-center py-4 text-muted">No facilities found. Add your first medical center.</td></tr>':e.state.facilities.forEach(a=>{t+=`
          <tr>
            <td class="fw-bold">${a.name}</td>
            <td><span class="badge bg-secondary">${a.mf_no}</span></td>
            <td>${a.facility_type}</td>
            <td>${a.coordinator||"-"}</td>
            <td>
              ${a.active?'<span class="badge bg-success bg-opacity-10 text-success border border-success">Active</span>':'<span class="badge bg-danger bg-opacity-10 text-danger border border-danger">Inactive</span>'}
            </td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-${a.active?"secondary":"success"} me-1" title="Toggle Active Status" onclick="Facilities.toggleStatus(${a.id})"><i class="bi bi-power"></i></button>
              <button class="btn btn-sm btn-outline-primary me-1" onclick="Facilities.edit(${a.id})"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" onclick="Facilities.delete(${a.id})"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `}),t+=`
            </tbody>
          </table>
        </div>
      </div>
    `,i.innerHTML=t},toggleAddForm(){const i=document.getElementById("addFacilityCard");i.classList.contains("d-none")?(i.classList.remove("d-none"),document.getElementById("facilityForm").reset()):i.classList.add("d-none")},edit(i){const t=e.state.facilities.find(l=>l.id===i);if(!t)return;document.getElementById("facId").value=t.id,document.getElementById("facName").value=t.name,document.getElementById("facMfNo").value=t.mf_no,document.getElementById("facType").value=t.facility_type==="Primary Care Center"?"Primary Care":t.facility_type,document.getElementById("facCoord").value=t.coordinator||"",document.getElementById("addFacilityCard").classList.remove("d-none"),window.scrollTo(0,0)},async save(){const i=document.getElementById("facId").value,t={name:document.getElementById("facName").value,mf_no:document.getElementById("facMfNo").value,facility_type:document.getElementById("facType").value,coordinator:document.getElementById("facCoord").value};if(!t.name||!t.mf_no)return e.toast("Name and MF number required","danger");try{let a="/api/facilities",l="POST";i&&(a=`/api/facilities/${i}`,l="PUT");const s=await(await fetch(a,{method:l,headers:{"Content-Type":"application/json"},body:JSON.stringify(t)})).json();s.success?(e.toast(i?"Facility updated successfully":"Facility added successfully"),await e.loadFacilities(),e.refreshCurrentPage()):e.toast(s.error||"Failed to save facility","danger")}catch{e.toast("Error saving facility","danger")}},async toggleStatus(i){try{const a=await(await fetch(`/api/facilities/${i}/toggle`,{method:"POST"})).json();a.success?(e.toast("Facility status updated","success"),await e.loadFacilities(),this.render(document.getElementById("facilities-page"))):e.toast(a.error||"Failed to toggle status","danger")}catch{e.toast("Network error","danger")}},async delete(i){if(confirm("Are you sure you want to delete this facility? All related data will be inaccessible."))try{await fetch(`/api/facilities/${i}`,{method:"DELETE"}),e.toast("Facility deleted"),e.state.facilityId===i&&(e.state.facilityId=null),await e.loadFacilities(),e.refreshCurrentPage()}catch{e.toast("Error deleting facility","danger")}}};window.Facilities=d;export{d as Facilities};
