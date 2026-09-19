const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const { initDb } = require('../database/db');
const crypto = require('crypto');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });


function parseBool(val) {
  if (val === undefined || val === null || val === '') return 0;
  const s = String(val).trim().toLowerCase();
  if (s === '1' || s === 'true' || s === 'yes' || s === 'positive' || s === 'done' || s === 'y' || s === 't') return 1;
  return 0;
}

function parseExcelDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val)) return null;
    return val.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  // Handle Excel Serial Dates (e.g., 46233)
  if (/^\d+$/.test(str)) {
    // Excel epoch is Dec 30, 1899
    const serial = parseInt(str, 10);
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const finalDate = new Date(excelEpoch.getTime() + serial * 86400000);
    if (!isNaN(finalDate)) return finalDate.toISOString().split('T')[0];
  }

  // Check if DD-MM-YYYY or DD-MMM-YYYY or DD/MM/YYYY
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    if (isNaN(parts[1])) {
      // Month is string like May
      const d = new Date(str);
      if (!isNaN(d)) return d.toISOString().split('T')[0];
    } else {
      // Assume DD-MM-YYYY
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      let d = new Date(year, month, day);
      if (year < 100) {
        // Fix 2-digit years
        d = new Date(2000 + year, month, day);
      }
      if (!isNaN(d)) {
        // Must correct timezone offset if doing local dates, but splitting ISO string gets UTC date. 
        // Best to use Date.UTC to prevent timezone shift issues.
        const dUtc = new Date(Date.UTC(year < 100 ? 2000 + year : year, month, day));
        return dUtc.toISOString().split('T')[0];
      }
    }
  }
  // Fallback
  const d = new Date(str);
  if (!isNaN(d)) return d.toISOString().split('T')[0];
  return null;
}

function calculateAgeMonths(dobStr, encounterDateStr) {
  if (!dobStr || !encounterDateStr) return null;
  const dob = new Date(dobStr);
  const enc = new Date(encounterDateStr);
  if (isNaN(dob) || isNaN(enc)) return null;
  return (enc.getFullYear() - dob.getFullYear()) * 12 + (enc.getMonth() - dob.getMonth());
}

function normalizePhysician(typeStr) {
  if (!typeStr) return 'Other'; // Fallback if missing
  const t = String(typeStr).toUpperCase().trim();
  if (['GP','FM','IM','FMED','INT','GEN','GENERAL PRACTITIONER','FAMILY MEDICINE','INTERNAL MEDICINE','FAMILY PHYSICIAN','GP PHYSICIAN','INT MED','INTMED','GENERAL PRACTICE','GP/FM','GENERALIST','PRIMARY CARE','FAMILY PRACTICE'].includes(t)) return 'PC_Valid';
  if (['PAEDIATRICIAN','PEDIATRICIAN','PED','PAED','PEDS','PAEDIATRIC','PEDIATRIC'].includes(t)) return 'PC_Paed';
  if (['OPH','OPHTHALMOLOGIST','EYE'].includes(t)) return 'Specialist_Eye';
  if (['NEPH','NEPHROLOGIST'].includes(t)) return 'Specialist_Neph';
  return 'Other';
}

function normalizeInsurance(insStr, insMap) {
  if (!insStr) return 'Self-Pay';
  const t = String(insStr).toUpperCase().trim();
  
  // Dynamic DB Check
  if (insMap[t]) return insMap[t];
  
  // Fallbacks
  if (t === 'D001' || t.includes('THIQA')) return 'THIQA';
  if (t === 'D002' || t === 'D003' || t.includes('MANDATE') || t.includes('ABM')) return 'ABM_Mandate';
  if (t.includes('SELF') || t.includes('CASH') || t.includes('HAAD')) return 'Self-Pay';
  if (t.includes('OUT OF POCKET') || t.includes('BASIC')) return 'Commercial';
  
  return 'Commercial';
}

function checkThiqa(cat, code) {
  return (cat === 'THIQA' || String(code).toUpperCase().trim() === 'D001') ? 1 : 0;
}

function checkAbm(cat, code) {
  return (cat === 'ABM_Mandate' || ['D002','D003'].includes(String(code).toUpperCase().trim())) ? 1 : 0;
}

