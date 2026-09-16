const fs = require('fs');
let code = fs.readFileSync('public/js/proofs.js', 'utf8');

// PC014 fix
const pc014Target = /<b>Exclusions Applied:<\/b> Pregnancy \(\$\{dbMaps\['Pregnancy_Exc'\]\}\), ESRD \(\$\{dbMaps\['HTN_ESRD'\]\}\), Transplant \(\$\{dbMaps\['HTN_Transplant'\]\}\), Dialysis \(\$\{dbMaps\['Dialysis'\]\}\), ABM Mandate/;

const pc014Rep = `<details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary><div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;"><b>Pregnancy:</b> \${dbMaps['Pregnancy_Exc']}<br><b>ESRD:</b> \${dbMaps['HTN_ESRD']}<br><b>Transplant:</b> \${dbMaps['HTN_Transplant']}<br><b>Dialysis:</b> \${dbMaps['Dialysis']}<br><b>ABM Mandate</b></div></details>`;

code = code.replace(pc014Target, pc014Rep);

// PC009 fix
const pc009Target = /<b>Exclusions Applied:<\/b> Pregnancy \(\$\{dbMaps\['Pregnancy_Exc'\]\}\), Gestational \(\$\{dbMaps\['DM_Gestational'\]\}\), PCOS \(\$\{dbMaps\['DM_PCOS'\]\}\), ABM Mandate/;

const pc009Rep = `<details class="mt-2"><summary class="text-primary" style="cursor:pointer"><b>View Exclusions Applied</b></summary><div style="max-height: 100px; overflow-y: auto; font-size: 0.85em; background: #f8f9fa; padding: 8px; border-radius: 4px; margin-top: 5px;"><b>Pregnancy:</b> \${dbMaps['Pregnancy_Exc']}<br><b>Gestational:</b> \${dbMaps['DM_Gestational']}<br><b>PCOS:</b> \${dbMaps['DM_PCOS']}<br><b>ABM Mandate</b></div></details>`;

code = code.replace(pc009Target, pc009Rep);

fs.writeFileSync('public/js/proofs.js', code);
console.log('Fixed UI layout for long exclusions');
