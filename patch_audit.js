
const fs = require('fs');
const file = 'routes/audit.js';
let content = fs.readFileSync(file, 'utf8');

// Replace /monthly
content = content.replace(
  /router\.get\('\\/monthly', async \(req, res\) => \{[\s\S]*?\}\);\s*\n\/\/ \u2500+ GET \/api\/audit\/reconciliation/m,
  \outer.get('/monthly', async (req, res) => {
  res.json({ deprecated: true, message: 'This endpoint is deprecated in V2.0. Use /vault-summary instead.' });
});

// \u2500\u2500\u2500 GET /api/audit/reconciliation\
);

// Replace /reconciliation
content = content.replace(
  /router\.get\('\\/reconciliation', async \(req, res\) => \{[\s\S]*?\}\);\s*\n\/\/ \u2500+ GET \/api\/audit\/batches/m,
  \outer.get('/reconciliation', async (req, res) => {
  res.json({ deprecated: true, message: 'This endpoint is deprecated in V2.0. Use /vault-summary or /exceptions instead.' });
});

// \u2500\u2500\u2500 GET /api/audit/batches\
);

fs.writeFileSync(file, content);

