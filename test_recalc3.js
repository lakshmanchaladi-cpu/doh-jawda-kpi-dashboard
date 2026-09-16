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
  } catch (err) {}
})();
