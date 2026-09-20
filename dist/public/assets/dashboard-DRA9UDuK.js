import{A as e}from"./main-DHmSEy9Y.js";class _{static render(t,l=[]){t.status,t.status;const v=t.status?`status-${t.status}`:"status-no-data",g=t.status?`badge-${t.status}`:"badge-no-data",b=t.status?t.status.replace("-"," ").toUpperCase():"NO DATA";let h=t.value!==null?t.value+(t.unit||""):"N/A",y=t.target!==null?(t.target_dir==="gte","= "+t.target+(t.unit||"")):"Monitor",r="bi-activity";(t.kpi_code.includes("009")||t.kpi_code.includes("010")||t.kpi_code.includes("011")||t.kpi_code.includes("012")||t.kpi_code.includes("013"))&&(r="bi-droplet"),(t.kpi_code.includes("014")||t.kpi_code.includes("016")||t.kpi_code.includes("023"))&&(r="bi-heart-pulse"),(t.kpi_code.includes("004")||t.kpi_code.includes("005")||t.kpi_code.includes("026"))&&(r="bi-brain");let s="";if(l.length>0){const d=Math.max(...l.map(a=>a.value||0),t.target||0,100);s='<div class="d-flex align-items-end mt-3" style="height: 30px; gap: 4px;">',l.forEach(a=>{const o=(a.value||0)/d*100,u=a.value!==null&&a.target!==null?t.target_dir==="gte"?a.value>=a.target?"#28a745":"#dc3545":a.value<=a.target?"#28a745":"#dc3545":"#6c757d";s+=`<div title="Q${a.quarter} ${a.year}: ${a.value}%" style="width: 25px; height: ${Math.max(o,5)}%; background-color: ${u}; border-radius: 2px 2px 0 0; opacity: 0.8;"></div>`}),s+='</div><div class="text-muted" style="font-size: 0.65rem;">Last 4 Quarters</div>'}return`
      <div class="col-md-6 col-lg-4">
        <div class="card kpi-card ${v}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-light text-dark border pointer" tabindex="0" role="button" aria-label="View Patients" onclick="Dashboard.viewPatients('${t.kpi_code}')">${t.kpi_code} <i class="bi bi-people"></i></span>
              <span class="badge ${g}">${b}</span>
            </div>
            <h6 class="card-title text-truncate" title="${t.short_name}">${t.short_name}</h6>
            
            <div class="mt-3 d-flex align-items-center">
              <div class="kpi-icon bg-light text-primary me-3">
                <i class="bi ${r}"></i>
              </div>
              <div>
                <div class="fs-3 fw-bold">${h}</div>
                <div class="text-muted small">Target: ${y}</div>
              </div>
              <div class="ms-auto text-end">
                ${s}
              </div>
            </div>
            
            <div class="mt-3 text-muted small d-flex justify-content-between">
              <span>N: ${t.numerator!==null?t.numerator:"-"}</span>
              <span>D: ${t.denominator!==null?t.denominator:"-"}</span>
            </div>
          </div>
        </div>
      </div>
    `}}const M={_cache:{},_cacheKey(){return`${e.state.facilityId}-${e.state.year}-${e.state.quarter}`},async render(c){const t=this._cacheKey();if(this._cache[t]&&!window._forceDashboardReload){c.innerHTML=this._cache[t];return}c.innerHTML='<div class="text-center mt-5"><div class="spinner-border text-primary"></div></div>';try{const[l,v,g]=await Promise.all([fetch(`/api/kpi/results?facility_id=${e.state.facilityId}&year=${e.state.year}&quarter=${e.state.quarter}`),fetch(`/api/audit/summary?facility_id=${e.state.facilityId}&year=${e.state.year}&quarter=${e.state.quarter}`),fetch(`/api/kpi/trends?facility_id=${e.state.facilityId}&year=${e.state.year}&quarter=${e.state.quarter}`)]),b=await l.json(),h=await v.json(),y=await g.json(),r=e.state.facilities.find(i=>i.id===e.state.facilityId);let s=null;e.state.year===2026&&(e.state.quarter===1&&(s=new Date("2026-05-29")),e.state.quarter===2&&(s=new Date("2026-08-28")),e.state.quarter===3&&(s=new Date("2026-11-27")),e.state.quarter===4&&(s=new Date("2027-02-27")));let d="";if(s){const p=s-new Date,m=Math.ceil(p/(1e3*60*60*24));m>0?d=`<div class="alert alert-info py-2 mb-3"><i class="bi bi-clock-history"></i> <strong>JAWDA Portal Submission:</strong> ${m} days remaining (Due ${s.toDateString()})</div>`:d=`<div class="alert alert-danger py-2 mb-3"><i class="bi bi-exclamation-octagon"></i> <strong>JAWDA Portal Submission Overdue!</strong> (Was due ${s.toDateString()})</div>`}let a="";const o=h.emrMonths||0,u=h.rcmMonths||0;let $=o===3?'<span class="text-success"><i class="bi bi-check-circle-fill"></i> EMR Data: Complete (3/3 months)</span>':`<span class="text-danger"><i class="bi bi-x-circle-fill"></i> EMR Data: Incomplete (${o}/3 months)</span>`,x=u===3?'<span class="text-success"><i class="bi bi-check-circle-fill"></i> RCM Data: Complete (3/3 months)</span>':`<span class="text-danger"><i class="bi bi-x-circle-fill"></i> RCM Data: Incomplete (${u}/3 months)</span>`;(o<3||u<3)&&(a=`
            <div class="alert alert-warning py-3 mb-4 shadow-sm border-warning">
              <h6 class="alert-heading fw-bold mb-2"><i class="bi bi-shield-exclamation me-2"></i>Data Incomplete for Q${e.state.quarter} ${e.state.year}</h6>
              <div class="d-flex gap-4 mb-2">
                <div>${$}</div>
                <div>${x}</div>
              </div>
              <p class="mb-0 small text-dark">
                <strong>Important:</strong> Disease-specific KPIs (like Diabetes and Hypertension) rely on ICD-10 diagnosis codes. If your RCM/Shafafiya data is missing, the engine cannot identify patients with these conditions, and those KPIs will remain at 0.
              </p>
            </div>
          `);let n=`
        ${d}
        ${a}
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h4 mb-0">${r.name} <span class="badge bg-secondary fs-6 ms-2">${r.mf_no}</span></h2>
            <p class="text-muted mb-0">KPI Dashboard — Q${e.state.quarter} ${e.state.year}</p>
          </div>
          <div>
            <button class="btn btn-outline-success me-2" onclick="Dashboard.exportJawda()">
              <i class="bi bi-file-earmark-excel"></i> Export JDC
            </button>
            
          </div>
        </div>
      `;if(b.length===0){n+=`
          <div class="alert alert-secondary">
            <i class="bi bi-info-circle"></i> No KPI results calculated yet for this quarter. 
            Go to <strong>Data Manager</strong>, upload your data, then click Calculate KPIs to build the dashboard.
          </div>
        `,c.innerHTML=n;return}const f={};b.forEach(i=>{f[i.domain]||(f[i.domain]=[]),f[i.domain].push(i)}),n+='<div class="row g-3">';for(const[i,p]of Object.entries(f))n+=`<div class="col-12 mt-4"><h5 class="border-bottom pb-2">${i}</h5></div>`,p.forEach(m=>{const D=y.filter(w=>w.kpi_code===m.kpi_code).slice(0,4).reverse();n+=_.render(m,D)});n+="</div>",c.innerHTML=n}catch(l){c.innerHTML=`<div class="alert alert-danger">Error loading dashboard: ${l.message}</div>`}}};window.Dashboard=M;export{M as Dashboard};
