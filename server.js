const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const path = require('path');
const { initDb } = require('./database/db');
const logger = require('./utils/logger');
const pinoHttp = require('pino-http');

const app = express();

// Request Logging
app.use(pinoHttp({ logger, autoLogging: false })); // Set autoLogging: true if we want all requests, but keeping it false to avoid noise unless specifically requested

let selectedPort = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-secret-change-in-production';
const frontendRoot = path.join(__dirname, 'dist', 'public');
const frontendIndex = path.join(frontendRoot, 'index.html');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for Bootstrap CDN
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' }
});

// JWT authentication middleware (optional for local use)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // For local development, allow unauthenticated access
    if (process.env.NODE_ENV !== 'production') {
      req.user = { id: 'local', role: 'admin' };
      return next();
    }
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Optional auth - doesn't block if no token (for local use)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
    });
  }
  next();
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the Vite-built frontend. During development, Vite serves public/ on port 5173.
app.get('/favicon.ico', (req, res) => res.sendStatus(204));
app.use(express.static(frontendRoot));

app.get('/api/health', async (req, res) => {
  try {
    const db = await initDb();
    const row = await db.get('SELECT COUNT(*) as c FROM app_settings');
    res.json({
      status: 'ok',
      database: !!db,
      app_settings_rows: row ? row.c : 0,
      port: selectedPort
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message, port: selectedPort });
  }
});

// Simple login endpoint for JWT token (local development)
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  // For local dev, accept any credentials
  if (process.env.NODE_ENV !== 'production' || (username === 'admin' && password === 'admin')) {
    const token = jwt.sign({ id: 'local', role: 'admin', username }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: 'local', role: 'admin', username } });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// Initialize DB and Start Server
initDb().then(() => {
  // Mount API routes with optional auth
  app.use('/api/facilities', optionalAuth, require('./routes/facilities'));
  app.use('/api/import', optionalAuth, require('./routes/import'));
  app.use('/api/kpi', optionalAuth, require('./routes/kpi-engine'));
  app.use('/api/reports', optionalAuth, require('./routes/reports'));
  app.use('/api/jdc', optionalAuth, require('./routes/jdc-export'));
  app.use('/api/settings', optionalAuth, require('./routes/settings'));
  app.use('/api/audit', optionalAuth, require('./routes/audit'));
  app.use('/api/auth', optionalAuth, require('./routes/auth')); // Will create this

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.warn(`API 404: ${req.method} ${req.originalUrl}`);
      return res.status(404).json({ error: 'API route not found' });
    }
    next();
  });

  // SPA Fallback
  app.get('/{*splat}', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    if (!require('fs').existsSync(frontendIndex)) {
      return res.status(503).send('Frontend build not found. Run npm run build before starting the production server.');
    }
    res.sendFile(frontendIndex);
  });

  app.use((err, req, res, next) => {
    console.error('Unhandled API error:', err);
    if (req.path.startsWith('/api/')) {
      return res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
      });
    }
    next(err);
  });

  const startServer = (port) => {
    selectedPort = port;
    const server = app.listen(port, () => {
      logger.info(`DOH JAWDA KPI Server running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        logger.warn(`Port ${port} is busy, retrying on ${nextPort}`);
        startServer(nextPort);
        return;
      }
      logger.error({ err }, 'Server failed to start');
      throw err;
    });
  };

  startServer(selectedPort);
}).catch(err => {
  logger.error({ err }, "Failed to initialize database");
  process.exit(1);
});
