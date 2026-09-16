const Reports = {
  async render(container) {
    container.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';
    
    try {
      const res = await fetch(`/api/reports/quarterly?facility_id=${App.state.facilityId}&year=${App.state.year}&quarter=${App.state.quarter}`);
      const data = await res.json();
      
      if (!data.data || data.data.length === 0) {
        container.innerHTML = `<div class="alert alert-warning">No data to report for Q${App.state.quarter} ${App.state.year}. Please calculate KPIs first.</div>`;
        return;
      }

      let html = `
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0">JAWDA Quarterly Report</h2>
            <p class="text-muted mb-0">${data.facility.name} (MF: ${data.facility.mf_no}) — Q${App.state.quarter} ${App.state.year}</p>
          </div>
          <div>
            <button class="btn btn-outline-secondary" onclick="window.print()">
              <i class="bi bi-printer"></i> Print Report
            </button>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white h-100">
              <div class="card-body text-center">
                <h6 class="text-uppercase opacity-75">Overall Compliance</h6>
                <h2 class="display-5 fw-bold mb-0">${data.score}%</h2>
              </div>
            </div>
          </div>
          <div class="col-md-9">
            <div class="card h-100">
              <div class="card-body d-flex justify-content-around align-items-center text-center">
                <div>
                  <div class="h2 text-success mb-0">${data.summary.met}</div>
                  <div class="text-muted small text-uppercase">Met Target</div>
                </div>
                <div>
                  <div class="h2 text-warning mb-0">${data.summary.near}</div>
                  <div class="text-muted small text-uppercase">Near Target</div>
                </div>
                <div>
                  <div class="h2 text-danger mb-0">${data.summary.not_met}</div>
                  <div class="text-muted small text-uppercase">Not Met</div>
                </div>
                <div>
                  <div class="h2 text-secondary mb-0">${data.summary.total}</div>
                  <div class="text-muted small text-uppercase">Total KPIs Tracked</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body p-0">
            <table class="table table-bordered table-striped mb-0 align-middle">
              <thead class="table-dark">
                <tr>
                  <th width="8%">Code</th>
                  <th width="32%">Indicator Name</th>
                  <th width="15%">Domain</th>
                  <th width="10%">Target</th>
                  <th width="10%">Num</th>
                  <th width="10%">Denom</th>
                  <th width="10%">Result</th>
                  <th width="5%">Status</th>
                </tr>
              </thead>
              <tbody>
      `;

      data.data.forEach(r => {
        let badge = 'bg-secondary';
        if (r.Status === 'met') badge = 'bg-success';
        if (r.Status === 'near') badge = 'bg-warning text-dark';
        if (r.Status === 'not-met') badge = 'bg-danger';

        const statusIcon = r.Status === 'met' ? '<i class="bi bi-check-circle-fill text-success fs-5"></i>' 
                         : r.Status === 'not-met' ? '<i class="bi bi-x-circle-fill text-danger fs-5"></i>'
                         : r.Status === 'near' ? '<i class="bi bi-exclamation-circle-fill text-warning fs-5"></i>'
                         : '<i class="bi bi-dash-circle text-secondary fs-5"></i>';

        let targetStr = r.Target !== null 
            ? r.Target + (r.Unit || '')
            : '-';

        html += `
          <tr>
            <td class="fw-bold">${r.Code}</td>
            <td>${r.Name}</td>
            <td class="small text-muted">${r.Domain}</td>
            <td class="fw-semibold">${targetStr}</td>
            <td>${r.Numerator !== null ? r.Numerator : '-'}</td>
            <td>${r.Denominator !== null ? r.Denominator : '-'}</td>
            <td class="fw-bold fs-6">${r.Value !== null ? r.Value + (r.Unit||'') : '-'}</td>
            <td class="text-center">${statusIcon}</td>
          </tr>
        `;
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
