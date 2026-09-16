const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

const target = `AND \\$\\{filters.HTN_ICD_FILTER\\} \\$\\{filters.HTN_EXCL\\} \\$\\{filters.ABM_EXCL\\}
          AND \\$\\{filters.PC_PHY_FILTER\\}
          AND mrn IN \\(SELECT mrn FROM locked_audit_records WHERE facility_id=\\? AND encounter_date>=\\? AND encounter_date<\\?
                      AND \\$\\{filters.HTN_ICD_FILTER\\} GROUP BY mrn HAVING COUNT\\(DISTINCT encounter_date\\)>=2\\)`;

const rep = `AND \${filters.HTN_ICD_FILTER} \${filters.HTN_EXCL} \${filters.ABM_EXCL}
          AND \${filters.PC_PHY_FILTER}
          AND \${filters.EM_CPT_FILTER}
          AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date>=? AND encounter_date<?
                      AND \${filters.HTN_ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date)>=2)`;

code = code.replace(new RegExp(target, 'g'), rep);
fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed HTN Numerators to require EM_CPT_FILTER');
