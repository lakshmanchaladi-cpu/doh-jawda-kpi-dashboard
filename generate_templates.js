const XLSX = require('xlsx');
const path = require('path');

// EMR Template
const emrHeaders = [
  "MRN", "Patient_Age", "DOB", "Gender", "Encounter_Date", "Physician_Type", 
  "ICD10_Primary", "ICD10_Secondary", "ICD10_All", "CPT_Codes", 
  "Wait_Time_Mins", "HbA1c_Value", "HbA1c_Date", "BP_Systolic", "BP_Diastolic", "BP_Date", "BMI",
  "PHQ2_Result", "PHQ9_Score", "PHQ9_Date", "PHQ9_Followup_Date", "Depression_DX_Date", "Followup_Within_30d",
  "Foot_Exam", "Eye_Exam", "Nephropathy_Exam", "Lipid_Profile_Done", 
  "eGFR_Value", "eGFR_Date", "uACR_Done", "Autism_Screened", 
  "Asthma_Controller_Count", "Asthma_Reliever_Count"
];

const emrSheet = XLSX.utils.aoa_to_sheet([
  emrHeaders,
  ["1001", "45", "1980-05-15", "M", "2026-07-10", "GP", "E11.9", "", "E11.9", "99213", "15", "8.2", "2026-07-10", "125", "78", "2026-07-10", "28.5", "0", "", "", "", "", "0", "1", "1", "1", "1", "95", "2026-07-10", "1", "0", "0", "0"]
]);
const emrWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(emrWb, emrSheet, "EMR_Data");
XLSX.writeFile(emrWb, path.join(__dirname, 'public', 'templates', 'EMR_Template.xlsx'));

// Shafafiya Template
const shafHeaders = [
  "Claim_ID", "MRN", "Patient_Age", "DOB", "Encounter_Date", 
  "Physician_Type", "ICD10_Primary", "ICD10_Secondary", "All_ICD10_Codes", "All_CPT_Codes", "Service_Type"
];

const shafSheet = XLSX.utils.aoa_to_sheet([
  shafHeaders,
  ["CLM-9901", "1001", "45", "1980-05-15", "2026-07-10", "GP", "E11.9", "", "E11.9", "99213,83036", "Outpatient"]
]);
const shafWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(shafWb, shafSheet, "Shafafiya_Claims");
XLSX.writeFile(shafWb, path.join(__dirname, 'public', 'templates', 'Shafafiya_Template.xlsx'));

console.log("Templates created.");
