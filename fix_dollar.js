const fs = require('fs');
const path = require('path');
const dir = 'public/js';

fs.readdirSync(dir).forEach(f => {
  if (f.endsWith('.js')) {
    const p = path.join(dir, f);
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/\\\$/g, '$');
    fs.writeFileSync(p, c);
    console.log(`Fixed $ in ${f}`);
  }
});
