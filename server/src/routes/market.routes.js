import { Router } from 'express';
import { getNearbyMarkets, getMarkets, getPriceHistory } from '../services/data/marketRepository.js';
import { getTelanganaCommmodities, getTelanganaMarketHistory } from '../services/data/telanganaData.js';

export const marketRouter = Router();

// GET /api/markets — all markets (with CSV fallback prices)
marketRouter.get('/', async (req, res, next) => {
  try {
    const crop = req.query.crop || 'Tomato';
    const markets = await getMarkets({ crop });
    res.json({ markets, count: markets.length });
  } catch (error) { next(error); }
});

// GET /api/markets/candidates — nearby markets for a lat/lng
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

// GET /api/markets/commodities — list all available commodities from CSV
marketRouter.get('/commodities', async (req, res, next) => {
  try {
    const commodities = await getTelanganaCommmodities();
    res.json({ commodities, count: commodities.length });
  } catch (error) { next(error); }
});

// GET /api/markets/history — price history for a commodity (optionally per yard)
marketRouter.get('/history', async (req, res, next) => {
  try {
    const crop = req.query.crop || 'Tomato';
    const yardCode = req.query.yardCode || null;

    // Try per-market history from database
    const csvHistory = await getTelanganaMarketHistory({ crop, yardCode });
    if (csvHistory.length) {
      return res.json({ history: csvHistory, source: 'Supabase (telangana_market_prices)', count: csvHistory.length });
    }

    // Fallback to aggregated price history
    const history = await getPriceHistory({ crop });
    res.json({ history, source: 'aggregated', count: history.length });
  } catch (error) { next(error); }
});
