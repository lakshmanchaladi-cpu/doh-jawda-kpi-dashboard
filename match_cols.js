const sql = \
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
              physician_category,
              COALESCE(s.icd10_primary, e.icd10_primary) as icd10_primary,
              COALESCE(s.icd10_secondary, e.icd10_secondary) as icd10_secondary,
              COALESCE(s.icd10_all, e.icd10_all) as icd10_all,
              COALESCE(s.cpt_all, e.cpt_all) as cpt_all,
              insurance_category,
              CASE WHEN 1 THEN 1 ELSE 0 END as is_thiqa,
              CASE WHEN 1 THEN 1 ELSE 0 END as is_abm_mandate
\;

const insertPart = sql.split('SELECT')[0].split('(')[1].split(')')[0];
const selectPart = sql.split('SELECT')[1];

const insertCols = insertPart.split(',').map(s => s.trim().replace(/\n/g, ''));
const selectCols = selectPart.split(',').map(s => s.trim().replace(/\n/g, ''));

for (let i=0; i < Math.max(insertCols.length, selectCols.length); i++) {
  console.log(i + ': ' + (insertCols[i] || 'NONE') + ' <==> ' + (selectCols[i] || 'NONE').split('as').pop().trim());
}
