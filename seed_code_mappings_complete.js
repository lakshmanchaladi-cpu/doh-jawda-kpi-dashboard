/**
 * Comprehensive Code Mappings Seed Script
 * Consolidates ALL DOH JAWDA V9/V1 code mappings into a single run.
 * 
 * Run: node seed_code_mappings_complete.js
 * 
 * Source: DOH JAWDA Primary Care V9 (Q1 2026) & V1 (Q3 2026) Appendices
 */
const { initDb } = require('./database/db');

const BATCH_SIZE = 50;

async function run() {
  const db = await initDb();

  await db.exec('DELETE FROM code_mappings');
  console.log('Cleared code_mappings');

  const rows = [];

  function add(mappingType, groupName, codeType, code, description = '', targetKpi = null) {
    rows.push([mappingType, groupName, codeType, code.toUpperCase().trim(), description, targetKpi]);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. INSURANCE MAPPINGS
  // ═══════════════════════════════════════════════════════════════════════════
  add('Insurance', 'THIQA', 'Insurance', 'D001', 'THIQA');
  add('Insurance', 'ABM_Mandate', 'Insurance', 'D002', 'ABM Mandate');
  add('Insurance', 'ABM_Mandate', 'Insurance', 'D003', 'ABM Mandate');
  for (let i = 4; i <= 10; i++) add('Insurance', 'Commercial', 'Insurance', `D0${i}`, 'Commercial');
  for (let i = 1; i <= 5; i++) add('Insurance', 'Commercial', 'Insurance', `A00${i}`, 'Commercial');
  for (let i = 1; i <= 3; i++) add('Insurance', 'Commercial', 'Insurance', `B00${i}`, 'Commercial');
  for (let i = 1; i <= 3; i++) add('Insurance', 'Commercial', 'Insurance', `C00${i}`, 'Commercial');
  for (let i = 1; i <= 5; i++) add('Insurance', 'Government', 'Insurance', `E00${i}`, 'Government');

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PHYSICIAN TYPE MAPPINGS
  // ═══════════════════════════════════════════════════════════════════════════
  const pcValid = [
    'GP','FM','IM','FMED','INT','GEN','GENERAL PRACTITIONER',
    'FAMILY MEDICINE','INTERNAL MEDICINE','FAMILY PHYSICIAN',
    'GP PHYSICIAN','INT MED','INTMED','GENERAL PRACTICE',
    'GP/FM','GENERALIST','PRIMARY CARE','FAMILY PRACTICE'
  ];
  pcValid.forEach(c => add('Physician_Type', 'PC_Valid', 'Physician', c));

  const pcPaed = ['PAEDIATRICIAN','PEDIATRICIAN','PED','PAED','PEDS','PAEDIATRIC','PEDIATRIC'];
  pcPaed.forEach(c => add('Physician_Type', 'PC_Paed', 'Physician', c));

  const eye = ['OPH','OPHTHALMOLOGIST','EYE'];
  eye.forEach(c => add('Physician_Type', 'Specialist_Eye', 'Physician', c));

  const neph = ['NEPH','NEPHROLOGIST'];
  neph.forEach(c => add('Physician_Type', 'Specialist_Neph', 'Physician', c));

  const nonPc = [
    'CARD','CARDIOLOGIST','DERM','DERMATOLOGIST','ENDO','ENDOCRINOLOGIST',
    'GASTRO','GASTROENTEROLOGIST','HEM','HEMATOLOGIST','NEURO','NEUROLOGIST',
    'ONCO','ONCOLOGIST','ORTHO','ORTHOPEDIC','PSYCH','PSYCHIATRIST',
    'PULM','PULMONOLOGIST','RHEUM','RHEUMATOLOGIST','SURG','SURGEON','URO','UROLOGIST'
  ];
  nonPc.forEach(c => add('Physician_Type', 'Non_PC', 'Physician', c));

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. DISEASE GROUP - INCLUSIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // DM Inclusion - Diabetes ICD-10 (E10, E11, E13, O24 series)
  const dmInc = [
    'E10','E10.10','E10.11','E10.21','E10.22','E10.29','E10.311','E10.319',
    'E10.3211','E10.3212','E10.3213','E10.3219','E10.3291','E10.3292','E10.3293','E10.3299',
    'E10.3311','E10.3312','E10.3313','E10.3319','E10.3391','E10.3392','E10.3393','E10.3399',
    'E10.3411','E10.3412','E10.3413','E10.3419','E10.3491','E10.3492','E10.3493','E10.3499',
    'E10.3511','E10.3512','E10.3513','E10.3519','E10.3521','E10.3522','E10.3523','E10.3529',
    'E10.3591','E10.3592','E10.3593','E10.3599','E10.36','E10.37X1','E10.37X2','E10.37X3',
    'E10.37X9','E10.39','E10.40','E10.41','E10.42','E10.43','E10.44','E10.49',
    'E10.51','E10.52','E10.59','E10.610','E10.618','E10.620','E10.621','E10.622',
    'E10.628','E10.630','E10.638','E10.641','E10.649','E10.65','E10.69','E10.8','E10.9',
    'E11','E11.00','E11.01','E11.10','E11.11','E11.21','E11.22','E11.29',
    'E11.311','E11.319','E11.3211','E11.3212','E11.3213','E11.3219','E11.3291','E11.3292',
    'E11.3293','E11.3299','E11.3311','E11.3312','E11.3313','E11.3319','E11.3391','E11.3392',
    'E11.3393','E11.3399','E11.3411','E11.3412','E11.3413','E11.3419','E11.3491','E11.3492',
    'E11.3493','E11.3499','E11.3511','E11.3512','E11.3513','E11.3519','E11.3521','E11.3522',
    'E11.3523','E11.3529','E11.3591','E11.3592','E11.3593','E11.3599','E11.36','E11.37X1',
    'E11.37X2','E11.37X3','E11.37X9','E11.39','E11.40','E11.41','E11.42','E11.43',
    'E11.44','E11.49','E11.51','E11.52','E11.59','E11.610','E11.618','E11.620',
    'E11.621','E11.622','E11.628','E11.630','E11.638','E11.641','E11.649','E11.65',
    'E11.69','E11.8','E11.9',
    'E13','E13.00','E13.01','E13.10','E13.11','E13.21','E13.22','E13.29',
    'E13.311','E13.319','E13.3211','E13.3212','E13.3213','E13.3219','E13.3291','E13.3292',
    'E13.3311','E13.3312','E13.3313','E13.3319','E13.3391','E13.3392','E13.3393','E13.3399',
    'E13.3411','E13.3412','E13.3413','E13.3419','E13.3491','E13.3492','E13.3493','E13.3499',
    'E13.3511','E13.3512','E13.3513','E13.3519','E13.3521','E13.3522','E13.3523','E13.3529',
    'E13.3591','E13.3592','E13.3593','E13.3599','E13.36','E13.37X1','E13.37X2','E13.37X3',
    'E13.37X9','E13.39','E13.40','E13.41','E13.42','E13.43','E13.44','E13.49',
    'E13.51','E13.52','E13.59','E13.610','E13.618','E13.620','E13.621','E13.622',
    'E13.628','E13.630','E13.638','E13.641','E13.649','E13.65','E13.69','E13.8','E13.9',
    // Pregnancy-associated diabetes (non-gestational, part of denominator)
    'O24.011','O24.012','O24.013','O24.019','O24.02','O24.03',
    'O24.111','O24.112','O24.113','O24.119','O24.12','O24.13',
    'O24.311','O24.312','O24.313','O24.319','O24.32','O24.33',
    'O24.811','O24.812','O24.813','O24.819','O24.82','O24.83'
  ];
  dmInc.forEach(c => add('Disease_Group', 'DM_Inclusion', 'ICD-10', c));

  // HTN Inclusion
  ['I10','I11','I12','I13'].forEach(c => add('Disease_Group', 'HTN_Inclusion', 'ICD-10', c));

  // Depression Inclusion
  const depInc = [
    'F01.51','F32.0','F32.1','F32.2','F32.3','F32.4','F32.5','F32.89','F32.9',
    'F33.0','F33.1','F33.2','F33.3','F33.40','F33.41','F33.42','F33.8','F33.9',
    'F34.1','F34.81','F34.89','F43.21','F43.23','F53',
    'O90.6','O99.340','O99.341','O99.342','O99.343','O99.344','O99.345'
  ];
  depInc.forEach(c => add('Disease_Group', 'Depression_Inc', 'ICD-10', c));

  // CVD Inclusion (for PC024 high-risk)
  ['I20','I21','I22','I23','I24','I25'].forEach(c => add('Disease_Group', 'CVD_Inclusion', 'ICD-10', c));

  // Obesity Inclusion (for PC024/PC025)
  ['E66','E66.0','E66.01','E66.09','E66.1','E66.2','E66.3','E66.8','E66.9'].forEach(c =>
    add('Disease_Group', 'Obesity_Inclusion', 'ICD-10', c));

  // Nephropathy Evidence (for PC013, PC016, PC029)
  ['N18.1','N18.2','N18.3','N18.4','N18.5','N18.6','N18.9','E10.65','E11.65','E13.65'].forEach(c =>
    add('Disease_Group', 'Nephropathy_Evidence', 'ICD-10', c));

  // Asthma Inclusion (for PC027 - persistent asthma)
  ['J45.40','J45.41','J45.42','J45.50','J45.51','J45.52'].forEach(c =>
    add('Disease_Group', 'Asthma_Inclusion', 'ICD-10', c));

  // Autism Screen (for PC021)
  add('Disease_Group', 'Autism_Screen', 'ICD-10', 'Z13.4', 'Autism screening encounter');

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. EXCLUSION GROUPS
  // ═══════════════════════════════════════════════════════════════════════════

  // Gestational DM exclusions (O24.4 series)
  const dmGest = [
    'O24.410','O24.414','O24.415','O24.419','O24.420','O24.424',
    'O24.425','O24.429','O24.430','O24.434','O24.435','O24.439'
  ];
  dmGest.forEach(c => add('Exclusion_Group', 'DM_Gestational', 'ICD-10', c));

  // PCOS
  add('Exclusion_Group', 'DM_PCOS', 'ICD-10', 'E28.2', 'Polycystic ovarian syndrome');

  // Steroid-induced DM (full E09.x series)
  const steroidCodes = [
    'E09','E09.00','E09.01','E09.10','E09.11','E09.21','E09.22','E09.29',
    'E09.311','E09.319','E09.3211','E09.3212','E09.3213','E09.3219',
    'E09.3291','E09.3292','E09.3293','E09.3299','E09.3311','E09.3312',
    'E09.3313','E09.3319','E09.3391','E09.3392','E09.3393','E09.3399',
    'E09.3411','E09.3412','E09.3413','E09.3419','E09.3491','E09.3492',
    'E09.3493','E09.3499','E09.3511','E09.3512','E09.3513','E09.3519',
    'E09.3521','E09.3522','E09.3523','E09.3529','E09.3531','E09.3532',
    'E09.3533','E09.3539','E09.3541','E09.3542','E09.3543','E09.3549',
    'E09.3551','E09.3552','E09.3553','E09.3559','E09.3591','E09.3592',
    'E09.3593','E09.3599','E09.36','E09.37X1','E09.37X2','E09.37X3',
    'E09.37X9','E09.39','E09.40','E09.41','E09.42','E09.43','E09.44',
    'E09.49','E09.51','E09.52','E09.59','E09.610','E09.618','E09.620',
    'E09.621','E09.622','E09.628','E09.630','E09.638','E09.641','E09.649',
    'E09.65','E09.69','E09.8','E09.9'
  ];
  steroidCodes.forEach(c => add('Exclusion_Group', 'DM_Steroid', 'ICD-10', c));

  // Pregnancy exclusion (O00-O9A, excluding O24 for DM)
  const pregnancyCodes = [
    'O00','O01','O02','O03','O04','O05','O06','O07','O08','O09',
    'O10','O11','O12','O13','O14','O15','O16',
    'O20','O21','O22','O23','O25','O26','O27','O28','O29',
    'O30','O31','O32','O33','O34','O35','O36','O37','O38','O39',
    'O40','O41','O42','O43','O44','O45','O46','O47','O48',
    'O60','O61','O62','O63','O64','O65','O66','O67','O68','O69',
    'O70','O71','O72','O73','O74','O75','O76','O77',
    'O80','O81','O82','O83','O84','O85','O86','O87','O88','O89',
    'O90','O91','O92','O93','O94','O95','O96','O97','O98','O99','O9A'
  ];
  pregnancyCodes.forEach(c => add('Exclusion_Group', 'Pregnancy_Exc', 'ICD-10', c));

  // HTN exclusions
  add('Exclusion_Group', 'HTN_ESRD', 'ICD-10', 'N18.6', 'End stage renal disease');
  ['N18.5','Z99.2'].forEach(c => add('Exclusion_Group', 'HTN_ESRD', 'ICD-10', c));

  const transplantCodes = ['Z94.0','T86.10','T86.11','T86.12','T86.13','T86.19','Z48.22'];
  transplantCodes.forEach(c => add('Exclusion_Group', 'HTN_Transplant', 'ICD-10', c));

  // Combined ESRD + Transplant
  ['N18.6','N18.5','Z99.2','Z94.0','T86.10','T86.11','T86.12','T86.13','T86.19','Z48.22'].forEach(c =>
    add('Exclusion_Group', 'HTN_ESRD_Transplant', 'ICD-10', c));

  // Depression exclusion (same codes as inclusion, used for established depression)
  depInc.forEach(c => add('Exclusion_Group', 'Depression_Exc', 'ICD-10', c));

  // Bipolar exclusion
  const bipolarCodes = [
    'F31.10','F31.11','F31.12','F31.13','F31.2','F31.30','F31.31','F31.32','F31.4',
    'F31.5','F31.60','F31.61','F31.62','F31.63','F31.64','F31.70','F31.71','F31.72',
    'F31.73','F31.74','F31.75','F31.76','F31.77','F31.78','F31.81','F31.89','F31.9'
  ];
  bipolarCodes.forEach(c => add('Exclusion_Group', 'Bipolar_Exc', 'ICD-10', c));

  // Asthma exclusions (COPD, CF, Bronchiectasis, Respiratory failure)
  ['J43.0','J43.1','J43.2','J43.8','J43.9','J44.0','J44.1','J44.9','E84.0','E84.11','E84.19','E84.8','E84.9',
   'J96.00','J96.01','J96.02','J96.10','J96.11','J96.12','J96.90','J96.91','J96.92'].forEach(c =>
    add('Exclusion_Group', 'Asthma_Excl', 'ICD-10', c));

  // Amputation (for foot exam exclusion)
  ['Z89.011','Z89.012','Z89.019','Z89.111','Z89.112','Z89.119','Z89.211','Z89.212','Z89.219',
   'Z89.411','Z89.412','Z89.419','Z89.511','Z89.512','Z89.519','Z89.611','Z89.612','Z89.619'].forEach(c =>
    add('Exclusion_Group', 'Amputation_Limb', 'ICD-10', c));

  // Prior Dyslipidemia (for PC024 - identifies patients already known)
  ['E78.0','E78.1','E78.2','E78.3','E78.4','E78.5','E78.8','E78.9'].forEach(c =>
    add('Exclusion_Group', 'Prior_Dyslipidemia', 'ICD-10', c));

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CPT / ACTION TABLE CODE GROUPS
  // ═══════════════════════════════════════════════════════════════════════════

  // Valid EM Consultation (Category type - engine expects this)
  ['99201','99202','99203','99204','99205','99211','99212','99213','99214','99215'].forEach(c =>
    add('Category', 'Valid_EM', 'CPT', c));

  // HbA1c (Action_Table - engine expects this)
  add('Action_Table', 'HbA1c', 'CPT', '83036', 'Hemoglobin A1c');

  // Foot Exam (Action_Table - DOH V9 Appendix C)
  ['2028F','99203','97110','97112','97113','97116','11042','11043'].forEach(c =>
    add('Action_Table', 'Foot_Exam', 'CPT', c));

  // Eye Exam (Action_Table - comprehensive DOH Appendix C)
  const eyeExamCpts = [
    '92002','92004','92008','92009','92012','92014','92018','92019',
    '92132','92133','92134','92136','92227','92228','92230','92235',
    '92240','92242','92250','92260','92265','92270','92283','92284',
    '92285','92499','95060'
  ];
  eyeExamCpts.forEach(c => add('Action_Table', 'Eye_Exam', 'CPT', c));

  // Nephropathy (Action_Table - microalbuminuria + eGFR)
  ['82042','82043','82044','82565','82570','82945','82947'].forEach(c =>
    add('Action_Table', 'Nephropathy', 'CPT', c));

  // Autism Screening (Action_Table)
  add('Action_Table', 'Autism_Screen', 'CPT', '96110', 'Autism screening M-CHAT-R');

  // Dyslipidemia / Lipid Profile (Action_Table)
  ['80061','82465','83550','83718','83719','83720','83721','84478'].forEach(c =>
    add('Action_Table', 'Dyslipidemia', 'CPT', c));

  // Kidney Function (Action_Table - eGFR + uACR)
  ['82040','82042','82043','82044','82540','82565','82570'].forEach(c =>
    add('Action_Table', 'Kidney_Function', 'CPT', c));
  // UACR_eGFR for PC029
  ['82040','82042','82043','82044','82540','82565','82570'].forEach(c =>
    add('Action_Table', 'UACR_eGFR', 'CPT', c));

  // Dialysis (Action_Table - exclusion for HTN KPIs)
  const dialysisCpts = [];
  for (let i = 90935; i <= 90970; i++) dialysisCpts.push(String(i));
  dialysisCpts.forEach(c => add('Action_Table', 'Dialysis', 'CPT', c));

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. LOINC CODES (for lab results matching)
  // ═══════════════════════════════════════════════════════════════════════════
  // HbA1c LOINC
  ['4548-4','4549-2','17856-6','17857-4'].forEach(c =>
    add('LOINC', 'HbA1c_LOINC', 'LOINC', c));

  // eGFR LOINC
  ['33914-3','48642-3','48643-1','93824-2','93825-9'].forEach(c =>
    add('LOINC', 'eGFR_LOINC', 'LOINC', c));

  // uACR LOINC
  ['14957-5','14958-3','14959-1','21308-6','14577-6'].forEach(c =>
    add('LOINC', 'uACR_LOINC', 'LOINC', c));

  // ═══════════════════════════════════════════════════════════════════════════
  // INSERT ALL ROWS
  // ═══════════════════════════════════════════════════════════════════════════
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    for (const [mappingType, groupName, codeType, code, description, targetKpi] of batch) {
      await db.run(`
        INSERT OR IGNORE INTO code_mappings (mapping_type, group_name, code_type, code, description, target_kpi, active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `, [mappingType, groupName, codeType, code, description, targetKpi]);
      inserted++;
    }
  }

  const count = await db.get('SELECT COUNT(*) as c FROM code_mappings');
  console.log(`Seeded ${count.c} code_mappings (inserted ${inserted})`);

  // Summary by mapping_type
  const types = await db.all('SELECT mapping_type, COUNT(*) as c FROM code_mappings GROUP BY mapping_type ORDER BY c DESC');
  console.log('\nBy mapping_type:');
  types.forEach(t => console.log(`  ${t.mapping_type}: ${t.c}`));

  // Summary by group_name for key types
  const groups = await db.all(`
    SELECT mapping_type, group_name, COUNT(*) as c 
    FROM code_mappings 
    WHERE mapping_type IN ('Disease_Group','Exclusion_Group','CPT','Physician_Type','Insurance')
    GROUP BY mapping_type, group_name 
    ORDER BY mapping_type, group_name
  `);
  console.log('\nBy group_name:');
  groups.forEach(g => console.log(`  ${g.mapping_type}/${g.group_name}: ${g.c}`));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
