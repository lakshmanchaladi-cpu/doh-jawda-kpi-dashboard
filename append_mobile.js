const fs = require('fs');
let code = fs.readFileSync('public/js/app.js', 'utf8');

const mobileLogic = `
      // Mobile sidebar toggle
      const mobileToggle = document.getElementById('mobileSidebarToggle');
      const sidebar = document.querySelector('.sidebar');
      if (mobileToggle && sidebar) {
          mobileToggle.addEventListener('click', () => {
              sidebar.classList.toggle('show-mobile');
          });
      }
`;

// Insert into setupEventListeners
code = code.replace(/setupEventListeners\(\) \{/, 'setupEventListeners() {' + mobileLogic);
fs.writeFileSync('public/js/app.js', code);
console.log('Appended mobile logic to app.js');
