const fs = require('fs');
let code = fs.readFileSync('public/js/import.js', 'utf8');

// Update text
code = code.replace('<p class="text-muted small mb-0">Upload the raw Excel export from the medical center\\\'s EMR system.</p>',
                    '<p class="text-muted small mb-0 text-danger fw-bold">Upload the raw CSV export from the EMR system. MUST BE .CSV FORMAT!</p>');

// Update template link
code = code.replace('href="/templates/EMR_Template.xlsx"', 'href="/templates/EMR_Template.csv"');

// Update input accept
code = code.replace('<input class="form-control mb-3" type="file" id="emrFile" accept=".xlsx,.xls,.csv" required>',
                    '<input class="form-control mb-3" type="file" id="emrFile" accept=".csv" required>');

fs.writeFileSync('public/js/import.js', code);
console.log('Updated EMR UI for CSV');
