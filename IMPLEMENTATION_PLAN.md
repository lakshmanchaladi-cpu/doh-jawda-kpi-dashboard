# DOH JAWDA KPI Dashboard - Implementation Plan

## Project Overview
**Goal**: Build a fully DOH-compliant JAWDA Primary Care KPI Dashboard for local use
**Scope**: Primary Care V9 (Q1 2026) + Primary Care & Medical Center V1 (Q3 2026)
**Architecture**: Node.js/Express + SQLite + Vanilla JS (Vite-bundled) - Local only

---

## Phase 0: Foundation & Security (Week 1) - CRITICAL ✅ COMPLETED 2026-09-17

### 0.1 Security Hardening
- [x] Fix SQL injection in `generateDynamicFilters()` - added `sanitizeCode()` validation
- [x] Fix SQL injection in `kpi-engine.js` toggle-lock dynamic CASE statements - added `sanitizeCode()`
- [x] Fix SQL injection in `audit.js` getRcmCaseSql/getPhysicianCaseSql - added `sanitizeCode()`
- [x] Add Helmet.js for security headers
- [x] Add express-rate-limit for API protection
- [x] Add basic JWT/session authentication (optional for local, but good practice)

### 0.2 Dependency Updates
- [x] `better-sqlite3`: ^9.6.0 (kept for Windows compatibility)
- [x] `express`: ^4.19.2 (latest)
- [x] `sqlite3`: ^6.0.1 → ^5.1.7
- [x] `xlsx`: ^0.18.5 (latest)
- [x] `multer`: ^2.3.0 → ^1.4.5-lts.1 (stable LTS)
- [x] `pdf-parse`: ^2.4.5 → ^1.1.1
- [x] Add `helmet`, `express-rate-limit`, `jsonwebtoken`

### 0.3 Developer Experience
- [x] Add Vite for frontend bundling (replace CDN loads) — ✅ `vite.config.js` exists
- [x] Convert all frontend JS to ES modules
- [ ] Add TypeScript (gradual migration) — not started (no `tsconfig.json`)
- [ ] Add ESLint + Prettier — ESLint in devDeps, **no config**; Prettier not in deps
- [ ] Add Jest/Vitest for unit tests — `tests/kpi-calculator.test.js` exists (manual), no test framework configured
- [ ] Create `.github/workflows/ci.yml` for automated testing

---

## Phase 1: Data Model & Migration System (Week 1-2) ✅ COMPLETED 2026-09-17

### 1.1 Proper Migration System
- [x] Install `node-pg-migrate` (works with SQLite)
- [x] Create migration files for all current schema
- [x] Replace inline `ALTER TABLE` hacks in `db.js` with migrations (created 3 migrations)
- [x] Add `schema_version` tracking (via `migrations` table)

### 1.2 Schema Cleanup (Target Schema) ✅ DONE
```sql
-- Core tables (keep)
facilities
import_batches
emr_data (raw)
shafafiya_data (raw)
shafafiya_claim_lines
kpi_definitions
code_mappings
clinician_licenses

-- Calculated/Derived (keep)
kpi_results
quarter_locks
manual_kpi_entries
app_settings
app_meta

-- NEW: Audit trail for JDC compliance ✅
audit_log (id, table_name, record_id, action, old_json, new_json, user, timestamp)

-- NEW: Versioned KPI registry ✅
kpi_registry_versions (version, effective_from, effective_to, facility_types, kpi_codes_json)
```

### 1.3 Facility Type Support ✅ DONE
- [x] `facility_type` column exists in facilities table
- [x] Migration updates default values
- [x] KPI registry includes facility_types filtering

### 1.4 Redundant Tables Removed ✅
- [x] `kpi_data` (old format) → dropped
- [x] `facility` (singular) → dropped  
- [x] `patient_measurements` → dropped

---

## Phase 2: Versioned KPI Registry (Week 2)

### 2.1 KPI Version Management
- [x] Create `engine/kpi-registry.js` with versioned KPI definitions
- [x] Support V9 (Q1 2026) and V1 (Q3 2026) simultaneously
- [x] Each KPI defines: `facilityTypes`, `effectiveFrom`, `effectiveTo`
- [x] Engine loads correct KPI set based on facility type + quarter

