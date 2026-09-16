const sqlite3 = require('sqlite3').verbose();
const { CALCULATORS, generateDynamicFilters } = require('./engine/kpi-calculator.js');
(async () => {
  const db = new sqlite3.Database('./database/kpi_data.db');
  
  // Custom promise wrapper to avoid stack overflow
  const dbGet = (sql, params) => new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));
  const dbAll = (sql, params) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
  
  // mock db object expected by calculator
  const mockDb = {
    get: dbGet,
    all: dbAll,
    run: (sql, params) => new Promise((resolve, reject) => db.run(sql, params, (err) => err ? reject(err) : resolve()))
  };
  
  mockDb._dynamicFilters = await generateDynamicFilters(mockDb);
  const r = await CALCULATORS.PC009(mockDb, 2, 2026, 2, mockDb._dynamicFilters);
  console.log("Numerator:", r.numerator, "Denominator:", r.denominator);
})();
