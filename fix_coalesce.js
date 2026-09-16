const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// Fix PC009
const target009 = `             MAX(CASE WHEN hba1c_date >= ? THEN hba1c_value ELSE NULL END) as latest_hba1c,
             MAX(CASE WHEN hba1c_date >= ? THEN hba1c_date ELSE NULL END) as latest_hba1c_date`;
const rep009 = `             MAX(CASE WHEN COALESCE(hba1c_date, encounter_date) >= ? THEN hba1c_value ELSE NULL END) as latest_hba1c,
             MAX(CASE WHEN COALESCE(hba1c_date, encounter_date) >= ? THEN COALESCE(hba1c_date, encounter_date) ELSE NULL END) as latest_hba1c_date`;
             
code = code.replace(target009, rep009);

// Fix PC010
const target010 = `             MAX(CASE WHEN hba1c_date >= ? THEN hba1c_value ELSE NULL END) as latest_hba1c,
             MAX(CASE WHEN hba1c_date >= ? THEN hba1c_date ELSE NULL END) as latest_hba1c_date`;
code = code.replace(target010, rep009);

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed HbA1c missing date bug with COALESCE');
