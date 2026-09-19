const fs = require('fs');
const files = [
  { path: 'public/js/dashboard.js', name: 'Dashboard' },
  { path: 'public/js/audit.js', name: 'Audit' },
  { path: 'public/js/import.js', name: 'Import' },
  { path: 'public/js/proofs.js', name: 'Proofs' },
  { path: 'public/js/manual.js', name: 'Manual' },
  { path: 'public/js/reports.js', name: 'Reports' },
  { path: 'public/js/facilities.js', name: 'Facilities' },
  { path: 'public/js/settings.js', name: 'Settings' },
  { path: 'public/js/comparison.js', name: 'Comparison' }
];

files.forEach(f => {
  if (fs.existsSync(f.path)) {
    let content = fs.readFileSync(f.path, 'utf8');
    const exportStr = `\nwindow.${f.name} = ${f.name};\n`;
    if (!content.includes(`window.${f.name} =`)) {
      fs.appendFileSync(f.path, exportStr);
      console.log(`Patched ${f.path}`);
    }
  }
});
