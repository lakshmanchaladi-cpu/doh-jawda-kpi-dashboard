const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target = `den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}

async function calc_PC004(db, facilityId, year, quarter, filters) {`;

const rep = `den_list: den.mrn_list ? den.mrn_list.split(',') : [] };
}
}

async function calc_PC004(db, facilityId, year, quarter, filters) {`;

code = code.replace(target, rep);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Restored missing brace');
