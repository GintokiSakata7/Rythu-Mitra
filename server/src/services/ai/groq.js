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
  const netStr = `₹${Math.round(recommendation.netRealization).toLocaleString('en-IN')}`;
  const priceStr = `₹${recommendation.pricePerKg}/kg`;
  const name = recommendation.name || recommendation.companyName;

  if (isLoss) {
    if (lang === 'te') {
      return `హెచ్చరిక: రవాణా మరియు ప్రయాణ ఖర్చులు (₹${Math.round(recommendation.transportCost || 0)}) పంట విలువ కంటే ఎక్కువగా ఉండటం వల్ల నికర నష్టం ${netStr} వచ్చింది. తక్కువ పరిమాణానికి దూరపు హోల్‌సేల్ మార్కెట్లకు వెళ్లడం కంటే స్థానిక గ్రామంలో విక్రయించడం లేదా పొరుగు రైతులతో కలిసి సరుకు తరలించడం శ్రేయస్కరం.`;
    }
    if (lang === 'hi') {
      return `चेतावनी: ढुलाई और यात्रा खर्च (₹${Math.round(recommendation.transportCost || 0)}) फसल मूल्य से अधिक होने के कारण ₹${Math.round(recommendation.netRealization)} का शुद्ध घाटा हो रहा है। इतनी छोटी मात्रा के लिए दूर की थोक मंडी जाने के बजाय स्थानीय बाज़ार में बेचें या साथी किसानों के साथ मिलकर माल भेजें।`;
    }
    return `Warning: Freight and travel costs (₹${Math.round(recommendation.transportCost || 0)}) exceed total harvest value, resulting in a net loss of ${netStr}. For small quantities, avoid individual wholesale transit; sell locally at the farmgate or pool freight with neighboring farmers.`;
  }

  if (lang === 'te') {
    return recommendation.type === 'Direct Buyer'
      ? `${name} నేరుగా కొనుగోలుదారు, ${priceStr} ధర అందిస్తున్నారు${recommendation.pickupProvided ? ' (పికప్ సదుపాయం ఉంది)' : ''}. రవాణా, సమయం, నష్టభయం లెక్కించిన తర్వాత మీ నికర ఆదాయం ${netStr}. ఇంజిన్ మొత్తం ${search?.candidatesEvaluated || 5} అవకాశాలను విశ్లేషించి రవాణా నష్టాలను తప్పించింది.`
      : `${name}లో మోడల్ ధర ${priceStr}. రవాణా మరియు సమయ ఖర్చులు పోను మీకు చేతికందే నికర మొత్తం ${netStr}. దూరం పెరిగే కొద్దీ రవాణా ఖర్చులు పెరగకుండా ఇంజిన్ ఉత్తమ మార్కెట్‌ను ఎంపిక చేసింది.`;
  }

  if (lang === 'hi') {
    return recommendation.type === 'Direct Buyer'
      ? `${name} डायरेक्ट खरीदार हैं जो ${priceStr} का ऑफर दे रहे हैं${recommendation.pickupProvided ? ' (पिकअप उपलब्ध)' : ''}। ढुलाई, समय और जोखिम घटाने के बाद आपका अनुमानित शुद्ध मुनाफा ${netStr} है। सिस्टम ने ${search?.candidatesEvaluated || 5} विकल्पों का मूल्यांकन करके अनावश्यक यात्रा से बचाया।`
      : `${name} में भाव ${priceStr} है। ढुलाई, यात्रा समय और जोखिम के बाद आपकी शुद्ध आय ${netStr} रहेगी। दूर की मंडियों में भाड़ा और नुकसान से बचाने के लिए यह सबसे किफायती विकल्प है।`;
  }

  const buyerLine = recommendation.type === 'Direct Buyer'
    ? `${name} is a direct buyer offering ${priceStr}${recommendation.pickupProvided ? ' with pickup provided' : ''}.`
    : `${name} has a modal price of ${priceStr}.`;
  return `${buyerLine} After transport, travel time and risk, the estimated net realization is ${netStr}. The optimizer evaluated ${search?.candidatesEvaluated || 5} relevant opportunities across ${search?.levelsUsed || 1} search level(s) and stopped early to avoid unnecessary travel.`;
}

export async function explainRecommendation(payload) {
  const lang = payload.language || payload.input?.language || 'en';
  if (!client) return { text: fallbackExplanation(payload, lang), provider: 'fallback' };

  let langInstruction = 'Respond in English.';
  if (lang === 'te') langInstruction = 'CRITICAL: Respond fluently and naturally in Telugu script (తెలుగు) so a Telugu-speaking farmer understands immediately.';
  else if (lang === 'hi') langInstruction = 'CRITICAL: Respond fluently and naturally in Hindi script (हिंदी) so a Hindi-speaking farmer understands immediately.';

  const system = `You are MandiMitra, an expert and empathetic agricultural market decision assistant for Indian farmers. Explain recommendations from structured calculations clearly. Never invent market prices or facts. Emphasize expected net realization, transport costs, travel time, and risk, explaining why this choice pays best after travel. If the expected net realization is negative (less than 0), explicitly warn the farmer that freight and travel costs exceed the total crop value for this small harvest quantity, and advise selling locally at the farmgate or aggregating loads with neighboring farmers rather than traveling solo to a distant mandi. Keep the explanation under 90 words. Use Indian rupee formatting (₹). If the recommendation is a direct buyer, mention the buyer and pickup terms. ${langInstruction}`;
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
