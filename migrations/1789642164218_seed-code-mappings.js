/**
 * Migration: Seed code_mappings with DOH JAWDA required codes
 * From DOH JAWDA Primary Care V9 & V1 2026 Appendices
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Clear existing mappings
  pgm.sql('DELETE FROM code_mappings;');

  // Helper to insert multiple codes for a group
  const insertCodes = (pgm, mappingType, groupName, codes, codeType = 'ICD-10', targetKpi = null) => {
    for (const code of codes) {
      pgm.sql(`
        INSERT INTO code_mappings (mapping_type, group_name, code_type, code, description, target_kpi, standard_category, active)
        VALUES ('${mappingType}', '${groupName}', '${codeType}', '${code}', '', ${targetKpi ? `'${targetKpi}'` : 'NULL'}, '', 1)
        ON CONFLICT(mapping_type, COALESCE(group_name, ''), COALESCE(code, '')) DO NOTHING;
      `);
    }
  };

  // ============================================================
  // INSURANCE MAPPINGS (DOH Appendix - Insurance Codes)
  // ============================================================
  // THIQA
  insertCodes(pgm, 'Insurance', 'THIQA', ['D001'], 'Insurance');
  // ABM Mandate
  insertCodes(pgm, 'Insurance', 'ABM_Mandate', ['D002', 'D003'], 'Insurance');
  // Commercial (D* series)
  insertCodes(pgm, 'Insurance', 'Commercial', ['D004','D005','D006','D007','D008','D009','D010'], 'Insurance');
  // Commercial (A* series)
  insertCodes(pgm, 'Insurance', 'Commercial', ['A001','A002','A003','A004','A005'], 'Insurance');
  // Commercial (B* series)
  insertCodes(pgm, 'Insurance', 'Commercial', ['B001','B002','B003'], 'Insurance');
  // Commercial (C* series)
  insertCodes(pgm, 'Insurance', 'Commercial', ['C001','C002','C003'], 'Insurance');
  // Government (E* series)
  insertCodes(pgm, 'Insurance', 'Government', ['E001','E002','E003','E004','E005'], 'Insurance');

  // ============================================================
  // PHYSICIAN TYPE MAPPINGS
  // ============================================================
  // PC_Valid - Primary Care Physicians
  const pcValidCodes = [
    'GP','FM','IM','FMED','INT','GEN','GENERAL PRACTITIONER',
    'FAMILY MEDICINE','INTERNAL MEDICINE','FAMILY PHYSICIAN',
    'GP PHYSICIAN','INT MED','INTMED','GENERAL PRACTICE',
    'GP/FM','GENERALIST','PRIMARY CARE','FAMILY PRACTICE'
  ];
  insertCodes(pgm, 'Physician_Type', 'PC_Valid', pcValidCodes, 'Physician');

  // PC_Paed - Pediatricians
  const pcPaedCodes = ['PAEDIATRICIAN','PEDIATRICIAN','PED','PAED','PEDS','PAEDIATRIC','PEDIATRIC'];
  insertCodes(pgm, 'Physician_Type', 'PC_Paed', pcPaedCodes, 'Physician');

  // Specialist_Eye
  insertCodes(pgm, 'Physician_Type', 'Specialist_Eye', ['OPH','OPHTHALMOLOGIST','EYE'], 'Physician');
  // Specialist_Neph
  insertCodes(pgm, 'Physician_Type', 'Specialist_Neph', ['NEPH','NEPHROLOGIST'], 'Physician');
  // Non_PC / Other
  insertCodes(pgm, 'Physician_Type', 'Non_PC', ['CARD','CARDIOLOGIST','DERM','DERMATOLOGIST','ENDO','ENDOCRINOLOGIST','GASTRO','GASTROENTEROLOGIST','HEM','HEMATOLOGIST','NEURO','NEUROLOGIST','ONCO','ONCOLOGIST','ORTHO','ORTHOPEDIC','PSYCH','PSYCHIATRIST','PULM','PULMONOLOGIST','RHEUM','RHEUMATOLOGIST','SURG','SURGEON','URO','UROLOGIST'], 'Physician');

  // ============================================================
  // DISEASE GROUP - INCLUSIONS
  // ============================================================
  // DM_Inclusion - Diabetes ICD-10 codes (E10, E11, E13, O24 series from Appendix B)
  const dmInclusionCodes = [
    'E10','E10.10','E10.11','E10.21','E10.22','E10.29','E10.311','E10.319',
    'E11','E11.00','E11.01','E11.21','E11.22','E11.29','E11.311','E11.319',
    'E13','E13.00','E13.01','E13.10','E13.11','E13.21','E13.22',
    'O24.011','O24.012','O24.013','O24.019','O24.02','O24.03',
    'O24.111','O24.112','O24.113','O24.119','O24.12','O24.13',
    'O24.311','O24.312','O24.313','O24.319','O24.32','O24.33',
    'O24.811','O24.812','O24.813','O24.819','O24.82','O24.83'
  ];
  insertCodes(pgm, 'Disease_Group', 'DM_Inclusion', dmInclusionCodes, 'ICD-10', 'PC009,PC010,PC011,PC012,PC013');

  // HTN_Inclusion - Hypertension ICD-10
  insertCodes(pgm, 'Disease_Group', 'HTN_Inclusion', ['I10','I11','I12','I13'], 'ICD-10', 'PC014,PC016,PC023');

  // Depression_Inc
  const depIncCodes = [
    'F01.51','F32.0','F32.1','F32.2','F32.3','F32.4','F32.5','F32.89','F32.9',
    'F33.0','F33.1','F33.2','F33.3','F33.40','F33.41','F33.42','F33.8','F33.9',
    'F34.1','F34.81','F34.89','F43.21','F43.23','F53','O90.6','O99.340','O99.341','O99.342','O99.343','O99.344','O99.345'
  ];
  insertCodes(pgm, 'Disease_Group', 'Depression_Inc', depIncCodes, 'ICD-10', 'PC004,PC005');

  // ============================================================
  // EXCLUSION GROUPS
  // ============================================================
  // DM_Gestational
  const dmGestationalCodes = [
    'O24.410','O24.414','O24.415','O24.419','O24.420','O24.424',
    'O24.425','O24.429','O24.430','O24.434','O24.435','O24.439'
  ];
  insertCodes(pgm, 'Exclusion_Group', 'DM_Gestational', dmGestationalCodes, 'ICD-10', 'PC009,PC010,PC011,PC012,PC013');

  // DM_PCOS
  insertCodes(pgm, 'Exclusion_Group', 'DM_PCOS', ['E28.2'], 'ICD-10', 'PC009,PC010,PC011,PC012,PC013');

  // DM_Steroid
  insertCodes(pgm, 'Exclusion_Group', 'DM_Steroid', ['E09'], 'ICD-10', 'PC009,PC010,PC011,PC012,PC013');

  // Pregnancy_Exc (general pregnancy codes - O00-O9A except O24)
  const pregnancyCodes = [
    'O00','O01','O02','O03','O04','O05','O06','O07','O08',
    'O09','O10','O11','O12','O13','O14','O15','O16',
    'O20','O21','O22','O23','O24','O25','O26','O27','O28','O29',
    'O30','O31','O32','O33','O34','O35','O36','O37','O38','O39',
    'O40','O41','O42','O43','O44','O45','O46','O47','O48',
    'O60','O61','O62','O63','O64','O65','O66','O67','O68','O69',
    'O70','O71','O72','O73','O74','O75','O76','O77',
    'O80','O81','O82','O83','O84','O85','O86','O87','O88','O89',
    'O90','O91','O92','O93','O94','O95','O96','O97','O98','O99','O9A'
  ];
  insertCodes(pgm, 'Exclusion_Group', 'Pregnancy_Exc', pregnancyCodes, 'ICD-10', 'PC004,PC005,PC009,PC010,PC011,PC012,PC013,PC014,PC016,PC023');

  // HTN_ESRD
  insertCodes(pgm, 'Exclusion_Group', 'HTN_ESRD', ['N18.6'], 'ICD-10', 'PC014,PC016,PC023');

  // HTN_Transplant
  insertCodes(pgm, 'Exclusion_Group', 'HTN_Transplant', ['Z94.0'], 'ICD-10', 'PC014,PC016,PC023');

  // Depression_Exc (same as Depression_Inc but for exclusion logic)
  insertCodes(pgm, 'Exclusion_Group', 'Depression_Exc', depIncCodes, 'ICD-10', 'PC004,PC005');

  // Bipolar_Exc
  const bipolarCodes = [
    'F31.10','F31.11','F31.12','F31.13','F31.2','F31.30','F31.31','F31.32','F31.4',
    'F31.5','F31.60','F31.61','F31.62','F31.63','F31.64','F31.70','F31.71','F31.72',
    'F31.73','F31.74','F31.75','F31.76','F31.77','F31.78','F31.81','F31.89','F31.9'
  ];
  insertCodes(pgm, 'Exclusion_Group', 'Bipolar_Exc', bipolarCodes, 'ICD-10', 'PC004,PC005');

  // Asthma_Excl
  const asthmaExclCodes = ['J43.8','J43.9','J44.0','J44.1','J44.9','E84.0','J96.00','J96.01','J96.02'];
  insertCodes(pgm, 'Exclusion_Group', 'Asthma_Excl', asthmaExclCodes, 'ICD-10', 'PC027');

  // ============================================================
  // CPT CODE GROUPS
  // ============================================================
  // Valid_EM - Consultation CPT codes
  insertCodes(pgm, 'CPT', 'Valid_EM', ['99201','99202','99203','99204','99205','99211','99212','99213','99214','99215'], 'CPT', 'PC009,PC010,PC011,PC012,PC013,PC014,PC016,PC023');

  // HbA1c CPT
  insertCodes(pgm, 'CPT', 'HbA1c', ['83036'], 'CPT', 'PC009,PC010');

  // Foot_Exam CPT (example codes)
  insertCodes(pgm, 'CPT', 'Foot_Exam', ['97110','97112','97113','97116'], 'CPT', 'PC011');

  // Eye_Exam CPT
  insertCodes(pgm, 'CPT', 'Eye_Exam', ['92134','92132','92133','92136','92242','92250','92227','92228','92002','92004','92012','92014'], 'CPT', 'PC012');

  // Nephropathy CPT
  insertCodes(pgm, 'CPT', 'Nephropathy', ['82043','82570','82042','82044','82565'], 'CPT', 'PC013,PC016');

  // Autism CPT
  insertCodes(pgm, 'CPT', 'Autism', ['96110'], 'CPT', 'PC021');

  // Lipid_Profile CPT
  insertCodes(pgm, 'CPT', 'Lipid_Profile', ['80061','82465','83718','83721','84478'], 'CPT', 'PC024');

  // Kidney_Function CPT
  insertCodes(pgm, 'CPT', 'Kidney_Function', ['82040','82042','82043','82044','82570','82565','82540'], 'CPT', 'PC029');

  // Dialysis CPT
  insertCodes(pgm, 'CPT', 'Dialysis', ['90935','90937','90945','90947','90951','90952','90953','90954','90955','90956','90957','90958','90959','90960','90961','90962','90963','90964','90965','90966','90967','90968','90969','90970'], 'CPT', 'PC014,PC016');

  // ============================================================
  // ICD-10 DISEASE SPECIFIC
  // ============================================================
  // CVD_HighRisk
  insertCodes(pgm, 'ICD-10', 'CVD_HighRisk', ['I20','I21','I22','I23','I24','I25'], 'ICD-10', 'PC024');

  // Obesity_HighRisk
  insertCodes(pgm, 'ICD-10', 'Obesity_HighRisk', ['E66'], 'ICD-10', 'PC024,PC025');

  // Autism_Screen
  insertCodes(pgm, 'ICD-10', 'Autism_Screen', ['Z13.4'], 'ICD-10', 'PC021');

  // CKD_Codes
  insertCodes(pgm, 'ICD-10', 'CKD', ['N18.1','N18.2','N18.3','N18.4','N18.5','N18.6','N18.9'], 'ICD-10', 'PC029');

  console.log('Code mappings seeded successfully');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql('DELETE FROM code_mappings;');
};