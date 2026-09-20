# DOH JAWDA KPI Dashboard — Version 2.0 Implementation Plan

**Project:** JAWDA Primary Care KPI Dashboard (Local Desktop App)
**Architecture:** Smart ETL Pipeline + Professional Navigation Restructure
**Status:** Planning Complete — Ready to Execute
**V1.0:** Fully Complete (see IMPLEMENTATION_PLAN_V1_ARCHIVE.md)

---

## 🗺️ Quick Progress Tracker

| Phase | Priority | Title | Status |
|-------|----------|-------|--------|
| Phase 1 | 🔴 CRITICAL | Database Schema Updates | `[x] Complete` |
| Phase 2 | 🔴 HIGH | Smart ETL Import Rewrite | `[x] Complete` |
| Phase 3 | 🔴 HIGH | KPI Engine — Remove Lock Gate + Async | `[x] Complete` |
| Phase 4 | 🔴 HIGH | Audit Route — New Vault APIs | `[x] Complete` |
| Phase 5 | 🟡 MEDIUM | Sidebar Navigation Restructure | `[x] Complete` |
| Phase 6 | 🔴 HIGH | Data Manager Frontend (New Module) | `[x] Complete` |
| Phase 7 | 🟡 MEDIUM | Fix Stale Messages — Dashboard & Proofs | `[x] Complete` |
| Phase 8 | 🟢 LOW | Settings Page Consolidation | `[x] Complete` |

> **Rule:** Complete phases in order. Never start a phase before the previous one is verified.
> **After every frontend change:** `npm run build`
> **After every backend change:** Restart Node server

---

## 🛑 V1.0 Deferred DevOps Tasks (Do NOT implement in V2.0 sprint)

These were skipped in V1.0 because they require server/cloud infrastructure the user does not have.

- [x] Create `.github/workflows/ci.yml` — Automated testing pipeline (requires GitHub Actions)
- [x] Automated daily database backup — Requires nssm or Windows Task Scheduler
- [x] Windows Service (nssm/PM2) + Auto-start on boot — Server deployment only
- [x] SSL certificates for local network HTTPS — Requires local certificate authority
- [x] Dynamic filter caching layer — Over-engineering for single local user

---

## Phase 1 — 🔴 CRITICAL: Database Schema Updates

**File:** `database/db.js`
**Why first:** Every other phase depends on these tables/columns existing. Phases 2, 3, and 6 will crash without them.
**Estimated effort:** 30 minutes
**Verification command:** `node -e "const {initDb}=require('./database/db'); initDb().then(()=>console.log('DB OK'))"`

