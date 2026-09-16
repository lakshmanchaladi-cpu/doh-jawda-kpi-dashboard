const fs = require('fs');

// 1. DASHBOARD CACHING
let dashCode = fs.readFileSync('public/js/dashboard.js', 'utf8');
const dashRegex = /async render\(container\) \{[\s\S]*?const resResults = await Promise\.all\(\[/;

// Actually it's easier to inject caching logic at the start of render
dashCode = dashCode.replace('async render(container) {', `
  _cache: {},
  _cacheKey() { return \`\${App.state.facilityId}-\${App.state.year}-\${App.state.quarter}\`; },
  
  async render(container) {
    const cKey = this._cacheKey();
    if (this._cache[cKey] && !window._forceDashboardReload) {
      container.innerHTML = this._cache[cKey];
      return;
    }
`);

dashCode = dashCode.replace('container.innerHTML = html;\n      return;', 'this._cache[cKey] = html; container.innerHTML = html; return;');
dashCode = dashCode.replace('container.innerHTML = html;\n    } catch', 'this._cache[cKey] = html; container.innerHTML = html;\n    } catch');

// When recalculate happens, force reload
dashCode = dashCode.replace("App.toast('Recalculating KPIs... Please wait.', 'info');", "App.toast('Recalculating KPIs... Please wait.', 'info'); window._forceDashboardReload = true;");
fs.writeFileSync('public/js/dashboard.js', dashCode);

// 2. AUDIT CACHING
let auditCode = fs.readFileSync('public/js/audit.js', 'utf8');
auditCode = auditCode.replace('async render(container) {', `
  _cacheHtml: {},
  _cacheKey() { return \`\${App.state.facilityId}-\${App.state.year}-\${App.state.quarter}\`; },
  
  async render(container) {
    const cKey = this._cacheKey();
    if (this._cacheHtml[cKey] && !window._forceAuditReload) {
      container.innerHTML = this._cacheHtml[cKey];
      return;
    }
`);

// The audit render function ends with container.innerHTML = html;
// Wait, Audit renders dynamically in parts. Let's just find where it sets the HTML for the final time?
// No, it builds HTML and then does document.getElementById('auditGrid').innerHTML = ...
// Caching the entire Audit container might break the event listeners (like toggle lock button onclick).
// Because inline onclick="Audit.toggleLock()" works, but `this.state` will be empty.
