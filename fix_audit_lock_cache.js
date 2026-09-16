const fs = require('fs');
let auditCode = fs.readFileSync('public/js/audit.js', 'utf8');

auditCode = auditCode.replace('if (data.success) {', 
  'if (data.success) { window._forceAuditReload = true; window._forceDashboardReload = true;');

fs.writeFileSync('public/js/audit.js', auditCode);
console.log('Audit lock cache wipe added');
