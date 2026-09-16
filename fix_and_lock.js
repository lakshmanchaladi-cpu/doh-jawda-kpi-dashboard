(async () => {
  const facility_id = 2;
  const year = 2026;
  const quarter = 2;
  const kpiEngineReq = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ facility_id, year, quarter, lock: true })
  };

  try {
    console.log('Sending Lock request...');
    const res = await fetch('http://localhost:3000/api/kpi/toggle-lock', kpiEngineReq);
    const data = await res.json();
    console.log('Lock Result:', data);

    console.log('Sending Calculate request...');
    const calcRes = await fetch('http://localhost:3000/api/kpi/calculate', kpiEngineReq);
    const calcData = await calcRes.json();
    console.log('Calculate Result:', calcData.success);
  } catch (err) {
    console.error('Error via API:', err);
  }
})();
