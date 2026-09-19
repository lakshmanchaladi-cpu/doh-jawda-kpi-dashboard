const fs = require('fs');
let code = fs.readFileSync('public/js/app.js', 'utf8');

// 1. Remove static imports
code = code.replace(/import \{ [^}]+\ } from '\.\/[a-z-]+\.js';\n/g, '');

// 2. Replace switch(page)
const newSwitch = `
      // Lazy load mapping
      const routeMap = {
        'dashboard': () => import('./dashboard.js').then(m => m.Dashboard.render(content)),
        'import': () => import('./import.js').then(m => m.Import.render(content)),
        'audit': () => import('./audit.js').then(m => m.Audit.render(content)),
        'manual': () => import('./manual.js').then(m => m.ManualEntry.render(content)),
        'reports': () => import('./reports.js').then(m => m.Reports.render(content)),
        'jdc': () => import('./jdc.js').then(m => m.Jdc.render(content)),
        'facilities': () => import('./facilities.js').then(m => m.Facilities.render(content)),
        'comparison': () => import('./comparison.js').then(m => m.Comparison.render(content)),
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
`;

code = code.replace(/switch\(page\) \{[\s\S]*?case 'proofs': Proofs\.render\(content\); break;\n\s*\}/, newSwitch.trim());

fs.writeFileSync('public/js/app.js', code);
console.log('Replaced app.js routing');
