const fs = require('fs');
let code = fs.readFileSync('routes/import.js', 'utf8');

const oldArray = `          await stmt.run([
            facilityId, batchId, mrn, ageYears, ageMonths, dob, row['Gender'],
            encDate, rowYear, rowQuarter, encMonth, phyId, icdPrimary, row['ICD10_Secondary'], row['ICD10_All'], row['CPT_Codes'],
            parseFloat(row['Wait_Time_Mins']) || null, parseFloat(row['HbA1c_Value']) || null, row['HbA1c_Date'] || null, bpSys, bpDia, row['BP_Date'] || null,
            parseInt(row['PHQ2']) || parseInt(row['PHQ2_Result']) || 0, parseFloat(row['PHQ9']) || parseFloat(row['PHQ9_Score']) || null, row['PHQ9 Time'] || row['PHQ9_Date'] || null, row['PHQ9_Followup_Date'] || null, row['Depression_DX_Date'] || null, parseInt(row['Followup_Within_30d']) || 0,
            parseInt(row['Foot_Exam']) || 0, parseInt(row['Eye_Exam']) || 0, parseInt(row['Nephropathy_Exam']) || 0, parseInt(row['Lipid_Profile_Done']) || 0, parseFloat(row['eGFR_Value']) || null, row['eGFR_Date'] || null, parseInt(row['uACR_Done']) || 0, parseFloat(row['BMI']) || null,
            parseInt(row['Autism_Screened']) || 0, parseInt(row['Asthma_Controller_Count']) || 0, parseInt(row['Asthma_Reliever_Count']) || 0, rowHash,
            parseFloat(row['PHQ9_Followup_Score']) || null, isAbm, insCat, phyCat, isThiqa, parseInt(row['Is_Palliative']) || 0, parseInt(row['Patient_Refused']) || 0, String(row['Visit_Type'] || row['Visit No'] || '1')
          ]);`;

const newArray = `          await stmt.run([
            facilityId, batchId, mrn, ageYears, ageMonths, parseExcelDate(row['DOB'] || row['Patient_DOB']) || null, row['Gender'],
            encDate, rowYear, rowQuarter, encMonth, phyId, icdPrimary, row['ICD10_Secondary'], row['ICD10_All'], row['CPT_Codes'],
            parseFloat(row['Wait_Time_Mins']) || null, parseFloat(row['HbA1c_Value']) || null, parseExcelDate(row['HbA1c_Date']) || null, bpSys, bpDia, parseExcelDate(row['BP_Date']) || null,
            parseInt(row['PHQ2']) || parseInt(row['PHQ2_Result']) || 0, parseFloat(row['PHQ9']) || parseFloat(row['PHQ9_Score']) || null, parseExcelDate(row['PHQ9 Time'] || row['PHQ9_Date']) || null, parseExcelDate(row['PHQ9_Followup_Date']) || null, parseExcelDate(row['Depression_DX_Date']) || null, parseInt(row['Followup_Within_30d']) || 0,
            parseInt(row['Foot_Exam']) || 0, parseInt(row['Eye_Exam']) || 0, parseInt(row['Nephropathy_Exam']) || 0, parseInt(row['Lipid_Profile_Done']) || 0, parseFloat(row['eGFR_Value']) || null, parseExcelDate(row['eGFR_Date']) || null, parseInt(row['uACR_Done']) || 0, parseFloat(row['BMI']) || null,
            parseInt(row['Autism_Screened']) || 0, parseInt(row['Asthma_Controller_Count']) || 0, parseInt(row['Asthma_Reliever_Count']) || 0, rowHash,
            parseFloat(row['PHQ9_Followup_Score']) || null, isAbm, insCat, phyCat, isThiqa, parseInt(row['Is_Palliative']) || 0, parseInt(row['Patient_Refused']) || 0, String(row['Visit_Type'] || row['Visit No'] || '1')
          ]);`;

if (code.includes(oldArray)) {
  code = code.replace(oldArray, newArray);
  fs.writeFileSync('routes/import.js', code);
  console.log('Successfully updated dates in import.js');
} else {
  console.log('Failed to match oldArray in import.js');
}
