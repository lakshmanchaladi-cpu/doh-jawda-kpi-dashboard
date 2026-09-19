const fs = require('fs');
let code = fs.readFileSync('public/css/style.css', 'utf8');

// 1. Update font-family
code = code.replace(/font-family: 'Segoe UI',[^;]+;/, 'font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif;\n  letter-spacing: -0.01em;');

// 2. Remove old top-nav bg (we'll override it at the bottom to avoid conflicts)
const premiumStyles = `

/* --- PREMIUM UI UPGRADES (v1.1) --- */

/* Top Nav: Gradient & Glassmorphism */
.top-nav {
  background: linear-gradient(135deg, rgba(0, 107, 107, 0.95) 0%, rgba(0, 51, 51, 0.98) 100%) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Global Cards: Soft Shadows, Rounded Corners */
.card, .modal-content {
  border-radius: 12px !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05), 0 2px 5px rgba(0, 0, 0, 0.03) !important;
}
.card-header {
  border-top-left-radius: 12px !important;
  border-top-right-radius: 12px !important;
  background-color: transparent !important;
  border-bottom: 1px solid rgba(0,0,0,0.03) !important;
}

/* Sidebar: Elegant Active State */
.nav-btn.active {
  background: linear-gradient(90deg, rgba(0, 107, 107, 0.08) 0%, transparent 100%) !important;
  border-left: 4px solid var(--doh-teal);
  border-radius: 0 6px 6px 0 !important;
  padding-left: 11px !important; /* Compensate for the 4px border */
}

/* Sidebar Hover Polish */
.nav-btn:hover:not(.active) {
  background-color: rgba(0, 107, 107, 0.04) !important;
}

/* Icons: Softened Opacity for Elegance */
.bi {
  opacity: 0.85;
}
.nav-btn.active .bi, .navbar .bi, .btn .bi {
  opacity: 1; /* Keep active, navbar, and button icons sharp */
}

/* Dark Mode Specific Overrides */
[data-bs-theme="dark"] .card {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}
[data-bs-theme="dark"] .top-nav {
  background: linear-gradient(135deg, rgba(15, 25, 25, 0.95) 0%, rgba(5, 10, 10, 0.98) 100%) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
[data-bs-theme="dark"] .nav-btn.active {
  background: linear-gradient(90deg, rgba(0, 150, 150, 0.15) 0%, transparent 100%) !important;
  border-left-color: #00d2d2;
}

/* KPI Card Custom Radius */
.kpi-icon {
  border-radius: 12px !important;
}
`;

code += premiumStyles;
fs.writeFileSync('public/css/style.css', code);
console.log('Premium styles injected');
