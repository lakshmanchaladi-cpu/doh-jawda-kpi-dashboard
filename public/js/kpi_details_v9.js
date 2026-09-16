// Auto-generated from PC V9 PDF
const KPI_DETAILS_V9 = {
  "PC004": {
    "title": "Percentage of Patients Completing the PHQ-9 Within 24 Hours After a Positive PHQ-2 Result",
    "denominator": "All patients aged 18 (completed) years and older at the beginning of the reporting quarter who were screened positive on PHQ-2. THIQA Insurance patients must be identified separately. If multiple positive PHQ-2 screenings in the quarter, consider first one only.",
    "numerator": "Total number of unique patients from the denominator who completed PHQ-9 screening documentation within exactly 24 hours of positive PHQ-2.",
    "exclusions": [
      "Established diagnosis of depression prior to index encounter (ICD-10: F01.51, F32.x, F33.x, F34.1, F43.21, F43.23, F53, O90.6, O99.340-O99.345).",
      "Established diagnosis of bipolar disorder prior to index encounter (ICD-10: F31.10-F31.9).",
      "Patients with documented reason for not screening (patient refusal).",
      "Medical reasons: cognitive, functional, or motivational limitations; urgent/emergent situations.",
      "ABM Mandate encounters.",
      "Patients not assessed for vitals during the visit."
    ],
    "emr_resp": "Captures PHQ-2 score field (positive = score ≥3). Records precise PHQ2_DateTime and PHQ9_DateTime to validate the 24-hour rule. Confirms vitals were documented at visit.",
    "rcm_resp": "Validates face-to-face encounter with GP, Internal Medicine, or Family Medicine via CPT 99201-99215. Flags historical F32.x/F31.x diagnoses from prior claims. Identifies THIQA payer via DOH License codes (A001/D001)."
  },
  "PC005": {
    "title": "Percentage of Patients Diagnosed with Depression Who Have Follow-Up Visit Within 30 Days",
    "denominator": "All unique patients aged ≥18 years with positive PHQ-9 score (5-14) newly diagnosed with depression during the reporting quarter in the same primary care unit. ICD-10 depression codes: F01.51, F32.x, F33.x, F34.1, F34.81, F43.21, F43.23, F53, O90.6, O99.340-O99.345.",
    "numerator": "Total unique patients from denominator who had a first follow-up visit within 30 days of diagnosis in the same primary care unit/facility/network.",
    "exclusions": [
      "Patients with PHQ-9 score ≥15 — expected to be referred to Psychiatry.",
      "Established depression patients already diagnosed at another facility prior to index encounter.",
      "Patients with documented reason for not attending follow-up (patient refusal).",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Records PHQ-9 score (5-14 range triggers inclusion). Calculates time from diagnosis date to follow-up appointment date (≤30 days = numerator).",
    "rcm_resp": "Validates diagnosis codes F32.x, F33.x on claims. Confirms follow-up CPT encounter within 30-day window."
  },
  "PC009": {
    "title": "Diabetes: HbA1c Poor Control Rate (>9%) or No Test Result",
    "denominator": "Unique outpatients (≥18 to ≤75 years) with a diagnosis of diabetes during the quarter AND who had at least 2 outpatient visits within 9 months with a diagnosis of diabetes in the same primary care facility prior to the reporting quarter. Valid encounters: CPT 99201-99215 + ICD-10 E10, E11, E13, O24 series (Appendix B).",
    "numerator": "Patients whose most recent HbA1c level was >9.0% OR who had no HbA1c test result within 12 months prior to end of reporting quarter. HbA1c test: CPT 83036. Can be performed at same or different facility.",
    "exclusions": [
      "Gestational Diabetes (O24.410, O24.414, O24.415, O24.419, O24.420, O24.424, O24.425, O24.429, O24.430, O24.434, O24.435, O24.439).",
      "Patients with PCOS (E28.2).",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Extracts most recent HbA1c value and collection date. Calculates if within 12-month lookback window.",
    "rcm_resp": "Identifies diabetic cohort via DM_Inclusion ICD-10 codes (Appendix B: E10, E11, E13, O24 series). Verifies ≥2 valid primary care encounters in 9-month lookback."
  },
  "PC010": {
    "title": "Diabetes: HbA1c Good Control Rate (≤8.0%)",
    "denominator": "Same as PC009: unique outpatients (≥18 to ≤75 years) with diabetes AND ≥2 outpatient visits within 9 months prior to the reporting quarter.",
    "numerator": "Patients whose most recent HbA1c level was ≤8.0% within 12 months prior to end of reporting quarter. (V9 Change: target changed from ≤7.0% to ≤8.0%).",
    "exclusions": [
      "Gestational Diabetes (O24.4x series).",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Extracts most recent HbA1c value and date. Confirms ≤8.0% threshold.",
    "rcm_resp": "Same cohort identification as PC009. Verifies continuity of care visits."
  },
  "PC011": {
    "title": "Percentage of Diabetics Receiving Annual Foot Exams",
    "denominator": "Unique outpatients (≥18 to ≤75 years) with a diabetes diagnosis in the quarter AND ≥2 outpatient visits with diabetes diagnosis within 9 months prior in same facility.",
    "numerator": "Patients with a diabetic foot exam (skin, soft tissue, musculoskeletal, vascular, neurological — visual inspection + sensory exam or pulse exam) performed in the same facility or network within 12 months prior to end of reporting quarter. CPT: 2028F.",
    "exclusions": [
      "Gestational Diabetes (O24.4x series).",
      "Bilateral lower extremity amputations (Z89.411-Z89.519 series).",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Documents foot exam completion flag or date. Checks for CPT 2028F in clinical records.",
    "rcm_resp": "Validates diabetes diagnosis on claims (E10, E11, E13). Checks encounter frequency (≥2 in 9 months)."
  },
  "PC012": {
    "title": "Percentage of Diabetics Receiving Annual Eye Exams",
    "denominator": "Unique outpatients (≥18 to ≤75 years) with a diabetes diagnosis in the quarter AND ≥2 visits with diabetes in 9 months prior in same facility.",
    "numerator": "Patients with retinal/dilated eye exam by ophthalmologist or optometrist, or AI-interpreted fundus photography, within 12 months (quarter + 9 months prior). Retinal/Dilated CPT: 92134, 92132, 92133, 92136, 92242, 92265, 92270, 92283, 92284, 92285, 92230, 92235, 92260, 92499, 95060, 92240, 92250, 92227, 92228. Ophthalmology services: 92002, 92004, 92012, 92014, 92018, 92019. SERVICE CODE: 60.",
    "exclusions": [
      "Gestational Diabetes (O24.4x series).",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Records eye exam completion and date. Captures referral to ophthalmology/optometry.",
    "rcm_resp": "Validates eye exam CPT codes in claims from same or different facility within 12-month window."
  },
  "PC013": {
    "title": "Percentage of Diabetics Receiving Annual Nephropathy Exams",
    "denominator": "Unique outpatients (≥18 to ≤75 years) with a diabetes diagnosis in the quarter AND ≥2 visits with diabetes in 9 months prior in same facility.",
    "numerator": "Patients with nephropathy screening OR evidence of nephropathy within 12 months prior to end of quarter. Tests: Microalbumin (CPT 82043, 82044), Urine albumin (CPT 82042), Creatinine (CPT 82570, 82565). Documented nephropathy ICD-10 (N18.x) also qualifies.",
    "exclusions": [
      "Gestational Diabetes (O24.4x series).",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Records nephropathy lab test results (microalbumin, creatinine). Confirms tests performed within 12-month lookback.",
    "rcm_resp": "Validates CPT 82043, 82042, 82044, 82570, 82565 on claims. Checks evidence of nephropathy diagnosis codes (N18.x)."
  },
  "PC014": {
    "title": "Percentage of Patients with Controlled Hypertension (<130/80 mmHg)",
    "denominator": "Unique outpatients (≥18 to ≤85 years) with a diagnosis of essential hypertension (ICD-10: I10-I13) overlapping the measurement period AND ≥2 outpatient visits with hypertension diagnosis within 9 months prior in same facility.",
    "numerator": "Patients whose most recent blood pressure, performed in the same facility or network, was adequately controlled (systolic <130 mmHg AND diastolic <80 mmHg) during the reporting quarter.",
    "exclusions": [
      "End Stage Renal Disease (ESRD) — ICD-10: N18.6.",
      "Kidney transplant — ICD-10: T86.10-T86.19, Z94.0.",
      "Dialysis — CPT: 90935-90999 (all ESRD and dialysis services).",
      "Pregnancy (Appendix A, O00-O9A).",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Extracts most recent systolic and diastolic BP readings. Validates BP taken in same facility or network during reporting quarter.",
    "rcm_resp": "Identifies HTN cohort via ICD-10 I10-I13. Verifies ≥2 encounters in 9-month lookback. Flags ESRD/dialysis/transplant exclusions."
  },
  "PC016": {
    "title": "Percentage of Hypertensive Patients Receiving Annual Nephropathy Exams",
    "denominator": "Unique outpatients (≥18 to ≤85 years) with a hypertension diagnosis in the quarter AND ≥2 visits with hypertension diagnosis within 9 months prior in same facility. ICD-10: I10-I13.",
    "numerator": "Patients with nephropathy screening OR evidence of nephropathy exam performed within 12 months prior to end of reporting quarter. CPT: 82570, 82042, 82044, 82565 (creatinine/albumin tests).",
    "exclusions": [
      "ESRD (N18.6).",
      "Dialysis (CPT 90935-90999).",
      "Kidney transplant (T86.10-T86.19, Z94.0).",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Records nephropathy screening results and dates for hypertensive patients.",
    "rcm_resp": "Validates HTN ICD-10 on claims. Checks for nephropathy CPT codes in 12-month lookback from same or different facility."
  },
  "PC021": {
    "title": "Autism Screening in Children Between 18 to 24 Months",
    "denominator": "Total number of children (18 months to 24 months of age) with an outpatient visit during the reporting quarter. Age limit applies to visit in the reporting facility within the reporting quarter. CPT: 99201-99215 for the visit.",
    "numerator": "Children from the denominator who had screening for Autism using an evidence-based tool. ICD-10 CM: Z13.4. CPT: 96110. Performance met criteria: at least 1 screening up to 24 months of age.",
    "exclusions": [
      "Children with established Autism diagnosis prior to screening encounter — ICD-10: F84.0.",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Records autism screening tool completion and date (M-CHAT-R or equivalent). Confirms child age between 18-24 months at visit date.",
    "rcm_resp": "Validates CPT 96110 (developmental screening) on claims. Confirms Z13.4 as encounter diagnosis. Checks age from DOB in patient records."
  },
  "PC023": {
    "title": "Percentage of Patients with Poorly Controlled Hypertension (≥130 mmHg or ≥80 mmHg)",
    "denominator": "Same cohort as PC014: unique outpatients (≥18 to ≤85 years) with hypertension (I10-I13) AND ≥2 visits within 9 months prior in same facility.",
    "numerator": "Patients whose most recent 2 abnormal blood pressure readings in SEPARATE encounters, in the same facility or network, was (systolic ≥130 mmHg OR diastolic ≥80 mmHg) during the reporting quarter. If no BP recorded, patient is assumed \"not controlled\".",
    "exclusions": [
      "ESRD (N18.6).",
      "Dialysis (CPT 90935-90999).",
      "Kidney transplant (T86.10-T86.19, Z94.0).",
      "Pregnancy (Appendix A, O00-O9A).",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Tracks two most recent BP readings in separate encounters during the quarter. Applies \"assumed not controlled\" rule if no readings exist.",
    "rcm_resp": "Same HTN cohort as PC014. Validates separate encounter dates for the two required readings."
  },
  "PC024": {
    "title": "Percentage of High-Risk Patients (18+) Screened for Dyslipidemia",
    "denominator": "High-risk patients ≥18 years with ≥1 encounter in same facility during the quarter AND ≥1 encounter in 9 months prior. High-risk = Diabetes (Appendix B), Hypertension (I10-I13), Cardiovascular Disease (I20-I25), Obesity (E66 with BMI ≥30).",
    "numerator": "Patients who had a complete lipid profile (total cholesterol, TGs, HDL-C, LDL-C) within 12 months prior to end of reporting quarter. CPT: 80061 (lipid panel), 82465 (cholesterol total), 83718 (HDL), 84478 (triglycerides), 83721 (LDL).",
    "exclusions": [
      "Individuals with documented reason for not ordering (patient refusal).",
      "Individuals with limitation of insurance benefits.",
      "Patients previously diagnosed with dyslipidemia (ICD-10: E78 series) — new patients: diagnosed prior to first encounter; established patients: diagnosed prior to denominator timeframe or by another facility.",
      "Pregnancy during the reporting quarter (Appendix A, O00-O9A).",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Records lipid panel results and dates. Identifies high-risk patients by BMI, DM, HTN, and CVD diagnoses.",
    "rcm_resp": "Validates high-risk diagnosis codes (E10-E13, I10-I13, I20-I25, E66) on claims. Confirms lipid panel CPTs within 12-month window. Flags E78 exclusions."
  },
  "PC025": {
    "title": "Percentage of Adult Patients (18+) Who Are Overweight or Obese",
    "denominator": "Total unique adult patients (≥18 years) with at least one visit in the facility during the reporting quarter. Patient must be aged 18+ on date of visit. Face-to-face consultations included.",
    "numerator": "Adult patients with a documented BMI ≥25 performed in same facility or network. If no BMI recorded during the measurement period, patient is ASSUMED overweight or obese. If multiple visits, consider the visit with abnormal BMI (≥25).",
    "exclusions": [
      "Patients receiving palliative care at or prior to current encounter.",
      "Patients who are pregnant during the reporting period (Appendix A, O00-O9A).",
      "Patients refusing measurement of height/weight or follow-up.",
      "Urgent or emergent medical situations where treatment delay would jeopardize health.",
      "ABM Mandate encounters."
    ],
    "emr_resp": "Captures BMI value at each visit. Applies \"assumed overweight\" rule when no BMI documented. Uses encounter date to confirm age ≥18.",
    "rcm_resp": "Validates primary care face-to-face CPT encounter. Checks ICD-10 E66 for documented obesity. Cross-references pregnancy exclusions from Appendix A."
  }
};
