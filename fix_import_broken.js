const fs = require('fs');
let code = fs.readFileSync('public/js/import.js', 'utf8');

code = code.replace("onclick=\"App.navigate('dashboard'); Dashboard.recalculate();\"", 
                    "onclick=\"App.navigate('audit');\"");

fs.writeFileSync('public/js/import.js', code);
console.log('Fixed import broken button');
