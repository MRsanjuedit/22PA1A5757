import express from 'express';
import axios from 'axios';
import { urlStore } from '../index.js';

const router = express.Router();

async function getGeo(ip) {
  try {
    const resp = await axios.get(`https://ipapi.co/${ip}/country_name/`);
    return typeof resp.data === 'string' ? resp.data : 'Unknown';
  } catch {
    return 'Unknown';
  }
}

router.get('/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  const urlDoc = urlStore[shortcode];
  if (!urlDoc) {
    return res.status(404).json({ error: 'Shortcode not found.' });
  }
  if (new Date() > urlDoc.expiry) {
    return res.status(410).json({ error: 'Short link expired.' });
  }
  const referrer = req.get('referer') || '';
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
  const geo = await getGeo(ip);
  urlDoc.clicks.push({ timestamp: new Date(), referrer, geo });
  res.redirect(urlDoc.originalUrl);
});

export default router;
