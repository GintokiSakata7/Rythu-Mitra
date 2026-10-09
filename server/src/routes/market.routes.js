import { Router } from 'express';
import { getNearbyMarkets, getMarkets, getPriceHistory } from '../services/data/marketRepository.js';
import { getTelanganaCommmodities, getTelanganaMarketHistory } from '../services/data/telanganaData.js';
import { db } from '../services/data/supabaseStore.js';

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

// GET /api/markets/commodities — list all available commodities from cloud DB and state catalog
marketRouter.get('/commodities', async (req, res, next) => {
  try {
    const dbCommodities = await db.getCommodities();
    const csvCommodities = await getTelanganaCommmodities();

    const set = new Set();
    const result = [];

    // Prioritize Supabase cloud items
    for (const c of dbCommodities) {
      const name = c.commodityName || c;
      if (name && !set.has(name.toLowerCase())) {
        set.add(name.toLowerCase());
        result.push(name);
      }
    }

    // Add state catalog items
    for (const c of csvCommodities) {
      const name = typeof c === 'string' ? c : c.commodityName || c.name;
      if (name && !set.has(name.toLowerCase())) {
        set.add(name.toLowerCase());
        result.push(name);
      }
    }

    res.json({ commodities: result, count: result.length });
  } catch (error) { next(error); }
});

// POST /api/markets/commodities — add new commodity item to database
marketRouter.post('/commodities', async (req, res, next) => {
  try {
    const { commodityName, variety, grade, canonicalUnit } = req.body;
    if (!commodityName || !commodityName.trim()) {
      return res.status(400).json({ error: 'Commodity name is required.' });
    }
    const item = await db.createCommodity({
      commodityName: commodityName.trim(),
      variety: variety?.trim() || 'Common',
      grade: grade?.trim() || 'Grade A',
      canonicalUnit: canonicalUnit?.trim() || '₹/Quintal'
    });
    res.status(201).json({ message: 'Commodity added successfully.', commodity: item });
  } catch (error) { next(error); }
});

// GET /api/markets/history — price history for a commodity (optionally per yard)
marketRouter.get('/history', async (req, res, next) => {
  try {
    const crop = req.query.crop || 'Tomato';
    const yardCode = req.query.yardCode || null;

    // Try per-market history from CSV
    const csvHistory = getTelanganaMarketHistory({ crop, yardCode });
    if (csvHistory.length) {
      return res.json({ history: csvHistory, source: 'Telangana State CSV', count: csvHistory.length });
    }

    // Fallback to aggregated price history
    const history = await getPriceHistory({ crop });
    res.json({ history, source: 'aggregated', count: history.length });
  } catch (error) { next(error); }
});
