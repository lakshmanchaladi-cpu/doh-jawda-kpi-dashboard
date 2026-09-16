const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

const depCodes = ['F01.51','F32.0','F32.1','F32.2','F32.3','F32.4','F32.5','F32.89','F32.9','F33.0','F33.1','F33.2','F33.3','F33.40','F33.41','F33.42','F33.8','F33.9','F34.1','F34.81','F34.89','F43.21','F43.23','F53','O90.6','O99.340','O99.341','O99.342','O99.343','O99.344','O99.345'];
const bipCodes = ['F31.10','F31.11','F31.12','F31.13','F31.2','F31.30','F31.31','F31.32','F31.4','F31.5','F31.60','F31.61','F31.62','F31.63','F31.64','F31.70','F31.71','F31.72','F31.73','F31.74','F31.75','F31.76','F31.77','F31.78','F31.81','F31.89','F31.9'];

(async () => {
  const run = (sql, params) => new Promise((resolve, reject) => {
    db.run(sql, params, err => err ? reject(err) : resolve());
  });

  await run("BEGIN TRANSACTION");
  
  // Clear old if they exist
  await run("DELETE FROM code_mappings WHERE group_name IN ('Depression_Exc', 'Bipolar_Exc')");

  for (const code of depCodes) {
    await run("INSERT INTO code_mappings (mapping_type, group_name, code_type, code) VALUES ('ICD-10', 'Depression_Exc', 'ICD-10', ?)", [code]);
  }
  for (const code of bipCodes) {
    await run("INSERT INTO code_mappings (mapping_type, group_name, code_type, code) VALUES ('ICD-10', 'Bipolar_Exc', 'ICD-10', ?)", [code]);
  }

  await run("COMMIT");
  console.log('Successfully loaded PC004 exclusion codes into code_mappings');
})();
