const fs = require('fs');
let code = fs.readFileSync('routes/kpi-engine.js', 'utf8');

const regex = /\/\/ --- BEGIN V2 AUTO-COMPILE STEP ---[\s\S]*?\/\/ --- END V2 AUTO-COMPILE STEP ---/m;

const replacement = \// --- BEGIN V2 AUTO-COMPILE STEP ---
          await db.run('BEGIN TRANSACTION');
          await db.run('DELETE FROM locked_audit_records WHERE facility_id=? AND year=? AND quarter=?', [facility, year, quarter]);

          const { sanitizeCode, canonicalInsuranceCategory } = require('../engine/kpi-calculator');
          function sqlLiteral(str) { return str ? str.replace(/'/g, "''") : ''; }
          
          const mappings = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type = 'Insurance'");
          const insuranceCases = mappings.map(m => {
            const code = sanitizeCode(m.code);
            const group = m.group_name ? m.group_name.trim() : 'Commercial';
            if (!code || !group) return null;
            return \\\WHEN UPPER(TRIM(COALESCE(s.insurance_type, ''))) = '\\\' THEN '\\\'\\\;
          }).filter(Boolean).join(' ');
          const rcmCaseSql = \\\CASE \\\ WHEN UPPER(TRIM(COALESCE(s.insurance_type, ''))) = '' THEN 'Self-Pay' ELSE 'Commercial' END\\\;
          
          const physicianMappings = await db.all("SELECT code, group_name FROM code_mappings WHERE mapping_type IN ('Physician_Type', 'Physician_Role')");
          const physCases = physicianMappings.map(m => {
            const code = sanitizeCode(m.code);
            const group = m.group_name ? m.group_name.trim() : 'Other';
            if (!code || !group) return null;
            return \\\WHEN UPPER(TRIM(COALESCE(s.physician_type, e.physician_type))) = '\\\' THEN '\\\'\\\;
          }).filter(Boolean).join(' ');
          const physCaseSql = \\\CASE \\\ ELSE 'Other' END\\\;

          await db.run(\\\
            INSERT INTO locked_audit_records (
              facility_id, year, quarter, mrn, encounter_date,
              patient_age, patient_age_months, gender, is_palliative, patient_refused,
              phq2_result, phq9_score, phq9_date, phq9_followup_date, phq9_followup_score, depression_dx_date, followup_within_30d,
              foot_exam_done, eye_exam_done, nephropathy_exam_done, lipid_profile_done, egfr_value, egfr_date, uacr_done, bmi,
              bp_systolic, bp_diastolic, bp_date, autism_screened, asthma_controller_count, asthma_reliever_count, wait_time_mins, appointment_wait_days, hba1c_value, hba1c_date,
              patient_dob, month, visit_type, physician_type, physician_category, icd10_primary, icd10_secondary, icd10_all, cpt_all,
              insurance_category, is_thiqa, is_abm_mandate
            )
            SELECT 
              e.facility_id, e.year, e.quarter, e.mrn, e.encounter_date,
              e.patient_age, e.patient_age_months, e.gender, e.is_palliative, e.patient_refused,
              e.phq2_result, e.phq9_score, e.phq9_date, e.phq9_followup_date, e.phq9_followup_score, e.depression_dx_date, e.followup_within_30d,
              e.foot_exam_done, e.eye_exam_done, e.nephropathy_exam_done, e.lipid_profile_done, e.egfr_value, e.egfr_date, e.uacr_done, e.bmi,
              e.bp_systolic, e.bp_diastolic, e.bp_date, e.autism_screened, e.asthma_controller_count, e.asthma_reliever_count, e.wait_time_mins, e.appointment_wait_days,
              COALESCE(e.hba1c_value, s.hba1c_value) as hba1c_value, e.hba1c_date,
              e.patient_dob, e.month, e.visit_type,
              COALESCE(s.physician_type, e.physician_type) as physician_type,
              (\\\) as physician_category,
              COALESCE(s.icd10_primary, e.icd10_primary) as icd10_primary,
              COALESCE(s.icd10_secondary, e.icd10_secondary) as icd10_secondary,
              COALESCE(s.icd10_all, e.icd10_all) as icd10_all,
              COALESCE(s.cpt_all, e.cpt_all) as cpt_all,
              (\\\) as insurance_category,
              CASE WHEN (\\\) = 'THIQA' THEN 1 ELSE 0 END as is_thiqa,
              CASE WHEN (\\\) = 'ABM_Mandate' THEN 1 ELSE 0 END as is_abm_mandate
            FROM emr_data e
            LEFT JOIN shafafiya_data s 
              ON e.facility_id = s.facility_id 
              AND e.mrn = s.mrn 
              AND e.encounter_date = s.encounter_date
            LEFT JOIN facilities fac ON fac.id = e.facility_id
            LEFT JOIN clinician_licenses cl 
              ON cl.license_number = COALESCE(s.physician_type, e.physician_type)
              AND cl.facility_mf_no = fac.mf_no
            WHERE e.facility_id = ? AND e.year = ? AND e.quarter = ?
          \\\, [facility, year, quarter]);
          
          await db.run('COMMIT');
          // --- END V2 AUTO-COMPILE STEP ---\;

code = code.replace(regex, replacement);
fs.writeFileSync('routes/kpi-engine.js', code);
