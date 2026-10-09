import Groq from 'groq-sdk';
import { env } from '../../lib/env.js';

let client = null;
if (env.groqApiKey) client = new Groq({ apiKey: env.groqApiKey });

function fallbackExplanation({ recommendation, search }, lang = 'en') {
  if (!recommendation) {
    if (lang === 'te') return 'ఎంచుకున్న సమీప మార్కెట్లలో సరిపోయే అవకాశం లభించలేదు.';
    if (lang === 'hi') return 'उपलब्ध विकल्पों में कोई उपयुक्त मंडी या खरीदार नहीं मिला।';
    return 'No suitable opportunity was found from the configured candidate set.';
  }
  const isLoss = (recommendation.netRealization ?? 0) < 0;
  const netStr = recommendation.netRange || `₹${Math.round(recommendation.netRealization).toLocaleString('en-IN')}`;
  const priceStr = `₹${recommendation.pricePerKg}/kg`;
  const name = recommendation.name || recommendation.companyName;
  const vehicle = (lang === 'te' ? recommendation.vehicleNameTe : lang === 'hi' ? recommendation.vehicleNameHi : recommendation.vehicleName) || recommendation.vehicleName || 'వాహనం';
  const transportStr = recommendation.transportRange || `₹${Math.round(recommendation.transportCost || 0).toLocaleString('en-IN')}`;

  if (isLoss) {
    if (lang === 'te') {
      return `హెచ్చరిక: ${vehicle} రవాణా ఖర్చు (${transportStr}) పంట విలువ కంటే ఎక్కువగా ఉండటం వల్ల నికర నష్టం (${netStr}) వచ్చే అవకాశం ఉంది. తక్కువ పరిమాణానికి దూరపు మార్కెట్లకు వెళ్లకుండా స్థానికంగా విక్రయించడం లేదా ఇతర రైతులతో కలిసి వాహనం మాట్లాడుకోవడం శ్రేయస్కరం.`;
    }
    if (lang === 'hi') {
      return `चेतावनी: ${vehicle} ढुलाई खर्च (${transportStr}) फसल मूल्य से अधिक होने के कारण अनुमानित घाटा (${netStr}) हो सकता है। इतनी कम मात्रा के लिए दूर की मंडी जाने के बजाय स्थानीय स्तर पर बेचें या अन्य किसानों के साथ मिलकर वाहन साझा करें।`;
    }
    return `Warning: ${vehicle} transport freight (${transportStr}) exceeds harvest value, resulting in an estimated net loss (${netStr}). For this volume, sell locally at the farmgate or pool transport with neighbors instead of hiring a vehicle alone.`;
  }

  if (lang === 'te') {
    return recommendation.type === 'Direct Buyer'
      ? `${name} నేరుగా కొనుగోలుదారు, ${priceStr} ధర అందిస్తున్నారు (${vehicle}, రవాణా ఖర్చు: ${transportStr}). అన్ని ఖర్చులు పోను మీ అంచనా నికర ఆదాయం ${netStr}. ఇంజిన్ మొత్తం ${search?.candidatesEvaluated || 5} అవకాశాలను విశ్లేషించి లాభదాయకమైన ఎంపికను ఇచ్చింది.`
      : `${name} మార్కెట్‌లో ధర ${priceStr}. సిఫార్సు చేసిన రవాణా: ${vehicle} (ఖర్చు: ${transportStr}). రవాణా మరియు సమయం పోను చేతికందే నికర మొత్తం ${netStr}. దూరం మరియు వాహన ఖర్చులను లెక్కించి ఇది ఉత్తమమైనదిగా నిర్ణయించబడింది.`;
  }

  if (lang === 'hi') {
    return recommendation.type === 'Direct Buyer'
      ? `${name} डायरेक्ट खरीदार हैं जो ${priceStr} का भाव दे रहे हैं (${vehicle}, ढुलाई: ${transportStr})। सभी खर्चों के बाद आपका अनुमानित शुद्ध मुनाफा ${netStr} रहेगा। सिस्टम ने ${search?.candidatesEvaluated || 5} विकल्पों में से सबसे फायदेमंद सौदा चुना है।`
      : `${name} मंडी में भाव ${priceStr} है। अनुशंसित वाहन: ${vehicle} (अनुमानित भाड़ा: ${transportStr})। ढुलाई और समय लागत के बाद आपकी शुद्ध आय ${netStr} रहेगी।`;
  }

  const buyerLine = recommendation.type === 'Direct Buyer'
    ? `${name} is a direct buyer offering ${priceStr} (${vehicle}, freight: ${transportStr}).`
    : `${name} offers ${priceStr} via ${vehicle} (est. freight: ${transportStr}).`;
  return `${buyerLine} After estimated transit and risk, your expected net realization is ${netStr}. The optimizer evaluated ${search?.candidatesEvaluated || 5} opportunities across ${search?.levelsUsed || 1} search level(s) to maximize your farm earnings.`;
}

