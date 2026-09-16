const { initDb } = require('./database/db');
const { calculateAllKPIs } = require('./engine/kpi-calculator');

initDb().then(async db => {
  const facilities = await db.all('SELECT id, name FROM facilities LIMIT 3');
  console.log('=== ENGINE BENCHMARK ===');
  console.log('Facilities found:', facilities.length);

  if (!facilities.length) {
    console.log('No facilities in DB - inserting test facility...');
    await db.run("INSERT OR IGNORE INTO facilities (mf_no, name, facility_type) VALUES ('TEST001', 'Test PC Center', 'Primary Care Medical Center')");
    const f = await db.get("SELECT id FROM facilities WHERE mf_no='TEST001'");
    facilities.push({ id: f.id, name: 'Test PC Center' });
  }

  for (const f of facilities) {
    const t0 = Date.now();
    try {
      const r = await calculateAllKPIs(f.id, 2025, 2);
      console.log(`Facility: ${f.name} | KPIs: ${r.length} | Time: ${Date.now() - t0}ms`);
      r.forEach(k => console.log(`  ${k.code}: num=${k.numerator} den=${k.denominator} val=${k.value} status=${k.status}`));
    } catch (e) {
      console.error(`Facility ${f.name} error:`, e.message);
    }
  }

  // DB structure audit
  const indexes = await db.all("SELECT name, tbl_name FROM sqlite_master WHERE type='index' ORDER BY tbl_name");
  console.log('\n=== DB INDEXES ===');
  indexes.forEach(i => console.log(' ', i.tbl_name + '.' + i.name));

  // Row counts
  const tables = ['emr_data', 'shafafiya_data', 'code_mappings', 'kpi_results', 'import_batches'];
  console.log('\n=== TABLE ROW COUNTS ===');
  for (const t of tables) {
    const r = await db.get(`SELECT COUNT(*) as c FROM ${t}`);
    console.log(` ${t}: ${r.c} rows`);
  }

  // Missing indexes check
  const cols = ['encounter_date', 'mrn', 'icd10_primary', 'physician_type'];
  console.log('\n=== MISSING INDEX ANALYSIS ===');
  for (const col of cols) {
    const idx = indexes.find(i => i.tbl_name === 'emr_data' && i.name.includes(col));
    console.log(` emr_data.${col}: ${idx ? '✅ indexed' : '❌ NOT indexed (consider adding)'}`);
  }
}).catch(console.error);
