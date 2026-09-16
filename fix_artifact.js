const fs = require('fs');
const artifactPath = 'C:/Users/USER/.gemini/antigravity/brain/672b157b-0624-4cb7-895a-cf62c277811f/client_data_requirements.md';
let code = fs.readFileSync(artifactPath, 'utf8');

const additionalSection = `
## 7. RCM / Claims Data Template (Required Columns)
When uploading your Shafafiya RCM exports, please ensure your Excel file contains these exact headers. *(Note: We no longer require Clinician Specialty columns since the system pulls those dynamically from the DOH Clinician Licenses Settings)*:
- \`Facility ID\` (e.g. MF2222)
- \`Claim ID\`
- \`MRN\`
- \`Date of Service\` or \`Encounter_Date\`
- \`Clinician License\` (e.g. D3080)
- \`Primary ICD-10\`
- \`Secondary ICD-10s\` (comma separated)
- \`CPT Codes\` (comma separated)
- \`Payer\` or \`Insurance\`

## 8. EMR Clinical Data Template (Required Columns)
When uploading your Clinical EMR exports, please ensure your Excel file contains these exact headers:
- \`Facility ID\`
- \`MRN\`
- \`Patient_DOB\` or \`DOB\` (Format: YYYY-MM-DD or standard Excel Date)
- \`Patient_Age\`
- \`Gender\`
- \`Encounter_Date\`
- \`Clinician License\`
- \`Wait_Time_Mins\`
- \`HbA1c_Value\` and \`HbA1c_Date\`
- \`BP_Systolic\`, \`BP_Diastolic\`, and \`BP_Date\`
- \`PHQ9_Score\` and \`PHQ9_Date\`
- \`eGFR_Value\` and \`eGFR_Date\`
`;

fs.writeFileSync(artifactPath, code + '\n' + additionalSection);
console.log('Updated Artifact');
