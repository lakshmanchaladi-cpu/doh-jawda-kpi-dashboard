const fs = require('fs');
let code = fs.readFileSync('routes/import.js', 'utf8');

const targetStr = `          await stmt.run([
            facilityId, batchId, mrn, ageYears, ageMonths, dob, row['Gender'],
            encDate, rowYear, rowQuarter, encMonth, phyId, icdPrimary, row['ICD10_Secondary'], row['ICD'] || row['ICD10_All'] || row['ICD_Codes'], row['CPT'] || row['CPT_Codes'],
            parseFloat(row['Wait_Time_Mins']) || null, parseFloat(row['HbA1c_Value']) || null, parseExcelDate(row['HbA1c_Date']) || null, bpSys, bpDia, parseExcelDate(row['BP_Date']) || null,
            parseBool(row['PHQ2']) || parseBool(row['PHQ2_Result']) || 0, parseFloat(row['PHQ9']) || parseFloat(row['PHQ9_Score']) || null, parseExcelDate(row['PHQ9 Time'] || row['PHQ9_Date']) || null, parseExcelDate(row['PHQ9_Followup_Date']) || null, parseExcelDate(row['Depression_DX_Date']) || null, parseBool(row['Followup_Within_30d']) || 0,
            parseBool(row['Foot_Exam']) || 0, parseBool(row['Eye_Exam']) || 0, parseBool(row['Nephropathy_Exam']) || 0, parseBool(row['Lipid_Profile_Done']) || 0, parseFloat(row['eGFR_Value']) || null, parseExcelDate(row['eGFR_Date']) || null, parseBool(row['uACR_Done']) || 0, parseFloat(row['BMI']) || null,
            parseBool(row['Autism_Screened']) || 0, parseInt(row['Asthma_Controller_Count']) || 0, parseInt(row['Asthma_Reliever_Count']) || 0, rowHash,
            parseFloat(row['PHQ9_Followup_Score']) || null, isAbm ? 1 : 0, insCat, phyCat, isThiqa ? 1 : 0, parseBool(row['Is_Palliative']) || 0, parseBool(row['Patient_Refused']) || 0, row['Visit_Type'] || null
          ]);`;

const replaceStr = `          // -- NLP EXPERIMENTAL FALLBACK LOGIC --
          const clinicalText = [
            row['Chief Complaints'], row['Chief Complaint s'], row['Physician Plan'], 
            row['Narrative Diagnosis'], row['Procedure Notes'], row['Procedure Remarks']
          ].filter(Boolean).join(' ').toLowerCase();

          let hba1cValue = parseFloat(row['HbA1c_Value']);
          if (isNaN(hba1cValue)) {
            const hba1cMatch = clinicalText.match(/hba1c\\s*[=:]?\\s*(\\d{1,2}\\.?\\d*)/i);
            if (hba1cMatch) hba1cValue = parseFloat(hba1cMatch[1]);
          }
          if (isNaN(hba1cValue)) hba1cValue = null;

          let footExamDone = parseBool(row['Foot_Exam']) || 0;
          if (!footExamDone && clinicalText.match(/foot exam|monofilament|diabetic foot/i)) {
             footExamDone = 1;
          }

          let eyeExamDone = parseBool(row['Eye_Exam']) || 0;
          if (!eyeExamDone && clinicalText.match(/eye exam|retinopathy|fundoscopy/i)) {
             eyeExamDone = 1;
          }

          let nephroDone = parseBool(row['Nephropathy_Exam']) || 0;
          if (!nephroDone && clinicalText.match(/nephropathy|microalbumin|uacr/i)) {
             nephroDone = 1;
          }
          // ----------------------------------------

          await stmt.run([
            facilityId, batchId, mrn, ageYears, ageMonths, dob, row['Gender'],
            encDate, rowYear, rowQuarter, encMonth, phyId, icdPrimary, row['ICD10_Secondary'], row['ICD'] || row['ICD10_All'] || row['ICD_Codes'], row['CPT'] || row['CPT_Codes'],
            parseFloat(row['Wait_Time_Mins']) || null, hba1cValue, parseExcelDate(row['HbA1c_Date']) || null, bpSys, bpDia, parseExcelDate(row['BP_Date']) || null,
            parseBool(row['PHQ2']) || parseBool(row['PHQ2_Result']) || 0, parseFloat(row['PHQ9']) || parseFloat(row['PHQ9_Score']) || null, parseExcelDate(row['PHQ9 Time'] || row['PHQ9_Date']) || null, parseExcelDate(row['PHQ9_Followup_Date']) || null, parseExcelDate(row['Depression_DX_Date']) || null, parseBool(row['Followup_Within_30d']) || 0,
            footExamDone, eyeExamDone, nephroDone, parseBool(row['Lipid_Profile_Done']) || 0, parseFloat(row['eGFR_Value']) || null, parseExcelDate(row['eGFR_Date']) || null, parseBool(row['uACR_Done']) || 0, parseFloat(row['BMI']) || null,
            parseBool(row['Autism_Screened']) || 0, parseInt(row['Asthma_Controller_Count']) || 0, parseInt(row['Asthma_Reliever_Count']) || 0, rowHash,
            parseFloat(row['PHQ9_Followup_Score']) || null, isAbm ? 1 : 0, insCat, phyCat, isThiqa ? 1 : 0, parseBool(row['Is_Palliative']) || 0, parseBool(row['Patient_Refused']) || 0, row['Visit_Type'] || null
          ]);`;

if(code.includes("row['HbA1c_Value']")) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('routes/import.js', code);
  console.log('Successfully injected NLP fallback logic!');
} else {
  console.log('Target string not found in import.js!');
}
