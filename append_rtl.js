const fs = require('fs');
let code = fs.readFileSync('public/css/style.css', 'utf8');

const rtlCSS = `
/* --- ARABIC RTL SUPPORT (SCAFFOLDING) --- */
html[dir="rtl"] {
  direction: rtl;
  text-align: right;
}
html[dir="rtl"] .sidebar {
  border-right: none !important;
  border-left: 1px solid #dee2e6;
  right: 0;
  left: auto;
}
html[dir="rtl"] .nav-btn.active {
  border-left: none !important;
  border-right: 4px solid var(--doh-teal);
  border-radius: 6px 0 0 6px !important;
  padding-left: 15px !important;
  padding-right: 11px !important;
}
html[dir="rtl"] .ms-auto { margin-left: 0 !important; margin-right: auto !important; }
html[dir="rtl"] .me-3 { margin-right: 0 !important; margin-left: 1rem !important; }
`;

code += rtlCSS;
fs.writeFileSync('public/css/style.css', code);
console.log('Appended RTL css scaffolding');
