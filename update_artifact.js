const fs = require('fs');
const artifactPath = 'C:/Users/USER/.gemini/antigravity/brain/672b157b-0624-4cb7-895a-cf62c277811f/client_data_requirements.md';
let code = fs.readFileSync(artifactPath, 'utf8');

// The section I added before started with "## 7. RCM / Claims Data Template (Required Columns)"
const regex = /## 7\. RCM \/ Claims Data Template[\s\S]*/;

const newSection = `## 7. RCM / Claims Data Template (Required Columns)
When uploading your Shafafiya RCM exports, please ensure your CSV file contains these exact headers:
- \`Facility ID\` (e.g. MF2222)
- \`Claim ID\`
- \`MRN\`
- \`Date of Service\`
- \`Clinician License\` (e.g. D3080)
- \`ICD Code\` (Primary and secondary codes separated by semicolons)
- \`CPT Code\` (Comma separated if multiple)
- \`LOINC Value\`
- \`Insurance\`

## 8. EMR Clinical Data Template (Required Columns)
When uploading your Clinical EMR exports, please ensure your CSV file contains these exact headers:
- \`Facility ID\`
- \`Visit Date\`
- \`MRN\`
- \`Visit No\`
- \`Patient Name\`
- \`Age\`
- \`Physician ID\`
- \`Insurance\`
- \`DOB\`
- \`Gender\`
- \`Weight(kg)\`
- \`Height(cm)\`
- \`BMI\`
- \`Temp(C)\`
- \`Pulse\`
- \`Respiration\`
- \`BP\` (Format: 120/80)
- \`SPO2\`
- \`PHQ2\`
- \`PHQ2 Time\`
- \`PHQ9\`
- \`PHQ9 Time\`
`;

if (code.match(regex)) {
  code = code.replace(regex, newSection);
} else {
  code += "\n\n" + newSection;
}

fs.writeFileSync(artifactPath, code);
console.log('Artifact updated');
