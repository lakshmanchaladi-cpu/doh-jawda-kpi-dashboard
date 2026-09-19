const fs = require('fs');
let code = fs.readFileSync('public/js/dashboard.js', 'utf8');

// Insert import at the top
code = "import { KPICard } from './components/KPICard.js';\n" + code;

// Find the loop:
// kpis.forEach(kpi => { ... html += ... })
// Replace it with: kpis.forEach(kpi => { html += KPICard.render(kpi, sparklines[kpi.kpi_code]); });

const loopRegex = /kpis\.forEach\(kpi => \{[\s\S]*?<hr class="my-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*`;\n          \}\);/m;

if (loopRegex.test(code)) {
    code = code.replace(loopRegex, `kpis.forEach(kpi => {
            const lines = sparklines ? sparklines[kpi.kpi_code] : [];
            html += KPICard.render(kpi, lines);
          });`);
    fs.writeFileSync('public/js/dashboard.js', code);
    console.log('Refactored dashboard.js successfully');
} else {
    console.log('Failed to find loop in dashboard.js');
}
