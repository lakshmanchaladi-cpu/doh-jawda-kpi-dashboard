# JAWDA DASHBOARD - AGENT CONTINUITY & HANDOFF GUIDE
# READ THIS FILE FIRST BEFORE DOING ANYTHING ELSE
# This file ensures any new agent or session can pick up exactly where we left off.
# Last Updated: 2026-09-19

===========================================================================
SECTION 1: WHAT THIS PROJECT IS
===========================================================================

This is a LOCAL DESKTOP web application (Node.js + Express + SQLite + Vite)
that calculates UAE DOH JAWDA Primary Care KPIs for a medical consultant.

It runs on the user's own Windows PC. There is no cloud. No deployment.
The user is the only user. localhost:3000 is the only access point.

Key facts:
- Database file: database/kpi_data.db (SQLite)
- Frontend: Built with Vite. ALWAYS run "npm run build" after JS/CSS changes.
- Server: Started with "npm start". The server.js process must be restarted after backend changes.
- Node server task is running as a background daemon (task-4116 or similar)

===========================================================================
SECTION 2: HOW V1 WAS IMPLEMENTED SUCCESSFULLY (LESSONS LEARNED)
===========================================================================

The V1 implementation worked smoothly because it followed these rules:

RULE 1 - ALWAYS read the file before editing it.
  Never assume what a file contains. Always view it first.

