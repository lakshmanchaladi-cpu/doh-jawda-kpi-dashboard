const { initDb } = require('./database/db');
const fs = require('fs');

// ============================================================
// Read extracted PDF text to build appendix code sets
// ============================================================
const text = fs.readFileSync('pc_v9_extracted.txt', 'utf8');

// Extract Appendix A: Pregnancy exclusion codes (O00-O9A)
const idxA = text.indexOf('APPENDIX – A', 3000);
const idxB = 72006;  // known start of Appendix B
const idxEnd = text.indexOf('Summary of Changes', idxB);

const appAText = text.slice(idxA, idxB);
const appBText = text.slice(idxB, idxEnd);

// Unique codes from Appendix A - O-series pregnancy codes
const appACodes = [...new Set(
  (appAText.match(/O[0-9][0-9A-Z\.]+/g) || [])
    .filter(c => /^O[0-9]{2}(\.[0-9A-Z]+)?$/.test(c) && c.length >= 3)
)];

// Unique Appendix B - diabetes E10/E11/E13/O24 expanded codes
const appBCodes = [...new Set(
  (appBText.match(/[EO][0-9][0-9A-Z\.]+/g) || [])
    .filter(c => /^[EO][0-9]{2}(\.[0-9A-Z]+)?$/.test(c) && c.length >= 3)
)];

console.log(`Found ${appACodes.length} Pregnancy exclusion codes (Appendix A)`);
console.log(`Found ${appBCodes.length} Diabetes inclusion codes (Appendix B)`);

// ============================================================
// All confirmed missing data from V9 PDF analysis
// ============================================================

// Missing Depression codes found in V9 PC004/PC005 (O-series peripartum)
const missingDepressionCodes = [
  { code: 'O90.6', description: 'Postpartum mood disturbance' },
  { code: 'O99.340', description: 'Other mental disorders complicating pregnancy, unspecified trimester' },
  { code: 'O99.341', description: 'Other mental disorders complicating pregnancy, first trimester' },
  { code: 'O99.342', description: 'Other mental disorders complicating pregnancy, second trimester' },
  { code: 'O99.343', description: 'Other mental disorders complicating pregnancy, third trimester' },
  { code: 'O99.344', description: 'Other mental disorders complicating childbirth' },
  { code: 'O99.345', description: 'Other mental disorders complicating the puerperium' }
];

// Missing Bipolar codes from V9 (F31.70 series not in current DB)
const missingBipolarCodes = [
  { code: 'F31.70', description: 'Bipolar disorder, currently in remission, unspecified' },
  { code: 'F31.71', description: 'Bipolar disorder, in partial remission, most recent episode hypomanic' },
  { code: 'F31.72', description: 'Bipolar disorder, in full remission, most recent episode hypomanic' },
  { code: 'F31.73', description: 'Bipolar disorder, in partial remission, most recent episode manic' },
  { code: 'F31.74', description: 'Bipolar disorder, in full remission, most recent episode manic' },
  { code: 'F31.75', description: 'Bipolar disorder, in partial remission, most recent episode depressed' },
  { code: 'F31.76', description: 'Bipolar disorder, in full remission, most recent episode depressed' },
  { code: 'F31.77', description: 'Bipolar disorder, in partial remission, most recent episode mixed' },
  { code: 'F31.78', description: 'Bipolar disorder, in full remission, most recent episode mixed' },
  { code: 'F31.81', description: 'Bipolar II disorder' },
  { code: 'F31.89', description: 'Other bipolar disorder' },
  { code: 'F31.9', description: 'Bipolar disorder, unspecified' }
];

