import{A as a}from"./main-q3P2gCcD.js";const n={async render(s){s.innerHTML='<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';try{const e=await(await fetch(`/api/reports/quarterly?facility_id=${a.state.facilityId}&year=${a.state.year}&quarter=${a.state.quarter}`)).json();if(!e.data||e.data.length===0){s.innerHTML=`<div class="alert alert-warning">No data to report for Q${a.state.quarter} ${a.state.year}. Please calculate KPIs first.</div>`;return}let i=`
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0">JAWDA Quarterly Report</h2>
            <p class="text-muted mb-0">${e.facility.name} (MF: ${e.facility.mf_no}) — Q${a.state.quarter} ${a.state.year}</p>
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
                <h2 class="display-5 fw-bold mb-0">${e.score}%</h2>
              </div>
            </div>
          </div>
          <div class="col-md-9">
            <div class="card h-100">
              <div class="card-body d-flex justify-content-around align-items-center text-center">
                <div>
                  <div class="h2 text-success mb-0">${e.summary.met}</div>
                  <div class="text-muted small text-uppercase">Met Target</div>
                </div>
                <div>
                  <div class="h2 text-warning mb-0">${e.summary.near}</div>
                  <div class="text-muted small text-uppercase">Near Target</div>
                </div>
                <div>
                  <div class="h2 text-danger mb-0">${e.summary.not_met}</div>
                  <div class="text-muted small text-uppercase">Not Met</div>
                </div>
                <div>
                  <div class="h2 text-secondary mb-0">${e.summary.total}</div>
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
      `;e.data.forEach(t=>{let d="bg-secondary";t.Status==="met"&&(d="bg-success"),t.Status==="near"&&(d="bg-warning text-dark"),t.Status==="not-met"&&(d="bg-danger");const r=t.Status==="met"?'<i class="bi bi-check-circle-fill text-success fs-5"></i>':t.Status==="not-met"?'<i class="bi bi-x-circle-fill text-danger fs-5"></i>':t.Status==="near"?'<i class="bi bi-exclamation-circle-fill text-warning fs-5"></i>':'<i class="bi bi-dash-circle text-secondary fs-5"></i>';let c=t.Target!==null?t.Target+(t.Unit||""):"-";i+=`
          <tr>
            <td class="fw-bold">${t.Code}</td>
            <td>${t.Name}</td>
            <td class="small text-muted">${t.Domain}</td>
            <td class="fw-semibold">${c}</td>
            <td>${t.Numerator!==null?t.Numerator:"-"}</td>
            <td>${t.Denominator!==null?t.Denominator:"-"}</td>
            <td class="fw-bold fs-6">${t.Value!==null?t.Value+(t.Unit||""):"-"}</td>
            <td class="text-center">${r}</td>
          </tr>
        `}),i+=`
              </tbody>
            </table>
          </div>
        </div>
      `,s.innerHTML=i}catch(l){s.innerHTML=`<div class="alert alert-danger">Error: ${l.message}</div>`}}};window.Reports=n;export{n as Reports};
