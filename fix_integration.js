const fs = require('fs');
let code = fs.readFileSync('tests/integration.test.js', 'utf8');

code = code.replace(/async function runIntegration\(\) \{/g, 'test("Integration Pipeline", async () => {');
code = code.replace(/runIntegration\(\)\.catch[\s\S]+/m, '');
code = code.replace(/console\.log/g, '// console.log');
code = code.replace(/assert\.ok\(([^,]+),([^)]+)\);/g, 'expect($1).toBeTruthy(); // $2');
code = code.replace(/assert\.strictEqual\(([^,]+),([^,]+),([^)]+)\);/g, 'expect($1).toBe($2); // $3');

// Fix column name
code = code.replace(/type\) VALUES \('Test Clinic', 'MF1234', 'Primary Care'\)/g, "facility_type) VALUES ('Test Clinic', 'MF1234', 'Primary Care')");

// Fix the closing brace issue from earlier by adding );
code = code.replace(/^}$/gm, '});');

fs.writeFileSync('tests/integration.test.js', code);
console.log('Fixed integration test');
