const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

(async () => {
  const all = (query, params = []) => new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
  });

  const mapRows = await all("SELECT group_name, code FROM code_mappings");
  const dict = {};
  for (let r of mapRows) {
    if(!dict[r.group_name]) dict[r.group_name] = [];
    dict[r.group_name].push(r.code.toUpperCase().trim());
  }

  const pregCodes = dict['Pregnancy_Exc'] || [];
  const esrdCodes = dict['HTN_ESRD'] || [];
  const transCodes = dict['HTN_Transplant'] || [];

  const records = await all("SELECT mrn, icd10_all FROM locked_audit_records WHERE facility_id=2 AND year=2026 AND quarter=2");
  
  let preg = 0, esrd = 0, trans = 0;
  for(let r of records) {
    let text = (r.icd10_all || '').toUpperCase();
    if(pregCodes.some(c => text.includes(c))) preg++;
    if(esrdCodes.some(c => text.includes(c))) esrd++;
    if(transCodes.some(c => text.includes(c))) trans++;
  }
  console.log('Total Q2 Encounters with Pregnancy codes:', preg);
  console.log('Total Q2 Encounters with ESRD codes:', esrd);
  console.log('Total Q2 Encounters with Transplant codes:', trans);
})();
