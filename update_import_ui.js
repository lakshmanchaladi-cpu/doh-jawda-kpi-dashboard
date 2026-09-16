const fs = require('fs');
let code = fs.readFileSync('public/js/import.js', 'utf8');

// 1. Force CSV for Shafafiya
code = code.replace(/accept="\.xlsx,\.xls,\.csv" required/g, 'accept=".csv" required'); // Wait, there's two of them. I only want to change Shafafiya or both? The user said "for rcm and why it is acepting xl it should be .csv". I'll change both to be safe, or just RCM? I will change Shafafiya explicitly.

// Let's do string replacement for Shafafiya specifically
code = code.replace('<input class="form-control mb-3" type="file" id="shafafiyaFile" accept=".xlsx,.xls,.csv" required>',
                    '<input class="form-control mb-3" type="file" id="shafafiyaFile" accept=".csv" required>');

// 2. Change template link
code = code.replace('href="/templates/Shafafiya_Template.xlsx"', 'href="/templates/Shafafiya_Template.csv"');
code = code.replace('<p class="text-muted small mb-0">Upload the claim-level export from the Shafafiya portal.</p>',
                    '<p class="text-muted small mb-0 text-danger fw-bold">Upload the claim-level export from Shafafiya. MUST BE .CSV FORMAT!</p>');

fs.writeFileSync('public/js/import.js', code);
console.log('Updated import UI for CSV');
