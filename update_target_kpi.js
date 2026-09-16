const { initDb } = require('./database/db');

initDb().then(async db => {
  await db.run(`
    UPDATE code_mappings 
    SET target_kpi = CASE 
      WHEN group_name='HbA1c' THEN 'PC009, PC010' 
      WHEN group_name='Eye_Exam' THEN 'PC012' 
      WHEN group_name='Nephropathy' THEN 'PC013, PC016' 
      WHEN group_name='Autism_Screen' THEN 'PC021' 
      WHEN group_name='Dyslipidemia' THEN 'PC024' 
      WHEN group_name='Foot_Exam' THEN 'PC011' 
      ELSE NULL 
    END 
    WHERE mapping_type='Action_Table'
  `);
  console.log('target_kpi updated');
}).catch(console.error);
