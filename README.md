# ?? DOH JAWDA KPI Dashboard

**Version:** 1.0.0
**Description:** A localized, fully offline Node.js/Express web application that reconciles EMR clinical data with RCM (Shafafiya) claims data to calculate Primary Care KPIs required by the UAE Department of Health (DOH).

---

## ?? Where to start? (Documentation Hub)

If you are coming back to this software after a long time, **start right here**. Depending on what you want to do, click on one of the dedicated playbooks below:

### 1. ?? I want to understand the Code, UI, and Buttons
**Go to:** [DEVELOPER_PLAYBOOK.md](./DEVELOPER_PLAYBOOK.md)
*Read this if you want to know:*
*   Which JavaScript file controls which screen.
*   How the SQLite database tables (`emr_data`, `shafafiya_data`) are structured.
*   How the Vite Frontend bundler works.
*   How to add a new button, tab, or API route.

### 2. ?? I want to understand the KPI Formulas & Rules
**Go to:** [CLINICAL_ENGINE.md](./CLINICAL_ENGINE.md)
*Read this if you want to know:*
*   Exactly how Numerators and Denominators are calculated.
*   Which ICD-10 and CPT codes trigger specific KPIs.
*   How patient exclusions (like ESRD, Palliative Care, or Patient Refusals) are handled.
*   How EMR data is matched to Claims data using `row_hash`.

---

## ?? Quickstart: How to run the application

If you just need to start the application on your computer, run these commands in your terminal:

**1. Install dependencies (First time only):**
```bash
npm install
```

**2. Build the UI (Any time you change CSS/JS files):**
```bash
npm run build
```

**3. Start the Server:**
```bash
npm start
```
*The application will now be running securely at: `http://localhost:3000`*

---

## ??? Tech Stack
*   **Backend:** Node.js, Express.js
*   **Database:** SQLite3 (Serverless, local `database/kpi_data.db`)
*   **Frontend:** Vanilla JavaScript (ES6 Modules), Bootstrap 5.3 (CSS Framework)
*   **Bundler:** Vite (Handles code-splitting and minification)
*   **Logging:** Pino (Outputs to `logs/application.log`)
