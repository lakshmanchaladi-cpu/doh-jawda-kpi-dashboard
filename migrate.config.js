module.exports = {
  database: {
    driver: 'sqlite3',
    filename: './database/kpi_data.db'
  },
  migrationsTable: 'migrations',
  migrationsDirectory: './migrations',
  verbose: true
};