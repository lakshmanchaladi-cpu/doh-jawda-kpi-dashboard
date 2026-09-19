import { KPICard } from './components/KPICard.js';
import { App } from './app.js';

export const Dashboard = {
  
  _cache: {},
  _cacheKey() { return `${App.state.facilityId}-${App.state.year}-${App.state.quarter}`; },
  
  async render(container) {
    const cKey = this._cacheKey();
    if (this._cache[cKey] && !window._forceDashboardReload) {
      container.innerHTML = this._cache[cKey];
      return;
    }

    container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';
    
    try {
      const [resResults, resAudit, resTrends] = await Promise.all([
        fetch(`/api/kpi/results?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`),
        fetch(`/api/audit/summary?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`),
        fetch(`/api/kpi/trends?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`)
      ]);
      
      const results = await resResults.json();
      const audit = await resAudit.json();
      const trendsData = await resTrends.json();
      
      const facility = App.state.facilities.find(f => f.id === App.state.facilityId);
      
      // Calculate submission deadline
      let deadlineDate = null;
      if (App.state.year === 2026) {
        if (App.state.quarter === 1) deadlineDate = new Date('2026-05-29');
        if (App.state.quarter === 2) deadlineDate = new Date('2026-08-28');
        if (App.state.quarter === 3) deadlineDate = new Date('2026-11-27');
        if (App.state.quarter === 4) deadlineDate = new Date('2027-02-27');
      }
      
      let countdownHtml = '';
      if (deadlineDate) {
        const today = new Date();
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          countdownHtml = `<div class="alert alert-info py-2 mb-3"><i class="bi bi-clock-history"></i> <strong>JAWDA Portal Submission:</strong> ${diffDays} days remaining (Due ${deadlineDate.toDateString()})</div>`;
        } else {
          countdownHtml = `<div class="alert alert-danger py-2 mb-3"><i class="bi bi-exclamation-octagon"></i> <strong>JAWDA Portal Submission Overdue!</strong> (Was due ${deadlineDate.toDateString()})</div>`;
        }
      }

      // Check completeness
      let completenessHtml = '';
        const emrMonths = audit.emrMonths || 0;
        const shafMonths = audit.rcmMonths || 0;
        
        let emrText = emrMonths === 3 ? `<span class="text-success"><i class="bi bi-check-circle-fill"></i> EMR Data: Complete (3/3 months)</span>` : `<span class="text-danger"><i class="bi bi-x-circle-fill"></i> EMR Data: Incomplete (${emrMonths}/3 months)</span>`;
        let rcmText = shafMonths === 3 ? `<span class="text-success"><i class="bi bi-check-circle-fill"></i> RCM Data: Complete (3/3 months)</span>` : `<span class="text-danger"><i class="bi bi-x-circle-fill"></i> RCM Data: Incomplete (${shafMonths}/3 months)</span>`;

        if (emrMonths < 3 || shafMonths < 3) {
          completenessHtml = `
            <div class="alert alert-warning py-3 mb-4 shadow-sm border-warning">
              <h6 class="alert-heading fw-bold mb-2"><i class="bi bi-shield-exclamation me-2"></i>Data Incomplete for Q${App.state.quarter} ${App.state.year}</h6>
              <div class="d-flex gap-4 mb-2">
                <div>${emrText}</div>
                <div>${rcmText}</div>
              </div>
              <p class="mb-0 small text-dark">
                <strong>Important:</strong> Disease-specific KPIs (like Diabetes and Hypertension) rely on ICD-10 diagnosis codes. If your RCM/Shafafiya data is missing, the engine cannot identify patients with these conditions, and those KPIs will remain at 0.
              </p>
            </div>
          `;
        }

      let html = `
        ${countdownHtml}
        ${completenessHtml}
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0">${facility.name} <span class="badge bg-secondary fs-6 ms-2">${facility.mf_no}</span></h2>
            <p class="text-muted mb-0">KPI Dashboard — Q${App.state.quarter} ${App.state.year}</p>
          </div>
          <div>
            <button class="btn btn-outline-success me-2" onclick="Dashboard.exportJawda()">
              <i class="bi bi-file-earmark-excel"></i> Export JDC
            </button>
            
          </div>
        </div>
      `;

      if (results.length === 0) {
        html += `
          <div class="alert alert-secondary">
            <i class="bi bi-info-circle"></i> No KPI results calculated yet for this quarter. 
            Go to <strong>Data Manager</strong>, upload your data, then click Calculate KPIs to build the dashboard.
          </div>
        `;
        container.innerHTML = html;
        return;
      }

      // Group by Domain and Filter by facility_type
      const domains = {};
      results.forEach(r => {
        
        if (!domains[r.domain]) domains[r.domain] = [];
        domains[r.domain].push(r);
      });

      html += '<div class="row g-3">';
      
      for (const [domain, kpis] of Object.entries(domains)) {
        html += `<div class="col-12 mt-4"><h5 class="border-bottom pb-2">${domain}</h5></div>`;
        
        kpis.forEach(kpi => {
          const kpiHistory = trendsData.filter(t => t.kpi_code === kpi.kpi_code).slice(0, 4).reverse();
          html += KPICard.render(kpi, kpiHistory);
        });
      }
      
      html += '</div>';
      container.innerHTML = html;

    } catch (e) {
      container.innerHTML = `<div class="alert alert-danger">Error loading dashboard: ${e.message}</div>`;
    }
  },

  };

window.Dashboard = Dashboard;
