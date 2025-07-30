import express from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT || 6000;
const LOG_DIR = process.env.LOG_DIR || path.resolve('logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB per log file

app.use(express.json({ limit: '32kb' }));

const allowedStacks = ['backend'];
const allowedLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
const backendPackages = [
  'cache', 'controller', 'cron job', 'db', 'domain', 'handler', 'repository', 'route', 'service'
];
const sharedPackages = [
  'auth', 'config', 'middleware', 'utils'
];

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function rotateLogFile() {
  if (fs.existsSync(LOG_FILE)) {
    const stats = fs.statSync(LOG_FILE);
    if (stats.size >= MAX_LOG_SIZE) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.renameSync(LOG_FILE, path.join(LOG_DIR, `app-${timestamp}.log`));
    }
  }
}

function writeLog(entry) {
  ensureLogDir();
  rotateLogFile();
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
}

app.post('/evalution-service/logs', (req, res) => {
  try {
    const { stack, level, package: pkg, message, meta } = req.body;
    if (!stack || !level || !pkg || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (typeof stack !== 'string' || typeof level !== 'string' || typeof pkg !== 'string' || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid field types' });
    }
    if (!allowedStacks.includes(stack)) {
      return res.status(400).json({ error: 'Invalid stack' });
    }
    if (!allowedLevels.includes(level)) {
      return res.status(400).json({ error: 'Invalid level' });
    }
    const valid = backendPackages.includes(pkg) || sharedPackages.includes(pkg);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid package for stack' });
    }
    const logID = randomUUID();
    const logEntry = {
      logID,
      timestamp: new Date().toISOString(),
      stack,
      level,
      package: pkg,
      message,
      meta: meta || null
    };
    writeLog(logEntry);
    res.status(200).json({ logID, message: 'log created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// For production: logs are not exposed via API
// If you want to allow log download, implement secure admin-only endpoint

app.listen(PORT, () => {
  // Production-ready logging service started
});