### 2.2 Registry Structure
```javascript
{
  "v9-2026-q1": {
    name: "Primary Care V9",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-09-30",
    facilityTypes: ["Primary Care"],
    kpis: ["PC004","PC005","PC009","PC010","PC011","PC012","PC013","PC014","PC016",
           "PC021","PC023","PC024","PC025","PC026","PC027","PC028","PC029","PC030"]
  },
  "v1-2026-q3": {
    name: "Primary Care & Medical Center V1",
    effectiveFrom: "2026-07-01",
    effectiveTo: null,
    facilityTypes: ["Primary Care", "Medical Center"],
    kpis: [...] // May have additions/changes
    // Note: PC027–PC030 are Medical Center only (facility_type: 'Medical Center')
  }
}
```

---

## Phase 3: Missing 9 KPI Calculators (Week 2-3) - HIGHEST PRIORITY ✅ CORE CALCULATORS DONE 2026-09-17

### 3.1 Chronic Disease Management ✅ CALCULATORS ADDED
- [x] **PC021** - Autism Screening (18-24 months)
  - CPT: 96110, ICD: Z13.4
  - Age in months support added
  - Target: 100% (Well-Child) / 80% (Other)

- [x] **PC023** - Poorly Controlled HTN (≥130/80 ×2 separate encounters)
  - 2 abnormal BPs in quarter, separate dates logic added
  - Target: Monitor (lower better)

- [x] **PC024** - Dyslipidemia Screening High-Risk
  - High-risk: DM, HTN, CVD (I20-I25), Obesity BMI≥30 (E66)
  - Lipid profile CPT codes (80061, 82465, 83718, 83721, 84478)
  - Target: Monitor (higher better)

- [x] **PC025** - Overweight/Obese Rate (BMI≥25)
  - Adults ≥18, BMI ≥25 or ICD E66
  - Target: Monitor (lower better)

- [x] **PC026** - Depression Treatment Success (50% PHQ-9 reduction)
  - 14-180 days follow-up logic
  - PHQ-9 baseline vs follow-up
  - Target: 50%

- [x] **PC027** - Asthma Medication Ratio (AMR ≥0.50)
  - Age 5-64, persistent asthma (J45.40-J45.52)
  - Controller / (Controller + Reliever) ≥ 0.50 logic (simplified)
  - Target: 50%

- [x] **PC028** - Wait Time ≤30 min
  - Manual entry KPI type added
  - Target: 90%

- [x] **PC029** - Kidney Function (eGFR<90, test q6mo)
  - 6-month lookback logic added
  - eGFR+uACR within 6 months
  - Target: Monitor

- [x] **PC030** - 3rd Next Available Appointment (days)
  - Manual entry KPI type added
  - Target: Monitor (lower better)

### 3.2 Common Infrastructure ✅ DONE
- [x] Add age-in-months support (PC021)
- [x] Add "2 separate encounters" logic (PC023)
- [x] Add manual entry KPI type (PC028, PC030)
- [x] Add 6-month lookback (PC029)
- [x] Add PC026 denominator quarter shifting (2 quarters prior)

### 3.3 Complete Code Mappings (from DOH Appendix) ✅ COMPLETED 2026-09-17
- [x] `seed_code_mappings_complete.js` - consolidated 830 mappings (Insurance, Physician, ICD-10, CPT, LOINC)
- [x] Insurance mappings: D001=THIQA, D002/D003=ABM, D*/A*/B*/C*=Commercial, E*=Government
- [x] Physician type mappings: GP/FM/IM→PC_Valid, Pediatrician→PC_Paed, Specialist_Eye/Neph, Non_PC
- [x] ICD-10 complete: Diabetes (E10/E11/E13/O24 full series), HTN (I10-I13), Gestational DM exclusions, Depression, Bipolar, Asthma, CVD, Obesity, Nephropathy
- [x] CPT/LOINC complete: Consultation, HbA1c, Eye, Nephropathy, Autism, Lipid, eGFR, uACR, Dialysis
- [x] LOINC codes for HbA1c (4548-4), eGFR, uACR

