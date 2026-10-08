import { Router } from 'express';
import { explainRecommendation, parseHarvestText } from '../services/ai/groq.js';

export const aiRouter = Router();

aiRouter.post('/explain', async (req, res, next) => {
  try {
    res.json(await explainRecommendation(req.body));
  } catch (error) {
    next(error);
  }
});

aiRouter.post('/parse-harvest', async (req, res, next) => {
  try {
    if (!req.body?.text) return res.status(400).json({ error: 'text is required' });
    res.json(await parseHarvestText({ text: req.body.text }));
  } catch (error) {
    next(error);
  }
});

// High-fidelity natural regional text-to-speech stream (Telugu, Hindi, English)
aiRouter.get('/tts', async (req, res, next) => {
  try {
    const text = req.query.text;
    const lang = req.query.lang || 'te';
    if (!text) return res.status(400).send('Text parameter is required');

    // Limit text chunk for fast audio stream
    const cleanText = text.slice(0, 350);
    const googleLang = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en';
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${googleLang}&client=tw-ob`;

    const upstream = await fetch(ttsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send('TTS upstream request failed');
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400'
    });

    const arrayBuffer = await upstream.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    next(error);
  }
});
