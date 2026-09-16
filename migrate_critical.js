const { initDb } = require('./database/db');

initDb().then(async db => {
  console.log('Applying critical database fixes...');

  // 1. Add missing performance indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_emr_encounter_date ON emr_data(facility_id, encounter_date)',
    'CREATE INDEX IF NOT EXISTS idx_emr_icd10_primary ON emr_data(facility_id, icd10_primary)',
    'CREATE INDEX IF NOT EXISTS idx_emr_physician_type ON emr_data(facility_id, physician_type)',
    'CREATE INDEX IF NOT EXISTS idx_emr_year_month ON emr_data(facility_id, year, month)',
    'CREATE INDEX IF NOT EXISTS idx_emr_mrn_date ON emr_data(facility_id, mrn, encounter_date)',
    'CREATE INDEX IF NOT EXISTS idx_shaf_mrn_date ON shafafiya_data(facility_id, mrn, encounter_date)',
    'CREATE INDEX IF NOT EXISTS idx_shaf_insurance ON shafafiya_data(facility_id, insurance_type)',
  ];
  for (const sql of indexes) {
    await db.run(sql);
    console.log('✅ Index:', sql.match(/idx_\w+/)[0]);
  }

  // 2. Add missing columns to emr_data
  const alterStatements = [
    // PHQ-9 follow-up score for PC026 50% improvement rule
    "ALTER TABLE emr_data ADD COLUMN phq9_followup_score REAL",
    // ABM mandate flag (D002/D003 encounters must be excluded from all KPIs)
    "ALTER TABLE emr_data ADD COLUMN is_abm_mandate INTEGER DEFAULT 0",
    // Insurance category (resolved at import time from free-text)
    "ALTER TABLE emr_data ADD COLUMN insurance_category TEXT",
    // Physician category (normalized at import time)
    "ALTER TABLE emr_data ADD COLUMN physician_category TEXT",
    // THIQA flag (cross-referenced from RCM at import)
    "ALTER TABLE emr_data ADD COLUMN is_thiqa INTEGER DEFAULT 0",
    // Palliative care flag (PC025 exclusion)
    "ALTER TABLE emr_data ADD COLUMN is_palliative INTEGER DEFAULT 0",
    // Patient refused flag (covers multiple KPI exclusions)
    "ALTER TABLE emr_data ADD COLUMN patient_refused INTEGER DEFAULT 0",
    // Visit type from Shafafiya (outpatient / inpatient / emergency)
    "ALTER TABLE emr_data ADD COLUMN visit_type TEXT",
  ];

  for (const sql of alterStatements) {
    try {
      await db.run(sql);
      const col = sql.match(/ADD COLUMN (\w+)/)[1];
      console.log('✅ Column added:', col);
    } catch (e) {
      if (e.message.includes('duplicate column')) {
        const col = sql.match(/ADD COLUMN (\w+)/)[1];
        console.log('⏭️  Column already exists:', col);
      } else {
        console.error('❌ Error:', e.message, '|', sql.slice(0, 60));
      }
    }
  }

  // 3. Add physician type mapping reference
  const physicianTypes = [
    // Primary care valid physician types
    { group: 'PC_Valid', code: 'GP', desc: 'General Practitioner' },
    { group: 'PC_Valid', code: 'FM', desc: 'Family Medicine' },
    { group: 'PC_Valid', code: 'FMED', desc: 'Family Medicine (alt code)' },
    { group: 'PC_Valid', code: 'IM', desc: 'Internal Medicine' },
    { group: 'PC_Valid', code: 'INT', desc: 'Internal Medicine (alt)' },
    { group: 'PC_Valid', code: 'GEN', desc: 'General Practice' },
    // Paediatrician (PC021 Autism screening)
    { group: 'PC_Paed', code: 'PED', desc: 'Paediatrics' },
    { group: 'PC_Paed', code: 'PAED', desc: 'Paediatrics (alt)' },
    { group: 'PC_Paed', code: 'PEDS', desc: 'Paediatrics (alt 2)' },
    // Referral specialists (not denominators, but used for numerator validation)
    { group: 'Specialist', code: 'OPH', desc: 'Ophthalmology' },
    { group: 'Specialist', code: 'NEPH', desc: 'Nephrology' },
    { group: 'Specialist', code: 'ENDO', desc: 'Endocrinology' },
    { group: 'Specialist', code: 'CARD', desc: 'Cardiology' },
    { group: 'Specialist', code: 'PSYCH', desc: 'Psychiatry (depression referrals)' },
    // Non-PC types (excluded from denominators)
    { group: 'Non_PC', code: 'ER', desc: 'Emergency Room Physician' },
    { group: 'Non_PC', code: 'SURG', desc: 'Surgeon' },
    { group: 'Non_PC', code: 'DENT', desc: 'Dentist' },
    { group: 'Non_PC', code: 'NURSE', desc: 'Nurse Practitioner' },
  ];

  for (const pt of physicianTypes) {
    const existing = await db.get('SELECT id FROM code_mappings WHERE mapping_type=? AND group_name=? AND code=?',
      ['Physician_Type', pt.group, pt.code]);
    if (!existing) {
      await db.run('INSERT INTO code_mappings (mapping_type, group_name, code_type, code, description) VALUES (?,?,?,?,?)',
        ['Physician_Type', pt.group, 'DOH_Code', pt.code, pt.desc]);
    }
  }
  console.log('✅ Physician_Type mapping codes added');

  // 4. Add visit type mapping reference from Shafafiya
  const visitTypes = [
    { code: '1', desc: 'Outpatient visit' },
    { code: '2', desc: 'Inpatient admission' },
    { code: '3', desc: 'Emergency visit' },
    { code: '4', desc: 'Daycase / Day surgery' },
    { code: '5', desc: 'Home visit' },
    { code: '6', desc: 'Telemedicine / Virtual visit' },
    { code: 'OP', desc: 'Outpatient (text format)' },
    { code: 'IP', desc: 'Inpatient (text format)' },
    { code: 'EM', desc: 'Emergency (text format)' },
  ];

  for (const vt of visitTypes) {
    const existing = await db.get('SELECT id FROM code_mappings WHERE mapping_type=? AND code=?', ['Visit_Type', vt.code]);
    if (!existing) {
      await db.run('INSERT INTO code_mappings (mapping_type, group_name, code_type, code, description) VALUES (?,?,?,?,?)',
        ['Visit_Type', 'Visit_Type', 'DOH_Code', vt.code, vt.desc]);
    }
  }
  console.log('✅ Visit_Type mapping codes added');

  // Final verification
  const newCols = await db.all('PRAGMA table_info(emr_data)');
  console.log('\n=== emr_data columns after migration ===');
  newCols.forEach(c => console.log(' ', c.name, c.type));

  const idxCheck = await db.all("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='emr_data'");
  console.log('\n=== emr_data indexes ===');
  idxCheck.forEach(i => console.log(' ', i.name));

}).catch(console.error);
