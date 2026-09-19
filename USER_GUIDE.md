# DOH JAWDA Primary Care KPI Dashboard
## Official User Guide & Technical Reference

Welcome to the DOH JAWDA KPI Dashboard. This tool is designed to automate the ingestion, calculation, and reporting of the Department of Health (Abu Dhabi) Muashir Quality Indicators.

### 1. Initial Setup
1. **Launch the Application**: Run `npm start` from your terminal. 
2. **Access the Dashboard**: Open `http://localhost:3000` in your web browser.
3. **Configure Facilities**: Go to the **Settings > Facilities** tab and ensure your medical center is registered with its exact DOH License Number (MF-XXXX).

### 2. Data Upload Process (The Import Pipeline)
To generate your KPI scores, you must supply raw billing and clinical data.
- **EMR Data**: Contains clinical measurements (HbA1c values, BP readings, Depression PHQ scores, etc).
- **Shafafiya Data (RCM)**: Contains the official insurance claims, CPT codes, and ICD-10 codes billed for the quarter.
- **How to Upload**: 
  1. Navigate to the **Data Import** tab.
  2. Select your Facility, Year, and Quarter.
  3. Upload the *EMR Template* and *Shafafiya Template* CSVs respectively.
  4. The system will automatically validate your files. **Note:** The NLP Extraction Engine will automatically scan free-text `Chief Complaints` and `Procedure Notes` to rescue missing HbA1c and Foot Exam data during this step.

### 3. Data Audit & Locking
Before calculations can run, the system must merge your clinical (EMR) and billing (RCM) data into a single source of truth.
1. Navigate to the **Data Audit** tab.
2. Review the Reconciliation Grid. If your EMR and RCM data match closely, click **Save & Lock Audit**.
3. *Important:* The engine will **not** calculate KPIs until the quarter is officially locked by an administrator.

### 4. KPI Calculation Logic
The engine adheres strictly to the 2026 DOH JAWDA spec:
- **Exclusions**: The engine automatically purges patients with ABM Mandates, Palliative Care flags, Pregnancy (O00-O9A), ESRD (for HTN metrics), and Steroid-Induced Diabetes (E09.x) from the denominator.
- **The "UAE Outpatient Rule" (PC009/PC010)**: If a specific HbA1c lab date is missing from your EMR export, the engine will safely fallback to the billing encounter date.
- **12-Month Lookback**: Metrics like Diabetic Foot Exams (PC011) and Nephropathy (PC013) scan the patient's entire 12-month history for relevant CPT II codes, not just the reporting quarter.
- **Zero Denominator Rule**: If a facility has 0 eligible patients for a metric, the system safely flips the status to **MET** to protect your compliance score.

### 5. Finalizing the JDC Export
At the end of the quarter, you must generate your Jawda Data Certification (JDC) Excel file.
1. Go to the **JDC Export** tab.
2. Click **Prepare Submission** to run the final completeness checks.
3. Provide CEO Sign-off.
4. Click **Download JDC Excel**. This file will contain the exact required sheets, audit trails, and certification statements required by the Abu Dhabi DOH portal.
