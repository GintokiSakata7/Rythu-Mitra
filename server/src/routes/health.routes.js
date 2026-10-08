import { Router } from 'express';
import { supabaseEnabled } from '../lib/supabase.js';
import { env } from '../lib/env.js';

export const healthRouter = Router();
healthRouter.get('/', (_req, res) => {
  res.json({ ok: true, app: 'RythuMitra API', supabaseEnabled, groqEnabled: Boolean(env.groqApiKey), time: new Date().toISOString() });
});