RULE 2 - ALWAYS run "npm run build" after ANY frontend change.
  Changes to public/js/*.js or public/css/*.css do NOTHING until you build.
  The browser serves files from /dist/public/ not from /public/ directly.

RULE 3 - ALWAYS restart the Node server after backend changes.
  Run: Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force; npm start
  The server caches route handlers in memory. Old code stays active until restart.

RULE 4 - ONE PHASE AT A TIME. Never skip.
  V1 succeeded because phases were done in strict dependency order.
  Database schema always came first. Then backend routes. Then frontend. Never reversed.

RULE 5 - VERIFY each task before marking it done.
  Run a real test (SQL query, curl, or browser check) after each task.
  Never check a box based on "the code looks right."

RULE 6 - Use node scripts for complex file edits.
  For large file rewrites, write a small node script (e.g., Set-Content patch.js ...; node patch.js)
  This avoids PowerShell string escaping issues and is more reliable than replace_file_content.

RULE 7 - Update IMPLEMENTATION_PLAN.md as you go.
  Mark tasks [/] when starting and [x] when verified complete.
  The plan is the single source of truth for progress.

===========================================================================
SECTION 3: CURRENT PROJECT STATUS
===========================================================================

V1.0 STATUS: COMPLETE
  - All KPI calculators implemented (PC009-PC030)
  - Full frontend (dashboard, audit, import, proofs, reports, jdc, settings, comparison, facilities)
  - Vite bundling with code-splitting (lazy loading per route)
  - Jest unit tests passing
  - Premium UI (glassmorphism nav, soft shadows, dark mode, mobile responsive)
  - Structured logging with pino
  - Database backup UI
  - KPICard, DataTable, FilterBar components created
  - TypeScript scaffolded (tsconfig.json)
  - DEVELOPER_PLAYBOOK.md and CLINICAL_ENGINE.md written

V2.0 STATUS: PLANNING - NOT STARTED
  Implementation plan is fully documented in IMPLEMENTATION_PLAN.md
  The first task to execute is Phase 1 (database schema changes in database/db.js)

===========================================================================
SECTION 4: V2.0 PRIORITY ORDER (DO IN THIS EXACT ORDER)
===========================================================================

PRIORITY 1 - CRITICAL (Do first, everything depends on this)
  Phase 1: Database Schema Updates
  File: database/db.js
  Why first: All other phases need job_queue table and new import_batches columns.
  Risk if skipped: Phases 2, 3, 4, 6 will crash without these columns.
  Estimated effort: 30 minutes

PRIORITY 2 - HIGH (Core data pipeline - fixes the main bug)
  Phase 2: Smart ETL Import Route Rewrite
  File: routes/import.js
  Why second: This fixes the silent data corruption bug (wrong quarter tagging).
  Risk if skipped: All KPI calculations will remain incorrect for multi-month uploads.
  Estimated effort: 2-3 hours
  Dependency: Phase 1 must be done first (needs new import_batches columns)

PRIORITY 3 - HIGH (Unblocks calculations, removes confusing workflow)
  Phase 3: KPI Engine Route Updates
  File: routes/kpi-engine.js
  Why third: Removes the mandatory lock gate that confuses users.
  Async job queue makes UI responsive during calculations.
  Risk if skipped: Users still blocked by lock requirement. UI still freezes.
  Estimated effort: 2 hours
  Dependency: Phase 1 must be done first (needs job_queue table)

PRIORITY 4 - HIGH (New backend APIs that the new UI needs)
  Phase 4: Audit Route Updates
  File: routes/audit.js
  Why fourth: New /vault-summary and /exceptions endpoints must exist BEFORE building the UI.
  Risk if skipped: Phase 6 (Data Manager UI) has no API to call.
  Estimated effort: 2 hours
  Dependency: Phases 1, 2, 3 should be done first

PRIORITY 5 - MEDIUM (Navigation restructure - visible improvement)
  Phase 5: Sidebar Navigation Restructure
  Files: public/index.html, public/js/app.js
  Why fifth: Restructuring navigation is safe to do independently of backend.
  Creates the new data-manager route. Removes old import/audit links.
  Risk if skipped: Old navigation remains. Users confused by stale links.
  Estimated effort: 1 hour
  Dependency: Phase 6 must be planned before this (need to know final route names)

PRIORITY 6 - HIGH (The main new UI - what the user sees)
  Phase 6: New Data Manager Frontend Module
  File: public/js/data-manager.js (NEW FILE)
  Why sixth: The biggest user-facing change. Merges import + audit into clean UI.
  Replaces the "messy pile of data" with Data Vault cards.
  Risk if skipped: Users still see the old confusing workflow.
  Estimated effort: 4-6 hours
  Dependency: Phases 1-5 must all be complete

PRIORITY 7 - MEDIUM (Fix stale messages and remove orphaned buttons)
  Phase 7: Update Dashboard and Proofs Tab Messages
  Files: public/js/dashboard.js, public/js/proofs.js
  Why seventh: Remove the "go to audit and lock" messages that no longer apply.
  Remove lock/unlock button from proofs tab (it moved to Data Manager).
  Risk if skipped: Users see wrong instructions. Proofs tab has a broken lock button.
  Estimated effort: 30 minutes

PRIORITY 8 - LOW (Polish - consolidate Settings sidebar items)
  Phase 8: Settings Page Consolidation
  Files: public/js/settings.js, public/js/app.js, public/index.html
  Why last: Settings already works. This is just a sidebar cleanup.
  Risk if skipped: Sidebar has 4 settings items instead of 1. Slightly messy.
  Estimated effort: 1 hour

===========================================================================
SECTION 5: THE ARCHITECTURE "GOLDEN RULES" FOR THIS PROJECT
===========================================================================

GOLDEN RULE 1 - The Frontend Router
  File: public/js/app.js -> routeMap
  Adding a new page requires 3 things:
  a) Add a nav link in public/index.html with data-page="yourpage"
  b) Create public/js/yourpage.js with export class YourPage { render(container) {} }
  c) Add to routeMap: 'yourpage': () => import('./yourpage.js').then(m => m.YourPage.render(content))
  Then run: npm run build

GOLDEN RULE 2 - The App.state Object
  App.state = { facilityId, year, quarter, facilities, activePage }
  All frontend modules access this via App.state.X (not local variables)
  The global navbar dropdowns control this state
  After V2: year/quarter state STAYS for display tabs. REMOVED from import flow.

GOLDEN RULE 3 - Database Changes
  Always use "IF NOT EXISTS" and "ALTER TABLE IF NOT EXISTS column" patterns.
  The initDb() function in database/db.js runs EVERY server start.
  Never use DROP TABLE unless absolutely necessary. Use deprecation instead.

GOLDEN RULE 4 - KPI Engine Never Changes Its Signature
  engine/kpi-calculator.js exports: calculateAllKPIs(facility_id, year, quarter, version)
  Never change this function signature. Routes call it. Tests depend on it.
  Only change the SQL inside it if adding new KPI rules.

GOLDEN RULE 5 - Zero Denominator Rule
  If denominator = 0, status MUST be "met" (not "no-data" or "error")
  This is a clinical requirement. Never remove this logic.

GOLDEN RULE 6 - Run Tests Before Pushing
  Command: npm test
  Tests file: tests/kpi.test.js
  If tests fail, do not proceed. Fix the test first.

===========================================================================
SECTION 6: CRITICAL FILES MAP
===========================================================================

BACKEND:
  server.js              - Entry point. Registers all routes. Start here to understand the app.
  database/db.js         - Schema definition. Every table and index lives here.
  routes/import.js       - CSV/Excel upload processing. Row parsing logic lives here.
  routes/kpi-engine.js   - KPI calculation trigger. Lock/unlock. Results fetch.
  routes/audit.js        - Data quality summaries. Reconciliation.
  routes/settings.js     - KPI definitions, code mappings, clinicians, backup.
  routes/reports.js      - Quarterly report and comparison data.
  routes/jdc-export.js   - JDC submission workflow.
  routes/facilities.js   - Facility CRUD operations.
  engine/kpi-calculator.js - The mathematical heart. Never touch without reading fully.
  engine/kpi-registry.js   - KPI definitions (codes, targets, age ranges).
  engine/exclusions.js     - Patient exclusion rules (ESRD, palliative, pregnancy, etc.)
  utils/logger.js          - Pino structured logger.

FRONTEND:
  public/index.html      - The only HTML file. Sidebar nav is defined here.
  public/js/app.js       - Master router. App.state. Dark mode. Mobile toggle.
  public/js/dashboard.js - KPI Overview cards and sparklines.
  public/js/audit.js     - Data Audit tab (TO BE REPLACED by data-manager.js in V2)
  public/js/import.js    - Data Import tab (TO BE REPLACED by data-manager.js in V2)
  public/js/proofs.js    - KPI Drill-Down (waterfall, claims, proof mappings).
  public/js/reports.js   - Quarterly HTML report.
  public/js/jdc.js       - JDC Export workflow.
  public/js/comparison.js - Multi-period comparison charts.
  public/js/facilities.js - Facility management UI.
  public/js/settings.js  - Settings tabs (guidelines, engine, clinical, dicts, database).
  public/js/manual.js    - Manual KPI override entry.
  public/js/components/KPICard.js - Reusable KPI card HTML generator.
  public/css/style.css   - All custom styles. Dark mode. Mobile. Premium UI.

DOCUMENTATION:
  IMPLEMENTATION_PLAN.md          - V2.0 master blueprint. CHECK THIS FIRST.
  IMPLEMENTATION_PLAN_V1_ARCHIVE.md - Completed V1 reference (read-only).
  DEVELOPER_PLAYBOOK.md           - Architecture guide for developers.
  CLINICAL_ENGINE.md              - KPI formula and exclusion documentation.
  README.md                       - Quickstart and documentation hub.

===========================================================================
SECTION 7: HOW TO START A NEW AGENT SESSION (CREDITS RESET)
===========================================================================

When you start a new agent/conversation, give the agent THIS EXACT PROMPT:

---START PROMPT---
I am working on the JAWDA KPI Dashboard project located at:
c:\Users\USER\Documents\antigravity\agitated-hypatia

Start by reading these files IN ORDER:
1. AGENT_HANDOFF.md      (this file - gives you full context)
2. IMPLEMENTATION_PLAN.md (the V2 blueprint with priority order)

The project is a local Node.js/Express/SQLite/Vite web app for UAE DOH JAWDA KPI tracking.
V1.0 is complete. We are now implementing V2.0.

Check the IMPLEMENTATION_PLAN.md and find the first unchecked task under the highest priority phase.
Mark it [/] (in progress) and begin implementation.

Key rules before you write a single line of code:
- ALWAYS read the file you are about to edit first
- ALWAYS run "npm run build" after ANY frontend change
- ALWAYS restart Node server after backend changes:
  Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force; npm start
- Update IMPLEMENTATION_PLAN.md as you complete tasks
- ONE phase at a time, in priority order
---END PROMPT---

===========================================================================
SECTION 8: QUICK REFERENCE COMMANDS
===========================================================================

Build frontend:         npm run build
Start server:           npm start
Restart server:         Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force; npm start
Run tests:              npm test
Check DB schema:        node -e "const {initDb}=require('./database/db'); initDb().then(db=>db.all('SELECT name FROM sqlite_master WHERE type=table').then(r=>console.log(r)))"
Check indexes:          node -e "const {initDb}=require('./database/db'); initDb().then(db=>db.all('SELECT name FROM sqlite_master WHERE type=index').then(r=>console.log(r)))"
Check node processes:   Get-Process node
View server logs:       Get-Content logs/application.log -Tail 50
View error logs:        Get-Content logs/error.log -Tail 20
Check open port:        netstat -ano | Select-String "3000"
