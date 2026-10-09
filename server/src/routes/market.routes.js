import { Router } from 'express';
import { getNearbyMarkets, getMarkets, getPriceHistory } from '../services/data/marketRepository.js';
import { getTelanganaCommmodities, getTelanganaMarketHistory } from '../services/data/telanganaData.js';
import { supabase } from '../lib/supabase.js';

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

// GET /api/markets/trends — live market trends and recent prices from market_prices table
marketRouter.get('/trends', async (req, res, next) => {
  try {
    const crop = (req.query.crop || '').trim();
    const market = (req.query.market || '').trim();
    const limit = Math.min(Number(req.query.limit) || 100, 200);

    let query = supabase
      .from('market_prices')
      .select('*')
      .order('price_date', { ascending: false })
      .limit(limit);

    if (crop) {
      query = query.ilike('commodity_name', `%${crop}%`);
    }
    if (market) {
      query = query.or(`yard_name.ilike.%${market}%,amc_name.ilike.%${market}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[marketRouter] Error fetching trends from market_prices:', error);
      return res.status(500).json({ error: error.message });
    }

    const items = (data || []).map(r => ({
      id: r.id,
      date: r.price_date,
      market: r.yard_name || r.amc_name,
      amcName: r.amc_name,
      yardCode: r.yard_code,
      crop: r.commodity_name,
      variety: r.variety_name,
      arrivalsQuintal: Number(r.arrivals || 0),
      minPriceQuintal: Number(r.min_price || 0),
      maxPriceQuintal: Number(r.max_price || 0),
      modalPriceQuintal: Number(r.modal_price || 0),
      minPriceKg: Number((Number(r.min_price || 0) / 100).toFixed(2)),
      maxPriceKg: Number((Number(r.max_price || 0) / 100).toFixed(2)),
      modalPriceKg: Number((Number(r.modal_price || 0) / 100).toFixed(2)),
    }));

    // Compute summary stats if items exist
    let summary = null;
    if (items.length > 0) {
      const modalPrices = items.map(x => x.modalPriceKg).filter(p => p > 0);
      const latestPrice = modalPrices[0] || 0;
      const avgPrice = modalPrices.length ? Number((modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length).toFixed(2)) : latestPrice;
      const minPrice = Math.min(...items.map(x => x.minPriceKg).filter(p => p > 0));
      const maxPrice = Math.max(...items.map(x => x.maxPriceKg).filter(p => p > 0));
      const prevPrice = modalPrices[1] || avgPrice;
      const changePct = prevPrice > 0 ? Number((((latestPrice - prevPrice) / prevPrice) * 100).toFixed(1)) : 0;

      summary = {
        crop: crop || 'All Commodities',
        market: market || 'All Telangana Mandis',
        latestModalPriceKg: latestPrice,
        avgModalPriceKg: avgPrice,
        minPriceKg: isFinite(minPrice) ? minPrice : latestPrice,
        maxPriceKg: isFinite(maxPrice) ? maxPrice : latestPrice,
        changePct,
        trendDirection: changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'stable',
        totalArrivalsQuintals: items.reduce((sum, x) => sum + x.arrivalsQuintal, 0),
        recordCount: items.length
      };
    }

    res.json({
      trends: items,
      summary,
      count: items.length,
      source: 'Supabase (market_prices)'
    });
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
