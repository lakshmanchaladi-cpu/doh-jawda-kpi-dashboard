const fs = require('fs');
let code = fs.readFileSync('public/js/app.js', 'utf8');

const fix = `
      // Sidebar navigation & brand link
      document.addEventListener('click', (e) => {
        const navLink = e.target.closest('[data-page]');
        if (navLink) {
          e.preventDefault();
          this.navigate(navLink.dataset.page);
          if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('show-mobile');
        }
      });
`;

code = code.replace(/\/\/ Sidebar navigation & brand link[\s\S]*?\}\);/, fix.trim());
fs.writeFileSync('public/js/app.js', code);
console.log('Fixed nav click');
