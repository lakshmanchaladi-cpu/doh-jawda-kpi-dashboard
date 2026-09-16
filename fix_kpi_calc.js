const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target1 = "physician_category IN ('PC','PC_Valid')";
const replace1 = "physician_category IN ('PC','PC_Valid','Primary Care / Family Medicine', 'General Practitioner')";

const target2 = "physician_category IN ('PC','PC_Valid','PC_Paed')";
const replace2 = "physician_category IN ('PC','PC_Valid','PC_Paed','Primary Care / Family Medicine', 'General Practitioner')";

code = code.replace(target1, replace1);
code = code.replace(target2, replace2);

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed kpi-calculator.js PC_PHY_FILTER');
