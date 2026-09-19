const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'db.js');
let dbCode = fs.readFileSync(dbPath, 'utf8');

// 1. Add job_queue table
const jobQueueSql = \
    CREATE TABLE IF NOT EXISTS job_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'calculate_kpi',
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
\;

if (!dbCode.includes('CREATE TABLE IF NOT EXISTS job_queue')) {
  dbCode = dbCode.replace(
    'CREATE INDEX IF NOT EXISTS idx_locked_audit_quarter',
    jobQueueSql + '\n    CREATE INDEX IF NOT EXISTS idx_locked_audit_quarter'
  );
}

// 2. Add ALTER TABLE import_batches 
const alterImportSql = \
  // V2 Additions for import_batches
  await db.run("ALTER TABLE import_batches ADD COLUMN replaced_count INTEGER DEFAULT 0").catch(()=>{});
  await db.run("ALTER TABLE import_batches ADD COLUMN skipped_count INTEGER DEFAULT 0").catch(()=>{});
  await db.run("ALTER TABLE import_batches ADD COLUMN quarters_json TEXT").catch(()=>{});
\;

if (!dbCode.includes('replaced_count INTEGER DEFAULT 0')) {
  dbCode = dbCode.replace(
    '// Seed KPI Definitions',
    alterImportSql + '\n\n  // Seed KPI Definitions'
  );
}

fs.writeFileSync(dbPath, dbCode, 'utf8');
console.log('database/db.js patched successfully');
