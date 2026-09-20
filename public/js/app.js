// Main App Module - ES Module
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;


const App = {
  state: {
    activePage: 'dashboard',
    facilityId: null,
    year: new Date().getFullYear(),
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    version: null,
    facilities: []
  },

  async init() {
    await this.loadFacilities();
    this.populateYearDropdown();
    document.getElementById('globalYearSelect').value = this.state.year;
    document.getElementById('globalQuarterSelect').value = this.state.quarter;
    await this.loadVersions();
    
    // Check if facility selected
    if (this.state.facilities.length > 0) {
      this.state.facilityId = this.state.facilities[0].id;
      document.getElementById('globalFacilitySelect').value = this.state.facilityId;
    }

    // Set up event delegation for navigation and controls
    this.setupEventListeners();

    this.navigate(this.state.activePage);
  },

  setupEventListeners() {
      // Accessibility (Keyboard Navigation)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const focused = document.activeElement;
          if (focused && (focused.hasAttribute('data-page') || focused.getAttribute('tabindex') === '0')) {
            e.preventDefault();
            focused.click();
          }
        }
      });

      // Mobile sidebar toggle
      const mobileToggle = document.getElementById('mobileSidebarToggle');
      const sidebar = document.querySelector('.sidebar');
      if (mobileToggle && sidebar) {
          mobileToggle.addEventListener('click', () => {
              sidebar.classList.toggle('show-mobile');
          });
      }

    // Dark mode toggle
    const dmBtn = document.getElementById('darkModeToggle');
    if (dmBtn) {
      dmBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-bs-theme') === 'dark';
        html.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
        dmBtn.innerHTML = isDark ? '<i class="bi bi-moon-stars"></i>' : '<i class="bi bi-sun"></i>';
        localStorage.setItem('jawda-theme', isDark ? 'light' : 'dark');
      });
      // Initialize theme from local storage
      const savedTheme = localStorage.getItem('jawda-theme');
      if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        dmBtn.innerHTML = '<i class="bi bi-sun"></i>';
      }
    }

    // Sidebar navigation & brand link
      document.addEventListener('click', (e) => {
        const navLink = e.target.closest('[data-page]');
        if (navLink) {
          e.preventDefault();
          this.navigate(navLink.dataset.page);
          if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('show-mobile');
        }
      });

    // Facility selector
    document.getElementById('globalFacilitySelect').addEventListener('change', (e) => {
      this.changeFacility(e.target.value);
    });

    // Year selector
    document.getElementById('globalYearSelect').addEventListener('change', (e) => {
      this.changeYear(e.target.value);
    });

    // Quarter selector
    document.getElementById('globalQuarterSelect').addEventListener('change', (e) => {
      this.changeQuarter(e.target.value);
    });

    // Version selector
    document.getElementById('globalVersionSelect').addEventListener('change', (e) => {
      this.changeVersion(e.target.value);
    });

    // Navbar brand link (data-page="dashboard")
    document.querySelector('.navbar-brand[data-page]').addEventListener('click', (e) => {
      e.preventDefault();
      this.navigate('dashboard');
    });
  },

  async loadFacilities() {
    try {
      const res = await fetch('/api/facilities');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.state.facilities = await res.json();
      
      const select = document.getElementById('globalFacilitySelect');
      select.innerHTML = '<option value="">Select Facility...</option>';
      this.state.facilities.forEach(f => {
        select.innerHTML += `<option value="${f.id}">${f.name} (${f.mf_no})</option>`;
      });
    } catch (e) {
      this.toast('Error loading facilities', 'danger');
      console.error('Failed to load facilities:', e);
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
    this.loadVersions();
    this.refreshCurrentPage();
  },

  changeYear(y) {
    window._forceDashboardReload = true;
    window._forceAuditReload = true;
    this.state.year = parseInt(y);
    this.loadVersions();
    this.refreshCurrentPage();
  },

  changeQuarter(q) {
    window._forceDashboardReload = true;
    window._forceAuditReload = true;
    this.state.quarter = parseInt(q);
    this.loadVersions();
    this.refreshCurrentPage();
  },

  changeVersion(v) {
    this.state.version = v ? String(v) : null;
    this.refreshCurrentPage();
  },

  // Populate the KPI registry version dropdown; shows which version auto-applies
  async loadVersions() {
    const select = document.getElementById('globalVersionSelect');
    if (!select) return;
    const qs = `?facility_id=${this.state.facilityId || ''}&year=${this.state.year}&quarter=${this.state.quarter}`;
    try {
      const res = await fetch(`/api/kpi/versions${qs}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const activeLabel = data.active ? ` (Active: ${data.active.name})` : '';
      const opts = [`<option value="">Auto${activeLabel}</option>`];
      (data.versions || []).forEach(v => {
        let types = '';
        try { types = JSON.parse(v.facility_types || '[]').join(', '); } catch (e) {}
        opts.push(`<option value="${v.version}">${v.name}${types ? ` — ${types}` : ''}</option>`);
      });
      const current = this.state.version || '';
      select.innerHTML = opts.join('');
      select.value = current;
    } catch (e) {
      console.error('Failed to load KPI versions:', e);
    }
  },

    navigate(page) {
    this.state.activePage = page;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    let activeBtnSelector = page.startsWith('settings') ? '.nav-btn[data-page="settings"]' : '.nav-btn[data-page="' + page + '"]';
    const btn = document.querySelector(activeBtnSelector);
    if (btn) btn.classList.add('active');

    const content = document.getElementById('app-content');
    
    if (!this.state.facilityId && ['dashboard', 'data-manager', 'import', 'audit', 'manual', 'reports', 'report-center', 'proofs'].includes(page)) {
      content.innerHTML = `
        <div class="text-center mt-5 pt-5 text-muted">
          <i class="bi bi-building fs-1 mb-3"></i>
          <h4>No Facility Selected</h4>
          <p>Please select a facility from the top menu to view data.</p>
        </div>
      `;
      return;
    }

    // Lazy load mapping
      const routeMap = {
        'dashboard': () => import('./dashboard.js').then(m => m.Dashboard.render(content)),
        'data-manager': () => import('./data-manager.js').then(m => m.DataManager.render(content)),
        'import': () => import('./import.js').then(m => m.ImportView.render(content)),
        'audit': () => import('./audit.js').then(m => m.AuditData.render(content)),
        'proofs': () => import('./proofs.js').then(m => m.Proofs.render(content)),
        'manual': () => import('./manual.js').then(m => m.ManualEntry.render(content)),
        'reports': () => import('./reports.js').then(m => m.Reports.render(content)),
        'report-center': () => import('./report-center.js').then(m => m.ReportCenter.render(content)),
        'facilities': () => import('./facilities.js').then(m => m.Facilities.render(content)),
        'comparison': () => import('./comparison.js').then(m => m.Comparison.render(content)),
        'settings': () => import('./settings.js').then(m => m.Settings.render(content, 'guidelines')),
        'settings-guidelines': () => import('./settings.js').then(m => m.Settings.render(content, 'guidelines')),
        'settings-engine': () => import('./settings.js').then(m => m.Settings.render(content, 'engine')),
        'settings-clinical': () => import('./settings.js').then(m => m.Settings.render(content, 'clinical')),
        'settings-dicts': () => import('./settings.js').then(m => m.Settings.render(content, 'dicts')),
        'settings-database': () => import('./settings.js').then(m => m.Settings.render(content, 'database')),
        'proofs': () => import('./proofs.js').then(m => m.Proofs.render(content))
      };
      
      const load = routeMap[page];
      if (load) {
        content.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';
        load().catch(err => {
          console.error(err);
          content.innerHTML = '<div class="alert alert-danger">Error loading module: ' + err.message + '</div>';
        });
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

// Make App globally available for inline onclick handlers
window.App = App;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

export { App };