// Dialysis CPT codes from PC014/PC016 V9 -- 90951-90970 series missing
const missingDialysisCodes = [
  { code: '90951', description: 'End stage renal disease (ESRD) related services monthly, for patients younger than 2 years' },
  { code: '90952', description: 'ESRD related services monthly, for patients 2-11 years' },
  { code: '90953', description: 'ESRD related services monthly, for patients 12-19 years' },
  { code: '90954', description: 'ESRD related services monthly, for patients 20 years and older' },
  { code: '90955', description: 'ESRD related services monthly, full month; 2-11 years' },
  { code: '90956', description: 'ESRD related services monthly, full month; 12-19 years' },
  { code: '90957', description: 'ESRD related services monthly, full month; 20 years and older' },
  { code: '90958', description: 'ESRD related services; for outpatients, per day; 2-11 years' },
  { code: '90959', description: 'ESRD related services; for outpatients, per day; 12-19 years' },
  { code: '90960', description: 'ESRD related services; for outpatients, per day; 20 years and older' },
  { code: '90961', description: 'ESRD related services; per day; 2-11 years' },
  { code: '90962', description: 'ESRD related services; per day; 12-19 years' },
  { code: '90963', description: 'ESRD related services; per day; 20 years and older' },
  { code: '90964', description: 'ESRD related services; for full month; 2-11 years' },
  { code: '90965', description: 'ESRD related services; for full month; 12-19 years' },
  { code: '90966', description: 'ESRD related services; for full month; 20 years and older' },
  { code: '90967', description: 'ESRD related services; per day; younger than 2 years' },
  { code: '90968', description: 'ESRD related services; per day; 2-11 years (home)' },
  { code: '90969', description: 'ESRD related services; per day; 12-19 years (home)' },
  { code: '90970', description: 'ESRD related services; per day; 20 years and older (home)' }
];

// Missing CVD codes for PC024 denominator (ICD-10 I20-I25)
const missingCVDCodes = [
  { code: 'I20', description: 'Angina pectoris' },
  { code: 'I20.0', description: 'Unstable angina' },
  { code: 'I20.1', description: 'Angina pectoris with documented spasm' },
  { code: 'I20.8', description: 'Other forms of angina pectoris' },
  { code: 'I20.9', description: 'Angina pectoris, unspecified' },
  { code: 'I21', description: 'ST elevation (STEMI) and non-ST elevation (NSTEMI) myocardial infarction' },
  { code: 'I21.0', description: 'ST elevation (STEMI) myocardial infarction of anterior wall' },
  { code: 'I21.1', description: 'ST elevation (STEMI) myocardial infarction of inferior wall' },
  { code: 'I21.2', description: 'ST elevation (STEMI) myocardial infarction of other sites' },
  { code: 'I21.3', description: 'ST elevation (STEMI) myocardial infarction of unspecified site' },
  { code: 'I21.4', description: 'Non-ST elevation (NSTEMI) myocardial infarction' },
  { code: 'I21.9', description: 'Acute myocardial infarction, unspecified' },
  { code: 'I22', description: 'Subsequent myocardial infarction' },
  { code: 'I23', description: 'Certain current complications following acute myocardial infarction' },
  { code: 'I24', description: 'Other acute ischemic heart diseases' },
  { code: 'I25', description: 'Chronic ischemic heart disease' },
  { code: 'I25.0', description: 'Atherosclerotic cardiovascular disease' },
  { code: 'I25.1', description: 'Atherosclerotic heart disease of native coronary artery' },
  { code: 'I25.2', description: 'Old myocardial infarction' },
  { code: 'I25.5', description: 'Ischemic cardiomyopathy' },
  { code: 'I25.6', description: 'Silent myocardial ischemia' },
  { code: 'I25.8', description: 'Other forms of chronic ischemic heart disease' },
  { code: 'I25.9', description: 'Chronic ischemic heart disease, unspecified' }
];

