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

function chunkTextForTTS(text, maxChars = 120) {
  if (!text) return [];
  const segments = text.split(/([.!?,;:\n।|]+)/).filter(Boolean);
  const chunks = [];
  let current = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if ((current + segment).length <= maxChars) {
      current += segment;
    } else {
      if (current.trim()) chunks.push(current.trim());
      if (segment.length <= maxChars) {
        current = segment;
      } else {
        const words = segment.split(/\s+/);
        let wordChunk = '';
        for (const w of words) {
          if ((wordChunk + ' ' + w).length <= maxChars) {
            wordChunk += (wordChunk ? ' ' : '') + w;
          } else {
            if (wordChunk.trim()) chunks.push(wordChunk.trim());
            wordChunk = w;
          }
        }
        current = wordChunk;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.slice(0, 4);
}

// High-fidelity natural regional text-to-speech stream (Telugu, Hindi, English)
aiRouter.get('/tts', async (req, res, next) => {
  try {
    const text = req.query.text;
    const lang = req.query.lang || 'te';
    if (!text) return res.status(400).send('Text parameter is required');

    const googleLang = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en';
    const chunks = chunkTextForTTS(text, 120);

    if (chunks.length === 0) {
      return res.status(400).send('Invalid text content');
    }

    const buffers = [];
    for (const chunk of chunks) {
      try {
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${googleLang}&client=tw-ob`;
        const upstream = await fetch(ttsUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(6000)
        });
        if (upstream.ok) {
          const ab = await upstream.arrayBuffer();
          buffers.push(Buffer.from(ab));
        }
      } catch (err) {
        console.warn('TTS chunk fetch failed:', err.message);
      }
    }

    if (buffers.length === 0) {
      return res.status(502).send('TTS upstream request failed');
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400'
    });

    res.send(Buffer.concat(buffers));
  } catch (error) {
    next(error);
  }
});
