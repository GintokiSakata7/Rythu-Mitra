import express from 'express';
import cors from 'cors';
import { env } from './lib/env.js';
import { healthRouter } from './routes/health.routes.js';
import { marketRouter } from './routes/market.routes.js';
import { recommendationRouter } from './routes/recommendation.routes.js';
import { buyerRouter } from './routes/buyer.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { officialRouter } from './routes/official.routes.js';
import { priceRouter } from './routes/price.routes.js';
import { adminRouter } from './routes/admin.routes.js';

const app = express();
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => res.json({ name: 'RythuMitra API', status: 'online' }));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/ping', (_req, res) => res.status(200).send('pong'));
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/official', officialRouter);
app.use('/api/prices', priceRouter);
app.use('/api/admin', adminRouter);
app.use('/api/markets', marketRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/buyers', buyerRouter);
app.use('/api/ai', aiRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: error?.message || 'Internal server error' });
});

app.listen(env.port, () => {
  console.log(`RythuMitra API listening on http://localhost:${env.port}`);
});