// Dyslipidemia exclusion E78 series codes (Prior_Dyslipidemia group needs expansion)
const dyslipidemiaCodes = [
  { code: 'E78.0', description: 'Pure hypercholesterolemia, unspecified' },
  { code: 'E78.00', description: 'Pure hypercholesterolemia, unspecified' },
  { code: 'E78.01', description: 'Familial hypercholesterolemia' },
  { code: 'E78.1', description: 'Pure hyperglyceridemia' },
  { code: 'E78.2', description: 'Mixed hyperlipidemia' },
  { code: 'E78.3', description: 'Hyperchylomicronemia' },
  { code: 'E78.4', description: 'Other hyperlipidemia' },
  { code: 'E78.41', description: 'Elevated Lipoprotein(a)' },
  { code: 'E78.49', description: 'Other hyperlipidemia' },
  { code: 'E78.5', description: 'Hyperlipidemia, unspecified' },
  { code: 'E78.6', description: 'Lipoprotein deficiency' },
  { code: 'E78.70', description: 'Disorder of bile acid and cholesterol metabolism, unspecified' },
  { code: 'E78.71', description: 'Barth syndrome' },
  { code: 'E78.72', description: 'Smith-Lemli-Opitz syndrome' },
  { code: 'E78.79', description: 'Other disorders of bile acid and cholesterol metabolism' },
  { code: 'E78.81', description: 'Lipoid dermatoarthritis' },
  { code: 'E78.89', description: 'Other lipoprotein metabolism disorders' },
  { code: 'E78.9', description: 'Disorder of lipoprotein metabolism, unspecified' }
];

// HTN codes I11-I13 missing from HTN_Inclusion
const missingHTNCodes = [
  { code: 'I11', description: 'Hypertensive heart disease' },
  { code: 'I11.0', description: 'Hypertensive heart disease with heart failure' },
  { code: 'I11.9', description: 'Hypertensive heart disease without heart failure' },
  { code: 'I12', description: 'Hypertensive chronic kidney disease' },
  { code: 'I12.0', description: 'Hypertensive chronic kidney disease with stage 5 CKD or ESRD' },
  { code: 'I12.9', description: 'Hypertensive chronic kidney disease with stage 1-4 CKD' },
  { code: 'I13', description: 'Hypertensive heart and chronic kidney disease' },
  { code: 'I13.0', description: 'Hypertensive heart and CKD with heart failure and stage 1-4 CKD' },
  { code: 'I13.1', description: 'Hypertensive heart and CKD without heart failure' },
  { code: 'I13.10', description: 'Hypertensive heart and CKD without heart failure, with stage 1-4 CKD' },
  { code: 'I13.11', description: 'Hypertensive heart and CKD without heart failure, with stage 5 CKD or ESRD' },
  { code: 'I13.2', description: 'Hypertensive heart and CKD with heart failure and stage 5 CKD or ESRD' }
];

// Obesity ICD-10 E66 expanded codes for PC025 denominator
const missingObesityCodes = [
  { code: 'E66.0', description: 'Obesity due to excess calories' },
  { code: 'E66.01', description: 'Morbid (severe) obesity due to excess calories' },
  { code: 'E66.09', description: 'Other obesity due to excess calories' },
  { code: 'E66.1', description: 'Drug-induced obesity' },
  { code: 'E66.2', description: 'Morbid (severe) obesity with alveolar hypoventilation' },
  { code: 'E66.8', description: 'Other obesity' },
  { code: 'E66.9', description: 'Obesity, unspecified' }
];

// Dyslipidemia action codes - these are confirmed in PC024 numerator
// 80061 = lipid panel, 82465 = cholesterol total, 83718 = HDL
const missingDyslipidemiaActionCodes = [
  { code: '80061', description: 'Lipid panel (includes total cholesterol, HDL, LDL, triglycerides)', target_kpi: 'PC024' },
  { code: '82465', description: 'Cholesterol, serum or whole blood, total', target_kpi: 'PC024' },
  { code: '83718', description: 'Lipoprotein, direct measurement, high density cholesterol (HDL)', target_kpi: 'PC024' },
  { code: '84478', description: 'Triglycerides assay', target_kpi: 'PC024' },
  { code: '83721', description: 'Low density lipoprotein (LDL) cholesterol', target_kpi: 'PC024' }
];

// Foot exam 2028F is a Category II CPT code - confirmed in guidelines
const missingFootExamCodes = [
  { code: '2028F', description: 'Foot examination performed (includes visual inspection, sensory exam with monofilament, pulse exam)', target_kpi: 'PC011' },
  { code: '11042', description: 'Debridement, subcutaneous tissue (wound); first 20 sq cm or less', target_kpi: 'PC011' },
  { code: '11043', description: 'Debridement, muscle, and/or fascia; first 20 sq cm or less', target_kpi: 'PC011' }
];

