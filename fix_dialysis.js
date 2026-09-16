const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target = `filters.HTN_EXCL = buildLikeAndNot('icd10_all', htnExc);`;
const rep = `filters.HTN_EXCL = buildLikeAndNot('icd10_all', htnExc);
  if(dict['Dialysis']) filters.HTN_EXCL += buildLikeAndNot('cpt_all', dict['Dialysis']);`;

code = code.replace(target, rep);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed Dialysis CPTs in HTN_EXCL');
