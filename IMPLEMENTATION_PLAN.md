# JAWDA KPI Dashboard - Version 3.0 Implementation Plan
**Architecture:** Unified Report Center & Automated Data Extracts

---

## SECTION 1: Architecture Decision Record (WHY V3.0)

During the V2 migration, the heavy, browser-crashing "Data Audit" raw table was replaced with an aggregated "Data Vault". This drastically improved performance but orphaned the critical export features. V3.0 creates a dedicated, centralized "Report Center" in the sidebar to instantly generate compliance exports, gap analyses, and patient-level auditor proofs without cluttering the clinical dashboards.

---

## SECTION 2: Full Codebase Impact Map

| File | Change Type | Scope |
|------|-------------|-------|
| `public/index.html` | MINOR MODIFY | Add "Report Center" to the sidebar navigation. ✅ Done |
| `public/js/app.js` | MINOR MODIFY | Register the new `report-center` route. ✅ Done |
| `public/js/report-center.js` | NEW FILE | Build the centralized UI for instant report generation. ✅ Done |
| `routes/reports.js` | MINOR MODIFY | Verify and expose `/jawda-export` endpoint. ✅ Done |
| `routes/audit.js` | MAJOR MODIFY | Add `/exceptions`, `/monthly-reconciliation` endpoints. ✅ Partial |
| `routes/kpi-engine.js` | MODERATE MODIFY | Add `/proofs/export` + write to `reconciliation_log` on KPI calc. ✅ Partial |
| `routes/import.js` | MODERATE MODIFY | Write EMR/RCM stats to `reconciliation_log` on every file upload. |
| `database/db.js` | MINOR MODIFY | Add `reconciliation_log` table schema. |

---

## SECTION 3: Phase 1 - The Unified Report Center UI
**Objective:** Create a dedicated sidebar tab for reporting and build the empty shell for the report cards.

### Task 1.1 - Update Sidebar Navigation
File: `public/index.html`
- [x] Find the "Data Management" section in the sidebar.
- [x] Add a new navigation link for "Report Center" (e.g., `<a href="#" class="nav-link nav-btn" data-page="report-center"><i class="bi bi-file-earmark-spreadsheet"></i> Report Center</a>`).

### Task 1.2 - Register the Route
File: `public/js/app.js`
- [x] Import `ReportCenter` from `./report-center.js`.
- [x] Add `'report-center'` to the routes switch statement in `loadPage()`.

### Task 1.3 - Build the UI Shell
File: `public/js/report-center.js` (NEW)
- [x] Create a standard module with a `render(container)` function.
- [x] Add a page header: "Report Center - Instant Data Extracts".
- [x] Create a responsive grid (using `col-md-6` or `col-xl-4`) to hold the report cards (Jawda Export, Gap Analysis, Auditor Proofs, Exception Report).

---

## SECTION 4: Phase 2 - Restoring Core DOH & Gap Extracts
**Objective:** Wire up the existing backend export endpoints to the new UI.

### Task 2.1 - JAWDA Submission Export
File: `public/js/report-center.js`
- [x] Add a card for "JAWDA DOH Submission Export".
- [x] Include a button that triggers a download from `GET /api/reports/jawda-export?facility_id=X&year=Y&quarter=Z`.

### Task 2.2 - Revenue/EMR Gap Analysis
File: `public/js/report-center.js`
- [x] Add a card for "Billing & EMR Gap Analysis".
- [x] Include a button that triggers a download from `GET /api/audit/download-gaps?facility_id=X&year=Y&quarter=Z`.

---

## SECTION 5: Phase 3 - Patient-Level Auditor Proofs
**Objective:** Provide auditors with the exact MRNs of patients who failed or passed a specific KPI.

### Task 3.1 - Create the Backend Route
File: `routes/kpi-engine.js`
- [x] Add a new route: `GET /proofs/export`.
- [x] Accept query params: `facility_id`, `year`, `quarter`, `kpi_code`.
- [x] Use the KPI engine's dynamic SQL to query `locked_audit_records` for the specific KPI.
- [x] Format the output as a CSV containing `MRN`, `Encounter Date`, `Physician Type`, and `Status` (Numerator/Denominator).

### Task 3.2 - Wire up the UI
File: `public/js/report-center.js`
- [x] Add an "Auditor Patient Proofs" card.
- [x] Add a dropdown `<select>` populated with the available KPI codes (PC004, PC009, etc.).
- [x] Add an "Export Patient List" button that hits the new backend route and downloads the CSV.

---

## SECTION 6: Phase 4 - Data Quality & Exceptions
**Objective:** Allow coders to instantly download malformed or skipped rows.

### Task 4.1 - Create the Exceptions Endpoint
File: `routes/audit.js`
- [x] Add a new route: `GET /exceptions`.
- [x] Query `emr_data` and `shafafiya_data` for rows missing critical fields (e.g., empty dates, negative ages, invalid physicians).
- [x] Export as CSV.

### Task 4.2 - Wire up the UI
File: `public/js/report-center.js`
- [x] Add a "Data Quality Exceptions" card.
- [x] Add a button to download the CSV.

---

## SECTION 7: Phase 5 - Monthly Reconciliation Table (Hybrid Architecture)

