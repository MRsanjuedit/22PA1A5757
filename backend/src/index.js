import express from 'express';
import cors from 'cors';
import logger from './logger.js';
import shortUrlRoutes from './routes/shorturl.js';
import redirectRoute from './routes/redirect.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(logger);

// In-memory storage for URLs and stats
export const urlStore = {};

app.use('/shorturls', shortUrlRoutes);
app.use('/', redirectRoute);

app.listen(PORT, () => {
  // ...existing code...
});
