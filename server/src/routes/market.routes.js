import { Router } from 'express';
import { getNearbyMarkets } from '../services/data/marketRepository.js';

export const marketRouter = Router();
marketRouter.get('/candidates', async (req, res, next) => {
  try {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);
    const radiusKm = Number(req.query.radiusKm || 45);
    const count = Number(req.query.count || 5);
    const crop = req.query.crop || 'Tomato';
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ error: 'lat and lng are required' });
    const markets = await getNearbyMarkets({ latitude, longitude, crop, radiusKm, count });
    res.json({ markets, count: markets.length });
  } catch (error) { next(error); }
});