**Objective:** Display a live, month-by-month data reconciliation summary at the top of the Report Center with zero performance cost. Uses a permanent `reconciliation_log` cache table that is written to automatically at two key moments: file upload and KPI calculation.

### Architecture: Two-Trigger Write Model
```
Event 1: File Upload (routes/import.js)
  → Writes: unique_patients, emr_count, rcm_count, matched, unbilled,
            missing_notes, thiqa, abm, commercial, self_pay, last_import_at

Event 2: KPI Calculation (routes/kpi-engine.js)
  → Writes: jawda_eligible, excluded, last_kpi_calc_at

Report Center (report-center.js)
  → Reads from reconciliation_log ONLY — zero heavy queries, instant load
```

### Row Status Logic
| Status | Condition |
|:---|:---|
| 🟢 Fresh | last_import_at < 30 days AND last_kpi_calc_at exists |
| 🟡 Imported Only | last_import_at exists BUT last_kpi_calc_at is NULL |
| 🔴 Stale | last_import_at > 30 days ago |
| ⚫ No Data | No record exists for that month |

---

### Task 5.0 - Add reconciliation_log Table to Database Schema
File: `database/db.js`
- [ ] Add `reconciliation_log` table with columns:
  - `facility_id`, `year`, `month` (composite unique key)
  - EMR stats: `unique_patients`, `emr_count`
  - RCM stats: `rcm_count`
  - Match stats: `matched`, `match_pct`, `unbilled`, `missing_notes`
  - KPI stats: `jawda_eligible`, `excluded`
  - Insurance (RCM only): `thiqa`, `abm`, `commercial`, `self_pay`
  - Timestamps: `last_import_at`, `last_kpi_calc_at`
- [ ] Use `INSERT OR REPLACE` so rows are cleanly overwritten on each update.

### Task 5.1 - Write to reconciliation_log on File Upload
File: `routes/import.js`
- [ ] After each successful EMR/RCM file import, loop over the distinct months found in the uploaded data.
- [ ] For each distinct `(facility_id, year, month)`, run a grouped SQL query to calculate:
  - `unique_patients` — COUNT(DISTINCT mrn) from emr_data
  - `emr_count` — COUNT(*) from emr_data
  - `rcm_count` — COUNT(*) from shafafiya_data
  - `matched` — INNER JOIN on MRN + encounter_date
  - `unbilled` — emr NOT EXISTS in rcm
  - `missing_notes` — rcm NOT EXISTS in emr
  - `match_pct` — (matched / MAX(emr, rcm)) * 100
  - Insurance breakdown (thiqa, abm, commercial, self_pay) from shafafiya_data using code_mappings
- [ ] Write results to `reconciliation_log` with `last_import_at = NOW()`.
- [ ] Do NOT overwrite `jawda_eligible`, `excluded`, or `last_kpi_calc_at` — those belong to KPI calculation.

### Task 5.2 - Write to reconciliation_log on KPI Calculation
File: `routes/kpi-engine.js`
- [ ] After the `/calculate` background worker completes successfully for a quarter, loop over the 3 months of that quarter.
- [ ] For each month, query `locked_audit_records` to calculate:
  - `jawda_eligible` — COUNT where physician_category = 'PC_Valid'
  - `excluded` — COUNT where is_palliative=1 OR patient_refused=1 OR physician_category != 'PC_Valid'
- [ ] Update the existing `reconciliation_log` row with `last_kpi_calc_at = NOW()`.

### Task 5.3 - Add GET /monthly-reconciliation Endpoint
File: `routes/audit.js`
- [ ] Add a new ultra-fast route: `GET /monthly-reconciliation`.
- [ ] Accept `facility_id`, `year`, `quarter`.
- [ ] Simply query `SELECT * FROM reconciliation_log WHERE facility_id=? AND year=? AND month IN (?,?,?)`.
- [ ] Compute status badge per month (🟢 Fresh / 🟡 Imported Only / 🔴 Stale / ⚫ No Data).
- [ ] Return a JSON array of 3 month rows + a pre-calculated TOTAL row.

### Task 5.4 - Build the UI Table
File: `public/js/report-center.js`
- [ ] Add a full-width `<table class="table table-bordered table-hover">` at the very top of `render()`.
- [ ] Final columns: Status · Month · Unique Patients · EMR Visits · RCM Claims · Matched · Match % · Unbilled Visits · Missing Notes · JAWDA Eligible · Excluded · Thiqa · ABM · Commercial · Self-Pay.
- [ ] Apply colour-coded badges on Match % (🟢 ≥95%, 🟡 80–94%, 🔴 <80%) and Unbilled Visits (🔴 >100, 🟡 10–100, 🟢 <10).
- [ ] Show `—` for `jawda_eligible` and `excluded` if `last_kpi_calc_at` is NULL (not yet calculated).
- [ ] Show a loading spinner while the table fetches from the backend.
- [ ] Display a bold "TOTAL" summary row at the bottom.
- [ ] Show a "Last Refreshed" timestamp above the table.
- [ ] Add a `[ 📥 Export This Table ]` button that downloads the reconciliation summary as a CSV.
- [ ] Place the four existing export cards (JAWDA Export, Gap Analysis, Proofs, Exceptions) in a "Data Downloads" section directly below the table.
