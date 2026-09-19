# ?? Developer Playbook & Architecture

This document maps out the entire software architecture, explaining where files live, how the UI is rendered, and how the database stores information.

## ?? Directory Structure

```text
+-- database/            # Contains the local SQLite database (.db) and schema definition (db.js)
+-- engine/              # The mathematical heart of the app (Calculates KPIs, handles exclusions)
+-- public/              # The Frontend UI (HTML, CSS, JS)
¦   +-- css/             # style.css (Contains all Dark Mode, responsive, and UI rules)
¦   +-- js/
¦   ¦   +-- app.js       # The Master Router (Handles navigation and lazy-loading)
¦   ¦   +-- components/  # Reusable UI parts (KPICard.js, DataTable.js)
¦   ¦   +-- *.js         # Page-specific controllers (e.g., data-manager.js, dashboard.js)
+-- routes/              # Backend API Endpoints (Express.js routers)
+-- logs/                # Auto-generated application and error logs
+-- server.js            # The main Node.js entry point (Starts the web server on port 3000)
+-- vite.config.js       # Configuration for the frontend bundler
```

## ??? How the UI Works (Which button does what?)

The frontend is a **Single Page Application (SPA)** built with Vanilla JavaScript and Vite.

1.  **The Router (`public/js/app.js`):** When you click a tab on the left sidebar, the page does not reload. Instead, `app.js` intercepts the click, dynamically downloads the JavaScript chunk for that specific page (Lazy Loading), and injects the HTML into the `<div id="app-content">`.
2.  **UI Components (`public/js/components/`):** Rather than writing massive HTML strings everywhere, the app uses reusable ES6 classes. For example, the `KPICard.js` component is responsible for drawing the layout, colors, and sparklines for every single KPI on the dashboard.
3.  **Vite Bundling (`npm run build`):** If you make **any** changes to `public/css/style.css` or `public/js/*.js`, you **MUST** run `npm run build` in the terminal. The browser only reads the minified output in the `dist/` folder.

## ??? The Database (SQLite)

The system uses a local file-based database (`database/kpi_data.db`).

### Key Tables
*   `emr_data`: Stores clinical records (Diagnoses, Vitals, Labs). Uploaded via EMR CSV.
*   `shafafiya_data`: Stores billing/claims records (CPT Codes, Insurance). Uploaded via RCM CSV.
*   `kpi_results`: Stores the final calculated numerator/denominator math so the dashboard loads instantly.
*   `import_batches`: Tracks the history of CSV uploads.

### How Duplicates are Handled
If a user uploads a CSV containing rows that were already imported last week, the system handles this gracefully. Both `emr_data` and `shafafiya_data` utilize an `INSERT OR REPLACE` SQL query tied to a cryptographically hashed `row_hash`. It will seamlessly overwrite the old record with the new one without crashing the application.

## ??? How to Modify the App

### 1. How to add a new Sidebar Tab
1. Add the HTML link to `public/index.html` (give it a `data-page="newtab"` attribute).
2. Create `public/js/newtab.js` with a `render(container)` function.
3. Open `public/js/app.js` and add it to the `routeMap` inside the `navigate()` function.
4. Run `npm run build`.

### 2. How to add a new Backend API Route
1. Create a new file in `routes/` (e.g., `routes/newfeature.js`).
2. Open `server.js` and register it: `app.use('/api/newfeature', require('./routes/newfeature'));`.
3. Restart the Node server (`npm start`).