export async function explainRecommendation(payload) {
  const lang = payload.language || payload.input?.language || 'en';
  if (!client) return { text: fallbackExplanation(payload, lang), provider: 'fallback' };

  let langInstruction = 'Respond in English.';
  if (lang === 'te') langInstruction = 'CRITICAL: Respond fluently and naturally in Telugu script (తెలుగు) so a Telugu-speaking farmer understands immediately.';
  else if (lang === 'hi') langInstruction = 'CRITICAL: Respond fluently and naturally in Hindi script (हिंदी) so a Hindi-speaking farmer understands immediately.';

  const system = `You are RythuMitra, an expert and empathetic agricultural market decision assistant for Indian farmers. Explain recommendations from structured calculations clearly. Never invent market prices or facts. Emphasize expected net realization range (netRange), realistic vehicle tier (vehicleName), and estimated freight cost range (transportRange), explaining why this vehicle and mandi choice yields the highest net return after round-trip logistics. If expected net realization is negative, warn the farmer against hiring a solo vehicle for small tonnage and advise local pooling or farmgate sale. Keep the explanation concise under 85 words. Use Indian rupee formatting (₹). If the recommendation is a direct buyer, highlight farmgate pickup terms. ${langInstruction}`;
  try {
    const completion = await client.chat.completions.create({
      model: env.groqModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(payload) }
      ]
    });
    return { text: completion.choices?.[0]?.message?.content?.trim() || fallbackExplanation(payload, lang), provider: 'groq' };
  } catch {
    return { text: fallbackExplanation(payload, lang), provider: 'fallback' };
  }
}

export async function parseHarvestText({ text }) {
  if (!client) return localParse(text);
  const system = `Extract farmer harvest intent from the user's message. Return JSON only with keys: crop, quantityKg, locationText, quality, hasTransport, perishability. quantityKg must be numeric or null. hasTransport should be boolean or null. Do not invent missing values.`;
  const completion = await client.chat.completions.create({
    model: env.groqModel,
    temperature: 0,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: text }
    ],
    response_format: { type: 'json_object' }
  });
  try {
    return { parsed: JSON.parse(completion.choices?.[0]?.message?.content || '{}'), provider: 'groq' };
  } catch {
    return { parsed: localParse(text), provider: 'fallback' };
  }
}

function localParse(text = '') {
  const crop = /tomato|tomatoes|టమాట/i.test(text) ? 'Tomato' : null;
  const match = text.match(/([\d,.]+)\s*(kg|kgs|ton|tons|tonnes|కిలోలు)/i);
  const raw = match ? Number(match[1].replace(/,/g, '')) : null;
  const quantityKg = match ? (/ton|tonnes/i.test(match[2]) ? raw * 1000 : raw) : null;
  const hasTransport = /have transport|own vehicle|వాహనం ఉంది/i.test(text) ? true : /no transport|need transport|వాహనం లేదు/i.test(text) ? false : null;
  return { crop, quantityKg, locationText: null, quality: null, hasTransport, perishability: 'high' };
}
