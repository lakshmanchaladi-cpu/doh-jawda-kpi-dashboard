const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { initDb } = require('../database/db');
const { calculateAllKPIs } = require('../engine/kpi-calculator');

const TEST_DB = path.join(__dirname, '../database/test_integration.db');
if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
process.env.DB_PATH = TEST_DB;

async function runIntegration() {
  console.log('\n--- Running Integration Pipeline ---');
  const db = await initDb();
  
  // 1. Mock Import
  console.log('1. Simulating Data Import...');
  await db.run("INSERT INTO facilities (name, mf_no, type) VALUES ('Test Clinic', 'MF1234', 'Primary Care')");
  await db.run("INSERT INTO import_batches (facility_id, file_name, file_type, year, quarter, status) VALUES (1, 'emr.csv', 'emr', 2026, 2, 'done')");
  
  await db.run(`INSERT INTO emr_data (facility_id, mrn, patient_age, encounter_date, year, quarter, icd10_all, cpt_all, hba1c_value, physician_type) 
                VALUES (1, 'P1', 50, '2026-05-10', 2026, 2, 'E11.9', '99213', 10.5, 'GP')`);
  await db.run(`INSERT INTO emr_data (facility_id, mrn, patient_age, encounter_date, year, quarter, icd10_all, cpt_all, physician_type) 
                VALUES (1, 'P1', 50, '2026-02-10', 2026, 1, 'E11.9', '99213', 'GP')`);
                
  // 2. Lock Quarter
  console.log('2. Simulating Quarter Lock...');
  await db.run("INSERT INTO quarter_locks (facility_id, year, quarter, is_locked) VALUES (1, 2026, 2, 1)");
  await db.run(`INSERT INTO locked_audit_records (facility_id, year, quarter, mrn, encounter_date, patient_age, icd10_all, cpt_all, hba1c_value, physician_category)
                SELECT e.facility_id, e.year, e.quarter, e.mrn, e.encounter_date, e.patient_age, e.icd10_all, e.cpt_all, e.hba1c_value, 'General Practice'
                FROM emr_data e`);

  // 3. Calculate
  console.log('3. Running KPI Engine...');
  const results = await calculateAllKPIs(1, 2026, 2, null);
  
  assert.ok(results.length > 0, 'KPIs should be calculated');
  const pc009 = results.find(r => r.code === 'PC009');
  assert.ok(pc009, 'PC009 should exist');
  assert.strictEqual(pc009.denominator, 1, `Denominator should be 1, got ${pc009.denominator}`);
  assert.strictEqual(pc009.numerator, 1, `Numerator should be 1, got ${pc009.numerator}`);
  assert.strictEqual(pc009.value, 100, 'Value should be 100%');
  
  // 4. Export Check
  console.log('4. Simulating JDC Export...');
  await db.run("CREATE TABLE IF NOT EXISTS jdc_submissions (id INTEGER PRIMARY KEY, facility_id INTEGER, year INTEGER, quarter INTEGER, status TEXT)");
  await db.run("INSERT INTO jdc_submissions (facility_id, year, quarter, status) VALUES (1, 2026, 2, 'signed')");
  
  console.log('Integration Test Passed Successfully!\n');
  await db.close();
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
}

runIntegration().catch(err => {
  console.error('Integration Failed:', err);
  process.exit(1);
});