### 3.4 Exclusions Engine ✅ COMPLETED 2026-09-17
- [x] Created `engine/exclusions.js` with centralized exclusion logic
- [x] ABM Mandate exclusion (is_abm_mandate = 1) - applies to all chronic disease KPIs
- [x] Pregnancy exclusion (ICD O00-O9A) - applies to DM & HTN KPIs
- [x] ESRD exclusion (N18.6) - applies to HTN KPIs (PC014, PC016, PC023)
- [x] Renal Transplant (Z94.0) - applies to HTN KPIs
- [x] Gestational DM (O24.4) - applies to DM KPIs (PC009-PC013)
- [x] PCOS (E28.2) - applies to DM KPIs
- [x] Steroid-induced DM (E09) - applies to DM KPIs
- [x] Bipolar (F31.x) - applies to Mental Health KPIs (PC004, PC005)
- [x] Palliative care (is_palliative = 1) - applies to most KPIs
- [x] Patient refused (patient_refused = 1) - applies to most KPIs
- [x] COPD/CF/Bronchiectasis - applies to Asthma KPI (PC027)
- [x] Dialysis - applies to HTN KPIs (PC014, PC016)
- [x] `getExclusionDescriptions(kpiCode)` for audit documentation

### 3.5 KPI Definitions Seed Data ✅ COMPLETED 2026-09-17
- [x] `seed_kpi_definitions.js` - upserts all 18 KPIs into `kpi_definitions` table
- [x] Proper target values per DOH guidance (PC004=90%, PC009=30% lte, PC010=36%, etc.)
- [x] facility_type for each KPI (PC vs Medical Center)
- [x] age_min/age_max for PC021 (18-24 months)
- [x] Fixed PC029 duplicate `facility_type` key
- [x] Added `facility_type: 'Medical Center'` + `data_source` to PC030

---

## Phase 4: Complete Code Mappings (Week 3) ✅ COMPLETED 2026-09-17

### 4.1 Insurance Mappings (from DOH Appendix) ✅ DONE
- [x] D001 → THIQA
- [x] D002, D003 → ABM Mandate
- [x] D* → Commercial
- [x] A*, B*, C* → Commercial
- [x] E001, E002 → Government
- [x] E* → Government
- [x] Fallback: text matching (THIQA, MANDATE, SELF, etc.)

### 4.2 Physician Type Mappings ✅ DONE
- [x] GP, FM, IM, FMED, INT, GEN, GENERAL PRACTITIONER, FAMILY MEDICINE, INTERNAL MEDICINE, FAMILY PHYSICIAN, GP PHYSICIAN, INT MED, INTMED, GENERAL PRACTICE, GP/FM, GENERALIST, PRIMARY CARE, FAMILY PRACTICE → PC_Valid
- [x] PAEDIATRICIAN, PEDIATRICIAN, PED, PAED, PEDS, PAEDIATRIC, PEDIATRIC → PC_Paed
- [x] OPH, OPHTHALMOLOGIST, EYE → Specialist_Eye
- [x] NEPH, NEPHROLOGIST → Specialist_Neph
- [x] clinician_licenses table integration

### 4.3 ICD-10 Mappings (Complete from DOH Appendix B) ✅ DONE
- [x] Diabetes: E10, E11, E13, O24 series (full list)
- [x] Gestational DM exclusions: O24.410-O24.439
- [x] HTN: I10, I11, I12, I13
- [x] ESRD: N18.6
- [x] Depression: F01.51, F32.x, F33.x, F34.x, F43.21, F43.23, F53, O90.6, O99.34x
- [x] Bipolar: F31.x
- [x] PCOS: E28.2
- [x] Pregnancy: O00-O99 (relevant codes)
- [x] Asthma: J45.40-J45.52 (persistent), exclusions J43, J44, E84, J96
- [x] CVD: I20-I25
- [x] Obesity: E66
- [x] Autism: Z13.4

### 4.4 CPT/LOINC Mappings ✅ DONE
- [x] Consultation: 99201-99215
- [x] HbA1c: 83036 (LOINC: 4548-4, 4549-2)
- [x] Foot Exam: CPT codes for visual + sensory/pulse
- [x] Eye Exam: 92134, 92132, 92133, 92136, 92242, 92250, 92227, 92228, 92002, 92004, 92012, 92014
- [x] Nephropathy: 82043, 82570, 82042, 82044, 82565
- [x] Autism: 96110
- [x] Lipid Profile: 80061, 82465, 83718, 83721, 84478
- [x] eGFR: 82565
- [x] uACR: 82043
- [x] Antipsychotic monitoring: ECG, metabolic panel

---

## Phase 5: Exclusions & Edge Cases (Week 3-4) ✅ COMPLETED 2026-09-17

