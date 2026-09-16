const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');
code = code.replace(`}
}

async function calc_PC004`, `}

async function calc_PC004`);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed final extra brace');
