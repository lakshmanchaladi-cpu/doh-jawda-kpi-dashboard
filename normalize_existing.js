const { initDb } = require('./database/db');

function normalizePhysician(typeStr) {
  if (!typeStr) return null;
  const t = String(typeStr).toUpperCase().trim();
  if (['GP','FM','IM','FMED','INT','GEN','GENERAL PRACTITIONER','FAMILY MEDICINE','INTERNAL MEDICINE','FAMILY PHYSICIAN','GP PHYSICIAN','INT MED','INTMED','GENERAL PRACTICE','GP/FM','GENERALIST','PRIMARY CARE','FAMILY PRACTICE'].includes(t)) return 'PC_Valid';
  if (['PAEDIATRICIAN','PEDIATRICIAN','PED','PAED','PEDS','PAEDIATRIC','PEDIATRIC'].includes(t)) return 'PC_Paed';
  if (['OPH','OPHTHALMOLOGIST','EYE'].includes(t)) return 'Specialist_Eye';
  if (['NEPH','NEPHROLOGIST'].includes(t)) return 'Specialist_Neph';
  return 'Other';
}

function normalizeInsurance(insStr) {
  if (!insStr) return 'Self-Pay';
  const t = String(insStr).toUpperCase().trim();
  if (t === 'D001' || t.includes('THIQA')) return 'THIQA';
  if (t === 'D002' || t === 'D003' || t.includes('MANDATE') || t.includes('ABM')) return 'ABM_Mandate';
  if (t.includes('SELF') || t.includes('CASH') || t.includes('OUT OF POCKET')) return 'Self-Pay';
  return 'Commercial';
}

function checkThiqa(cat, code) {
  return (cat === 'THIQA' || String(code).toUpperCase().trim() === 'D001') ? 1 : 0;
}

function checkAbm(cat, code) {
  return (cat === 'ABM_Mandate' || ['D002','D003'].includes(String(code).toUpperCase().trim())) ? 1 : 0;
}

initDb().then(async db => {
  console.log('Normalizing existing EMR data...');
  const rows = await db.all('SELECT id, physician_type, insurance_category FROM emr_data'); // Actually emr_data didn't have insurance_code originally, wait.
  // Actually, wait, emr_data only has insurance_category if it was in the file, but standard EMR doesn't always have it. Wait, the user said:
  // "but in emr there is no codes each facility will give like selfpay, self-pay ... for thiqa, it might be THIQA ... but in RCM we will get the codes as maping refrence."
  
  // Update physician_category
  let updatedCount = 0;
  for (const row of rows) {
    const pCat = normalizePhysician(row.physician_type);
    
    // In EMR, insurance is often empty because it's in RCM. But if it exists in emr_data somehow (we don't have an original insurance_type column in EMR), we can't map it.
    // Wait, let's just map physician_category and is_thiqa / is_abm by joining with shafafiya_data
    
    await db.run('UPDATE emr_data SET physician_category = ? WHERE id = ?', [pCat, row.id]);
    updatedCount++;
  }
  console.log(`Normalized physician_category for ${updatedCount} rows.`);

  // Cross-reference THIQA and ABM from shafafiya_data
  console.log('Cross-referencing insurance from shafafiya_data (RCM) to emr_data...');
  await db.run(`
    UPDATE emr_data
    SET 
      is_thiqa = (
        SELECT CASE WHEN insurance_type='D001' THEN 1 ELSE 0 END
        FROM shafafiya_data
        WHERE shafafiya_data.mrn = emr_data.mrn AND shafafiya_data.encounter_date = emr_data.encounter_date
        LIMIT 1
      ),
      is_abm_mandate = (
        SELECT CASE WHEN insurance_type IN ('D002','D003') THEN 1 ELSE 0 END
        FROM shafafiya_data
        WHERE shafafiya_data.mrn = emr_data.mrn AND shafafiya_data.encounter_date = emr_data.encounter_date
        LIMIT 1
      ),
      insurance_category = (
        SELECT CASE 
          WHEN insurance_type='D001' THEN 'THIQA'
          WHEN insurance_type IN ('D002','D003') THEN 'ABM_Mandate'
          WHEN insurance_type IS NULL THEN 'Self-Pay'
          ELSE 'Commercial' 
        END
        FROM shafafiya_data
        WHERE shafafiya_data.mrn = emr_data.mrn AND shafafiya_data.encounter_date = emr_data.encounter_date
        LIMIT 1
      )
  `);
  console.log('Cross-reference complete.');

}).catch(console.error);
