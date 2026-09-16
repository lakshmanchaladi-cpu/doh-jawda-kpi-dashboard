const fs = require('fs');
let code = fs.readFileSync('engine/kpi-calculator.js', 'utf8');

// The numerator subquery currently ends at `AND ${EM_CPT_FILTER}` and then a closing parenthesis `)`.
// We need to inject the 9-month lookback right before the closing parenthesis.

const targetNumSubquery = `AND \\\$\\{EM_CPT_FILTER\\}
        \\)
        GROUP BY mrn`;

const replacementNumSubquery = `AND \${EM_CPT_FILTER}
        )
        AND mrn IN (
          SELECT mrn FROM locked_audit_records
          WHERE facility_id=? AND encounter_date >= ? AND encounter_date < ?
            AND \${DM_ICD_FILTER}
          GROUP BY mrn HAVING COUNT(DISTINCT encounter_date) >= 2
        )
        GROUP BY mrn`;

// Since facilityId, lb9, qStart need to be passed to the SQL, let's check the query parameters array for the Numerator!
// For PC009, the array is `[lb12, lb12, facilityId, facilityId, year, quarter]`
// We need to append `facilityId, lb9, qStart` to it!
