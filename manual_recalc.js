const { calculateAllKPIs } = require('./engine/kpi-calculator.js');
(async () => {
  console.log('Recalculating all KPIs...');
  await calculateAllKPIs(2, 2026, 2);
  console.log('Done!');
})();
