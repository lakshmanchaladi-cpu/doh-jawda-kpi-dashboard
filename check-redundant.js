const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/kpi_data.db');

// Check kpi_data vs kpi_results
db.all("SELECT * FROM kpi_data LIMIT 5", [], (err, rows) => {
  console.log('kpi_data sample:', rows);
  
  db.all("SELECT * FROM kpi_results LIMIT 5", [], (err, rows) => {
    console.log('kpi_results sample:', rows);
    
    db.all("SELECT * FROM facility LIMIT 5", [], (err, rows) => {
      console.log('facility (singular) sample:', rows);
      
      db.all("SELECT * FROM patient_measurements LIMIT 5", [], (err, rows) => {
        console.log('patient_measurements sample:', rows);
        db.close();
      });
    });
  });
});