import{A as a}from"./main-DHmSEy9Y.js";const o={async render(r){r.innerHTML='<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';try{const i=await(await fetch(`/api/reports/comparison?facility_id=${a.state.facilityId}&year=${a.state.year}`)).json();let t=`
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0">Quarterly KPI Comparison</h2>
            <p class="text-muted mb-0">${a.state.facilityName} � Year ${a.state.year}</p>
          </div>
          <button class="btn btn-outline-secondary" onclick="window.print()">
            <i class="bi bi-printer"></i> Print Report
          </button>
        </div>
      `;t+=`
        <div class="card shadow-sm mb-4">
          <div class="card-body p-0" style="overflow-x: auto;">
            <table class="table table-bordered table-sm align-middle text-center mb-0" style="font-size: 0.85rem;">
              <thead class="table-dark">
                <tr>
                  <th class="text-start sticky-left" style="min-width: 250px;">KPI Definition</th>
                  <th style="width: 15%;">Q1 ${a.state.year}</th>
                  <th style="width: 15%;">Q2 ${a.state.year}</th>
                  <th style="width: 15%;">Q3 ${a.state.year}</th>
                  <th style="width: 15%;">Q4 ${a.state.year}</th>
                </tr>
              </thead>
              <tbody>
      `,t+=`
        <tr class="bg-light">
          <td class="text-start fw-bold sticky-left bg-light">Overall KPI Score</td>
      `,i.quarters.forEach(e=>{if(e.score===null)t+='<td><span class="text-muted small">No Data</span></td>';else{let c=parseFloat(e.score)>=80?"bg-success":parseFloat(e.score)>=60?"bg-warning text-dark":"bg-danger";t+=`<td><span class="badge ${c} fs-6">${e.score}%</span></td>`}}),t+="</tr>",i.definitions.forEach(e=>{t+=`
          <tr>
            <td class="text-start sticky-left bg-white">
              <strong>${e.code}</strong><br>
              <span class="text-muted small">${e.short_name}</span>
            </td>
        `,i.quarters.forEach(c=>{const s=c.results[e.code];if(!s||s.value===null)t+='<td class="bg-light text-muted">-</td>';else{let l="",d="";s.status==="met"?(l="text-success fw-bold",d='<i class="bi bi-check-circle-fill me-1"></i>'):s.status==="not-met"?(l="text-danger fw-bold",d='<i class="bi bi-x-circle-fill me-1"></i>'):s.status==="near"&&(l="text-warning fw-bold"),t+=`<td class="${l}" style="background-color: ${s.status==="met"?"#e8f5e9":s.status==="not-met"?"#ffebee":""}">${d}${s.value}</td>`}}),t+="</tr>"}),t+=`
              </tbody>
            </table>
          </div>
        </div>
      `,r.innerHTML=t}catch(n){r.innerHTML=`<div class="alert alert-danger">Error: ${n.message}</div>`}}};window.Comparison=o;export{o as Comparison};
