import { Router } from 'express';
import { explainRecommendation, parseHarvestText } from '../services/ai/groq.js';

export const aiRouter = Router();
aiRouter.post('/explain', async (req, res, next) => {
  try { res.json(await explainRecommendation(req.body)); } catch (error) { next(error); }
});
aiRouter.post('/parse-harvest', async (req, res, next) => {
  try {
    if (!req.body?.text) return res.status(400).json({ error: 'text is required' });
    res.json(await parseHarvestText({ text: req.body.text }));
  } catch (error) { next(error); }
});
