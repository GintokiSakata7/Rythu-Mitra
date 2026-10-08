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
