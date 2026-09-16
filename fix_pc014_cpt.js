const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// For PC014
const pc014Target = `SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=? AND ABS(patient_age)>=18 AND ABS(patient_age)<=85
        AND \\$\\{filters.HTN_ICD_FILTER\\} \\$\\{filters.HTN_EXCL\\} \\$\\{filters.ABM_EXCL\\}
        AND \\$\\{filters.PC_PHY_FILTER\\}
        AND mrn IN \\(SELECT mrn FROM locked_audit_records WHERE facility_id=\\? AND encounter_date>=\\? AND encounter_date<\\?
                    AND \\$\\{filters.HTN_ICD_FILTER\\} GROUP BY mrn HAVING COUNT\\(DISTINCT encounter_date\\)>=2\\)`;

const pc014Rep = `SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=? AND ABS(patient_age)>=18 AND ABS(patient_age)<=85
        AND \${filters.HTN_ICD_FILTER} \${filters.HTN_EXCL} \${filters.ABM_EXCL}
        AND \${filters.PC_PHY_FILTER}
        AND \${filters.EM_CPT_FILTER}
        AND mrn IN (SELECT mrn FROM locked_audit_records WHERE facility_id=? AND encounter_date>=? AND encounter_date<?
                    AND \${filters.HTN_ICD_FILTER} GROUP BY mrn HAVING COUNT(DISTINCT encounter_date)>=2)`;

code = code.replace(new RegExp(pc014Target, 'g'), pc014Rep);

// Do the same for PC016 Denominator
const pc016Target = `async function calc_PC016\\(db, facilityId, year, quarter, filters\\) \\{
    const lb9  = lookbackDate\\(year, quarter\\);
    const qStart = \\\`\\$\\{year\\}-\\$\\{String\\(quarter\\*3-2\\).padStart\\(2,'0'\\)\\}-01\\\`;
  
    const den = await db.get\\(\\\`
      SELECT COUNT\\(DISTINCT mrn\\) as cnt, GROUP_CONCAT\\(DISTINCT mrn\\) as mrn_list FROM locked_audit_records
      WHERE facility_id=\\? AND year=\\? AND quarter=\\? AND ABS\\(patient_age\\)>=18 AND ABS\\(patient_age\\)<=85
        AND \\$\\{filters.HTN_ICD_FILTER\\} \\$\\{filters.HTN_EXCL\\} \\$\\{filters.ABM_EXCL\\}
        AND \\$\\{filters.PC_PHY_FILTER\\}`;

const pc016Rep = `async function calc_PC016(db, facilityId, year, quarter, filters) {
    const lb9  = lookbackDate(year, quarter);
    const qStart = \`\${year}-\${String(quarter*3-2).padStart(2,'0')}-01\`;
  
    const den = await db.get(\`
      SELECT COUNT(DISTINCT mrn) as cnt, GROUP_CONCAT(DISTINCT mrn) as mrn_list FROM locked_audit_records
      WHERE facility_id=? AND year=? AND quarter=? AND ABS(patient_age)>=18 AND ABS(patient_age)<=85
        AND \${filters.HTN_ICD_FILTER} \${filters.HTN_EXCL} \${filters.ABM_EXCL}
        AND \${filters.PC_PHY_FILTER}
        AND \${filters.EM_CPT_FILTER}`;

code = code.replace(new RegExp(pc016Target, 'g'), pc016Rep);

// And PC023
const pc023Target = `async function calc_PC023\\(db, facilityId, year, quarter, filters\\) \\{
    const lb9  = lookbackDate\\(year, quarter\\);
    const qStart = \\\`\\$\\{year\\}-\\$\\{String\\(quarter\\*3-2\\).padStart\\(2,'0'\\)\\}-01\\\`;
  
    const den = await db.get\\(\\\`
      SELECT COUNT\\(DISTINCT mrn\\) as cnt, GROUP_CONCAT\\(DISTINCT mrn\\) as mrn_list FROM locked_audit_records
      WHERE facility_id=\\? AND year=\\? AND quarter=\\? AND ABS\\(patient_age\\)>=18 AND ABS\\(patient_age\\)<=85
        AND \\$\\{filters.HTN_ICD_FILTER\\} \\$\\{filters.HTN_EXCL\\} \\$\\{filters.ABM_EXCL\\}
        AND \\$\\{filters.PC_PHY_FILTER\\}`;

code = code.replace(new RegExp(pc023Target, 'g'), pc016Rep.replace('calc_PC016', 'calc_PC023'));

fs.writeFileSync('engine/kpi-calculator.js', code);
console.log('Fixed HTN KPIs to require EM_CPT_FILTER in Q2');
