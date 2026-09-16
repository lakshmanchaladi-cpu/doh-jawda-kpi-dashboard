const fs = require('fs');
let content = fs.readFileSync('./engine/kpi-definitions.js', 'utf8');

const kpis = ['PC013','PC014','PC016','PC021','PC023','PC024','PC025','PC026'];
for (const kpi of kpis) {
  content = content.replace(
    new RegExp(`(code:\\s*'${kpi}',[\\s\\S]*?data_source:\\s*'[^']*',)`, 'g'),
    `$1\n    facility_type: 'Both',`
  );
}

const mcKpis = ['PC027','PC028','PC029','PC030'];
for (const kpi of mcKpis) {
  content = content.replace(
    new RegExp(`(code:\\s*'${kpi}',[\\s\\S]*?data_source:\\s*'[^']*',)`, 'g'),
    `$1\n    facility_type: 'Medical Center',`
  );
}

fs.writeFileSync('./engine/kpi-definitions.js', content);
console.log('Done!');
