const fs = require('fs');
let code = fs.readFileSync('public/js/settings.js', 'utf8');

// The current condition is: ${(activeTab === 'clinical' || activeTab === 'dicts') ? `
// We want to change it to just: ${activeTab === 'clinical' ? `
code = code.replace(/\$\{\(activeTab === 'clinical' \|\| activeTab === 'dicts'\) \? `/g, "${activeTab === 'clinical' ? `");

fs.writeFileSync('public/js/settings.js', code);
console.log('Removed Add New Dictionary Entry from dicts tab');
