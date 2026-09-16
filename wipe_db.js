
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
const tables = ['emr_data', 'shafafiya_data', 'import_batches', 'quarter_locks', 'locked_audit_records', 'kpi_results', 'manual_kpi_entries'];
db.serialize(() => {
  tables.forEach(table => {
    db.run('DELETE FROM ' + table, err => {
      if (err) console.error('Error clearing', table, err);
      else console.log('Cleared', table);
    });
    db.run('DELETE FROM sqlite_sequence WHERE name=\'' + table + '\'');
  });
});

