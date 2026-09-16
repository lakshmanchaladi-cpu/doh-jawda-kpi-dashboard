const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

(async () => {
  const all = (query, params = []) => new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
  });

  const facilityId = 2; const year = 2026; const quarter = 2;
  const qStart = '2026-04-01';
  const qEnd = '2026-06-30';

  // 1. Initial pool: Age >= 18, THIQA, PHQ2 Positive
  const q1 = `
    SELECT * FROM locked_audit_records 
    WHERE facility_id=? AND year=? AND quarter=?
      AND ABS(patient_age) >= 18
      AND is_thiqa = 1
      AND phq2_result = 1
  `;
  const pool = await all(q1, [facilityId, year, quarter]);
  console.log(`Base Pool (Age >= 18, THIQA, PHQ2 Positive in Q2): ${pool.length} encounters.`);

  if(pool.length === 0) {
    // Check if there are ANY phq2 positive patients in the DB just to be sure
    const anyPhq2 = await all('SELECT COUNT(*) as c FROM locked_audit_records WHERE phq2_result=1');
    console.log(`Total PHQ2 Positive in entire DB: ${anyPhq2[0].c}`);
    return;
  }
})();
