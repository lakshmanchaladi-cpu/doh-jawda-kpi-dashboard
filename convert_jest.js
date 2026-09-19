const fs = require('fs');

let code = fs.readFileSync('tests/kpi-calculator.test.js', 'utf8');

// Replace standard assert with Jest expect
code = code.replace(/assert\.ok\(([^,]+),/g, 'expect($1).toBeTruthy(); //');
code = code.replace(/assert\.strictEqual\(([^,]+),([^,]+),([^)]+)\);/g, 'expect($1).toBe($2); // $3');

// Replace async function testX() with test('X', async () => { ... })
code = code.replace(/async function test([A-Za-z0-9_]+)\(\) \{/g, 'test("$1", async () => {');

// We need to replace the bottom main() call with nothing, since Jest runs the tests natively
code = code.replace(/async function main\(\) \{[\s\S]*?main\(\)\.catch\([^\n]+\n/m, '');
code = code.replace(/console\.log\([^)]+\);/g, ''); // Remove console logs for cleaner jest output

fs.writeFileSync('tests/kpi-calculator.test.js', code);
console.log('Converted to Jest');
