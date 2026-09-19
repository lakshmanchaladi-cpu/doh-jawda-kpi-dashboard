const fs = require('fs');

// 1. Rewrite KPICard.js exactly matching the logic
const kpiCardCode = `export class KPICard {
  static render(kpi, kpiHistory = []) {
    const isMet = kpi.status === 'met';
    const isNear = kpi.status === 'near';
    const statusClass = kpi.status ? \`status-\${kpi.status}\` : 'status-no-data';
    const badgeClass = kpi.status ? \`badge-\${kpi.status}\` : 'badge-no-data';
    const statusText = kpi.status ? kpi.status.replace('-', ' ').toUpperCase() : 'NO DATA';
    
    let valStr = kpi.value !== null ? kpi.value + (kpi.unit || '') : 'N/A';
    let targetStr = kpi.target !== null 
      ? (kpi.target_dir === 'gte' ? '= ' : '= ') + kpi.target + (kpi.unit || '')
      : 'Monitor';

    let icon = 'bi-activity';
    if (kpi.kpi_code.includes('009') || kpi.kpi_code.includes('010') || kpi.kpi_code.includes('011') || kpi.kpi_code.includes('012') || kpi.kpi_code.includes('013')) icon = 'bi-droplet'; 
    if (kpi.kpi_code.includes('014') || kpi.kpi_code.includes('016') || kpi.kpi_code.includes('023')) icon = 'bi-heart-pulse'; 
    if (kpi.kpi_code.includes('004') || kpi.kpi_code.includes('005') || kpi.kpi_code.includes('026')) icon = 'bi-brain'; 
    
    let sparklineHtml = '';
    if (kpiHistory.length > 0) {
       const maxVal = Math.max(...kpiHistory.map(t => t.value || 0), kpi.target || 0, 100);
       sparklineHtml = '<div class="d-flex align-items-end mt-3" style="height: 30px; gap: 4px;">';
       kpiHistory.forEach(t => {
          const pct = ((t.value || 0) / maxVal) * 100;
          const color = t.value !== null && t.target !== null ? 
            (kpi.target_dir==='gte' ? (t.value>=t.target?'#28a745':'#dc3545') : (t.value<=t.target?'#28a745':'#dc3545')) : '#6c757d';
          sparklineHtml += \`<div title="Q\${t.quarter} \${t.year}: \${t.value}%" style="width: 25px; height: \${Math.max(pct, 5)}%; background-color: \${color}; border-radius: 2px 2px 0 0; opacity: 0.8;"></div>\`;
       });
       sparklineHtml += '</div><div class="text-muted" style="font-size: 0.65rem;">Last 4 Quarters</div>';
    }

    return \`
      <div class="col-md-6 col-lg-4">
        <div class="card kpi-card \${statusClass}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-light text-dark border pointer" onclick="Dashboard.viewPatients('\${kpi.kpi_code}')">\${kpi.kpi_code} <i class="bi bi-people"></i></span>
              <span class="badge \${badgeClass}">\${statusText}</span>
            </div>
            <h6 class="card-title text-truncate" title="\${kpi.short_name}">\${kpi.short_name}</h6>
            
            <div class="mt-3 d-flex align-items-center">
              <div class="kpi-icon bg-light text-primary me-3">
                <i class="bi \${icon}"></i>
              </div>
              <div>
                <div class="fs-3 fw-bold">\${valStr}</div>
                <div class="text-muted small">Target: \${targetStr}</div>
              </div>
              <div class="ms-auto text-end">
                \${sparklineHtml}
              </div>
            </div>
            
            <div class="mt-3 text-muted small d-flex justify-content-between">
              <span>N: \${kpi.numerator !== null ? kpi.numerator : '-'}</span>
              <span>D: \${kpi.denominator !== null ? kpi.denominator : '-'}</span>
            </div>
          </div>
        </div>
      </div>
    \`;
  }
}
`;
fs.writeFileSync('public/js/components/KPICard.js', kpiCardCode);

// 2. Refactor dashboard.js
let dash = fs.readFileSync('public/js/dashboard.js', 'utf8');
dash = "import { KPICard } from './components/KPICard.js';\n" + dash;

const loopRegex = /kpis\.forEach\(kpi => \{[\s\S]*?<\!-- END LOOP -->/m; // Wait, there's no <!-- END LOOP -->
// I will just use string replace from 'const isMet = kpi.status' up to the end of the template literal.

const startStr = "const isMet = kpi.status === 'met';";
const endStr = "          `;\n        });";

const startIdx = dash.indexOf(startStr);
const endIdx = dash.indexOf(endStr) + endStr.length;

if (startIdx !== -1 && endIdx !== -1) {
    const toReplace = dash.substring(startIdx, endIdx);
    const replacement = `const kpiHistory = trendsData.filter(t => t.kpi_code === kpi.kpi_code).slice(0, 4).reverse();
          html += KPICard.render(kpi, kpiHistory);
        });`;
    dash = dash.replace(toReplace, replacement);
    fs.writeFileSync('public/js/dashboard.js', dash);
    console.log('Dashboard refactored cleanly.');
} else {
    console.log('Could not find loop bounds in dashboard.js');
}
