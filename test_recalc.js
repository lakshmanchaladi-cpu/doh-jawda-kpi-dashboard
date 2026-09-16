(async () => {
  const facility_id = 2;
  const year = 2026;
  const quarter = 2;
  
  try {
    const calcRes = await fetch('http://localhost:3000/api/kpi/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facility_id, year, quarter })
    });
    console.log('Calculate Result:', await calcRes.json());

    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./database/kpi_data.db');
    db.get("SELECT numerator, denominator, value FROM kpi_results WHERE kpi_code='PC009' AND facility_id=2 AND year=2026 AND quarter=2", (err, row) => console.log('NEW PC009 Result:', row));
  } catch (err) {}
})();
