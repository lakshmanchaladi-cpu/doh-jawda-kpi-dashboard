/**
 * Simple SQLite Migration Runner
 * Uses the existing database connection pattern from db.js
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'database', 'kpi_data.db');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATIONS_TABLE = 'migrations';

async function runMigrations() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Create migrations tracking table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      run_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Get list of migration files
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();

  // Get already run migrations
  const runMigrations = await db.all(`SELECT name FROM ${MIGRATIONS_TABLE}`);
  const runNames = new Set(runMigrations.map(r => r.name));

  for (const file of files) {
    if (runNames.has(file)) {
      console.log(`⏭️  Skipping ${file} (already run)`);
      continue;
    }

    console.log(`🔄 Running migration: ${file}`);
    const migration = require(path.join(MIGRATIONS_DIR, file));
    
    // Create a pgm-like object for the migration
    const pgm = {
      createTable: (name, columns, options = {}) => {
        const colDefs = Object.entries(columns).map(([colName, colDef]) => {
          let def = `${colName} ${colDef.type}`;
          if (colDef.primaryKey) def += ' PRIMARY KEY';
          if (colDef.autoIncrement) def += ' AUTOINCREMENT';
          if (colDef.notNull) def += ' NOT NULL';
          if (colDef.unique) def += ' UNIQUE';
          if (colDef.default !== undefined) {
            if (typeof colDef.default === 'string') {
              if (colDef.default.startsWith('datetime(')) {
                def += ` DEFAULT (${colDef.default})`;
              } else if (colDef.default.startsWith("'") && colDef.default.endsWith("'")) {
                // Already quoted string default
                def += ` DEFAULT ${colDef.default}`;
              } else {
                def += ` DEFAULT '${colDef.default}'`;
              }
            } else {
              def += ` DEFAULT ${colDef.default}`;
            }
          }
          if (colDef.references) def += ` REFERENCES ${colDef.references}(${colDef.referencesColumn || 'id'})`;
          if (colDef.onDelete) def += ` ON DELETE ${colDef.onDelete}`;
          return def;
        });

        // Handle constraints
        if (options.constraints?.unique) {
          colDefs.push(`UNIQUE(${options.constraints.unique.join(', ')})`);
        }
        if (options.constraints?.primaryKey) {
          colDefs.push(`PRIMARY KEY (${options.constraints.primaryKey.join(', ')})`);
        }

        const sql = `CREATE TABLE IF NOT EXISTS ${name} (${colDefs.join(', ')})`;
        return db.exec(sql);
      },
      createIndex: (table, columns, options = {}) => {
        const sql = `CREATE INDEX IF NOT EXISTS ${options.name} ON ${table} (${columns.join(', ')})`;
        return db.exec(sql);
      },
      dropTable: (name) => {
        return db.exec(`DROP TABLE IF EXISTS ${name}`);
      },
      sql: (statement) => {
        return db.exec(statement);
      },
      func: (fn) => fn // Pass through for datetime('now') etc.
    };

    try {
      await migration.up(pgm);
      await db.run(`INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (?)`, [file]);
      console.log(`✅ Completed: ${file}`);
    } catch (err) {
      console.error(`❌ Failed: ${file}`);
      console.error(err);
      throw err;
    }
  }

  console.log('🎉 All migrations completed!');
  await db.close();
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});