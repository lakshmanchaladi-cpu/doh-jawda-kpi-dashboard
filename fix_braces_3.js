const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target = `};
}

async function calc_PC005(db, facilityId, year, quarter, filters) {`;

const rep = `};

async function calc_PC005(db, facilityId, year, quarter, filters) {`;

code = code.replace(target, rep);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed extra brace before PC005');