function isLikelyCpt(value) {
  return /^\d{4,5}[A-Z]?$/.test(String(value || '').trim());
}

function splitCodes(value) {
  return String(value || '').split(/[,;|]/).map(code => code.trim()).filter(Boolean);
}

router.post('/', upload.single('file'), async (req, res) => {
  const { facility_id, file_type } = req.body;
  const facilityId = Number(facility_id);

  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  if (!Number.isInteger(facilityId) || facilityId <= 0) {
    return res.status(400).json({ error: 'Valid facility_id is required' });
  }

  if (!['emr', 'shafafiya'].includes(file_type)) {
    return res.status(400).json({ error: 'file_type must be either emr or shafafiya' });
  }

  try {
    const db = await initDb();
    const facilityExists = await db.get('SELECT id FROM facilities WHERE id = ?', [facilityId]);
    if (!facilityExists) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const result = await db.run(`
      INSERT INTO import_batches (facility_id, file_name, file_type, status)
      VALUES (?, ?, ?, 'processing')
    `, [facilityId, req.file.originalname, file_type]);
    
    const batchId = result.lastID;
    
    processFile(req.file.path, batchId, facilityId, file_type).catch(console.error);

    res.json({ success: true, batch_id: batchId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function processFile(filePath, batchId, facilityId, fileType) {
  const db = await initDb();
  try {
    // 1. Get Target Facility MF Number
    const facilityRow = await db.get('SELECT mf_no FROM facilities WHERE id = ?', [facilityId]);
    const expectedMfNo = facilityRow ? String(facilityRow.mf_no).trim() : null;

    // Load Insurance Dictionary
    const insRows = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type = 'Insurance'");
    const insMap = {};
    insRows.forEach(r => insMap[String(r.code).toUpperCase().trim()] = r.group_name);

    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { raw: false, dateNF: 'yyyy-mm-dd' });
    
    if (!data.length) throw new Error('File is empty.');

    const headers = Object.keys(data[0] || {}).map(h => h.toLowerCase().replace(/\s+/g,'_'));
    const emrRequired  = ['mrn', 'encounter_date'];
    const rcmRequired  = ['mrn', 'encounter_date'];
    const required = fileType === 'emr' ? emrRequired : rcmRequired;
    const missing = required.find(col => !headers.some(h => h.includes(col.replace('_',''))));
    if (missing) throw new Error(`Invalid file: Missing required column "${missing}". Check your file format.`);

    let insertedCount = 0;
    let replacedCount = 0;
    let skippedCount  = 0;
    const quartersDetected = new Set();
    
    await db.run('BEGIN TRANSACTION');

    if (fileType === 'emr') {
      const stmt = await db.prepare(`
        INSERT OR REPLACE INTO emr_data (
          facility_id, batch_id, mrn, patient_age, patient_age_months, patient_dob, gender,
          encounter_date, year, quarter, month, physician_id, physician_type, icd10_primary, icd10_secondary, icd10_all, cpt_all,
          wait_time_mins, hba1c_value, hba1c_date, bp_systolic, bp_diastolic, bp_date,
          phq2_result, phq9_score, phq9_date, phq9_followup_date, depression_dx_date, followup_within_30d,
          foot_exam_done, eye_exam_done, nephropathy_exam_done, lipid_profile_done, egfr_value, egfr_date, uacr_done, bmi,
          autism_screened, asthma_controller_count, asthma_reliever_count, row_hash,
          phq9_followup_score, is_abm_mandate, insurance_category, physician_category, is_thiqa, is_palliative, patient_refused, visit_type
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      
      for (const [index, row] of data.entries()) {
        // 2. Validate Facility ID if present
        const rowMfNo = row['Facility ID'] || row['Facility_ID'];
        if (expectedMfNo && rowMfNo && String(rowMfNo).trim() !== expectedMfNo) {
           throw new Error(`Data Validation Failed at Row ${index + 2}: The 'Facility ID' (${rowMfNo}) does not match the selected DOH License Number (${expectedMfNo}). Please verify your export.`);
        }

        const rawEncDate = row['Visit Date'] || row['Encounter_Date'];
        if (!rawEncDate) {
          throw new Error(`Data Validation Failed at Row ${index + 2}: 'Visit Date' or 'Encounter_Date' is missing.`);
        }
        
        const encDate = parseExcelDate(rawEncDate);
        if (!encDate) {
          skippedCount++; continue;
        }
        const encMonth = new Date(encDate).getMonth() + 1;
        const rowYear = new Date(encDate).getFullYear();
        const rowQuarter = Math.ceil(encMonth / 3);
        if (rowYear < 2015 || rowYear > new Date().getUTCFullYear() + 1) { skippedCount++; continue; }
        quartersDetected.add(`${rowYear}-Q${rowQuarter}`);
        
        const dob = parseExcelDate(row['DOB']);
        
        // TRUST EMR AGE FIRST
        let ageYears = parseFloat(row['Patient_Age']);
        if (isNaN(ageYears)) ageYears = parseFloat(row['Age']);
        
        let ageMonths = null;
        if (!isNaN(ageYears) && ageYears > 0) {
            ageMonths = ageYears * 12; // E.g., 2 years old = 24 months
        } else if (ageYears === 0) {
            // If they explicitly give 0 (infant), calculate months from DOB
            ageMonths = calculateAgeMonths(dob, encDate);
            if (ageMonths === null) {
                // Fallback to a custom column if provided
                ageMonths = parseFloat(row['Patient_Age_Months']) || 0;
            }
        } else {
            ageYears = null;
        }
        
        const mrn = row['MRN'] ? String(row['MRN']) : 'UNK-' + index;
        const icdPrimary = row['ICD10_Primary'] || '';

        const hashStr = facilityId + '-' + mrn + '-' + encDate + '-' + icdPrimary;
        const rowHash = crypto.createHash('md5').update(hashStr).digest('hex');

        // Normalizations
        const insCode = row['Insurance'] || row['Insurance_Code'] || row['Insurance_Type'] || null;
        const insCat = normalizeInsurance(insCode, insMap);
        const isThiqa = checkThiqa(insCat, insCode);
        const isAbm = checkAbm(insCat, insCode);
        
        // Physician might be empty
        const phyId = row['Physician ID'] || row['Physician_ID'] || null;
        const phyType = row['Speciality'] || row['Specialty'] || row['Physician_Type'] || null;
        const phyCat = normalizePhysician(phyType);

        // BP split
        let bpSys = null, bpDia = null;
        const bpRaw = row['BP'] || row['BP_Systolic'];
        if (typeof bpRaw === 'string' && bpRaw.includes('/')) {
            const parts = bpRaw.split('/');
            bpSys = parseFloat(parts[0]);
            bpDia = parseFloat(parts[1]);
        } else {
            bpSys = parseFloat(bpRaw) || null;
            bpDia = parseFloat(row['BP_Diastolic']) || null;
        }

        const visitId = row['Visit No'] || row['Visit_No'] || null;
        if (visitId) {
          await db.run('DELETE FROM emr_data WHERE facility_id=? AND visit_id=?', [facilityId, String(visitId).trim()]);
        }

        const result = await stmt.run([
          facilityId, batchId, mrn, ageYears, ageMonths, dob, row['Gender'],
          encDate, rowYear, rowQuarter, encMonth, phyId, phyType || 'Unknown', icdPrimary, row['ICD10_Secondary'], row['ICD'] || row['ICD10_All'] || row['ICD_Codes'], row['CPT'] || row['CPT_Codes'],
          parseFloat(row['Wait_Time_Mins']) || null, parseFloat(row['HbA1c_Value']) || null, parseExcelDate(row['HbA1c_Date']) || null, bpSys, bpDia, parseExcelDate(row['BP_Date']) || null,
          parseBool(row['PHQ2']) || parseBool(row['PHQ2_Result']) || 0, parseFloat(row['PHQ9']) || parseFloat(row['PHQ9_Score']) || null, parseExcelDate(row['PHQ9 Time'] || row['PHQ9_Date']) || null, parseExcelDate(row['PHQ9_Followup_Date']) || null, parseExcelDate(row['Depression_DX_Date']) || null, parseBool(row['Followup_Within_30d']) || 0,
          parseBool(row['Foot_Exam']) || 0, parseBool(row['Eye_Exam']) || 0, parseBool(row['Nephropathy_Exam']) || 0, parseBool(row['Lipid_Profile_Done']) || 0, parseFloat(row['eGFR_Value']) || null, parseExcelDate(row['eGFR_Date']) || null, parseBool(row['uACR_Done']) || 0, parseFloat(row['BMI']) || null,
          parseBool(row['Autism_Screened']) || 0, parseInt(row['Asthma_Controller_Count']) || 0, parseInt(row['Asthma_Reliever_Count']) || 0, rowHash,
          parseFloat(row['PHQ9_Followup_Score']) || null, isAbm, insCat, phyCat, isThiqa, parseBool(row['Is_Palliative']) || 0, parseBool(row['Patient_Refused']) || 0, String(row['Visit_Type'] || row['Visit No'] || '1')
        ]);
        await db.run(
          `UPDATE emr_data SET visit_id=?, patient_name=?, chief_complaints=?, physician_plan=?,
             narrative_diagnosis=?, procedure_notes=?, procedure_remarks=?, clinical_notes=?,
             physician_name=?, insurance_company=? WHERE row_hash=?`,
          [
            visitId, row['Patient Name'] || null, row['Chief Complaints'] || row['Chief_Complaints'] || null,
            row['Physician Plan'] || row['Physician_Plan'] || null,
            row['Narrative Diagnosis'] || row['Narrative_Diagnosis'] || null,
            row['Procedure Notes'] || row['Procedure_Notes'] || null,
            row['Procedure Remarks'] || row['Procedure_Remarks'] || null,
            row['Clinical Notes'] || row['Clinical_Notes'] || null,
            row['Physician'] || null, row['Company'] || null, rowHash
          ]
        );
        
        if (result && result.changes > 1) {
          replacedCount++;
        } else {
          insertedCount++;
        }
      }
      await stmt.finalize();

    } else if (fileType === 'shafafiya') {
      const claims = {};
      const serviceLines = [];
      
      for (const [index, row] of data.entries()) {
        const claimId = row['Claim ID'] || row['Claim_ID'] || '';
        const mrn = row['MRN'] ? String(row['MRN']) : 'UNK';
        const rawEncDate = row['Date of Service'] || row['Encounter_Date'] || row['Visit Date'];
        const encDate = parseExcelDate(rawEncDate);
        if (!encDate) { skippedCount++; continue; }
        const encMonth = new Date(encDate).getMonth() + 1;
        const rowYear = new Date(encDate).getFullYear();
        const rowQuarter = Math.ceil(encMonth / 3);
        if (rowYear < 2015 || rowYear > new Date().getUTCFullYear() + 1) { skippedCount++; continue; }
        quartersDetected.add(`${rowYear}-Q${rowQuarter}`);
        
        const key = claimId ? claimId : mrn + '_' + encDate;
        
        if (!claims[key]) {
           const encMonth = new Date(encDate).getMonth() + 1;
           const rowYear = new Date(encDate).getFullYear();
           const rowQuarter = Math.ceil(encMonth / 3);
           
           claims[key] = {
               facility: facilityId,
               insurance: row['Insurance'] || null,
               claimId: claimId,
               mrn: mrn,
               encDate: encDate,
               rowYear: rowYear,
               rowQuarter: rowQuarter,
               encMonth: encMonth,
               cpts: new Set(),
               icdPrimary: null,
               icdSecondary: [],
               icdAll: new Set(),
               physicianId: row['Clinician License'] || row['Clinician_License'] || row['Physician ID'] || row['Physician_ID'] || row['Physician_Type'] || 'Unknown',
               physicianType: row['Physician Type'] || row['Physician_Type'] || row['Clinician Specialty'] || 'Unknown',
               orderingPhysicianId: row['Ordering Clinician License'] || row['Ordering_Clinician_License'] || null,
               orderingPhysicianType: row['Ordering Clinician Specialty'] || row['Ordering_Clinician_Specialty'] || null,
               insuranceCompany: row['Insurance Company'] || row['Insurance_Company'] || null,
               loincCodes: new Set(),
               loincValues: [],
               loincTypes: new Set(),
               serviceReferences: new Set(),
               hba1cValue: null
           };
        }
        
        // Extract CPT
        const cpt = row['CPT'] || row['CPT Code'] || row['All_CPT_Codes'];
          if (cpt && cpt !== 'N/A') {
            const cptValue = String(cpt).trim();
            if (isLikelyCpt(cptValue)) claims[key].cpts.add(cptValue);
            else claims[key].serviceReferences.add(cptValue);
        }
        
        // Extract LOINC Value (HbA1c specifically if CPT indicates or if it's explicitly named)
        const loincVal = row['LOINC Value'];
        const loincType = row['LOINC Value Type'] || row['LOINC_Value_Type'] || null;
        const loincCode = row['LOINC Code'] || row['LOINC_Code'] || null;
        if (loincCode && loincCode !== 'N/A') claims[key].loincCodes.add(String(loincCode).trim());
        if (loincVal && loincVal !== 'N/A') claims[key].loincValues.push(String(loincVal).trim());
        if (loincType && loincType !== 'N/A') claims[key].loincTypes.add(String(loincType).trim());
        if (loincVal && loincVal !== 'N/A') {
           if (cpt === '83036' || cpt === '83037' || String(loincVal).includes('%')) {
               claims[key].hba1cValue = parseFloat(loincVal);
           }
        }

        serviceLines.push({
          facility: facilityId, batchId, claimId, mrn, encDate,
          cptCode: isLikelyCpt(cpt) ? String(cpt).trim() : null,
          serviceReferenceId: cpt && !isLikelyCpt(cpt) && cpt !== 'N/A' ? String(cpt).trim() : null,
          icdCodes: icdString || null,
          orderingPhysicianId: row['Ordering Clinician License'] || row['Ordering_Clinician_License'] || null,
          orderingPhysicianType: row['Ordering Clinician Specialty'] || row['Ordering_Clinician_Specialty'] || null,
          renderingPhysicianId: claims[key].physicianId,
          renderingPhysicianType: claims[key].physicianType,
          loincCode: loincCode && loincCode !== 'N/A' ? String(loincCode).trim() : null,
          loincValue: loincVal && loincVal !== 'N/A' ? String(loincVal).trim() : null,
          loincValueType: loincType && loincType !== 'N/A' ? String(loincType).trim() : null,
          insurance: claims[key].insurance
        });

        // Extract ICDs
        const icdString = row['ICD Code'] || row['All_ICD10_Codes'] || row['ICD10_Primary'] || '';
        if (icdString && icdString !== 'N/A') {
           const icdParts = icdString.split(';');
           for (let part of icdParts) {
               part = part.trim();
               if (!part) continue;
               
               const codeMatch = part.match(/^([A-Z0-9\.]+)/i);
               if (codeMatch) {
                   const rawCode = codeMatch[1];
                   claims[key].icdAll.add(rawCode);
                   
                   const lowerPart = part.toLowerCase();
                   if (lowerPart.includes('principal') || lowerPart.includes('primary')) {
                       claims[key].icdPrimary = rawCode;
                   } else if (lowerPart.includes('secondary')) {
                       claims[key].icdSecondary.push(rawCode);
                   }
               }
           }
        }
      }
      
      const stmt = await db.prepare(`
        INSERT OR REPLACE INTO shafafiya_data (
          facility_id, batch_id, claim_id, mrn, encounter_date, year, quarter, month,
          physician_id, physician_type, icd10_primary, icd10_secondary, icd10_all, cpt_all, insurance_type, hba1c_value, row_hash
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      
      for (const key in claims) {
        const c = claims[key];
        if (c.claimId) {
          await db.run('DELETE FROM shafafiya_claim_lines WHERE facility_id=? AND claim_id=?', [facilityId, c.claimId]);
          await db.run('DELETE FROM shafafiya_data WHERE facility_id=? AND claim_id=?', [facilityId, c.claimId]);
        }
        const hashStr = c.facility + '-' + c.claimId + '-' + c.mrn + '-' + c.encDate + '-' + Array.from(c.cpts).join(',');
        const rowHash = crypto.createHash('md5').update(hashStr).digest('hex');
        
        const primary = c.icdPrimary || Array.from(c.icdAll)[0] || '';
        const secondaryStr = c.icdSecondary.join(',') || null;
        const allStr = Array.from(c.icdAll).join(',') || null;
        const cptStr = Array.from(c.cpts).join(',') || null;
        
        const result = await stmt.run([
          c.facility, batchId, c.claimId, c.mrn, c.encDate, c.rowYear, c.rowQuarter, c.encMonth,
          c.physicianId, c.physicianType, primary, secondaryStr, allStr, cptStr, c.insurance, c.hba1cValue, rowHash
        ]);
        await db.run(
          'UPDATE shafafiya_data SET ordering_physician_id=?, ordering_physician_type=?, service_reference_ids=?, insurance_company=?, loinc_code=?, loinc_value=?, loinc_value_type=? WHERE row_hash=?',
          [c.orderingPhysicianId, c.orderingPhysicianType, Array.from(c.serviceReferences).join(','), c.insuranceCompany, Array.from(c.loincCodes).join(','), c.loincValues.join(' | '), Array.from(c.loincTypes).join(' | '), rowHash]
        );
        
        if (result && result.changes > 1) {
          replacedCount++;
        } else {
          insertedCount++;
        }
      }
      await stmt.finalize();

      const lineStmt = await db.prepare(`
        INSERT OR REPLACE INTO shafafiya_claim_lines (
          facility_id, batch_id, claim_id, mrn, encounter_date, service_line_no,
          cpt_code, service_reference_id, icd10_codes, ordering_physician_id,
          ordering_physician_type, rendering_physician_id, rendering_physician_type,
          loinc_code, loinc_value, loinc_value_type, insurance_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const [index, line] of serviceLines.entries()) {
        await lineStmt.run([
          line.facility, line.batchId, line.claimId, line.mrn, line.encDate, index + 1,
          line.cptCode, line.serviceReferenceId, line.icdCodes, line.orderingPhysicianId,
          line.orderingPhysicianType, line.renderingPhysicianId, line.renderingPhysicianType,
          line.loincCode, line.loincValue, line.loincValueType, line.insurance
        ]);
      }
      await lineStmt.finalize();
    }

    for (const q of quartersDetected) {
      const [y, qtr] = q.split('-Q');
      await db.run('UPDATE quarter_locks SET is_locked=0 WHERE facility_id=? AND year=? AND quarter=?', [facilityId, y, qtr]);
    }
    
    await db.run('COMMIT');
    await db.run(
      'UPDATE import_batches SET status=?, row_count=?, replaced_count=?, skipped_count=?, quarters_json=? WHERE id=?',
      ['done', insertedCount, replacedCount, skippedCount, JSON.stringify([...quartersDetected].sort()), batchId]
    );

  } catch (err) {
    await db.run('ROLLBACK');
    console.error('Import Error:', err);
    await db.run('UPDATE import_batches SET status = ?, errors_json = ? WHERE id = ?', ['error', JSON.stringify({ message: err.message }), batchId]);
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}

router.get('/status/:batchId', async (req, res) => {
  const batchId = Number(req.params.batchId);
  if (!Number.isInteger(batchId) || batchId <= 0) {
    return res.status(400).json({ error: 'Valid batchId is required' });
  }

  try {
    const db = await initDb();
    const batch = await db.get('SELECT * FROM import_batches WHERE id = ?', [batchId]);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:batchId', async (req, res) => {
  const batchId = Number(req.params.batchId);
  if (!Number.isInteger(batchId) || batchId <= 0) {
    return res.status(400).json({ error: 'Valid batchId is required' });
  }

  try {
    const db = await initDb();
    const batch = await db.get('SELECT * FROM import_batches WHERE id = ?', [batchId]);
    
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    await db.run('BEGIN TRANSACTION');
    
    if (batch.file_type === 'emr') {
      await db.run('DELETE FROM emr_data WHERE batch_id = ?', [batchId]);
    } else if (batch.file_type === 'shafafiya') {
      await db.run('DELETE FROM shafafiya_data WHERE batch_id = ?', [batchId]);
    }
    
    await db.run('DELETE FROM import_batches WHERE id = ?', [batchId]);
    
    await db.run('COMMIT');
    res.json({ success: true, message: 'Batch and associated data deleted completely.' });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/history/:facilityId', async (req, res) => {
  const facilityId = Number(req.params.facilityId);
  if (!Number.isInteger(facilityId) || facilityId <= 0) {
    return res.status(400).json({ error: 'Valid facilityId is required' });
  }

  try {
    const db = await initDb();
    const batches = await db.all('SELECT * FROM import_batches WHERE facility_id = ? ORDER BY id DESC', [facilityId]);
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
