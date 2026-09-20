const fs = require('fs');

const planContent = \# JAWDA KPI Dashboard - Version 3.0 Implementation Plan
**Architecture:** Unified Report Center & Automated Data Extracts

---

## SECTION 1: Architecture Decision Record (WHY V3.0)

During the V2 migration, the heavy, browser-crashing "Data Audit" raw table was replaced with an aggregated "Data Vault". This drastically improved performance but orphaned the critical export features. V3.0 creates a dedicated, centralized "Report Center" in the sidebar to instantly generate compliance exports, gap analyses, and patient-level auditor proofs without cluttering the clinical dashboards.

---

## SECTION 2: Full Codebase Impact Map

| File | Change Type | Scope |
|------|-------------|-------|
| \\\public/index.html\\\ | MINOR MODIFY | Add "Report Center" to the sidebar navigation. |
| \\\public/js/app.js\\\ | MINOR MODIFY | Register the new \\\eport-center\\\ route. |
| \\\public/js/report-center.js\\\ | NEW FILE | Build the centralized UI for instant report generation. |
| \\\outes/reports.js\\\ | MINOR MODIFY | Verify and expose \\\/jawda-export\\\ endpoint. |
| \\\outes/audit.js\\\ | MODERATE MODIFY | Verify \\\/download-gaps\\\ and add new \\\/exceptions\\\ endpoint. |
| \\\outes/kpi-engine.js\\\ | MINOR MODIFY | Add new \\\/proofs/export\\\ endpoint for patient-level drill-downs. |

---

## SECTION 3: Phase 1 - The Unified Report Center UI
**Objective:** Create a dedicated sidebar tab for reporting and build the empty shell for the report cards.

### Task 1.1 - Update Sidebar Navigation
File: \\\public/index.html\\\
- [ ] Find the "Data Management" section in the sidebar.
- [ ] Add a new navigation link for "Report Center" (e.g., \\\<a href="#" class="nav-link nav-btn" data-page="report-center"><i class="bi bi-file-earmark-spreadsheet"></i> Report Center</a>\\\).

### Task 1.2 - Register the Route
File: \\\public/js/app.js\\\
- [ ] Import \\\ReportCenter\\\ from \\\./report-center.js\\\.
- [ ] Add \\\'report-center'\\\ to the routes switch statement in \\\loadPage()\\\.

### Task 1.3 - Build the UI Shell
File: \\\public/js/report-center.js\\\ (NEW)
- [ ] Create a standard module with a \\\ender(container)\\\ function.
- [ ] Add a page header: "Report Center - Instant Data Extracts".
- [ ] Create a responsive grid (using \\\col-md-6\\\ or \\\col-xl-4\\\) to hold the report cards (Jawda Export, Gap Analysis, Auditor Proofs, Exception Report).

---

## SECTION 4: Phase 2 - Restoring Core DOH & Gap Extracts
**Objective:** Wire up the existing backend export endpoints to the new UI.

### Task 2.1 - JAWDA Submission Export
File: \\\public/js/report-center.js\\\
- [ ] Add a card for "JAWDA DOH Submission Export".
- [ ] Include a button that triggers a download from \\\GET /api/reports/jawda-export?facility_id=X&year=Y&quarter=Z\\\.

### Task 2.2 - Revenue/EMR Gap Analysis
File: \\\public/js/report-center.js\\\
- [ ] Add a card for "Billing & EMR Gap Analysis".
- [ ] Include a button that triggers a download from \\\GET /api/audit/download-gaps?facility_id=X&year=Y&quarter=Z\\\.

---

## SECTION 5: Phase 3 - Patient-Level Auditor Proofs
**Objective:** Provide auditors with the exact MRNs of patients who failed or passed a specific KPI.

### Task 3.1 - Create the Backend Route
File: \\\outes/kpi-engine.js\\\
- [ ] Add a new route: \\\GET /proofs/export\\\.
- [ ] Accept query params: \\\acility_id\\\, \\\year\\\, \\\quarter\\\, \\\kpi_code\\\.
- [ ] Use the KPI engine's dynamic SQL to query \\\locked_audit_records\\\ for the specific KPI.
- [ ] Format the output as a CSV containing \\\MRN\\\, \\\Encounter Date\\\, \\\Physician Type\\\, and \\\Status\\\ (Numerator/Denominator).

### Task 3.2 - Wire up the UI
File: \\\public/js/report-center.js\\\
- [ ] Add an "Auditor Patient Proofs" card.
- [ ] Add a dropdown \\\<select>\\\ populated with the available KPI codes (PC004, PC009, etc.).
- [ ] Add an "Export Patient List" button that hits the new backend route and downloads the CSV.

---

## SECTION 6: Phase 4 - Data Quality & Exceptions
**Objective:** Allow coders to instantly download malformed or skipped rows.

### Task 4.1 - Create the Exceptions Endpoint
File: \\\outes/audit.js\\\
- [ ] Add a new route: \\\GET /exceptions\\\.
- [ ] Query \\\emr_data\\\ and \\\shafafiya_data\\\ for rows missing critical fields (e.g., empty dates, negative ages, invalid physicians).
- [ ] Export as CSV.

### Task 4.2 - Wire up the UI
File: \\\public/js/report-center.js\\\
- [ ] Add a "Data Quality Exceptions" card.
- [ ] Add a button to download the CSV.
\;

fs.writeFileSync('IMPLEMENTATION_PLAN.md', planContent);
