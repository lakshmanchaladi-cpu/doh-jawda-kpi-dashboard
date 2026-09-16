const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// Fix HbA1c Dates (PC009, PC010)
code = code.replace(/hba1c_date >= \?/g, "COALESCE(hba1c_date, encounter_date) >= ?");
code = code.replace(/hba1c_date ELSE NULL/g, "COALESCE(hba1c_date, encounter_date) ELSE NULL");
code = code.replace(/latest_hba1c_date IS NULL/g, "latest_hba1c_date IS NULL"); // No change needed here

// Fix PHQ9 Date (PC004)
code = code.replace(/r\.phq9_date IS NOT NULL/g, "COALESCE(r.phq9_date, r.encounter_date) IS NOT NULL");
code = code.replace(/julianday\(r\.phq9_date\)/g, "julianday(COALESCE(r.phq9_date, r.encounter_date))");

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log("Updated date fallbacks");
