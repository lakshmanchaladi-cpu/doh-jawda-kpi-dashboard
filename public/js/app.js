const App = {
  state: {
    activePage: 'dashboard',
    facilityId: null,
    year: new Date().getFullYear(),
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    facilities: []
  },

  async init() {
    await this.loadFacilities();
    this.populateYearDropdown();
    document.getElementById('globalYearSelect').value = this.state.year;
    document.getElementById('globalQuarterSelect').value = this.state.quarter;
    
    // Check if facility selected
    if (this.state.facilities.length > 0) {
      this.state.facilityId = this.state.facilities[0].id;
      document.getElementById('globalFacilitySelect').value = this.state.facilityId;
    }

    this.navigate(this.state.activePage);
  },

  async loadFacilities() {
    try {
      const res = await fetch('/api/facilities');
      this.state.facilities = await res.json();
      
      const select = document.getElementById('globalFacilitySelect');
      select.innerHTML = '<option value="">Select Facility...</option>';
      this.state.facilities.forEach(f => {
        select.innerHTML += `<option value="${f.id}">${f.name} (${f.mf_no})</option>`;
      });
    } catch (e) {
      this.toast('Error loading facilities', 'danger');
    }
  },

  populateYearDropdown() {
    const select = document.getElementById('globalYearSelect');
    const current = new Date().getFullYear();
    select.innerHTML = '';
    for (let i = current - 2; i <= current + 1; i++) {
      select.innerHTML += `<option value="${i}">${i}</option>`;
    }
  },

  changeFacility(id) {
    window._forceDashboardReload = true;
    window._forceAuditReload = true;
    this.state.facilityId = id ? parseInt(id) : null;
    this.refreshCurrentPage();
  },

  changeYear(y) {
    window._forceDashboardReload = true;
    window._forceAuditReload = true;
    this.state.year = parseInt(y);
    this.refreshCurrentPage();
  },

  changeQuarter(q) {
    window._forceDashboardReload = true;
    window._forceAuditReload = true;
    this.state.quarter = parseInt(q);
    this.refreshCurrentPage();
  },

  navigate(page) {
    this.state.activePage = page;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.nav-btn[data-page="${page}"]`);
    if (btn) btn.classList.add('active');

    const content = document.getElementById('app-content');
    
    if (!this.state.facilityId && ['dashboard', 'import', 'audit', 'manual', 'reports'].includes(page)) {
      content.innerHTML = `
        <div class="text-center mt-5 pt-5 text-muted">
          <i class="bi bi-building fs-1 mb-3"></i>
          <h4>Please select a facility</h4>
          <p>You must select a medical center from the top dropdown to view this page.</p>
        </div>
      `;
      return;
    }

    switch(page) {
      case 'dashboard': Dashboard.render(content); break;
      case 'import': Import.render(content); break;
      case 'audit': Audit.render(content); break;
      case 'manual': ManualEntry.render(content); break;
      case 'reports': Reports.render(content); break;
      case 'facilities': Facilities.render(content); break;
      case 'comparison': Comparison.render(content); break;
      case 'settings-guidelines': Settings.render(content, 'guidelines'); break;
      case 'settings-engine': Settings.render(content, 'engine'); break;
      case 'settings-clinical': Settings.render(content, 'clinical'); break;
      case 'settings-dicts': Settings.render(content, 'dicts'); break;
      case 'proofs': Proofs.render(content); break;
    }
  },

  refreshCurrentPage() {
    this.navigate(this.state.activePage);
  },

  toast(message, type = 'success') {
    const container = document.querySelector('.toast-container');
    const toastHtml = `
      <div class="toast align-items-center text-bg-${type} border-0 show" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" onclick="this.closest('.toast').remove()"></button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = container.lastElementChild;
    setTimeout(() => toastEl.remove(), 4000);
  }
};
