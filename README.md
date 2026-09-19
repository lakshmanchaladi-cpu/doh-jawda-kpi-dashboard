# DOH JAWDA KPI Dashboard

**Primary Care & Medical Center Quality Indicators for DOH Abu Dhabi JAWDA Program**

> **Status**: 🚧 **Active Development** - See [Implementation Plan](./IMPLEMENTATION_PLAN.md) for detailed roadmap

---

## Quick Start

```bash
# Install dependencies
npm install

# Development (with auto-reload)
npm run dev

# Production build + start
npm start

# Run tests
npm test

# Health check
curl http://localhost:3000/api/health
```

**Development access**: http://localhost:5173 (run `npm run dev`)

**Production access**: http://localhost:3000 (run `npm start`)

---

## Current Progress Tracking

### ✅ Completed
| Item | Date | Notes |
|------|------|-------|
| Project structure & basic server | - | Express + SQLite + Vanilla JS |
| Database schema (core tables) | - | 20+ tables, WAL mode |
| 18/18 KPIs implemented | - | 14 PC+MC, 4 MC-only (PC027–PC030) |
| EMR + Shafafiya import | - | Excel/CSV with validation |
| Data Audit & Reconciliation | - | Monthly summary, gap analysis |
| Quarter Lock workflow | - | Generates locked_audit_records |
| Dashboard with sparklines | - | Domain grouped, status badges |
| Manual KPI entry | - | Basic CRUD |
| Facility management | - | CRUD + MF number validation |
| **SQL injection fixes** | 2026-09-17 | kpi-calculator.js, kpi-engine.js, audit.js |
| **Dependency updates** | 2026-09-17 | Helmet, rate-limit, JWT, better-sqlite3 |
| **Security middleware** | 2026-09-17 | Helmet, express-rate-limit, jsonwebtoken |
| **Vite bundling setup** | 2026-09-17 | ES modules, dev/build scripts |
| **Migration system** | 2026-09-17 | 4 migrations, node-pg-migrate |
| **Schema cleanup** | 2026-09-17 | audit_log, kpi_registry_versions added |
| **Redundant tables removed** | 2026-09-17 | kpi_data, facility, patient_measurements dropped |
| **KPI definitions synced** | 2026-09-17 | All 18 KPIs upserted with targets/facility_type/age ranges |

### 🔄 In Progress
| Item | Target | Blockers |
|------|--------|----------|
| **UI Modernization (Phase 7)** | In Progress | Code-split, reusable components, virtual scrolling |

### 🚀 Next Up (Priority Order)

**✅ Sprint 1 – Foundation (COMPLETED)**
1. **Unit Tests** – KPI calculators, edge cases, version switching, facility filtering 
2. **ESLint + Prettier** – Configured and enforced
3. **Import Validation** – Date ranges, facility ID match, required fields
4. **Database Indexes** – Added indexes for locked_audit_records to massively boost KPI engine performance

**✅ Sprint 2 – Testing & Docs (COMPLETED)**
5. **Integration Tests** – End-to-end pipeline tested (Import → Lock → Calculate → Export)
6. **Documentation** – Implementation plan and DOH KPI logic documented
7. **User Guide** – Official consultant user guide generated (USER_GUIDE.md)

**🥉 Sprint 3 — Production**
8. **Backup/Restore** — button in Settings + automated daily backup
9. **Structured Logging** — pino
10. **Error Tracking** — local file or Sentry
11. **Deployment** — Windows service, auto-start, port config via env

