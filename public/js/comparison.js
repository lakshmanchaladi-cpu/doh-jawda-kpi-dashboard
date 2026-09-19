import { App } from './app.js';

export const Comparison = {
  async render(container) {
    container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';
    
    try {
      const res = await fetch(`/api/reports/comparison?facility_id=${App.state.facilityId}&year=${App.state.year}`);
      const data = await res.json();
      
      let html = `
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0">Quarterly KPI Comparison</h2>
            <p class="text-muted mb-0">${App.state.facilityName} � Year ${App.state.year}</p>
          </div>
          <button class="btn btn-outline-secondary" onclick="window.print()">
            <i class="bi bi-printer"></i> Print Report
          </button>
        </div>
      `;

      // Matrix Table
      html += `
        <div class="card shadow-sm mb-4">
          <div class="card-body p-0" style="overflow-x: auto;">
            <table class="table table-bordered table-sm align-middle text-center mb-0" style="font-size: 0.85rem;">
              <thead class="table-dark">
                <tr>
                  <th class="text-start sticky-left" style="min-width: 250px;">KPI Definition</th>
                  <th style="width: 15%;">Q1 ${App.state.year}</th>
                  <th style="width: 15%;">Q2 ${App.state.year}</th>
                  <th style="width: 15%;">Q3 ${App.state.year}</th>
                  <th style="width: 15%;">Q4 ${App.state.year}</th>
                </tr>
              </thead>
              <tbody>
      `;

      // Score Row
      html += `
        <tr class="bg-light">
          <td class="text-start fw-bold sticky-left bg-light">Overall KPI Score</td>
      `;
      data.quarters.forEach(q => {
        if (q.score === null) {
          html += `<td><span class="text-muted small">No Data</span></td>`;
        } else {
          let scoreBadge = parseFloat(q.score) >= 80 ? 'bg-success' 
                         : parseFloat(q.score) >= 60 ? 'bg-warning text-dark' 
                         : 'bg-danger';
          html += `<td><span class="badge ${scoreBadge} fs-6">${q.score}%</span></td>`;
        }
      });
      html += `</tr>`;

      // KPI Rows
      data.definitions.forEach(d => {
        html += `
          <tr>
            <td class="text-start sticky-left bg-white">
              <strong>${d.code}</strong><br>
              <span class="text-muted small">${d.short_name}</span>
            </td>
        `;

        data.quarters.forEach(q => {
          const res = q.results[d.code];
          if (!res || res.value === null) {
            html += `<td class="bg-light text-muted">-</td>`;
          } else {
            let cellClass = '';
            let icon = '';
            if (res.status === 'met') { cellClass = 'text-success fw-bold'; icon = '<i class="bi bi-check-circle-fill me-1"></i>'; }
            else if (res.status === 'not-met') { cellClass = 'text-danger fw-bold'; icon = '<i class="bi bi-x-circle-fill me-1"></i>'; }
            else if (res.status === 'near') { cellClass = 'text-warning fw-bold'; }
            
            html += `<td class="${cellClass}" style="background-color: ${res.status==='met'?'#e8f5e9':res.status==='not-met'?'#ffebee':''}">${icon}${res.value}</td>`;
          }
        });
        html += `</tr>`;
      });

      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;

      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = `<div class="alert alert-danger">Error: ${e.message}</div>`;
    }
  }
};

window.Comparison = Comparison;
