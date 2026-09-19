const fs = require('fs');
let code = fs.readFileSync('public/js/app.js', 'utf8');

const darkModeSetup = `
    // Dark mode toggle
    const dmBtn = document.getElementById('darkModeToggle');
    if (dmBtn) {
      dmBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-bs-theme') === 'dark';
        html.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
        dmBtn.innerHTML = isDark ? '<i class="bi bi-moon-stars"></i>' : '<i class="bi bi-sun"></i>';
        localStorage.setItem('jawda-theme', isDark ? 'light' : 'dark');
      });
      // Initialize theme from local storage
      const savedTheme = localStorage.getItem('jawda-theme');
      if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        dmBtn.innerHTML = '<i class="bi bi-sun"></i>';
      }
    }
`;

code = code.replace(/setupEventListeners\(\) \{/, 'setupEventListeners() {' + darkModeSetup);
fs.writeFileSync('public/js/app.js', code);
console.log('Added dark mode logic');
