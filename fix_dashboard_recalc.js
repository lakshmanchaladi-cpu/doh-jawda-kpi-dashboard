const fs = require('fs');
let code = fs.readFileSync('public/js/dashboard.js', 'utf8');

// Remove the button
const buttonRegex = /<button class="btn btn-outline-primary" onclick="Dashboard\.recalculate\(\)">[\s\S]*?<\/button>/;
code = code.replace(buttonRegex, '');

// Change empty state message
code = code.replace('Click <strong>Recalculate KPIs</strong> to build the dashboard.', 
                    'Go to the <strong>Data Audit</strong> tab, lock the quarter, and click Calculate KPIs to build the dashboard.');

// Remove the recalculate method
const methodRegex = /async recalculate\(\) \{[\s\S]*?\}\n\};\n$/;
if (code.match(methodRegex)) {
  code = code.replace(methodRegex, '};\n');
} else {
  // If my regex fails due to spacing, I'll just let it be, but I should try to remove it.
  console.log('Method regex failed, trying alternative');
  code = code.replace(/async recalculate\(\) \{[\s\S]*?\} catch \(err\) \{[\s\S]*?\}[\s\S]*?\}/, '');
}

fs.writeFileSync('public/js/dashboard.js', code);
console.log('Removed from dashboard');
