import { Router } from 'express';
import { createBuyerRequirement, getBuyerRequirements } from '../services/data/marketRepository.js';

export const buyerRouter = Router();

buyerRouter.get('/requirements', async (req, res, next) => {
  try {
    res.json({ requirements: await getBuyerRequirements({ crop: req.query.crop || '' }) });
  } catch (error) { next(error); }
});

buyerRouter.post('/requirements', async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.companyName || !body.crop || !body.quantityKg || !body.offerPrice) return res.status(400).json({ error: 'companyName, crop, quantityKg and offerPrice are required' });
    const row = await createBuyerRequirement(body);
    res.status(201).json({ requirement: row });
  } catch (error) { next(error); }
});
