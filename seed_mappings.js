const { initDb } = require('./database/db');

const mappings = [
  // Valid EM
  ['Category', 'Valid_EM', 'CPT', '99201', ''],
  ['Category', 'Valid_EM', 'CPT', '99202', ''],
  ['Category', 'Valid_EM', 'CPT', '99203', ''],
  ['Category', 'Valid_EM', 'CPT', '99204', ''],
  ['Category', 'Valid_EM', 'CPT', '99205', ''],
  ['Category', 'Valid_EM', 'CPT', '99211', ''],
  ['Category', 'Valid_EM', 'CPT', '99212', ''],
  ['Category', 'Valid_EM', 'CPT', '99213', ''],
  ['Category', 'Valid_EM', 'CPT', '99214', ''],
  ['Category', 'Valid_EM', 'CPT', '99215', ''],

  // Inclusions
  ['Disease_Group', 'DM_Inclusion', 'ICD-10', 'E10', 'Type 1 diabetes mellitus'],
  ['Disease_Group', 'DM_Inclusion', 'ICD-10', 'E11', 'Type 2 diabetes mellitus'],
  ['Disease_Group', 'DM_Inclusion', 'ICD-10', 'E13', 'Other specified diabetes mellitus'],
  ['Disease_Group', 'DM_Inclusion', 'ICD-10', 'O24', 'Diabetes mellitus in pregnancy'],
  ['Disease_Group', 'HTN_Inclusion', 'ICD-10', 'I10', 'Essential (primary) hypertension'],
  ['Disease_Group', 'HTN_Inclusion', 'ICD-10', 'I11', 'Hypertensive heart disease'],
  ['Disease_Group', 'HTN_Inclusion', 'ICD-10', 'I12', 'Hypertensive chronic kidney disease'],
  ['Disease_Group', 'HTN_Inclusion', 'ICD-10', 'I13', 'Hypertensive heart and chronic kidney disease'],
  ['Disease_Group', 'CVD_Inclusion', 'ICD-10', 'I20', 'Angina pectoris'],
  ['Disease_Group', 'CVD_Inclusion', 'ICD-10', 'I21', 'Acute myocardial infarction'],
  ['Disease_Group', 'CVD_Inclusion', 'ICD-10', 'I22', 'Subsequent ST elevation and non-ST elevation MI'],
  ['Disease_Group', 'CVD_Inclusion', 'ICD-10', 'I23', 'Certain current complications following acute MI'],
  ['Disease_Group', 'CVD_Inclusion', 'ICD-10', 'I24', 'Other acute ischemic heart diseases'],
  ['Disease_Group', 'CVD_Inclusion', 'ICD-10', 'I25', 'Chronic ischemic heart disease'],
  ['Disease_Group', 'Obesity_Inclusion', 'ICD-10', 'E66', 'Overweight and obesity'],

  // Exclusions
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.410', 'Gestational diabetes mellitus in pregnancy'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.414', 'Gestational diabetes mellitus in pregnancy'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.415', 'Gestational diabetes mellitus in pregnancy'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.419', 'Gestational diabetes mellitus in pregnancy'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.420', 'Gestational diabetes mellitus in childbirth'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.424', 'Gestational diabetes mellitus in childbirth'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.425', 'Gestational diabetes mellitus in childbirth'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.429', 'Gestational diabetes mellitus in childbirth'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.430', 'Gestational diabetes mellitus in the puerperium'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.434', 'Gestational diabetes mellitus in the puerperium'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.435', 'Gestational diabetes mellitus in the puerperium'],
  ['Exclusion_Group', 'DM_Gestational', 'ICD-10', 'O24.439', 'Gestational diabetes mellitus in the puerperium'],
  ['Exclusion_Group', 'DM_PCOS', 'ICD-10', 'E28.2', 'Polycystic ovarian syndrome'],
  ['Exclusion_Group', 'HTN_ESRD', 'ICD-10', 'N18.6', 'End stage renal disease'],
  ['Exclusion_Group', 'HTN_Transplant', 'ICD-10', 'T86.10', 'Unspecified complication of kidney transplant'],
  ['Exclusion_Group', 'HTN_Transplant', 'ICD-10', 'T86.11', 'Kidney transplant rejection'],
  ['Exclusion_Group', 'HTN_Transplant', 'ICD-10', 'T86.12', 'Kidney transplant failure'],
  ['Exclusion_Group', 'HTN_Transplant', 'ICD-10', 'T86.13', 'Kidney transplant infection'],
  ['Exclusion_Group', 'HTN_Transplant', 'ICD-10', 'T86.19', 'Other complication of kidney transplant'],
  ['Exclusion_Group', 'HTN_Transplant', 'ICD-10', 'Z48.22', 'Encounter for aftercare following kidney transplant'],
  ['Exclusion_Group', 'HTN_Transplant', 'ICD-10', 'Z94.0', 'Kidney transplant status'],
  ['Exclusion_Group', 'Prior_Dyslipidemia', 'ICD-10', 'E78', 'Disorders of lipoprotein metabolism'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.411', 'Acquired absence of great toe'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.412', 'Acquired absence of great toe'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.419', 'Acquired absence of great toe'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.421', 'Acquired absence of other toe(s)'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.422', 'Acquired absence of other toe(s)'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.429', 'Acquired absence of other toe(s)'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.431', 'Acquired absence of foot'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.432', 'Acquired absence of foot'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.439', 'Acquired absence of foot'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.441', 'Acquired absence of ankle'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.442', 'Acquired absence of ankle'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.449', 'Acquired absence of ankle'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.511', 'Acquired absence of leg below knee'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.512', 'Acquired absence of leg below knee'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.519', 'Acquired absence of leg below knee'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.521', 'Acquired absence of knee'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.522', 'Acquired absence of knee'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.529', 'Acquired absence of knee'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.611', 'Acquired absence of leg above knee'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.612', 'Acquired absence of leg above knee'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.619', 'Acquired absence of leg above knee'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.621', 'Acquired absence of hip'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.622', 'Acquired absence of hip'],
  ['Exclusion_Group', 'Amputation_Limb', 'ICD-10', 'Z89.629', 'Acquired absence of hip'],
  ['Exclusion_Group', 'Dialysis', 'CPT', '90935', 'Hemodialysis procedure'],
  ['Exclusion_Group', 'Dialysis', 'CPT', '90937', 'Hemodialysis procedure requiring repeated evaluation'],
  ['Exclusion_Group', 'Dialysis', 'CPT', '90940', 'Hemodialysis access flow study'],
  ['Exclusion_Group', 'Dialysis', 'CPT', '90947', 'Dialysis procedure other than hemodialysis'],
  ['Exclusion_Group', 'Dialysis', 'CPT', '90989', 'Dialysis training, patient'],
  ['Exclusion_Group', 'Dialysis', 'CPT', '90993', 'Dialysis training, patient'],
  ['Exclusion_Group', 'Dialysis', 'CPT', '90997', 'Hemoperfusion'],
  ['Exclusion_Group', 'Dialysis', 'CPT', '90999', 'Unlisted dialysis procedure'],
  ['Exclusion_Group', 'Autism_Exc', 'ICD-10', 'F84.0', 'Autistic disorder'],
  ['Exclusion_Group', 'HTN_ESRD_Transplant', 'ICD-10', 'N18.6', 'End stage renal disease'],
  ['Exclusion_Group', 'HTN_ESRD_Transplant', 'ICD-10', 'Z99.2', 'Dependence on renal dialysis'],
  ['Exclusion_Group', 'HTN_ESRD_Transplant', 'ICD-10', 'Z94.0', 'Kidney transplant status'],
  ['Exclusion_Group', 'HTN_ESRD_Transplant', 'ICD-10', 'T86.10', 'Unspecified complication of kidney transplant']
];

initDb().then(async db => {
  await db.run('CREATE TABLE IF NOT EXISTS code_mappings (id INTEGER PRIMARY KEY AUTOINCREMENT, mapping_type TEXT, group_name TEXT, code_type TEXT, code TEXT, description TEXT)');
  await db.run('DELETE FROM code_mappings');

  for (const row of mappings) {
    await db.run('INSERT INTO code_mappings (mapping_type, group_name, code_type, code, description) VALUES (?, ?, ?, ?, ?)', row);
  }
  console.log('Successfully seeded code mappings');
}).catch(console.error);
