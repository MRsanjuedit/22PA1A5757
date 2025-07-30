// Custom Logging Middleware: sends logs to logging microservice
import axios from 'axios';

const LOGGING_SERVICE_URL = process.env.LOGGING_SERVICE_URL || 'http://localhost:6000/evalution-service/logs';
const LOGGING_API_KEY = process.env.LOGGING_API_KEY || 'affordmed-secret';

export default function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const logPayload = {
      stack: 'backend',
      level: 'info',
      package: 'route',
      message: `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      meta: {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    };
    try {
      await axios.post(LOGGING_SERVICE_URL, logPayload, {
        headers: { 'x-api-key': LOGGING_API_KEY }
      });
    } catch (e) {
      // Fail silently, do not use console.log
    }
  });
  next();
}