**🧹 Sprint 4 — Polish**
12. **UI** — code-split routes, reusable components, virtual scrolling
13. **Usability** — keyboard nav, responsive design
14. **Future** — dark mode, Arabic RTL

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      YOUR MACHINE                            │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │   Browser    │◀───│  Node.js/Express (localhost:3000) │  │
│  │  (Vite SPA)  │    │  ┌────────────────────────────┐  │  │
│  └──────────────┘    │  │   SQLite (kpi_data.db)      │  │  │
│                      │  │   - facilities              │  │  │
│                      │  │  - emr_data / shafafiya     │  │  │
│                      │  │  - kpi_results / locks      │  │  │
│                      │  │  - code_mappings / licenses │  │  │
│                      │  │  - audit_log (NEW)          │  │  │
│                      │  └────────────────────────────┘  │  │
│                      └──────────────────────────────────┘  │
│                              │                               │
│                      ┌────────────────────┐                 │
│                      │   uploads/ (temp)  │                 │
│                      │   public/templates/│                 │
│                      └────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Multi-Version KPI Support** | ✅ Done | V9 (Q1 2026) + V1 (Q3 2026) + UI version selector with Auto |
| **Facility-Type Aware** | ✅ Done | Primary Care vs Medical Center |
| **18/18 KPIs** | 18/18 ✅ | 14 PC+MC, 4 MC-only (PC027–PC030) |
| **JDC Export** | ✅ Done | 4-sheet Excel: Certification (CEO sign-off), KPIs, Validation, Audit Trail |
| **Audit Trail** | ✅ Done | Full traceability for JDC audit |
| **Local-First** | ✅ Done | SQLite file, no cloud deps |
| **Offline Assets** | ✅ Done | Bootstrap + Icons bundled locally (no CDN) |
| **Backup/Restore** | 🟡 Partial | `npm run db:backup` works; UI button pending |

---

## DOH Compliance Checklist

| Requirement | Status |
|-------------|--------|
| All 18 KPIs per V9/V1 guidance | 18/18 ✅ |
| Facility-type filtering | ✅ |
| Version-aware calculations | ✅ |
| ABM/Pregnancy/ESRD exclusions | ✅ |
| Complete ICD-10/CPT mappings | ✅ |
| JDC Excel template export | ✅ |
| CEO sign-off workflow | ✅ |
| Audit trail for JDC | ✅ |
| Malaffi integration placeholder | ❌ |

---

## Commands Reference

```bash
# Development
npm run dev              # Start Express API + Vite frontend; open http://localhost:5173
npm run build            # Build frontend with Vite
npm start                # Build frontend and serve from Express on port 3000
npm run preview          # Preview production build

# Code Quality (⚠️ ESLint in deps, no config yet; TypeScript not added)
npm run lint             # ESLint — ⚠️ no config file, will fail
npm run typecheck        # TypeScript — ⚠️ no tsconfig, will fail

# Tests (⚠️ manual, no framework)
npm test                 # Smoke test — requires server running (npm run dev first)

# Database
npm run db:migrate       # Run pending migrations (node-pg-migrate)
npm run db:seed          # Seed code mappings + KPI definitions
npm run db:seed:mappings # Seed code mappings only
npm run db:seed:kpis     # Upsert KPI definitions only
npm run db:backup        # Backup SQLite file

# Authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

---

## Project Structure

```
├── server.js                 # Express entry point
├── package.json
├── IMPLEMENTATION_PLAN.md    # 📋 Full roadmap (READ THIS)
├── README.md                 # This file
├── vite.config.js            # Vite config
├── database/
│   ├── db.js                 # SQLite init + schema
│   ├── kpi_data.db           # SQLite database (gitignored)
│   └── migrations/           # 4 migration files
├── engine/
│   ├── kpi-calculator.js     # KPI calculation logic
│   ├── kpi-definitions.js    # KPI metadata (V9)
│   └── kpi-registry.js       # Versioned registry (NEW)
├── routes/
│   ├── kpi.js                # KPI data API
│   ├── kpi-engine.js         # Calculate, results, waterfall
│   ├── patients.js           # Patient management
│   ├── auth.js               # Authentication
│   ├── import.js             # EMR/Shafafiya import
│   ├── audit.js              # Reconciliation, gaps
│   ├── facilities.js         # Facility CRUD
│   ├── settings.js           # App settings
│   ├── reports.js            # Reports
│   └── jdc-export.js         # JDC Excel export (NEW)
├── public/
│   ├── index.html
│   ├── css/style.css
│   ├── js/                   # Vanilla JS modules
│   │   ├── app.js            # Main app controller
│   │   ├── dashboard.js      # KPI dashboard
│   │   ├── import.js         # Import UI
│   │   ├── audit.js          # Data audit
│   │   ├── proofs.js         # KPI proofs/calculations
│   │   ├── manual.js         # Manual entry
│   │   ├── reports.js        # JDC/reports
│   │   ├── facilities.js     # Facility management
│   │   ├── comparison.js     # Quarterly comparison
│   │   └── settings.js       # Settings tabs
│   └── templates/            # Excel/CSV templates
└── tests/                    # Unit tests (manual, no framework)
```

---

## Data Flow

```
1. IMPORT
   EMR Excel ──────┐
                   ▼
   Shafafiya Excel ──▶ Import API ──▶ emr_data / shafafiya_data
                   ▲                     (raw, deduplicated)
   Validation ─────┘