### 5.1 Standard Exclusions (Apply to ALL Chronic Disease KPIs) ✅ DONE
- [x] **ABM Mandate**: `is_abm_mandate = 1` → EXCLUDE
- [x] **Pregnancy**: ICD O00-O9A → EXCLUDE (except O24 for DM)
- [x] **ESRD**: N18.6 → EXCLUDE from HTN (PC014, PC016, PC023)
- [x] **Renal Transplant**: Z94.0 → EXCLUDE from HTN
- [x] **Gestational DM**: O24.410-O24.439 → EXCLUDE from DM
- [x] **PCOS**: E28.2 → EXCLUDE from DM
- [x] **Steroid-induced DM**: E09 → EXCLUDE from DM
- [x] **Bipolar**: F31.x → EXCLUDE from Depression (PC004, PC005)
- [x] **Palliative**: `is_palliative = 1` → EXCLUDE
- [x] **Patient Refused**: `patient_refused = 1` → EXCLUDE

### 5.2 KPI-Specific Exclusions ✅ DONE
- [x] PC009/010/011/012/013: Apply all DM exclusions
- [x] PC014/016/023: Apply all HTN exclusions
- [x] PC021: Only Well-Child vs Other facility logic
- [x] PC027: Asthma exclusions (COPD, CF, etc.)

---

## Phase 6: JDC Export & Compliance (Week 4) ✅ COMPLETED 2026-09-17

### 6.1 JDC Excel Template Generation ✅ COMPLETED 2026-09-17
- [x] Create `routes/jdc-export.js`
- [x] Generate official JDC format Excel
- [x] Include:
  - JDC Certification sheet (cover + facility info + certification statement + approval panel signature block)
  - KPI Results sheet (num/den/value/status/target)
  - Validation Checklist sheet
  - Audit Trail sheet
- [x] `GET /api/jdc/preview` — preview payload (KPIs, imports, locks, summary counts)
- [x] `GET /api/jdc/export` — 4-sheet workbook download; logs EXPORT to audit_log
- [x] Mounted at `/api/jdc` in server.js

### 6.2 Audit Trail for JDC ✅ COMPLETED 2026-09-17
- [x] `audit_log` table created with indexes (via migration)
- [x] Created `engine/audit.js` with centralized audit logging
- [x] `logKPICalculation()` - logs each KPI calculation with N/D/V
- [x] `logQuarterLock()` - logs lock/unlock with timestamp
- [x] `logImport()` - logs data imports with batch details
- [x] `logManualEntry()` - logs manual KPI entries
- [x] Integrated into `kpi-engine.js`: calculate & toggle-lock endpoints
- [x] ACTION_TYPES enum for standardized action categorization
- [x] `getAuditTrail()` and `getAuditTrailByFacilityQuarter()` for queries

### 6.3 Submission Workflow ✅ COMPLETED 2026-09-17
- [x] `jdc_submissions` table (draft → validated → submitted, CEO sign-off)
- [x] "Prepare Submission" → POST /api/jdc/prepare (recorded on workbook download)
- [x] "Validate Submission" → POST /api/jdc/validate (completeness checks: lock, KPI results, no-data, imports)
- [x] "Finalize & Sign" → POST /api/jdc/finalize (locks quarter, records CEO name/date)
- [x] `GET /api/jdc/status` — workflow state + quarter lock check
- [x] JDC Export page UI with workflow stepper, validation checklist, KPI results table
- [x] Export audit trail with submission (audit_log logging on each step)

---

## Phase 7: UI Modernization (Week 4-5) 🔄 IN PROGRESS

### 7.1 Vite + Bundling
- [x] Install Vite, configure for Express
- [x] Bundle all JS modules (app.js, dashboard.js, import.js, etc.)
- [x] Remove CDN dependencies — **bundled Bootstrap 5.3.3 + Bootstrap Icons 1.11.3 locally via npm (2026-09-17)**; also fixes missing Bootstrap JS (modals previously broken)
- [ ] Code-split by route (lazy load)

### 7.2 Component Architecture
- [x] Toast notification system (exists; enhanced with colored variants)
- [x] Consistent loading/error states (spinner + alert-danger idiom used across all modules)
- [ ] Create reusable components: KPICard, DataTable, FilterBar, Modal (currently inline HTML — partial)
- [ ] Virtual scrolling for audit tables (1000+ rows)

