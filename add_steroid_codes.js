const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kpi_data.db');

const steroidCodes = ['E09.00', 'E09.01', 'E09.10', 'E09.11', 'E09.21', 'E09.22', 'E09.29', 'E09.311', 'E09.319', 'E09.3211', 'E09.3212', 'E09.3213', 'E09.3219', 'E09.3291', 'E09.3292', 'E09.3293', 'E09.3299', 'E09.3311', 'E09.3312', 'E09.3313', 'E09.3319', 'E09.3391', 'E09.3392', 'E09.3393', 'E09.3399', 'E09.3411', 'E09.3412', 'E09.3413', 'E09.3419', 'E09.3491', 'E09.3492', 'E09.3493', 'E09.3499', 'E09.3511', 'E09.3512', 'E09.3513', 'E09.3519', 'E09.3521', 'E09.3522', 'E09.3523', 'E09.3529', 'E09.3531', 'E09.3532', 'E09.3533', 'E09.3539', 'E09.3541', 'E09.3542', 'E09.3543', 'E09.3549', 'E09.3551', 'E09.3552', 'E09.3553', 'E09.3559', 'E09.3591', 'E09.3592', 'E09.3593', 'E09.3599', 'E09.36', 'E09.37X1', 'E09.37X2', 'E09.37X3', 'E09.37X9', 'E09.39', 'E09.40', 'E09.41', 'E09.42', 'E09.43', 'E09.44', 'E09.49', 'E09.51', 'E09.52', 'E09.59', 'E09.610', 'E09.618', 'E09.620', 'E09.621', 'E09.622', 'E09.628', 'E09.630', 'E09.638', 'E09.641', 'E09.649', 'E09.65', 'E09.69', 'E09.8', 'E09.9'];

(async () => {
  const run = (sql, params) => new Promise((resolve, reject) => {
    db.run(sql, params, err => err ? reject(err) : resolve());
  });

  await run("BEGIN TRANSACTION");
  await run("DELETE FROM code_mappings WHERE group_name = 'DM_Steroid'");

  for (const code of steroidCodes) {
    await run("INSERT INTO code_mappings (mapping_type, group_name, code_type, code) VALUES ('ICD-10', 'DM_Steroid', 'ICD-10', ?)", [code]);
  }

  await run("COMMIT");
  console.log('Successfully loaded Steroid Induced Diabetes exclusion codes into code_mappings');
})();
