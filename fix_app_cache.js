const fs = require('fs');

let appCode = fs.readFileSync('public/js/app.js', 'utf8');

appCode = appCode.replace('changeFacility(id) {', `changeFacility(id) {
    window._forceDashboardReload = true;
    window._forceAuditReload = true;`);

appCode = appCode.replace('changeYear(y) {', `changeYear(y) {
    window._forceDashboardReload = true;
    window._forceAuditReload = true;`);

appCode = appCode.replace('changeQuarter(q) {', `changeQuarter(q) {
    window._forceDashboardReload = true;
    window._forceAuditReload = true;`);

fs.writeFileSync('public/js/app.js', appCode);
console.log('App modified');

// Fix Audit Caching safely
let auditCode = fs.readFileSync('public/js/audit.js', 'utf8');

// The end of Audit.render(container) looks like:
// container.innerHTML = html;
// } catch (e) {
auditCode = auditCode.replace('container.innerHTML = html;\n    } catch (e) {', 
  'this._cacheHtml[cKey] = html; container.innerHTML = html;\n    } catch (e) {');

fs.writeFileSync('public/js/audit.js', auditCode);
console.log('Audit modified');

