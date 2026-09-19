const fs = require('fs');
let content = fs.readFileSync('public/js/manual.js', 'utf8');
content = content.replace('window.Manual = Manual;', 'window.ManualEntry = ManualEntry;');
fs.writeFileSync('public/js/manual.js', content);
console.log('Fixed manual.js');
