const pino = require('pino');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const isDev = process.env.NODE_ENV !== 'production';

// Write all errors to a specific error.log file for error tracking
// Write all other logs to application.log
const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
  },
  pino.multistream([
    // Console output (pretty in dev, json in prod)
    { 
      level: 'info', 
      stream: isDev 
        ? require('pino-pretty')({ colorize: true, translateTime: 'SYS:standard' }) 
        : process.stdout 
    },
    // Application Log
    { level: 'info', stream: pino.destination(path.join(logDir, 'application.log')) },
    // Dedicated Error Tracking Log
    { level: 'error', stream: pino.destination(path.join(logDir, 'error.log')) }
  ])
);

module.exports = logger;
