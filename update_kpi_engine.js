const fs = require('fs');
let code = fs.readFileSync('routes/kpi-engine.js', 'utf8');

const oldQuery = `          FROM emr_data e
          LEFT JOIN shafafiya_data s 
            ON e.facility_id = s.facility_id 
            AND e.mrn = s.mrn 
            AND e.encounter_date = s.encounter_date`;

const newQuery = `          FROM emr_data e
          LEFT JOIN shafafiya_data s 
            ON e.facility_id = s.facility_id 
            AND e.mrn = s.mrn 
            AND e.encounter_date = s.encounter_date
          LEFT JOIN facilities fac
            ON fac.id = e.facility_id
          LEFT JOIN clinician_licenses cl 
            ON cl.license_number = COALESCE(s.physician_type, e.physician_type)
            AND cl.facility_mf_no = fac.mf_no`;

code = code.replace(oldQuery, newQuery);

code = code.replace("(${physCaseSql}) as physician_category", "COALESCE(cl.major, 'Other') as physician_category");

// Remove the physCases mapping generation since it's no longer used
code = code.replace(/const physMappings = await db\.all\('SELECT code, group_name FROM code_mappings WHERE mapping_type = \? AND active = 1', \['Physician_Role'\]\);[\s\S]*?const physCaseSql = `CASE \$\{physCases\} WHEN 1=0 THEN 'dummy' ELSE 'Other' END`;/, '');

fs.writeFileSync('routes/kpi-engine.js', code);
console.log('Updated KPI Engine with Clinician Dictionary Join');
