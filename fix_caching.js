const fs = require('fs');

// Fix Audit.js
let auditCode = fs.readFileSync('public/js/audit.js', 'utf8');
auditCode = auditCode.replace('const Audit = {', 'const Audit = {\n  _cache: {},\n  _cacheKey() { return `${App.state.facilityId}-${App.state.year}-${App.state.quarter}`; },');

const auditFetchTarget = `      try {
        const r = await fetch(\`/api/audit/monthly?facility_id=\${fid}\`);
        this.state.monthlyData = await r.json();`;
        
const auditFetchReplacement = `      try {
        const cacheKey = this._cacheKey();
        if (this._cache[cacheKey] && !window._forceReloadAudit) {
           this.state = this._cache[cacheKey];
        } else {
          const r = await fetch(\`/api/audit/monthly?facility_id=\${fid}\`);
          this.state.monthlyData = await r.json();`;

// Wait, the state in audit.js is defined at the top:
// const Audit = {
//   state: { monthlyData: [], thiqaRecords: [] },
// So we can just cache the whole fetch process. Let's do it cleanly by checking cache at the top of render.
