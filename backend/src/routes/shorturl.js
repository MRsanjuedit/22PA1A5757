import express from 'express';
import { nanoid } from 'nanoid';
import { urlStore } from '../index.js';

const router = express.Router();

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidShortcode(code) {
  return /^[a-zA-Z0-9]{4,16}$/.test(code);
}

// POST /shorturls
router.post('/', (req, res) => {
  const { url, validity, shortcode } = req.body;
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL.' });
  }
  let code = shortcode;
  if (code) {
    if (!isValidShortcode(code)) {
      return res.status(400).json({ error: 'Invalid shortcode format.' });
    }
    if (urlStore[code]) {
      return res.status(409).json({ error: 'Shortcode already in use.' });
    }
  } else {
    do {
      code = nanoid(6);
    } while (urlStore[code]);
  }
  const validMinutes = Number.isInteger(validity) ? validity : 30;
  const expiry = new Date(Date.now() + validMinutes * 60000);
  urlStore[code] = {
    originalUrl: url,
    shortcode: code,
    createdAt: new Date(),
    expiry,
    clicks: []
  };
  res.status(201).json({
    shortLink: `${req.protocol}://${req.get('host')}/${code}`,
    expiry: expiry.toISOString()
  });
});

// GET /shorturls/:shortcode
router.get('/:shortcode', (req, res) => {
  const { shortcode } = req.params;
  const urlDoc = urlStore[shortcode];
  if (!urlDoc) {
    return res.status(404).json({ error: 'Shortcode not found.' });
  }
  res.json({
    originalUrl: urlDoc.originalUrl,
    createdAt: urlDoc.createdAt,
    expiry: urlDoc.expiry,
    totalClicks: urlDoc.clicks.length,
    clicks: urlDoc.clicks
  });
});

export default router;
