# ?? Clinical KPI Engine Rules & Formulas

This document details exactly how the mathematical heart of the application (`engine/kpi-calculator.js`) evaluates clinical data.

## ?? The Calculation Pipeline

When a user clicks **"Calculate KPIs"**, the backend executes the following steps:
1.  **Patient Resolution:** It joins the `emr_data` (Clinical) and `shafafiya_data` (Claims) tables by matching `mrn` and `encounter_date`. **If a claim does not have a matching EMR clinical record, it is entirely ignored by the engine.**
2.  **Target KPI Iteration:** It loops through every active KPI definition listed in `engine/kpi-definitions.js`.
3.  **Denominator Check:** It checks if the patient falls into the "Eligible Population" (e.g., Are they the right age? Did they have the right CPT/ICD-10 code during this quarter?).
4.  **Exclusion Check:** It runs the patient through `engine/exclusions.js`. If they have a terminal illness, refused treatment, or meet a specific exclusion criteria, they are removed from the Denominator.
5.  **Numerator Check:** It checks if the compliant action was taken (e.g., Was HbA1c < 8.0%? Was a foot exam completed?).
6.  **Scoring:** It divides Numerator by Denominator and saves it to the `kpi_results` database table.

*(Note: If the Denominator evaluates to 0, the system automatically awards a "Target Met" status, as requested by clinical rules).*

## ?? Global Exclusions

Patients matching any of the following criteria are automatically excluded from performance metrics (unless explicitly overridden by a specific KPI):
*   **Palliative Care:** (`is_palliative = 1` or ICD-10 `Z51.5`)
*   **Patient Refusal:** (`patient_refused = 1`)
*   **End-Stage Renal Disease (ESRD):** (ICD-10 `N18.6`)
*   **Dialysis/Kidney Transplant:** (ICD-10 `Z94.0`, `Z99.2`)

## ?? Specific KPI Logic

All specific KPI configurations (which ICD-10 code maps to which disease) are located in `engine/kpi-registry.js`. 
If DOH updates the rules next year, you only need to change the arrays in that file!

### Diabetes KPIs (PC009, PC010, PC011, etc.)
*   **Denominator:** Any patient aged 18-75 with a diagnosis of Diabetes (ICD-10 starting with `E10` or `E11`).
*   **PC009 Numerator:** Looks for an `hba1c_value` < 8.0%.
*   **PC011 Numerator:** Looks for an `eye_exam_done` flag.

### Cardiovascular KPIs (PC014, PC016, etc.)
*   **Denominator:** Patients 18-85 with Hypertension (ICD-10 starting with `I10`).
*   **PC014 Numerator:** Looks for `bp_systolic` < 140 AND `bp_diastolic` < 90.

### Asthma KPIs (PC027)
*   **Denominator:** Patients aged 5-60 with Persistent Asthma (ICD-10 `J45.40`).
*   **Numerator:** Checks the ratio of Controller medications to Reliever medications (`asthma_controller_count / asthma_reliever_count >= 0.5`).

## ?? Manual Overrides (Free Text)

Because doctors do not always use perfect structured fields in their EMR, the system possesses an NLP fallback.
If `hba1c_value` or `foot_exam_done` are blank, the engine will scan the free-text `clinical_notes` field for phrases like *"hba1c is 7.2"* or *"foot exam normal"* and automatically inject those values into the calculation.