2. AUDIT
   Monthly summary ──▶ Reconciliation (EMR vs RCM gaps)
   ◀─────────────────── Gap analysis CSV export

3. LOCK QUARTER
   User clicks "Save & Lock"
   ──▶ quarter_locks.is_locked = 1
   ──▶ Generates locked_audit_records (merged EMR+RCM)

4. CALCULATE KPIs
   Requires: Locked quarter
   ──▶ Engine reads locked_audit_records
   ──▶ Applies versioned KPI registry
   ──▶ Filters by facility_type
   ──▶ Writes kpi_results

5. DASHBOARD / REPORTS
   Reads kpi_results + trends
   ──▶ Domain-grouped cards
   ──▶ Sparkline history
   ──▶ Patient drill-down

6. JDC SUBMISSION (NEW)
   Prepare → Validate → CEO Sign-off → Export Excel
   ──▶ Audit trail logged
```

---

## KPI Coverage Matrix

| KPI | Name | V9 | V1 | PC | MC | Status |
|-----|------|----|----|----|----|--------|
| PC004 | PHQ-9 Follow-up 24h | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC005 | Depression 30-day FU | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC009 | HbA1c Poor Control | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC010 | HbA1c Good Control | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC011 | Diabetic Foot Exam | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC012 | Diabetic Eye Exam | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC013 | Diabetic Nephropathy | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC014 | Controlled HTN | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC016 | HTN Nephropathy | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC021 | Autism Screening | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC023 | Poorly Controlled HTN | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC024 | Dyslipidemia Screening | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC025 | Overweight/Obese Rate | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC026 | Depression Treatment Success | ✅ | ✅ | ✅ | ✅ | ✅ Done |
| PC027 | Asthma Medication Ratio | ✅ | ✅ | ❌ | ✅ | ✅ Done |
| PC028 | Wait Time ≤30 min | ✅ | ✅ | ❌ | ✅ | ✅ Done |
| PC029 | Kidney Function (eGFR) | ✅ | ✅ | ❌ | ✅ | ✅ Done |
| PC030 | 3rd Next Appt Days | ✅ | ✅ | ❌ | ✅ | ✅ Done |

**Legend**: V9=Primary Care V9, V1=Primary Care & Medical Center V1, PC=Primary Care, MC=Medical Center

---

## For New Model/Session

**Start here every time:**

1. **Read** `IMPLEMENTATION_PLAN.md` — Full context & roadmap by phase (Phases 0–9)
2. **Read** this `README.md` — Current progress status + prioritized Sprint roadmap (Sprint 1–4)
3. **Start with Sprint 1** — see 📋 Next Up section below
4. **Run** `npm test` - Verify working state
5. **Check** `package.json` scripts - Available commands
6. **Look at** `database/db.js` - Current schema
7. **Look at** `engine/kpi-calculator.js` - Current KPI logic

---

## Useful Resources

- [DOH JAWDA Guidelines Portal](https://www.doh.gov.ae/en/programs-initiatives/muashir/jawda-indicators-submission-guidelines2026)
- [Primary Care V9 PDF](https://www.doh.gov.ae/-/media/Feature/Muashir/Jawda/2026/Primary-Care-PC-Services-Jawda-GuidanceVersion-92026.ashx)
- [Primary Care & Medical Center V1 PDF](https://www.doh.gov.ae/-/media/Feature/Muashir/Jawda/2026/Primary-Care-and-Medical-Center-Services-Jawda-Guidance_V1_2026_Effective-From-Q3-2026.ashx)
- [JDC Methodology](https://tasneefba.org/wp-content/uploads/healthcare/JDC_Methodology/JAWDA%20Data%20Certification%20for%20Healthcare%20Providers%202025-Part_VIII.pdf)

---

## License

Internal use - DOH JAWDA Compliance Tool