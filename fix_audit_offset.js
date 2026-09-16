const fs = require('fs');
let code = fs.readFileSync('public/js/audit.js', 'utf8');

code = code.replace('<td class="text-muted small">${m.offset}</td>\n', '');
code = code.replace('<th>Offset</th>\n', '');
code = code.replace("'Offset','Month'", "'Month'");
code = code.replace("m.offset, m.label", "m.label");

fs.writeFileSync('public/js/audit.js', code);
console.log('Removed Offset column');