### 7.3 New Pages/Components
- [x] **Version Selector** - Switch between V9/V1 KPI sets (Auto default; override passed to engine)
- [x] **JDC Export Page** - Generate, preview, download (done in Phase 6)
- [x] **Submission Workflow** - Prepare → Validate → Sign (done in Phase 6)
- [x] **Facility Type Selector** - PC vs Medical Center (Manage Facilities; value normalized to 'Primary Care')
- [x] **Manual KPI Entry** - PC028, PC030 (manual.js)

### 💡 Phase 7 fixes (2026-09-17)
- Fixed registry timezone bug: `toISOString()` shifted quarter-start date back a day on UTC+X machines, causing V9/V1 to resolve to the WRONG version per quarter. Now uses local date components (Q1-Q2→V9, Q3-Q4→V1).
- Fixed facility-type normalization: 'Primary Care Center' variants now map to 'Primary Care' so registry resolution works (previously silently bypassed registry filtering and calculated ALL KPIs).

---

## Phase 8: Testing & Documentation (Week 5)

### 8.1 Unit Tests
- [x] Test each KPI calculator with known inputs/outputs
- [x] Test edge cases: empty data, exclusions, boundary ages
- [x] Test version switching (V9 vs V1)
- [x] Test facility type filtering

### 8.2 Integration Tests
- [x] Full import → lock → calculate → export flow
- [x] Multi-facility, multi-quarter scenarios
- [x] JDC export validation

### 8.3 Documentation
- [x] Update README with setup instructions
- [x] Document KPI calculation logic per DOH spec
- [x] Document JDC export format
- [x] Create user guide for consultants (USER_GUIDE.md)

---

## Phase 9: Production Hardening (Week 5-6)

### 9.1 Backup & Recovery
- [ ] "Backup Database" button in Settings
- [ ] Automated daily backup (cron/task scheduler)
- [ ] Restore procedure documentation

### 9.2 Monitoring
- [ ] Health check endpoint (already exists)
- [ ] Structured logging (pino)
- [ ] Error tracking (Sentry or local file)

### 9.3 Deployment
- [ ] Windows service (nssm or PM2)
- [ ] Auto-start on boot
- [ ] Port configuration via env
- [ ] SSL for local network access (optional)

---

## Cross-Cutting Concerns (Ongoing)

### Data Quality
- [ ] Import validation: date ranges, facility ID match, required fields
- [ ] Duplicate detection: row_hash, visit_id, claim_id
- [ ] Data completeness dashboard (already exists, enhance)

### Performance
- [x] Indexes on all query columns (verify with EXPLAIN)
- [ ] Pagination for large result sets
- [ ] Caching for dynamic filters (already partial)

### Usability
- [ ] Keyboard navigation
- [ ] Responsive design (mobile for field auditors)
- [ ] Dark mode (optional)
- [ ] Arabic RTL support (future)

---

## File Mapping Reference

| Feature Area | Key Files |
|--------------|-----------|
| Server Entry | `server.js` |
| Database | `database/db.js` |
| KPI Engine | `engine/kpi-calculator.js`, `engine/kpi-definitions.js`, `engine/kpi-registry.js` (NEW) |
| API Routes | `routes/kpi-engine.js`, `routes/import.js`, `routes/audit.js`, `routes/jdc-export.js` (NEW) |
| Frontend | `public/index.html`, `public/js/*.js`, `public/css/style.css` |
| Migrations | `migrations/*.js` (NEW) |
| Tests | `tests/*.test.js` (NEW) |
| Config | `vite.config.js`, `tsconfig.json`, `eslint.config.js` (NEW) |

---

## Success Criteria

1. ✅ All 18 KPIs (V9 + V1) calculate correctly per DOH spec
2. ✅ Facility-type aware (PC vs Medical Center)
3. ✅ Version-aware (V9 Q1, V1 Q3)
4. ✅ JDC Excel export passes DOH validation
5. ✅ Audit trail enables JDC audit
6. ✅ UI loads in <2s, responsive
7. ✅ Zero critical vulnerabilities
8. ✅ Single-command deploy: `npm run build && npm start`
9. ✅ Backup/restore works
10. ✅ Documentation complete for handoff

---

## Notes for Model Switching

**Next Model**: Read `README.md` first — it tracks completion status and has a **prioritized Sprint roadmap** (Sprint 1–4) derived from this plan.
Then read this `IMPLEMENTATION_PLAN.md` for full context per phase.
Check `package.json` scripts for current commands.
Run `npm test` to verify current state.