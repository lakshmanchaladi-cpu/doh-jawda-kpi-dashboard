const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target = `  if(dict['DM_Gestational']) dmExc.push(...dict['DM_Gestational']);
  if(dict['DM_PCOS']) dmExc.push(...dict['DM_PCOS']);
  if(dict['Pregnancy_Exc']) dmExc.push(...dict['Pregnancy_Exc']);`;

const rep = `  if(dict['DM_Gestational']) dmExc.push(...dict['DM_Gestational']);
  if(dict['DM_PCOS']) dmExc.push(...dict['DM_PCOS']);
  if(dict['DM_Steroid']) dmExc.push(...dict['DM_Steroid']);
  if(dict['Pregnancy_Exc']) dmExc.push(...dict['Pregnancy_Exc']);`;

code = code.replace(target, rep);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Patched generateDynamicFilters to include DM_Steroid');
