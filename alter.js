
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');
db.serialize(() => {
  const cols = [
    'bp_systolic REAL', 'bp_diastolic REAL', 'bp_date TEXT',
    'appointment_wait_days INTEGER', 'patient_dob TEXT', 'month INTEGER',
    'visit_type TEXT', 'icd10_secondary TEXT'
  ];
  cols.forEach(col => {
    db.run('ALTER TABLE locked_audit_records ADD COLUMN ' + col, err => {
      if (err && !err.message.includes('duplicate column')) console.error(err);
    });
  });
});

