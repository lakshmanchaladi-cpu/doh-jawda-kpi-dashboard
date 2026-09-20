const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
(async () => {
  const db = await open({ filename: 'database/kpi_data.db', driver: sqlite3.Database });
  
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
  
  const dbInfo = {};
  for (const t of tables) {
    const tableName = t.name;
    const countRow = await db.get(`SELECT COUNT(*) as cnt FROM ${tableName}`);
    const pragma = await db.all(`PRAGMA table_info(${tableName})`);
    
    dbInfo[tableName] = {
      rowCount: countRow.cnt,
      columns: pragma.map(c => c.name + ' (' + c.type + ')')
    };
  }
  
  console.log(JSON.stringify(dbInfo, null, 2));
})();
