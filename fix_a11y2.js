const fs = require('fs');
let code = fs.readFileSync('public/js/app.js', 'utf8');

const updatedA11y = `
      // Accessibility (Keyboard Navigation)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const focused = document.activeElement;
          if (focused && (focused.hasAttribute('data-page') || focused.getAttribute('tabindex') === '0')) {
            e.preventDefault();
            focused.click();
          }
        }
      });
`;

code = code.replace(/\/\/ Accessibility \(Keyboard Navigation\)[\s\S]*?\}\);/, updatedA11y.trim());
fs.writeFileSync('public/js/app.js', code);
console.log('Fixed generic a11y');
