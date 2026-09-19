const fs = require('fs');
let code = fs.readFileSync('public/css/style.css', 'utf8');

const mediaQueries = `
/* --- MOBILE RESPONSIVENESS --- */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -250px;
    height: 100%;
    z-index: 1050;
    background: white;
    transition: left 0.3s ease;
    box-shadow: 2px 0 10px rgba(0,0,0,0.2) !important;
  }
  .sidebar.show-mobile {
    left: 0;
  }
  .app-container {
    height: calc(100vh - 60px);
  }
  .top-nav .form-select {
    width: 100px !important;
  }
  #globalFacilitySelect {
    max-width: 120px !important;
  }
  /* Hide text labels on mobile to save space */
  .d-sm-none { display: inline-block; }
  .d-sm-inline { display: none; }
}

[data-bs-theme="dark"] .sidebar {
  background-color: #121212 !important;
}
`;

code += mediaQueries;
fs.writeFileSync('public/css/style.css', code);
console.log('Appended mobile media queries');