### 1.1 — Add `job_queue` Table
- [x] Open `database/db.js` and locate the section where `CREATE TABLE IF NOT EXISTS` statements are grouped
- [x] Add the following table definition after the existing tables:
  ```sql
  CREATE TABLE IF NOT EXISTS job_queue (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT    NOT NULL DEFAULT 'calculate_kpi',
    payload     TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'pending',
    result      TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [x] **Verify:** `node -e "const {initDb}=require('./database/db'); initDb().then(db=>db.all('SELECT name FROM sqlite_master WHERE name=\"job_queue\"').then(r=>console.log(r)))"`
  Expected output: `[ { name: 'job_queue' } ]`

### 1.2 — Add New Columns to `import_batches` Table
- [x] In `database/db.js`, find the `CREATE TABLE IF NOT EXISTS import_batches` block
- [x] After the table creation, add these `ALTER TABLE` statements using safe IF NOT EXISTS pattern:
  ```javascript
  await db.run("ALTER TABLE import_batches ADD COLUMN replaced_count INTEGER DEFAULT 0").catch(()=>{});
  await db.run("ALTER TABLE import_batches ADD COLUMN skipped_count INTEGER DEFAULT 0").catch(()=>{});
  await db.run("ALTER TABLE import_batches ADD COLUMN quarters_json TEXT").catch(()=>{});
  ```
  Note: `.catch(()=>{})` is intentional — SQLite throws if column already exists. This is safe.
- [x] **Verify:** `node -e "const {initDb}=require('./database/db'); initDb().then(db=>db.all('PRAGMA table_info(import_batches)').then(r=>console.log(r.map(c=>c.name))))"`
  Expected output includes: `replaced_count`, `skipped_count`, `quarters_json`

### 1.3 — Verify Existing Indexes (Audit Only — No Changes Expected)
- [x] Confirm these indexes already exist (they were created in V1.0):
  - `idx_emr_facility_quarter` on `emr_data(facility_id, year, quarter)` ✅
  - `idx_shafafiya_facility_quarter` on `shafafiya_data(facility_id, year, quarter)` ✅
  - `idx_emr_audit_match` on `emr_data(facility_id, mrn, encounter_date)` ✅
  - `idx_shafafiya_audit_match` on `shafafiya_data(facility_id, mrn, encounter_date)` ✅
- [x] **Verify command:** `node -e "const {initDb}=require('./database/db'); initDb().then(db=>db.all('SELECT name FROM sqlite_master WHERE type=\"index\"').then(r=>console.log(r.map(x=>x.name))))"`

### ✅ Phase 1 Sign-Off Checklist
- [x] `job_queue` table exists with all 7 columns
- [x] `import_batches` has `replaced_count`, `skipped_count`, `quarters_json` columns
- [x] Server restarts without errors: `npm start`

---

## Phase 2 — 🔴 HIGH: Smart ETL Import Route Rewrite

**File:** `routes/import.js`
**Why second:** Fixes the silent data corruption bug where all rows in a multi-month CSV get tagged with the wrong quarter.
**Estimated effort:** 2–3 hours
**Dependency:** Phase 1 must be complete (needs new `import_batches` columns)

### 2.1 — Remove Manual Year/Quarter from Frontend Upload
**File:** `public/js/import.js`
- [x] Find the `uploadFile()` function (search for `formData.append('year'`)
- [x] Remove these two lines:
  ```javascript
  formData.append('year', App.state.year);
  formData.append('quarter', App.state.quarter);
  ```
- [x] Update the modal header text from `"Data Import — Q${App.state.quarter} ${App.state.year}"` to `"Data Import — Auto-Detect Quarter"`
- [x] Run `npm run build` after this change

### 2.2 — Remove Static Year/Quarter from Backend Parser
**File:** `routes/import.js`
- [x] Find the lines near the top of `processFile()` that read:
  ```javascript
  const yearNum = parseInt(req.body.year)
  const quarterNum = parseInt(req.body.quarter)
  ```
- [x] Remove both lines. They must no longer exist anywhere in the row-processing loop.

### 2.3 — Add Row-Level Auto-Partitioning to EMR Loop
**File:** `routes/import.js`
- [x] Update `router.post('/')`: Remove `year` and `quarter` from `req.body` and from the `INSERT INTO import_batches` statement
- [x] Remove the `UPDATE quarter_locks` query from the `router.post('/')` endpoint entirely

### 2.3 — EMR Loop: Add Row-Level Auto-Partitioning
**File:** `routes/import.js` (inside `processFile` -> `fileType === 'emr'` loop)
- [x] Remove the strict `if (rowYear !== year || rowQuarter !== quarter)` validation that throws an error
- [x] Replace with tracking logic:
  ```javascript
  if (rowYear < 2015 || rowYear > new Date().getUTCFullYear() + 1) { skippedCount++; continue; }
  quartersDetected.add(`${rowYear}-Q${rowQuarter}`);
  ```

### 2.4 — Shafafiya Loop: Add Row-Level Auto-Partitioning
**File:** `routes/import.js` (inside `processFile` -> `fileType === 'shafafiya'` loop)
- [x] Apply the exact same date checking and `quartersDetected.add` logic as above
- [x] Ensure `rowYear` and `rowQuarter` variables are bound dynamically in the `stmt.run()` INSERT query

### 2.5 — Add Mandatory Column Header Validation
**File:** `routes/import.js` (before the loops)
- [x] Add code to grab Excel headers: `const headers = Object.keys(data[0] || {}).map(h => h.toLowerCase().replace(/\s+/g,'_'));`
- [x] Add check: `const required = fileType === 'emr' ? ['mrn', 'encounter_date'] : ['mrn', 'encounter_date'];`
- [x] Throw error immediately if required headers are missing

### 2.6 — Add Counters and Tracking Variables
**File:** `routes/import.js`
- [x] Initialize `let insertedCount = 0; let replacedCount = 0; let skippedCount = 0;` at the start of `processFile`
- [x] Initialize `const quartersDetected = new Set();`

### 2.7 — Verify All SQL INSERTs use `INSERT OR REPLACE`
**File:** `routes/import.js`
- [x] Ensure both `emr_data` and `shafafiya_data` INSERT queries begin with `INSERT OR REPLACE INTO`
- [x] Track replacements: if `stmt.run()` returns `changes > 1`, increment `replacedCount`, else `insertedCount`

### 2.8 — Update Final Batch Record
**File:** `routes/import.js` (end of `processFile`)
- [x] Replace the final `UPDATE import_batches` query with:
  ```javascript
  await db.run(
    'UPDATE import_batches SET status=?, row_count=?, replaced_count=?, skipped_count=?, quarters_json=? WHERE id=?',
    ['done', insertedCount, replacedCount, skippedCount, JSON.stringify([...quartersDetected].sort()), batchId]
  );
  ```

### ✅ Phase 2 Sign-Off Checklist
- [x] Frontend no longer sends global year/quarter
- [x] Backend derives year/quarter from `parseExcelDate()` per row
- [x] Invalid dates or empty rows are skipped, not crashed
- [x] Replaced vs Inserted rows are tracked accurately
- [x] Upload a CSV with data spanning Jan–Jun. Run `SELECT year, quarter, COUNT(*) FROM emr_data GROUP BY year, quarter`. Confirm Q1 and Q2 rows appear with ZERO manual selection.
- [x] Upload same file again. Confirm row count does NOT double. Confirm `replaced_count > 0` in `import_batches`.
- [x] Upload a file missing the `MRN` column. Confirm a `400` error with helpful message — and 0 rows inserted.
- [x] Upload a file with 5 rows containing date `99/99/9999`. Confirm `skipped_count = 5` and valid rows still import.

---

## Phase 3 — 🔴 HIGH: KPI Engine — Remove Lock Gate + Async Jobs

**File:** `routes/kpi-engine.js`
**Why third:** Removes the confusing mandatory lock gate. Makes calculations non-blocking.
**Estimated effort:** 2 hours
**Dependency:** Phase 1 must be complete (needs `job_queue` table)

### 3.1 — Remove Hard Quarter Lock Check
**File:** `routes/kpi-engine.js`
- [x] Find the block inside `POST /calculate` that looks like:
  ```javascript
  const lockRow = await db.get('SELECT is_locked FROM quarter_locks WHERE ...');
  if (!lockRow || !lockRow.is_locked) {
    return res.status(403).json({ error: 'Data Audit is not locked!...' });
  }
  ```
- [x] Delete this entire block
- [x] Replace it with a soft data-existence check:
  ```javascript
  const emrCount = await db.get(
    'SELECT COUNT(*) as cnt FROM emr_data WHERE facility_id=? AND year=? AND quarter=?',
    [facility, year, quarter]
  );
  if (!emrCount || emrCount.cnt === 0) {
    return res.status(400).json({
      error: `No EMR data found for Q${quarter} ${year}. Please upload your data first via Data Manager.`
    });
  }
  ```

### 3.2 — Make `POST /calculate` Non-Blocking (Async Job Queue)
**File:** `routes/kpi-engine.js`
- [x] After the data-existence check, replace the synchronous engine call with:
  ```javascript
  // Insert job and respond immediately
  const job = await db.run(
    "INSERT INTO job_queue (type, payload, status) VALUES ('calculate_kpi', ?, 'pending')",
    [JSON.stringify({ facility_id: facility, year, quarter, version })]
  );
  const jobId = job.lastID;
  res.json({ success: true, job_id: jobId, status: 'processing' }); // Returns in < 100ms

  // Run engine in background — does NOT block the response above
  setImmediate(async () => {
    try {
      await db.run("UPDATE job_queue SET status='running', updated_at=CURRENT_TIMESTAMP WHERE id=?", [jobId]);
      const results = await engine.calculateAllKPIs(facility, year, quarter, version);
      await db.run("UPDATE job_queue SET status='done', result=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [JSON.stringify({ kpi_count: results.length }), jobId]);
    } catch (err) {
      await db.run("UPDATE job_queue SET status='error', result=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [JSON.stringify({ error: err.message }), jobId]);
    }
  });
  ```

### 3.3 — Add New `GET /job-status` Endpoint
**File:** `routes/kpi-engine.js`
- [x] Add this new route after the `/calculate` route:
  ```javascript
  router.get('/job-status', async (req, res) => {
    const jobId = parseInt(req.query.job_id);
    if (!jobId) return res.status(400).json({ error: 'job_id is required' });
    try {
      const db = await initDb();
      const job = await db.get('SELECT status, result, updated_at FROM job_queue WHERE id=?', [jobId]);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      res.json({ status: job.status, result: job.result ? JSON.parse(job.result) : null, updated_at: job.updated_at });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  ```

### 3.4 — Retain `toggle-lock` and `lock-status` as Optional
**File:** `routes/kpi-engine.js`
- [x] Do NOT remove the `POST /toggle-lock` or `GET /lock-status` endpoints
- [x] The lock becomes a soft "reviewed" marker — it no longer blocks calculation
- [x] No code change needed here — just confirm they still exist

### 3.5 — Fix "No-Data" Status Bug for Monitoring KPIs
**File:** `engine/kpi-calculator.js`
- [x] Find the status assignment logic in `calculateAllKPIs`: `} else if (value != null && kpi.target) {`
- [x] Change it to handle KPIs that don't have a target (e.g., PC023, PC024, PC025):
  ```javascript
        } else if (value != null) {
          if (!kpi.target) {
            status = 'monitor'; // For KPIs without a target
          } else if (kpi.target_dir === 'gte') {
            status = value >= kpi.target ? 'met' : (value >= kpi.target * 0.9 ? 'near' : 'not-met');
          } else {
            status = value <= kpi.target ? 'met' : (value <= kpi.target * 1.1 ? 'near' : 'not-met');
          }
        }
  ```

### ✅ Phase 3 Sign-Off Checklist
- [x] With data uploaded, click Calculate. Confirm a `{ job_id: N, status: 'processing' }` response arrives within **200ms**
- [x] Poll `GET /api/kpi/job-status?job_id=N` after 10 seconds. Confirm `status: 'done'`
- [x] While a calculation is running, switch to the Dashboard tab. Confirm it loads normally (proves non-blocking)
- [x] With NO data uploaded for a quarter, click Calculate. Confirm `"No EMR data found"` error message (not a 403 lock error)

---

## Phase 4 — 🔴 HIGH: Audit Route — New Data Vault APIs

**File:** `routes/audit.js`
**Why fourth:** The new frontend Data Manager (Phase 6) makes API calls to these endpoints. They must exist before building the UI.
**Estimated effort:** 2 hours
**Dependency:** Phases 1, 2 should be complete

### 4.1 — Add `GET /vault-summary` Endpoint
**File:** `routes/audit.js`
- [x] Add this new route:
  ```javascript
  router.get('/vault-summary', async (req, res) => {
    const facilityId = parseInt(req.query.facility_id);
    if (!facilityId) return res.status(400).json({ error: 'facility_id required' });
    try {
      const db = await initDb();
      const rows = await db.all(`
        SELECT
          e.year,
          e.quarter,
          COUNT(e.id)  AS emr_count,
          COUNT(s.id)  AS rcm_count,
          SUM(CASE WHEN s.mrn IS NOT NULL THEN 1 ELSE 0 END) AS match_count,
          ROUND(SUM(CASE WHEN s.mrn IS NOT NULL THEN 1.0 ELSE 0 END) / COUNT(e.id) * 100, 1) AS match_rate,
          MAX(kr.calculated_at) AS last_calculated_at,
          MAX(ql.is_locked)     AS is_reviewed
        FROM emr_data e
        LEFT JOIN shafafiya_data s
          ON e.facility_id = s.facility_id AND e.mrn = s.mrn AND e.encounter_date = s.encounter_date
        LEFT JOIN kpi_results kr
          ON e.facility_id = kr.facility_id AND e.year = kr.year AND e.quarter = kr.quarter
        LEFT JOIN quarter_locks ql
          ON e.facility_id = ql.facility_id AND e.year = ql.year AND e.quarter = ql.quarter
        WHERE e.facility_id = ?
        GROUP BY e.year, e.quarter
        ORDER BY e.year DESC, e.quarter DESC
      `, [facilityId]);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  ```

### 4.2 — Add `GET /exceptions` Download Endpoint
**File:** `routes/audit.js`
- [x] Add this new route:
  ```javascript
  router.get('/exceptions', async (req, res) => {
    const facilityId = parseInt(req.query.facility_id);
    const year       = parseInt(req.query.year);
    const quarter    = parseInt(req.query.quarter);
    if (!facilityId || !year || !quarter) return res.status(400).json({ error: 'facility_id, year, quarter required' });
    try {
      const db = await initDb();
      const rows = await db.all(`
        SELECT e.mrn, e.encounter_date, e.icd10_primary, e.physician_type,
               'No Matching RCM Claim' AS reason
        FROM emr_data e
        WHERE e.facility_id=? AND e.year=? AND e.quarter=?
        AND NOT EXISTS (
          SELECT 1 FROM shafafiya_data s
          WHERE s.facility_id=e.facility_id AND s.mrn=e.mrn AND s.encounter_date=e.encounter_date
        )
        ORDER BY e.encounter_date
      `, [facilityId, year, quarter]);

      const headers = 'MRN,Encounter Date,ICD10 Primary,Physician Type,Reason\n';
      const csvBody = rows.map(r =>
        `${r.mrn},${r.encounter_date},${r.icd10_primary || ''},${r.physician_type || ''},${r.reason}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="exceptions_Q${quarter}_${year}.csv"`);
      res.send(headers + csvBody);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  ```

### 4.3 — Deprecate `GET /reconciliation`
**File:** `routes/audit.js`
- [x] Find `router.get('/reconciliation', ...)` and replace its handler body with:
  ```javascript
  res.json({ deprecated: true, message: 'This endpoint is deprecated in V2.0. Use /vault-summary or /exceptions instead.' });
  ```

### 4.4 — Deprecate `GET /monthly`
**File:** `routes/audit.js`
- [x] Find `router.get('/monthly', ...)` and replace its handler body with:
  ```javascript
  res.json({ deprecated: true, message: 'This endpoint is deprecated in V2.0. Use /vault-summary instead.' });
  ```

### 4.5 — Retain These Endpoints Unchanged
- [x] `GET /summary` — Still used by `dashboard.js`. **Do not touch.**
- [x] `GET /batches` — Still needed. **Do not touch.**
- [x] `GET /download-gaps` — Retain (similar to /exceptions but kept for backward compat)

### ✅ Phase 4 Sign-Off Checklist
- [x] `GET /api/audit/vault-summary?facility_id=1` returns an array of quarter objects with `emr_count`, `rcm_count`, `match_rate`
- [x] `GET /api/audit/exceptions?facility_id=1&year=2026&quarter=1` downloads a valid CSV file
- [x] `GET /api/audit/reconciliation` returns `{ deprecated: true }` — not raw data
- [x] `GET /api/audit/monthly` returns `{ deprecated: true }` — not raw data
- [x] `GET /api/audit/summary` still works normally (used by Dashboard)

---

## Phase 5 — 🟡 MEDIUM: Sidebar Navigation Restructure

**Files:** `public/index.html`, `public/js/app.js`
**Why fifth:** Must create the new `data-manager` route before Phase 6 builds the module.
**Estimated effort:** 1 hour
**Dependency:** Phase 6 route name (`data-manager`) must be decided — it is `data-manager`

### 5.1 — Redesign Sidebar HTML
**File:** `public/index.html`
- [x] Replace the entire sidebar `<div class="nav flex-column px-2">` content with:
  ```html
  <div class="nav flex-column px-2">

    <div class="text-uppercase text-muted small fw-bold mb-2 px-3">Clinical Dashboard</div>
    <a href="#" class="nav-link nav-btn active" data-page="dashboard">
      <i class="bi bi-grid-1x2"></i> KPI Overview
    </a>
    <a href="#" class="nav-link nav-btn" data-page="proofs">
      <i class="bi bi-calculator"></i> KPI Drill-Down
    </a>
    <a href="#" class="nav-link nav-btn" data-page="reports">
      <i class="bi bi-file-earmark-pdf"></i> Quarterly Report
    </a>

    <div class="text-uppercase text-muted small fw-bold mb-2 mt-4 px-3">Data Management</div>
    <a href="#" class="nav-link nav-btn" data-page="data-manager">
      <i class="bi bi-database-check"></i> Data Manager
    </a>
    <a href="#" class="nav-link nav-btn" data-page="manual">
      <i class="bi bi-pencil-square"></i> Manual Override
    </a>

    <div class="text-uppercase text-muted small fw-bold mb-2 mt-4 px-3">Export & Submission</div>
    <a href="#" class="nav-link nav-btn" data-page="jdc">
      <i class="bi bi-file-earmark-spreadsheet"></i> JDC Export
    </a>
    <a href="#" class="nav-link nav-btn" data-page="comparison">
      <i class="bi bi-bar-chart-steps"></i> Multi-Period View
    </a>

    <div class="text-uppercase text-muted small fw-bold mb-2 mt-4 px-3">Administration</div>
    <a href="#" class="nav-link nav-btn" data-page="facilities">
      <i class="bi bi-hospital"></i> Facilities
    </a>
    <a href="#" class="nav-link nav-btn" data-page="settings">
      <i class="bi bi-gear"></i> Settings
    </a>

  </div>
  ```

### 5.2 — Add Data Manager Route Array
**File:** `public/js/app.js`
- [x] Find `['dashboard', 'import', 'audit', 'manual', 'reports', 'jdc'].includes(page)`
- [x] Change it to: `['dashboard', 'data-manager', 'manual', 'reports', 'jdc', 'proofs'].includes(page)`

### 5.3 — Update Navigation Mapping
**File:** `public/js/app.js`
- [x] In the `const routeMap = { ... }` block, add:
  ```javascript
  'data-manager': () => import('./data-manager.js').then(m => window.DataManager.render(content)),
  'settings': () => import('./settings.js').then(m => m.Settings.render(content, 'guidelines')),
  ```
  'settings-dicts':     () => import('./settings.js').then(m => m.Settings.render(content, 'dicts')),
  ```
- [x] Run `npm run build`

### ✅ Phase 5 Sign-Off Checklist
- [x] Sidebar shows exactly 4 groups: "Clinical Dashboard", "Data Management", "Export & Submission", "Administration"
- [x] Sidebar has exactly 9 nav items (down from 14)
- [x] Clicking each item loads the correct page without errors
- [x] "Data Manager" link works (even if the page shows empty — Phase 6 builds it)
- [x] "Settings" link loads the settings page with its tabs

---

## Phase 6 — 🔴 HIGH: Data Manager Frontend Module (New Combined Page)

**File:** `public/js/data-manager.js` *(CREATE NEW FILE)*
**Why sixth:** This is the biggest user-facing change. Replaces the old messy import + audit workflow with a professional 2-tab Data Manager.
**Estimated effort:** 4–6 hours
**Dependency:** Phases 1–5 must all be complete

### 6.1 — Create the Module File
- [x] Create `public/js/data-manager.js` with basic class structure:
  ```javascript
  export const DataManager = {
    state: { activeTab: 'upload', facilityId: null },
    async render(container) { ... },
    switchTab(tab, el) { ... }
  };
  window.DataManager = DataManager;
  ```

### 6.2 — Build the Page Shell with Two Sub-Tabs
- [x] The `render()` method outputs a tab bar: **"Upload Data"** and **"Data Vault"**
- [x] Default active tab: "Data Vault" (so users see their data status first)
- [x] Tab switching calls `switchTab(tab)` which renders the correct content below

### 6.3 — "Upload Data" Sub-Tab
- [x] Migrate upload form from `import.js`:
  - File input (`<input type="file" accept=".xlsx,.csv">`)
  - File type selector (EMR or Shafafiya/RCM) — keep this
  - Facility warning if no facility selected
  - **REMOVE** Year and Quarter dropdowns
  - Upload button that calls `POST /api/import`
- [x] Upload progress: after POST, poll `GET /api/import/status/:batchId` every 2 seconds
- [x] On completion: show summary toast: `"Upload complete. 14,800 rows inserted. 200 duplicates updated. 5 rows skipped (bad dates). Quarters detected: Q1 2026, Q2 2026"`
- [x] Auto-switch to Data Vault tab after successful upload
- [x] Upload history table with columns: `File Name | File Type | Quarters Detected | Inserted | Updated | Skipped | Date | Actions`
- [x] Keep Delete batch button (calls `DELETE /api/import/:batchId`)

### 6.4 — "Data Vault" Sub-Tab
- [x] Call `GET /api/audit/vault-summary?facility_id=X` on load
- [x] If no quarters found: show empty state card: `"No data uploaded yet. Go to Upload Data tab to get started."`
- [x] For each quarter in the response, render a card:
  ```
  ┌─────────────────────────────────────────────────────────┐
  │  📅 Q1 2026 (Jan – Mar)                   ✅ Excellent  │
  │  ─────────────────────────────────────────────────────  │
  │  EMR Records: 15,000   RCM Claims: 14,800              │
  │  ■■■■■■■■■■░  98.6% Match Rate                         │
  │  Last Calculated: Sep 15, 2026                          │
  │  ─────────────────────────────────────────────────────  │
  │  [⬇ Download Exceptions]  [✓ Mark Reviewed]  [▶ Calculate] │
  └─────────────────────────────────────────────────────────┘
  ```
- [x] Match rate badge color logic:
  - `>= 95%` → `bg-success` + text "Excellent"
  - `80–94%` → `bg-warning text-dark` + text "Review Recommended"
  - `< 80%` → `bg-danger` + text "Action Required"
- [x] "Calculate KPIs" button: calls the async job flow (see 6.5)

### 6.5 — Implement Async `calculateKPIs(year, quarter)` Method
- [x] On button click:
  1. Disable the card's Calculate button. Show spinner icon.
  2. `POST /api/kpi/calculate` with `{ facility_id, year, quarter, version }`
  3. Receive `{ job_id }` (arrives within 100ms)
  4. Start polling: `setInterval(() => fetch('/api/kpi/job-status?job_id=X'), 3000)`
  5. When `status === 'done'`: stop polling, show green toast `"Q1 2026 KPIs calculated! 27 KPIs updated."`, reload vault summary to refresh the card
  6. When `status === 'error'`: stop polling, show red toast with the error message, re-enable Calculate button

### ✅ Phase 6 Sign-Off Checklist
- [x] "Data Manager" tab loads with two sub-tabs visible
- [x] Upload a CSV via the Upload tab — confirm the upload summary toast shows correct counts
- [x] After upload, confirm it auto-switches to Data Vault and shows the correct quarter card(s)
- [x] Verify match rate badge colors are correct (>95% green, 80-94% yellow, <80% red)
- [x] Click "Download Exceptions" — confirm a valid CSV downloads with unmatched rows only
- [x] Click "Calculate KPIs" — confirm the button shows a spinner, not a frozen screen
- [x] After calculation completes, confirm the card's "Last Calculated" date updates automatically
- [x] Verify other tabs (Dashboard, Proofs) remain interactive during calculation

---

## Phase 7 — 🟡 MEDIUM: Fix Stale Messages in Dashboard & Proofs

**Files:** `public/js/dashboard.js`, `public/js/proofs.js`
**Why seventh:** After V2, old messages telling users to "lock the quarter" in the Audit tab are wrong and confusing.
**Estimated effort:** 30 minutes
**Dependency:** Phase 6 must be complete (message references the new "Data Manager" tab)

### 7.1 — Fix the "No Data" Message in Dashboard
**File:** `public/js/dashboard.js`
- [x] Find the string: `"Go to the Data Audit tab, lock the quarter, and click Calculate KPIs"`
- [x] Replace with: `"Go to Data Manager, upload your data, then click Calculate KPIs."`
- [x] Run `npm run build`

### 7.2 — Remove Lock Button from Proofs Tab
**File:** `public/js/proofs.js`
- [x] Find the `toggleLock()` method and its associated UI button
- [x] Remove the button from the rendered HTML
- [x] Remove the `toggleLock()` method from the object
- [x] Keep ALL other proofs functionality: waterfall, claims drill-down, proof-mappings, KPI results table
- [x] Run `npm run build`

### ✅ Phase 7 Sign-Off Checklist
- [x] Open Dashboard with no KPI results. Confirm message says "Data Manager" (not "Data Audit" or "lock")
- [x] Open Proofs tab. Confirm there is NO lock/unlock button visible
- [x] Confirm lock functionality still works from the Data Vault "Mark Reviewed" toggle in Data Manager

---

## Phase 8 — 🟢 LOW: Settings Page Consolidation

**Files:** `public/js/settings.js`, `public/js/app.js`
**Why last:** Settings already works correctly. This is a sidebar polish only — pure cosmetic cleanup.
**Estimated effort:** 1 hour
**Dependency:** Phase 5 must be complete (sidebar already shows single "Settings" item)

### 8.1 — Confirm Settings Handles All 5 Tabs Internally
**File:** `public/js/settings.js`
- [x] Verify the `render(container, tab)` function handles these tab values: `guidelines`, `engine`, `clinical`, `dicts`, `database`
- [x] If any tab is missing or broken, fix it now

### 8.2 — Set Default Tab for Direct "Settings" Click
**File:** `public/js/settings.js`
- [x] If `tab` parameter is `undefined` or `'main'`, default to rendering the `'guidelines'` tab
- [x] This ensures clicking "Settings" in sidebar always shows something useful

### 8.3 — Update Route Map for Clean Settings Route
**File:** `public/js/app.js`
- [x] Ensure `'settings'` entry in routeMap renders `Settings.render(content, 'guidelines')` as default
- [x] Confirm all 5 old `settings-*` aliases still work (kept for backward compat in Phase 5)

### ✅ Phase 8 Sign-Off Checklist
- [x] Click "Settings" in sidebar. Confirm the Guidelines tab loads immediately
- [x] Click each of the 5 tabs (Guidelines, Engine Logic, KPI Mappings, DOH Dictionaries, Database Backup) — all load correctly
- [x] Database Backup tab still downloads the `.db` file correctly
- [x] Old URL-style `data-page="settings-database"` still works (backward compat)

---

## 📋 Final Full Sign-Off

Before closing V2.0 as complete:
- [x] All 8 phases are checked off
- [x] `npm test` passes with 0 failures
- [x] Server starts cleanly with `npm start` and no console errors
- [x] All 9 sidebar navigation items load without errors
- [x] Dashboard, Proofs, JDC, Reports, Comparison all work unchanged
- [x] Data Manager: Upload + Vault both work end-to-end
- [x] Update `README.md` to reflect the new navigation structure
- [x] Update `DEVELOPER_PLAYBOOK.md` with the new `data-manager.js` module
- [x] Archive this file as `IMPLEMENTATION_PLAN_V2_ARCHIVE.md`

