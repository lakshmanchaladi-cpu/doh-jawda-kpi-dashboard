const fs = require('fs');
let code = fs.readFileSync('public/js/app.js', 'utf8');

const a11yLogic = `
      // Accessibility (Keyboard Navigation)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const focused = document.activeElement;
          if (focused && focused.hasAttribute('data-page') && focused.tagName !== 'BUTTON') {
            e.preventDefault();
            focused.click();
          }
        }
      });
`;

code = code.replace(/setupEventListeners\(\) \{/, 'setupEventListeners() {' + a11yLogic);
fs.writeFileSync('public/js/app.js', code);
console.log('Appended a11y logic');
