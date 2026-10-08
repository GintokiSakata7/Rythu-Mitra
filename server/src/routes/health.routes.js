import { Router } from 'express';
import { supabaseEnabled } from '../lib/supabase.js';
import { env } from '../lib/env.js';

import { supabase } from '../lib/supabase.js';

export const healthRouter = Router();
healthRouter.get('/', async (_req, res) => {
  let count = -1;
  let errorMsg = null;
  if (supabaseEnabled) {
    try {
      const { count: c, error } = await supabase.from('telangana_market_prices').select('*', { count: 'exact', head: true });
      count = c;
      errorMsg = error ? error.message : null;
    } catch (e) {
      errorMsg = e.message;
    }
  }
  res.json({ ok: true, app: 'RythuMitra API', supabaseEnabled, groqEnabled: Boolean(env.groqApiKey), time: new Date().toISOString(), dbCount: count, dbError: errorMsg });
});

healthRouter.get('/test', async (req, res) => {
  const { data, error } = await supabase.from('telangana_market_prices').select('*').ilike('commodity', '%Tomato%');
  res.json({ data, error });
});

import { getMarkets } from '../services/data/marketRepository.js';
import { getTelanganaFallbackPrices } from '../services/data/telanganaData.js';
healthRouter.get('/test2', async (req, res) => {
  try {
    const fallbackPrices = await getTelanganaFallbackPrices({ crop: 'Tomato' });
    const markets = await getMarkets({ crop: 'Tomato' });
    res.json({ fallbackPrices, fallbackCount: fallbackPrices?.length, marketsCount: markets?.length });
  } catch (e) {
    res.json({ error: e.message, stack: e.stack });
  }
});