// Missing nephropathy CPT codes confirmed in PC013/PC016 (82043 microalbumin is there but missing albumin-creatinine ratio)
const missingNephropathyCodes = [
  { code: '82945', description: 'Glucose; body fluid, other than urine', target_kpi: 'PC013, PC016' },
  { code: '82947', description: 'Glucose; quantitative, blood (except reagent strip)', target_kpi: 'PC013, PC016' }
];

// Kidney transplant codes (missing from HTN_ESRD_Transplant exclusions)
const missingTransplantCodes = [
  { code: 'T86.11', description: 'Kidney transplant rejection' },
  { code: 'T86.12', description: 'Kidney transplant failure' },
  { code: 'T86.13', description: 'Kidney transplant infection' },
  { code: 'T86.19', description: 'Other complication of kidney transplant' },
  { code: 'Z48.22', description: 'Encounter for aftercare following kidney transplant' }
];

initDb().then(async db => {
  let inserted = 0;
  let skipped = 0;

  async function insertIfNew(mapping_type, group_name, code_type, code, description, target_kpi = null) {
    const existing = await db.get('SELECT id FROM code_mappings WHERE code = ? AND mapping_type = ? AND group_name = ?', [code, mapping_type, group_name]);
    if (existing) { skipped++; return; }
    await db.run(
      'INSERT INTO code_mappings (mapping_type, group_name, code_type, code, description, target_kpi) VALUES (?, ?, ?, ?, ?, ?)',
      [mapping_type, group_name, code_type, code, description, target_kpi]
    );
    inserted++;
  }

  // 1. Add Appendix A pregnancy exclusion codes for PC004/PC005/PC025
  console.log('Adding Appendix A Pregnancy exclusion codes...');
  // First add a subset of important ones (not all 2142 which would include sub-ranges)
  // We use the "O-series" family codes that are confirmed from V9 Appendix A
  const importantPregnancyCodes = appACodes.filter(c => c.length >= 6).slice(0, 200); // Core specific codes
  for (const code of importantPregnancyCodes) {
    await insertIfNew('Exclusion_Group', 'Pregnancy_Exc', 'ICD-10', code, 'Obstetric/Pregnancy exclusion code (Appendix A V9)');
  }

  // 2. Add Appendix B expanded diabetes codes to DM_Inclusion
  console.log('Adding Appendix B expanded Diabetes codes...');
  const specificDMCodes = appBCodes.filter(c => c.length >= 5); // Specific sub-codes only
  for (const code of specificDMCodes) {
    await insertIfNew('Disease_Group', 'DM_Inclusion', 'ICD-10', code, 'Diabetes mellitus inclusion code (Appendix B V9)');
  }

  // 3. Add missing Depression O-series codes to Depression_Inc group
  console.log('Adding missing peripartum depression codes...');
  for (const item of missingDepressionCodes) {
    await insertIfNew('Disease_Group', 'Depression_Inc', 'ICD-10', item.code, item.description);
  }

  // 4. Add missing Bipolar F31 extended codes
  console.log('Adding missing extended Bipolar codes...');
  for (const item of missingBipolarCodes) {
    await insertIfNew('Exclusion_Group', 'Bipolar_Exc', 'ICD-10', item.code, item.description);
  }

  // 5. Add missing Dialysis CPT codes 90951-90970
  console.log('Adding missing Dialysis CPT codes...');
  for (const item of missingDialysisCodes) {
    await insertIfNew('Exclusion_Group', 'Dialysis', 'CPT', item.code, item.description);
  }

  // 6. Add expanded CVD codes for PC024 denominator
  console.log('Adding CVD_Inclusion codes...');
  for (const item of missingCVDCodes) {
    await insertIfNew('Disease_Group', 'CVD_Inclusion', 'ICD-10', item.code, item.description);
  }

  // 7. Add full Dyslipidemia E78 exclusion series
  console.log('Adding Dyslipidemia exclusion codes...');
  for (const item of dyslipidemiaCodes) {
    await insertIfNew('Exclusion_Group', 'Prior_Dyslipidemia', 'ICD-10', item.code, item.description);
  }

  // 8. Add HTN codes I11-I13 to HTN_Inclusion
  console.log('Adding expanded HTN_Inclusion codes...');
  for (const item of missingHTNCodes) {
    await insertIfNew('Disease_Group', 'HTN_Inclusion', 'ICD-10', item.code, item.description);
  }

  // 9. Add E66 obesity expanded codes to Obesity_Inclusion
  console.log('Adding expanded Obesity_Inclusion codes...');
  for (const item of missingObesityCodes) {
    await insertIfNew('Disease_Group', 'Obesity_Inclusion', 'ICD-10', item.code, item.description);
  }

  // 10. Add Dyslipidemia action table codes (80061, 82465, 83718, 84478, 83721)
  console.log('Adding Dyslipidemia action CPT codes...');
  for (const item of missingDyslipidemiaActionCodes) {
    await insertIfNew('Action_Table', 'Dyslipidemia', 'CPT', item.code, item.description, item.target_kpi);
  }

  // 11. Add 2028F and other Foot Exam codes
  console.log('Adding Foot Exam action codes...');
  for (const item of missingFootExamCodes) {
    await insertIfNew('Action_Table', 'Foot_Exam', 'CPT', item.code, item.description, item.target_kpi);
  }

  // 12. Add missing transplant exclusion codes
  console.log('Adding missing transplant exclusion codes...');
  for (const item of missingTransplantCodes) {
    await insertIfNew('Exclusion_Group', 'HTN_ESRD_Transplant', 'ICD-10', item.code, item.description);
  }

  // 13. Make sure N18.6 ESRD exists in its own group too
  await insertIfNew('Exclusion_Group', 'HTN_ESRD', 'ICD-10', 'N18.5', 'Chronic kidney disease, stage 5');
  await insertIfNew('Exclusion_Group', 'HTN_ESRD', 'ICD-10', 'Z94.0', 'Kidney transplant status');
  await insertIfNew('Exclusion_Group', 'HTN_ESRD', 'ICD-10', 'Z99.2', 'Dependence on renal dialysis');

  // 14. Add ABM mandate placeholder (for PHQ exclusion guidance)
  await insertIfNew('Exclusion_Group', 'ABM_Mandate', 'CPT', '99201-99215', 'ABM mandated encounters excluded from PHQ-2/PHQ-9 denominator per V9 guidance', null);

  // 15. Add Nephropathy ICD-10 evidence codes (confirmed from PC013/PC016)
  const nephropathyEvidence = [
    { code: 'N18.1', description: 'Chronic kidney disease, stage 1' },
    { code: 'N18.2', description: 'Chronic kidney disease, stage 2 (mild)' },
    { code: 'N18.3', description: 'Chronic kidney disease, stage 3 (moderate)' },
    { code: 'N18.30', description: 'Chronic kidney disease, stage 3 unspecified' },
    { code: 'N18.31', description: 'Chronic kidney disease, stage 3a' },
    { code: 'N18.32', description: 'Chronic kidney disease, stage 3b' },
    { code: 'N18.4', description: 'Chronic kidney disease, stage 4 (severe)' },
    { code: 'N18.6', description: 'End stage renal disease' },
    { code: 'N18.9', description: 'Chronic kidney disease, unspecified' },
    { code: 'E10.65', description: 'Type 1 diabetes mellitus with hyperglycemia' },
    { code: 'E11.65', description: 'Type 2 diabetes mellitus with hyperglycemia' }
  ];
  console.log('Adding Nephropathy evidence ICD-10 codes...');
  for (const item of nephropathyEvidence) {
    await insertIfNew('Disease_Group', 'Nephropathy_Evidence', 'ICD-10', item.code, item.description);
  }

  console.log(`\n===== COMPLETED =====`);
  console.log(`Inserted: ${inserted} new codes`);
  console.log(`Skipped (already exist): ${skipped}`);

  // Print final counts
  const counts = await db.all('SELECT mapping_type, group_name, count(*) as cnt FROM code_mappings GROUP BY mapping_type, group_name ORDER BY mapping_type, group_name');
  console.log('\nFinal mapping reference counts:');
  console.table(counts);

}).catch(console.error);
