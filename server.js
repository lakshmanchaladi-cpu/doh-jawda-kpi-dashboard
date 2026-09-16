const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize DB and Start Server
initDb().then(() => {
  // Mount API routes
  app.use('/api/facilities', require('./routes/facilities'));
  app.use('/api/import', require('./routes/import'));
  app.use('/api/kpi', require('./routes/kpi-engine'));
  app.use('/api/reports', require('./routes/reports'));
  app.use('/api/settings', require('./routes/settings'));
  app.use('/api/audit', require('./routes/audit'));

  // SPA Fallback
  app.get('/{*splat}', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`DOH JAWDA KPI Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database", err);
  process.exit(1);
});
