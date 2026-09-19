/**
 * KPI Definitions Sync Script
 * Upserts all 18 DOH JAWDA V9/V1 KPI definitions into the kpi_definitions table.
 * 
 * Run: node seed_kpi_definitions.js
 */
const { initDb } = require('./database/db');
const { KPI_DEFINITIONS } = require('./engine/kpi-definitions');

async function run() {
  const db = await initDb();

  let updated = 0;
  for (const d of KPI_DEFINITIONS) {
    const result = await db.run(`
      INSERT INTO kpi_definitions (
        code, name, short_name, type, domain, indicator_type, description,
        numerator_desc, denominator_desc, formula, unit, target, target_dir,
        target_note, frequency, data_source, facility_type, age_min, age_max
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        name=excluded.name, short_name=excluded.short_name, type=excluded.type,
        domain=excluded.domain, indicator_type=excluded.indicator_type,
        description=excluded.description, numerator_desc=excluded.numerator_desc,
        denominator_desc=excluded.denominator_desc, formula=excluded.formula,
        unit=excluded.unit, target=excluded.target, target_dir=excluded.target_dir,
        target_note=excluded.target_note, frequency=excluded.frequency,
        data_source=excluded.data_source, facility_type=excluded.facility_type,
        age_min=excluded.age_min, age_max=excluded.age_max
    `, [
      d.code, d.name, d.short_name || d.name, d.type || '', d.domain,
      d.indicator_type || '', d.description || '', d.numerator_desc || '',
      d.denominator_desc || '', d.formula || '', d.unit || '%',
      d.target ?? null, d.target_dir || 'gte', d.target_note || null,
      d.frequency || 'quarterly', d.data_source || 'EMR',
      d.facility_type || 'Both', d.age_min ?? null, d.age_max ?? null
    ]);
    updated += result.changes || 0;
  }

  const count = await db.get('SELECT COUNT(*) as c FROM kpi_definitions');
  console.log(`KPI definitions: ${count.c} total (${updated} updated)`);

  const rows = await db.all('SELECT code, short_name, target, target_dir, facility_type FROM kpi_definitions ORDER BY code');
  rows.forEach(r => console.log(`  ${r.code} | ${r.short_name} | target=${r.target ?? '-'} ${r.target_dir ?? ''} | ${r.facility_type}`));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });