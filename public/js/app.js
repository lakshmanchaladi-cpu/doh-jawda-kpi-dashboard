// Main App Module - ES Module
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import * as bootstrap from 'bootstrap';
window.bootstrap = bootstrap;

import { Dashboard } from './dashboard.js';
import { Import } from './import.js';
import { Audit } from './audit.js';
import { ManualEntry } from './manual.js';
import { Reports } from './reports.js';
import { Jdc } from './jdc.js';
import { Facilities } from './facilities.js';
import { Comparison } from './comparison.js';
import { Settings } from './settings.js';
import { Proofs } from './proofs.js';

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
    // Sidebar navigation & brand link
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('[data-page]');
      if (navLink) {
        e.preventDefault();
        this.navigate(navLink.dataset.page);
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
    const btn = document.querySelector(`.nav-btn[data-page="${page}"]`);
    if (btn) btn.classList.add('active');

    const content = document.getElementById('app-content');
    
    if (!this.state.facilityId && ['dashboard', 'import', 'audit', 'manual', 'reports', 'jdc'].includes(page)) {
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
      case 'jdc': Jdc.render(content); break;
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

// Make App globally available for inline onclick handlers
window.App = App;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

export { App };
