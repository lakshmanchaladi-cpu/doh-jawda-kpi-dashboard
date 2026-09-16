const fs = require('fs');
let code = fs.readFileSync('routes/import.js', 'utf8');

const newShafLogic = \    } else if (fileType === 'shafafiya') {
      const claims = {};
      
      for (const [index, row] of data.entries()) {
        const claimId = row['Claim ID'] || row['Claim_ID'] || '';
        const mrn = row['MRN'] ? String(row['MRN']) : 'UNK';
        const rawEncDate = row['Date of Service'] || row['Encounter_Date'] || row['Visit Date'];
        const encDate = parseExcelDate(rawEncDate);
        if (!encDate) continue;
        
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
               physicianType: row['Clinician Specialty'] || row['Ordering Clinician Specialty'] || row['Physician_Type'] || 'Unknown',
               hba1cValue: null
           };
        }
        
        // Extract CPT
        const cpt = row['CPT Code'] || row['All_CPT_Codes'];
        if (cpt && cpt !== 'N/A') {
           claims[key].cpts.add(cpt.trim());
        }
        
        // Extract LOINC Value (HbA1c specifically if CPT indicates or if it's explicitly named)
        const loincVal = row['LOINC Value'];
        if (loincVal && loincVal !== 'N/A') {
           if (cpt === '83036' || cpt === '83037' || String(loincVal).includes('%')) {
               claims[key].hba1cValue = parseFloat(loincVal);
           }
        }

        // Extract ICDs
        const icdString = row['ICD Code'] || row['All_ICD10_Codes'] || row['ICD10_Primary'] || '';
        if (icdString && icdString !== 'N/A') {
           const icdParts = icdString.split(';');
           for (let part of icdParts) {
               part = part.trim();
               if (!part) continue;
               
               const codeMatch = part.match(/^([A-Z0-9\\.]+)/i);
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
      
      const stmt = await db.prepare(\\\
        INSERT INTO shafafiya_data (
          facility_id, batch_id, claim_id, mrn, encounter_date, year, quarter, month,
          physician_type, icd10_primary, icd10_secondary, icd10_all, cpt_all, insurance_type, hba1c_value, row_hash
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?
        )
      \\\);
      
      for (const key in claims) {
        const c = claims[key];
        const hashStr = c.facility + '-' + c.claimId + '-' + c.mrn + '-' + c.encDate + '-' + Array.from(c.cpts).join(',');
        const rowHash = crypto.createHash('md5').update(hashStr).digest('hex');
        
        const primary = c.icdPrimary || Array.from(c.icdAll)[0] || '';
        const secondaryStr = c.icdSecondary.join(',') || null;
        const allStr = Array.from(c.icdAll).join(',') || null;
        const cptStr = Array.from(c.cpts).join(',') || null;
        
        await stmt.run([
          c.facility, batchId, c.claimId, c.mrn, c.encDate, c.rowYear, c.rowQuarter, c.encMonth,
          c.physicianType, primary, secondaryStr, allStr, cptStr, c.insurance, c.hba1cValue, rowHash
        ]);
        importedCount++;
      }
      await stmt.finalize();
    }\;

const regex = /\\} else if \\(fileType === 'shafafiya'\\) \\{[\\s\\S]*?await stmt\\.finalize\\(\\);\n\\s+\\}/;
code = code.replace(regex, newShafLogic);

// Add hba1c to SYNC
const syncFind = /physician_type = COALESCE\\(NULLIF[\\s\\S]*?\\)\\), 'Unknown'\\)/;
const syncReplace = \physician_type = COALESCE(NULLIF(emr_data.physician_type, 'Unknown'), (SELECT physician_type FROM shafafiya_data s WHERE s.mrn = emr_data.mrn AND s.encounter_date = emr_data.encounter_date AND s.facility_id = emr_data.facility_id LIMIT 1), 'Unknown'),
        hba1c_value = COALESCE(emr_data.hba1c_value, (SELECT hba1c_value FROM shafafiya_data s WHERE s.mrn = emr_data.mrn AND s.encounter_date = emr_data.encounter_date AND s.facility_id = emr_data.facility_id LIMIT 1))\;

code = code.replace(syncFind, syncReplace);

fs.writeFileSync('routes/import.js', code);
console.log('Updated import.js successfully.');
