
const fs = require('fs');
const file = 'routes/audit.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /router\.get\('\\/monthly', async \(req, res\) => \{[\s\S]*?\}\);\s*\n\/\/ \u2500+ GET \/api\/audit\/reconciliation/;
content = content.replace(regex, \outer.get('/monthly', async (req, res) => {
  res.json({ deprecated: true, message: 'This endpoint is deprecated in V2.0. Use /vault-summary instead.' });
});

// \u2500\u2500\u2500 GET /api/audit/reconciliation\);

fs.writeFileSync(file, content);

