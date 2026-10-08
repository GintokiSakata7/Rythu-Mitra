import express from 'express';
import cors from 'cors';
import { env } from './lib/env.js';
import { healthRouter } from './routes/health.routes.js';
import { marketRouter } from './routes/market.routes.js';
import { recommendationRouter } from './routes/recommendation.routes.js';
import { buyerRouter } from './routes/buyer.routes.js';
import { aiRouter } from './routes/ai.routes.js';

const app = express();
app.use(cors({ origin: env.clientOrigin.split(',').map((x) => x.trim()), credentials: false }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.json({ name: 'MandiMitra API', status: 'online' }));
app.use('/api/health', healthRouter);
app.use('/api/markets', marketRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/buyers', buyerRouter);
app.use('/api/ai', aiRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error?.message || 'Internal server error' });
});

app.listen(env.port, () => {
  console.log(`MandiMitra API listening on http://localhost:${env.port}`);
});
