import { Router } from 'express';
import { optimizeSellingOpportunity } from '../services/optimizer/search.js';
import { explainRecommendation } from '../services/ai/groq.js';
import { env } from '../lib/env.js';

export const recommendationRouter = Router();

recommendationRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    const input = {
      crop: body.crop || 'Tomato',
      quantityKg: Number(body.quantityKg),
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      locationText: body.locationText || '',
      quality: body.quality || 'A',
      hasTransport: Boolean(body.hasTransport),
      perishability: body.perishability || 'high',
      includeBuyers: body.includeBuyers !== false,
      language: body.language || 'en'
    };
    if (!input.quantityKg || input.quantityKg <= 0) return res.status(400).json({ error: 'quantityKg must be greater than zero' });
    if (![input.latitude, input.longitude].every(Number.isFinite)) return res.status(400).json({ error: 'valid latitude and longitude are required' });

    const result = await optimizeSellingOpportunity(input);
    const ai = await explainRecommendation({ recommendation: result.recommendation, search: result.search, input, language: input.language });

    res.json({
      ...result,
      explanation: ai.text,
      aiProvider: ai.provider,
      assumptions: {
        transportRatePerKm: env.transportRatePerKm,
        timeValuePerHour: env.timeValuePerHour,
        riskRatePerKm: env.riskRatePerKm,
        note: 'These are prototype assumptions and should be calibrated before real deployment.'
      }
    });
  } catch (error) { next(error); }
});
