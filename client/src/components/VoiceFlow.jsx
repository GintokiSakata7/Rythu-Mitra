import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Navigation, MapPin, Check,
  ChevronRight, ArrowLeft, RefreshCw, Sparkles, TrendingUp,
  Truck, Clock, AlertTriangle, ShieldCheck, Award, Loader2,
  Play, Pause, X, Radio
} from 'lucide-react';
import { api } from '../lib/api.js';
import OpportunityCard from './OpportunityCard.jsx';
import OptimizerTrace from './OptimizerTrace.jsx';
import MarketMap from './MarketMap.jsx';

// Multi-language conversational prompts
const LANG_DATA = {
  te: {
    name: 'తెలుగు',
    nativeLabel: 'తెలుగు (Telugu)',
    code: 'te-IN',
    welcome: 'నమస్కారం! నేను రైతుమిత్రను.',
    q1: 'మీరు ఏ పంటను అమ్మాలనుకుంటున్నారు?',
    q1_sub: 'టమాట, ఉల్లిపాయ, బంగాళాదుంప, మిరప లేదా పత్తి చెప్పండి...',
    q2_prefix: 'గుర్తించబడింది. మీ దగ్గర ఎంత పరిమాణం ఉంది?',
    q2_sub: 'కిలోలు లేదా టన్నుల్లో చెప్పండి (ఉదా: 5 టన్నులు లేదా 5000 కేజీలు)...',
    q3: 'మీ పొలం ఎక్కడ ఉంది?',
    q3_sub: 'నల్గొండ, సూర్యాపేట, మిర్యాలగూడ చెప్పండి లేదా GPS బటన్ నొక్కండి...',
    q4: 'మీకు స్వంత రవాణా వాహనం ఉందా?',
    q4_sub: 'ఉంది లేదా లేదు అని చెప్పండి...',
    analyzing: 'అన్ని మార్కెట్లు మరియు కొనుగోలుదారులను లెక్కిస్తున్నాను...',
    analyzing_sub: 'రవాణా ఖర్చు, సమయం, నష్టభయం తీసివేసి అత్యధిక నికర లాభాన్ని లెక్కిస్తున్నాను...',
    state_listening: 'వింటున్నాను... మాట్లాడండి',
    state_speaking: 'రైతుమిత్ర మాట్లాడుతోంది...',
    state_thinking: 'ఆలోచిస్తున్నాను...',
    state_tap_speak: 'మాట్లాడటానికి తాకండి',
    gps_btn: '📍 నా GPS లొకేషన్ వాడండి',
    gps_success: 'GPS లొకేషన్ విజయవంతంగా గుర్తించబడింది!',
    gps_error: 'GPS గుర్తించలేకపోయాము. దయచేసి పట్టణం పేరు చెప్పండి.',
    transport_yes: '🚚 అవును, వాహనం ఉంది',
    transport_no: '❌ లేదు, రవాణా కావాలి',
    best_badge: 'అత్యుత్తమ మార్కెట్ సిఫార్సు',
    loss_badge: '⚠️ రవాణా నష్ట హెచ్చరిక (రవాణా ఖర్చు ఎక్కువ)',
    loss_net_label: 'అంచనా నికర నష్టం (Net Realization Loss)',
    loss_per_kg: 'నికర నష్టం',
    loss_advice_title: '💡 రైతు ఆర్థిక సలహా (Farmer Economic Advisory)',
    loss_advice_desc: '4 కిలోల వంటి తక్కువ పరిమాణానికి దూరపు హోల్‌సేల్ మార్కెట్‌కు వెళ్లడం వల్ల రవాణా ఖర్చులు (₹700) పంట విలువ కంటే ఎక్కువవుతాయి. దీనిని స్థానిక గ్రామంలో/సమీప రిటైల్ విక్రేతలకు అమ్మడం లేదా సమీప రైతుల సరుకుతో కలిపి (అగ్రిగేషన్) తరలించడం లాభదాయకం.',
    net_realization: 'చేతికందే నికర మొత్తం (Net Realization)',
    gross_val: 'మొత్తం అమ్మకపు విలువ',
    transport_cost: 'రవాణా ఖర్చు',
    time_cost: 'సమయ ఖర్చు',
    risk_cost: 'వృధా/నష్టభయం',
    why_this_won: 'ఈ మార్కెట్ ఎందుకు గెలిచింది?',
    listen_again: 'మళ్ళీ వినండి',
    stop_audio: 'ఆపండి',
    restart: 'నయా వాయిస్ సెషన్',
    edit: 'సవరించండి',
    crops: [
      { id: 'Tomato', label: '🍅 టమాట (Tomato)' },
      { id: 'Onion', label: '🧅 ఉల్లిపాయ (Onion)' },
      { id: 'Potato', label: '🥔 బంగాళాదుంప (Potato)' },
      { id: 'Chilli', label: '🌶️ మిరప (Chilli)' },
      { id: 'Cotton', label: '🌾 పత్తి (Cotton)' }
    ],
    quantities: [
      { val: 1000, label: '1,000 kg (1 టన్ను)' },
      { val: 2500, label: '2,500 kg (2.5 టన్నులు)' },
      { val: 5000, label: '5,000 kg (5 టన్నులు)' },
      { val: 10000, label: '10,000 kg (10 టన్నులు)' }
    ],
    locations: [
      { name: 'Nalgonda', label: 'నల్గొండ (Nalgonda)', lat: 17.05, lng: 79.27 },
      { name: 'Suryapet', label: 'సూర్యాపేట (Suryapet)', lat: 17.14, lng: 79.62 },
      { name: 'Miryalaguda', label: 'మిర్యాలగూడ (Miryalaguda)', lat: 16.87, lng: 79.56 },
      { name: 'Hyderabad', label: 'హైదరాబాద్ (Hyderabad)', lat: 17.385, lng: 78.4867 }
    ]
  },
  hi: {
    name: 'हिंदी',
    nativeLabel: 'हिंदी (Hindi)',
    code: 'hi-IN',
    welcome: 'नमस्ते! मैं रैतुमित्र हूँ।',
    q1: 'आप कौन सी फसल बेचना चाहते हैं?',
    q1_sub: 'टमाटर, प्याज, आलू, मिर्च या कपास बोलें...',
    q2_prefix: 'दर्ज हो गया। आपके पास कितनी मात्रा है?',
    q2_sub: 'किलो या टन में बताएं (जैसे: 5 टन या 5000 किलो)...',
    q3: 'आपका खेत या गाँव कहाँ है?',
    q3_sub: 'नलगोंडा, सूर्यापेट, मिर्यालगुडा बोलें या GPS बटन दबाएं...',
    q4: 'क्या आपके पास अपना वाहन या गाड़ी है?',
    q4_sub: 'हाँ या नहीं बोलें...',
    analyzing: 'आसपास की मंडियों और खरीदारों का विश्लेषण हो रहा है...',
    analyzing_sub: 'भाड़ा, यात्रा समय और नुकसान घटाकर अधिकतम शुद्ध मुनाफा खोज रहे हैं...',
    state_listening: 'सुन रहा हूँ... बोलिए',
    state_speaking: 'रैतुमित्र बोल रहा है...',
    state_thinking: 'सोच रहा हूँ...',
    state_tap_speak: 'बोलने के लिए टैप करें',
    gps_btn: '📍 वर्तमान GPS स्थान उपयोग करें',
    gps_success: 'GPS स्थान सफलतापूर्वक मिल गया!',
    gps_error: 'GPS नहीं मिला। कृपया स्थान का नाम बोलें।',
    transport_yes: '🚚 हाँ, अपनी गाड़ी है',
    transport_no: '❌ नहीं, परिवहन चाहिए',
    best_badge: 'सर्वश्रेष्ठ मंडी / खरीदार सिफ़ारिश',
    loss_badge: '⚠️ परिवहन घाटा चेतावनी (भाड़ा फसल से अधिक)',
    loss_net_label: 'अनुमानित शुद्ध घाटा (Net Realization Loss)',
    loss_per_kg: 'शुद्ध घाटा',
    loss_advice_title: '💡 किसान आर्थिक सलाह (Farmer Economic Advisory)',
    loss_advice_desc: 'छोटी मात्रा (जैसे 4 किलो) के लिए दूर की थोक मंडी जाने पर ढुलाई खर्च (₹700) फसल की कुल कीमत से अधिक हो जाता है। इस घाटे से बचने के लिए माल को स्थानीय बाज़ार में बेचें या पास के किसानों के साथ मिलकर वाहन साझा करें।',
    net_realization: 'शुद्ध प्राप्ति (Net Realization)',
    gross_val: 'कुल बिक्री मूल्य',
    transport_cost: 'ढुलाई खर्च',
    time_cost: 'समय खर्च',
    risk_cost: 'जोखिम खर्च',
    why_this_won: 'यह विकल्प सर्वश्रेष्ठ क्यों है?',
    listen_again: 'फिर से सुनें',
    stop_audio: 'रोकें',
    restart: 'नया वॉइस सत्र',
    edit: 'बदलें',
    crops: [
      { id: 'Tomato', label: '🍅 टमाटर (Tomato)' },
      { id: 'Onion', label: '🧅 प्याज (Onion)' },
      { id: 'Potato', label: '🥔 आलू (Potato)' },
      { id: 'Chilli', label: '🌶️ मिर्च (Chilli)' },
      { id: 'Cotton', label: '🌾 कपास (Cotton)' }
    ],
    quantities: [
      { val: 1000, label: '1,000 किलो (1 टन)' },
      { val: 2500, label: '2,500 किलो (2.5 टन)' },
      { val: 5000, label: '5,000 किलो (5 टन)' },
      { val: 10000, label: '10,000 किलो (10 टन)' }
    ],
    locations: [
      { name: 'Nalgonda', label: 'नलगोंडा (Nalgonda)', lat: 17.05, lng: 79.27 },
      { name: 'Suryapet', label: 'सूर्यापेट (Suryapet)', lat: 17.14, lng: 79.62 },
      { name: 'Miryalaguda', label: 'मिर्यालगुडा (Miryalaguda)', lat: 16.87, lng: 79.56 },
      { name: 'Hyderabad', label: 'हैदराबाद (Hyderabad)', lat: 17.385, lng: 78.4867 }
    ]
  },
  en: {
    name: 'English',
    nativeLabel: 'English',
    code: 'en-IN',
    welcome: 'Hello! I am RythuMitra.',
    q1: 'What crop do you want to sell?',
    q1_sub: 'Say Tomato, Onion, Potato, Chilli, or Cotton...',
    q2_prefix: 'noted. How much quantity do you have?',
    q2_sub: 'Say in kilograms or tons (e.g. 5 tons or 5000 kg)...',
    q3: 'Where is your farm located?',
    q3_sub: 'Speak Nalgonda, Suryapet, Hyderabad or tap GPS...',
    q4: 'Do you have your own transport vehicle?',
    q4_sub: 'Say yes or no...',
    analyzing: 'Evaluating nearby mandis and direct buyers...',
    analyzing_sub: 'Factoring in transport, travel time, and spoilage risk to maximize your net profit...',
    state_listening: 'Listening... speak now',
    state_speaking: 'RythuMitra is speaking...',
    state_thinking: 'Thinking...',
    state_tap_speak: 'Tap to speak',
    gps_btn: '📍 Use Current GPS Location',
    gps_success: 'GPS location detected successfully!',
    gps_error: 'Could not access GPS. Please speak your town name.',
    transport_yes: '🚚 Yes, I have a vehicle',
    transport_no: '❌ No, need transport',
    best_badge: 'Optimal Recommendation',
    loss_badge: '⚠️ Transport Loss Warning (Costs Exceed Crop Value)',
    loss_net_label: 'Estimated Net Loss (Negative Realization)',
    loss_per_kg: 'net loss',
    loss_advice_title: '💡 Farmer Economic Advisory',
    loss_advice_desc: 'For small harvest quantities (e.g. 4 kg), distant wholesale transit costs (₹700) exceed total crop value. Avoid solo freight; sell at local farmgate or pool loads with neighboring farmers to avoid transit loss.',
    net_realization: 'Expected Net Realization',
    gross_val: 'Gross Sale Value',
    transport_cost: 'Transport Cost',
    time_cost: 'Travel Time Cost',
    risk_cost: 'Spoilage Discount',
    why_this_won: 'Why this option delivers highest profit',
    listen_again: 'Listen Again',
    stop_audio: 'Stop Audio',
    restart: 'Start New Voice Search',
    edit: 'Edit Details',
    crops: [
      { id: 'Chilli', label: '🌶️ Chilli' },
      { id: 'Potato', label: '🥔 Potato' },
      { id: 'Tomato', label: '🍅 Tomato' },
      { id: 'Onion', label: '🧅 Onion' },
      { id: 'Cotton', label: '🌾 Cotton' }
    ],
    quantities: [
      { val: 1000, label: '1,000 kg (1 Ton)' },
      { val: 2500, label: '2,500 kg (2.5 Tons)' },
      { val: 5000, label: '5,000 kg (5 Tons)' },
      { val: 10000, label: '10,000 kg (10 Tons)' }
    ],
    locations: [
      { name: 'Balapur', label: 'Hyderabad (Balapur)', lat: 17.3117, lng: 78.5146 },
      { name: 'Nalgonda', label: 'Nalgonda', lat: 17.05, lng: 79.27 },
      { name: 'Suryapet', label: 'Suryapet', lat: 17.14, lng: 79.62 },
      { name: 'Miryalaguda', label: 'Miryalaguda', lat: 16.87, lng: 79.56 },
      { name: 'Hyderabad', label: 'Hyderabad', lat: 17.385, lng: 78.4867 }
    ]
  }
};

// ============================================================
// LOW-LATENCY ASSISTANT AUDIO
// Reuse ONE AudioContext instead of creating a new one per chime.
// ============================================================
let sharedVoiceAudioContext = null;

function getSharedVoiceAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedVoiceAudioContext) {
    sharedVoiceAudioContext = new AudioCtx();
  }

  if (sharedVoiceAudioContext.state === 'suspended') {
    sharedVoiceAudioContext.resume().catch(() => {});
  }

  return sharedVoiceAudioContext;
}

function playAlexaChime(type = 'wake') {
  const ctx = getSharedVoiceAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (type === 'wake') {
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.14);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.075);
    gain2.gain.setValueAtTime(0.0001, now + 0.075);
    gain2.gain.exponentialRampToValueAtTime(0.2, now + 0.095);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.31);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.075);
    osc2.stop(now + 0.32);
    return;
  }

  if (type === 'confirm') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, now);
    osc.frequency.exponentialRampToValueAtTime(659, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
    return;
  }

  if (type === 'success') {
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + index * 0.055;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.11, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.34);
    });
  }
}

// ==================== FAST MULTI-LINGUAL INTENT RECOGNITION ====================
function detectInstantIntent(rawText, currentStep) {
  if (!rawText) return null;
  const t = rawText.toLowerCase().trim();

  // STEP 1: CROP
  if (currentStep === 1) {
    if (/tomato|tomatoes|టమాట|టమోట|टमाटर|tamaatar|tamata/i.test(t)) {
      return { type: 'crop', value: 'Tomato' };
    }
    if (/onion|onions|ఉల్లి|ఉల్లిపాయ|प्याज|pyaaz|pyaj|ulli/i.test(t)) {
      return { type: 'crop', value: 'Onion' };
    }
    if (/potato|potatoes|ఆలూ|ఆలు|आलू|బంగాళా|బంగాళాదుంప|aloo|alu|bangala/i.test(t)) {
      return { type: 'crop', value: 'Potato' };
    }
    if (/chilli|chili|chillies|మిరప|మిర్చి|मिर्च|मिर्ची|mirchi|mirapa|mirch/i.test(t)) {
      return { type: 'crop', value: 'Chilli' };
    }
    if (/cotton|పత్తి|कपास|patti|kapas/i.test(t)) {
      return { type: 'crop', value: 'Cotton' };
    }
  }

  // STEP 2: QUANTITY
  if (currentStep === 2) {
    const numMatch = t.match(/(\d+(?:\.\d+)?)/);
    const hasTon = /ton|tons|tonne|tonnes|టన్|టన్ను|टन/i.test(t);
    const hasKg = /kg|kgs|kilo|kilos|కిలో|किलो/i.test(t);

    let spokenVal = null;
    if (/\b(one|ek|okati|ఒక|एक)\b/i.test(t)) spokenVal = 1;
    else if (/\b(two|do|rendu|రెండు|दो)\b/i.test(t)) spokenVal = 2;
    else if (/\b(two and a half|dhāī|arāi|2.5)\b/i.test(t)) spokenVal = 2.5;
    else if (/\b(five|panch|paanch|aidu|ఐదు|पांच)\b/i.test(t)) spokenVal = 5;
    else if (/\b(ten|das|padi|పది|दस)\b/i.test(t)) spokenVal = 10;

    if (numMatch || spokenVal !== null) {
      let val = numMatch ? parseFloat(numMatch[1]) : spokenVal;
      if (hasTon || (!hasKg && val <= 50)) {
        val = val * 1000;
      }
      if (val >= 100) {
        return { type: 'quantity', value: Math.round(val) };
      }
    }
  }

  // STEP 3: LOCATION
  if (currentStep === 3) {
    if (/gps|current|location|జీపీఎస్|స్థానం|यहाँ|లొకేషన్|యక్కడ|yahin|ikada/i.test(t)) {
      return { type: 'location_gps' };
    }
    if (/nalgonda|నల్గొండ|नलगोंडा|nalgunda/i.test(t)) {
      return { type: 'location', name: 'Nalgonda', lat: 17.05, lng: 79.27 };
    }
    if (/suryapet|సూర్యాపేట|सूर्यापेट|suryapeta/i.test(t)) {
      return { type: 'location', name: 'Suryapet', lat: 17.14, lng: 79.62 };
    }
    if (/miryalaguda|మిర్యాలగూడ|मिर्यालगुडा|miryalguda/i.test(t)) {
      return { type: 'location', name: 'Miryalaguda', lat: 16.87, lng: 79.56 };
    }
    if (/hyderabad|హైదరాబాద్|हैदराबाद|secunderabad/i.test(t)) {
      return { type: 'location', name: 'Hyderabad', lat: 17.385, lng: 78.4867 };
    }
  }

  // STEP 4: TRANSPORT
  if (currentStep === 4) {
    if (/\b(yes|ha|haan|avunu|అవును|హా|हाँ|undi|ఉంది|hai|vehicle|gaadi|apna|own|tractor|auto|lorry)\b/i.test(t)) {
      return { type: 'transport', value: true };
    }
    if (/\b(no|nahi|nahin|ledu|లేదు|नहीं|leydhu|don't|not|chahiye|need transport)\b/i.test(t)) {
      return { type: 'transport', value: false };
    }
  }

  return null;
}

// Select natural sounding voice for Indian regional languages
function pickBestVoice(voices, langCode) {
  if (!voices || voices.length === 0) return null;
  const langKey = langCode.slice(0, 2).toLowerCase();

  if (langKey === 'te') {
    const te = voices.find(v => v.lang.startsWith('te') || /telugu/i.test(v.name));
    if (te) return te;
    const inVoice = voices.find(v => v.lang === 'en-IN' || /india/i.test(v.name));
    if (inVoice) return inVoice;
  }

  if (langKey === 'hi') {
    const hi = voices.find(v => v.lang.startsWith('hi') || /hindi|swara|hemant|madhur/i.test(v.name));
    if (hi) return hi;
    const inVoice = voices.find(v => v.lang === 'en-IN' || /india/i.test(v.name));
    if (inVoice) return inVoice;
  }

  const en = voices.find(v =>
    (v.lang === 'en-IN' || v.lang === 'en-US') &&
    /natural|neural|google|jenny|aria|guy/i.test(v.name)
  ) || voices.find(v => v.lang.startsWith('en'));

  return en || voices[0];
}

export default function VoiceFlow({ onSwitchToManual }) {
  // Steps: 0: Language, 1: Crop, 2: Quantity, 3: Location, 4: Transport, 5: Recommendation
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState('te');
  const t = LANG_DATA[lang] || LANG_DATA.en;

  // Assistant states: 'idle' | 'speaking' | 'listening' | 'thinking'
  const [assistantState, setAssistantState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [micVolume, setMicVolume] = useState(1);
  const [harmonicLevels, setHarmonicLevels] = useState([8, 12, 16, 10, 8]);
  const [gpsStatus, setGpsStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Harvest state
  const [answers, setAnswers] = useState({
    crop: 'Tomato',
    quantityKg: 5000,
    locationText: 'Nalgonda',
    latitude: 17.05,
    longitude: 79.27,
    hasTransport: false,
    quality: 'A',
    perishability: 'high',
    includeBuyers: true
  });

  const stepRef = useRef(step);
  stepRef.current = step;

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const assistantStateRef = useRef(assistantState);
  assistantStateRef.current = assistantState;

  // Voice Session Refs
  const transcriptRef = useRef('');
  const finalTranscriptRef = useRef('');
  const committingRef = useRef(false);
  const hasSpeechRef = useRef(false);
  const lastVoiceAtRef = useRef(0);
  const listeningSessionRef = useRef(0);
  const commitListeningRef = useRef(null);
  const startListeningRef = useRef(null);
  const lastVisualUpdateRef = useRef(0);

  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const synthRef = useRef(null);
  const currentAudioRef = useRef(null);
  const speechWatchdogRef = useRef(null);
  const autoListenTimeoutRef = useRef(null);
  const interimDebounceRef = useRef(null);
  const voicesListRef = useRef([]);

  // Live database commodities and markets
  const [dbCrops, setDbCrops] = useState([]);
  const [dbMarkets, setDbMarkets] = useState([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.commodities(), api.markets()])
      .then(([cData, mData]) => {
        if (!isMounted) return;
        if (cData?.commodities?.length) setDbCrops(cData.commodities);
        if (mData?.markets?.length) setDbMarkets(mData.markets);
      })
      .catch(console.error);
    return () => { isMounted = false; };
  }, []);

  const activeCrops = useMemo(() => {
    if (dbCrops.length > 0) {
      return dbCrops.slice(0, 8).map(c => ({ id: c.name, label: c.name }));
    }
    return t.crops;
  }, [dbCrops, t.crops]);

  const activeLocations = useMemo(() => {
    if (dbMarkets.length > 0) {
      return dbMarkets.slice(0, 8).map(m => {
        const cleanName = m.name.replace(/ market/i, '').trim();
        return {
          name: cleanName,
          label: `${cleanName} (${m.district || 'Telangana'})`,
          lat: m.latitude,
          lng: m.longitude
        };
      });
    }
    return t.locations;
  }, [dbMarkets, t.locations]);

  // Cache voices on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const updateVoices = () => {
        voicesListRef.current = window.speechSynthesis.getVoices();
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // ============================================================
  // VOICE ENGINE
  // ============================================================
  const stopSpeech = useCallback(() => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch {}
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (speechWatchdogRef.current) {
      clearTimeout(speechWatchdogRef.current);
      speechWatchdogRef.current = null;
    }
    synthRef.current = null;
    window.__rythumitraActiveUtterance = null;
    setAssistantState(prev => (prev === 'speaking' ? 'idle' : prev));
  }, []);

  const stopListening = useCallback(() => {
    // Invalidate previous recognition session
    listeningSessionRef.current += 1;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    hasSpeechRef.current = false;
    lastVoiceAtRef.current = 0;
  }, []);

  const stopAllAudio = useCallback(() => {
    stopSpeech();
    stopListening();
    if (autoListenTimeoutRef.current) {
      clearTimeout(autoListenTimeoutRef.current);
      autoListenTimeoutRef.current = null;
    }
    if (interimDebounceRef.current) {
      clearTimeout(interimDebounceRef.current);
      interimDebounceRef.current = null;
    }
    setAssistantState('idle');
  }, [stopSpeech, stopListening]);

  // ============================================================
  // MICROPHONE VISUALIZER
  // Keep the microphone open during the whole voice session.
  // Do NOT request microphone access for every question.
  // ============================================================
  const setupMicVisualizer = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      return;
    }

    if (micStreamRef.current && analyserRef.current) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);
      analyserRef.current = analyser;

      const timeData = new Uint8Array(analyser.fftSize);
      const freqData = new Uint8Array(analyser.frequencyBinCount);

      const renderAudioPhysics = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(timeData);
        analyserRef.current.getByteFrequencyData(freqData);

        // RMS volume from microphone
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
          const normalized = (timeData[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / timeData.length);
        const now = performance.now();

        // Only trigger React rendering around 15-20 times/sec.
        if (now - lastVisualUpdateRef.current > 55) {
          lastVisualUpdateRef.current = now;
          const scale = Math.min(1.18, 1 + rms * 2.8);
          setMicVolume(scale);

          const bars = [
            Math.max(6, Math.round((freqData[2] || 0) / 12)),
            Math.max(8, Math.round((freqData[6] || 0) / 10)),
            Math.max(10, Math.round((freqData[10] || 0) / 8)),
            Math.max(8, Math.round((freqData[14] || 0) / 10)),
            Math.max(6, Math.round((freqData[18] || 0) / 12))
          ];
          setHarmonicLevels(bars);
        }

        // ======================================================
        // NATURAL SILENCE DETECTION
        // Only active while listening to the user.
        // ======================================================
        if (assistantStateRef.current === 'listening') {
          if (rms > 0.024) {
            hasSpeechRef.current = true;
            lastVoiceAtRef.current = now;
          }

          if (
            hasSpeechRef.current &&
            transcriptRef.current.trim() &&
            lastVoiceAtRef.current &&
            now - lastVoiceAtRef.current > 950 &&
            !committingRef.current
          ) {
            commitListeningRef.current?.();
          }
        }

        animFrameRef.current = requestAnimationFrame(renderAudioPhysics);
      };

      cancelAnimationFrame(animFrameRef.current || 0);
      animFrameRef.current = requestAnimationFrame(renderAudioPhysics);
    } catch (error) {
      console.warn('Microphone visualizer unavailable:', error);
    }
  }, []);

  // Browser SpeechSynthesis fallback
  const speakWithBrowserSynth = useCallback((text, onFinish) => {
    if (!('speechSynthesis' in window)) {
      if (onFinish) onFinish();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {}

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = t.code;
    utterance.rate = lang === 'en' ? 1.01 : 0.96;
    utterance.pitch = 1.0;
    utterance.volume = 1;

    const voice = pickBestVoice(voicesListRef.current, t.code);
    if (voice) {
      utterance.voice = voice;
    }

    window.__rythumitraActiveUtterance = utterance;
    synthRef.current = utterance;

    utterance.onend = () => {
      synthRef.current = null;
      window.__rythumitraActiveUtterance = null;
      if (onFinish) onFinish();
    };
    utterance.onerror = () => {
      synthRef.current = null;
      window.__rythumitraActiveUtterance = null;
      if (onFinish) onFinish();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      if (onFinish) onFinish();
    }
  }, [lang, t.code]);

  // ============================================================
  // SPEECH OUTPUT
  // Streams fluent audio without prematurely cutting off sentences.
  // Supports automatic turn-taking when speech finishes.
  // ============================================================
  const speakText = useCallback(
    (text, { autoListen = false, onFinish = null } = {}) => {
      if (!text?.trim()) {
        if (onFinish) onFinish();
        return;
      }

      stopListening();
      stopSpeech();

      setAssistantState('speaking');

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;

        if (speechWatchdogRef.current) {
          clearTimeout(speechWatchdogRef.current);
          speechWatchdogRef.current = null;
        }

        if (currentAudioRef.current) {
          try {
            currentAudioRef.current.pause();
          } catch {}
          currentAudioRef.current = null;
        }

        synthRef.current = null;
        window.__rythumitraActiveUtterance = null;
        setAssistantState('idle');

        if (onFinish) {
          onFinish();
        }

        // Automatic turn-taking: only starts listening when audio has completely finished!
        if (autoListen) {
          autoListenTimeoutRef.current = setTimeout(() => {
            startListeningRef.current?.();
          }, 200);
        }
      };

      // Generous safety watchdog (prevents hanging without cutting off spoken sentences)
      const maxDuration = Math.max(8000, Math.min(25000, text.length * 140));
      speechWatchdogRef.current = setTimeout(() => {
        finish();
      }, maxDuration);

      // Priority 1: High-fidelity native speech audio stream from /api/ai/tts
      try {
        const audioUrl = api.ttsUrl(text, lang);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        let hasStartedPlaying = false;
        const loadTimer = setTimeout(() => {
          if (!hasStartedPlaying && currentAudioRef.current === audio) {
            console.warn('Audio stream network timeout, falling back to speech synthesis');
            try { audio.pause(); } catch {}
            currentAudioRef.current = null;
            speakWithBrowserSynth(text, finish);
          }
        }, 4500);

        audio.onplaying = () => {
          hasStartedPlaying = true;
          clearTimeout(loadTimer);
        };

        audio.onended = () => {
          clearTimeout(loadTimer);
          finish();
        };

        audio.onerror = () => {
          clearTimeout(loadTimer);
          // If network stream fails, seamlessly fall back to browser speech synthesis
          currentAudioRef.current = null;
          speakWithBrowserSynth(text, finish);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            clearTimeout(loadTimer);
            console.warn('Audio stream play blocked, falling back to speech synthesis:', e);
            currentAudioRef.current = null;
            speakWithBrowserSynth(text, finish);
          });
        }
      } catch (e) {
        speakWithBrowserSynth(text, finish);
      }
    },
    [lang, stopListening, stopSpeech, speakWithBrowserSynth]
  );

  // ============================================================
  // COMMIT SPOKEN TURN
  // ============================================================
  const commitListening = () => {
    if (committingRef.current) return;
    const spoken = finalTranscriptRef.current.trim() || transcriptRef.current.trim();
    if (!spoken) {
      stopListening();
      setAssistantState('idle');
      return;
    }

    committingRef.current = true;
    stopListening();
    setAssistantState('thinking');
    playAlexaChime('confirm');

    const currentStep = stepRef.current;
    const detected = detectInstantIntent(spoken, currentStep);
    if (detected) {
      handleDetectedIntent(detected);
    } else {
      handleGenericTranscriptFallback(spoken);
    }

    setTimeout(() => {
      committingRef.current = false;
    }, 350);
  };
  commitListeningRef.current = commitListening;

  // ============================================================
  // START LISTENING
  // ============================================================
  const startListening = useCallback(async () => {
    if (assistantStateRef.current === 'listening') {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    stopSpeech();
    stopListening();
    setTranscript('');
    transcriptRef.current = '';
    finalTranscriptRef.current = '';
    hasSpeechRef.current = false;
    lastVoiceAtRef.current = 0;
    committingRef.current = false;

    await setupMicVisualizer();
    playAlexaChime('wake');

    const recognition = new SpeechRecognition();
    const sessionId = ++listeningSessionRef.current;
    recognition.lang = t.code;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setAssistantState('listening');
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let completeText = '';
      let finalText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result?.[0]?.transcript) continue;
        const text = result[0].transcript.trim();
        completeText += ` ${text}`;
        if (result.isFinal) {
          finalText += ` ${text}`;
        }
      }

      completeText = completeText.trim();
      finalText = finalText.trim();

      if (finalText) {
        finalTranscriptRef.current = finalText;
      }
      transcriptRef.current = completeText;
      setTranscript(completeText);

      hasSpeechRef.current = true;
      lastVoiceAtRef.current = performance.now();
    };

    recognition.onerror = (event) => {
      if (sessionId !== listeningSessionRef.current) {
        return;
      }
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone permission was denied. Please allow microphone access.');
      }
      setAssistantState('idle');
    };

    recognition.onend = () => {
      if (sessionId !== listeningSessionRef.current) {
        return;
      }

      if (transcriptRef.current.trim() && !committingRef.current) {
        // Give Chrome a tiny moment to deliver final result
        setTimeout(() => {
          commitListeningRef.current?.();
        }, 100);
      } else {
        setAssistantState('idle');
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (error) {
      console.warn('Recognition start failed:', error);
      setAssistantState('idle');
    }
  }, [t.code, stopSpeech, stopListening, setupMicVisualizer]);
  startListeningRef.current = startListening;

  // Execute action on matched intent
  const handleDetectedIntent = (intent) => {
    if (intent.type === 'crop') {
      selectCrop(intent.value);
    } else if (intent.type === 'quantity') {
      selectQuantity(intent.value);
    } else if (intent.type === 'location_gps') {
      handleEnableGPS();
    } else if (intent.type === 'location') {
      selectLocation(intent.name, intent.lat, intent.lng);
    } else if (intent.type === 'transport') {
      finishAndEvaluate(intent.value);
    }
  };

  // Structured AI recovery and natural sentence parser fallback
  const handleGenericTranscriptFallback = async (spoken) => {
    const currentStep = stepRef.current;
    setAssistantState('thinking');

    try {
      const response = await api.parseHarvest(spoken);
      const parsed = response?.parsed || {};

      // CROP
      if (currentStep === 1 && parsed.crop) {
        selectCrop(parsed.crop);
        return;
      }

      // QUANTITY
      if (currentStep === 2 && parsed.quantityKg) {
        selectQuantity(Number(parsed.quantityKg));
        return;
      }

      // LOCATION
      if (currentStep === 3 && parsed.locationText) {
        const location = activeLocations.find((item) =>
          item.name.toLowerCase().includes(parsed.locationText.toLowerCase())
        );
        if (location) {
          selectLocation(location.name, location.lat, location.lng);
          return;
        } else {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(parsed.locationText + ', Telangana, India')}`);
            const data = await res.json();
            if (data && data.length > 0) {
              selectLocation(parsed.locationText, parseFloat(data[0].lat), parseFloat(data[0].lon));
              return;
            }
          } catch(e) {}
        }
      }

      // TRANSPORT
      if (currentStep === 4 && typeof parsed.hasTransport === 'boolean') {
        finishAndEvaluate(parsed.hasTransport);
        return;
      }

      // MULTI-FIELD SENTENCE SHORTCUT: User said multiple harvest details in one sentence
      if (parsed.crop && parsed.quantityKg && parsed.locationText) {
        let locationName = parsed.locationText;
        let finalLat = 17.05;
        let finalLng = 79.27;

        const location = t.locations.find((item) =>
          item.name.toLowerCase().includes(parsed.locationText.toLowerCase())
        );
        
        if (location) {
          locationName = location.name;
          finalLat = location.lat;
          finalLng = location.lng;
        } else {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(parsed.locationText + ', Telangana, India')}`);
            const data = await res.json();
            if (data && data.length > 0) {
              finalLat = parseFloat(data[0].lat);
              finalLng = parseFloat(data[0].lon);
            }
          } catch(e) {}
        }

        setAnswers(prev => ({
          ...prev,
          crop: parsed.crop,
          quantityKg: Number(parsed.quantityKg),
          locationText: locationName,
          latitude: finalLat,
          longitude: finalLng,
          hasTransport: typeof parsed.hasTransport === 'boolean' ? parsed.hasTransport : false
        }));

        if (typeof parsed.hasTransport === 'boolean') {
          finishAndEvaluate(parsed.hasTransport);
          return;
        } else {
          setStep(4);
          setTimeout(() => {
            speakText(t.q4, { autoListen: true });
          }, 80);
          return;
        }
      }

      // NOTHING UNDERSTOOD: Ask politely to repeat
      setAssistantState('idle');
      speakText(
        lang === 'te'
          ? 'క్షమించండి, అది నాకు సరిగ్గా వినిపించలేదు. మళ్ళీ నెమ్మదిగా చెప్పండి.'
          : lang === 'hi'
          ? 'माफ़ कीजिए, मैं ठीक से समझ नहीं पाया। कृपया फिर से बोलिए।'
          : 'I didn’t catch that. Please say it again.',
        { autoListen: true }
      );
    } catch {
      setAssistantState('idle');
      speakText(
        lang === 'te'
          ? 'మళ్ళీ ఒకసారి చెప్పండి.'
          : lang === 'hi'
          ? 'कृपया फिर से बोलिए।'
          : 'Please say that again.',
        { autoListen: true }
      );
    }
  };

  // Step transitions (NO duplicate confirm chimes; clean auto-listen handoff)
  const selectCrop = (cropName) => {
    setAnswers(prev => ({ ...prev, crop: cropName }));
    setTranscript('');
    transcriptRef.current = '';
    setStep(2);
    setTimeout(() => {
      speakText(`${cropName} ${t.q2_prefix}`, { autoListen: true });
    }, 80);
  };

  const selectQuantity = (qty) => {
    setAnswers(prev => ({ ...prev, quantityKg: qty }));
    setTranscript('');
    transcriptRef.current = '';
    setStep(3);
    setTimeout(() => {
      speakText(t.q3, { autoListen: true });
    }, 80);
  };

  const selectLocation = (locName, lat, lng) => {
    setAnswers(prev => ({
      ...prev,
      locationText: locName,
      latitude: lat,
      longitude: lng
    }));
    setTranscript('');
    transcriptRef.current = '';
    setStep(4);
    setTimeout(() => {
      speakText(t.q4, { autoListen: true });
    }, 80);
  };

  // GPS 1-Tap Geolocation
  const handleEnableGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus(t.gps_error);
      return;
    }
    setGpsStatus('📍 Detecting GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setAnswers(prev => ({
          ...prev,
          latitude,
          longitude,
          locationText: `GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
        }));
        setGpsStatus(t.gps_success);
        setStep(4);
        setTimeout(() => {
          speakText(t.q4, { autoListen: true });
        }, 120);
      },
      () => {
        setGpsStatus(t.gps_error);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Step 4 -> Step 5: Evaluate Economics & Speak Verdict
  const finishAndEvaluate = async (hasTransport) => {
    stopAllAudio();

    const payload = {
      ...answersRef.current,
      hasTransport,
      language: lang
    };
    setAnswers(payload);
    setStep(5);
    setLoading(true);
    setAssistantState('thinking');
    setError('');

    try {
      const res = await api.recommend(payload);
      setResult(res);
      setLoading(false);
      playAlexaChime('success');

      // Announce the optimal recommendation out loud without immediate auto-listen
      if (res.explanation) {
        setTimeout(() => {
          speakText(res.explanation, { autoListen: false });
        }, 300);
      }
    } catch (err) {
      setError(err.message || 'Optimization failed');
      setLoading(false);
      setAssistantState('idle');
    }
  };

  const restartSession = () => {
    stopAllAudio();
    setStep(0);
    setResult(null);
    setTranscript('');
    transcriptRef.current = '';
    finalTranscriptRef.current = '';
    setGpsStatus('');
    setAssistantState('idle');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopAllAudio]);

  return (
    <div className="alexa-voice-container">
      {/* Dynamic Ambient Background Aurora */}
      <div className={`alexa-aurora-glow aura-${assistantState}`} />

      {/* Top Status & Language Bar */}
      <div className="alexa-top-bar">
        <div className="alexa-brand-tag">
          <span className="live-radar-dot" />
          <span>RYTHUMITRA • VOICE MODE</span>
        </div>
        <div className="alexa-lang-pill">
          <Radio size={12} className="spin-slow" />
          <span>{LANG_DATA[lang]?.nativeLabel || 'Telugu'}</span>
        </div>
      </div>

      {/* STEP 0: VOICE-FIRST START PANEL */}
      {step === 0 && (
        <div className="voice-start-panel slide-fade">
          <div className="voice-language-switch">
            <button
              type="button"
              className={lang === 'te' ? 'active' : ''}
              onClick={() => setLang('te')}
            >
              తెలుగు
            </button>
            <button
              type="button"
              className={lang === 'hi' ? 'active' : ''}
              onClick={() => setLang('hi')}
            >
              हिंदी
            </button>
            <button
              type="button"
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
            >
              English
            </button>
          </div>

          <h2 className="voice-start-title">Talk to RythuMitra</h2>

          <p className="voice-start-subtitle">
            Speak naturally. Tell me what you're selling, how much you have, and where your farm is.
          </p>
        </div>
      )}

      {/* ==================== THE LIVING ALEXA / CHATGPT VOICE ORB ==================== */}
      <div className="alexa-orb-stage">
        {/* Radiating sound wave ripple rings when listening */}
        {assistantState === 'listening' && (
          <>
            <div className="orb-soundwave-ring ring-1" />
            <div className="orb-soundwave-ring ring-2" />
            <div className="orb-soundwave-ring ring-3" />
          </>
        )}

        <div
          className={`alexa-orb-wrapper state-${assistantState}`}
          style={{
            transform: assistantState === 'listening' ? `scale(${micVolume})` : undefined
          }}
          onClick={async () => {
            if (assistantState === 'speaking') {
              stopSpeech();
              setTimeout(() => {
                startListening();
              }, 60);
              return;
            }

            if (assistantState === 'listening') {
              stopListening();
              setAssistantState('idle');
              return;
            }

            if (assistantState === 'thinking') {
              return;
            }

            // First voice interaction starts from Step 0
            if (step === 0) {
              getSharedVoiceAudioContext();
              setStep(1);
              speakText(`${t.welcome} ${t.q1}`, { autoListen: true });
              return;
            }

            if (step > 0 && step < 5) {
              startListening();
            }
          }}
          title={
            assistantState === 'speaking'
              ? 'Tap to interrupt / speak'
              : assistantState === 'listening'
              ? 'Tap to pause'
              : 'Tap to speak'
          }
        >
          {/* Multi-layered glass halo & holographic fluid core */}
          <div className="orb-halo-outer" />
          <div className="orb-halo-mid" />
          <div className="orb-aurora-mesh" />
          <div className="orb-core">
            {assistantState === 'listening' ? (
              <Mic size={38} className="orb-mic-glow" />
            ) : assistantState === 'speaking' ? (
              <div className="voice-harmonic-bars">
                <span /><span /><span /><span /><span />
              </div>
            ) : assistantState === 'thinking' ? (
              <Loader2 size={40} className="spin orb-loader-glow" />
            ) : (
              <Mic size={34} />
            )}
          </div>
        </div>

        {/* Real-time Dynamic Equalizer Bar Visualizer */}
        {assistantState === 'listening' && (
          <div className="alexa-live-equalizer">
            {harmonicLevels.map((lvl, i) => (
              <span
                key={i}
                className="eq-bar"
                style={{ height: `${lvl}px` }}
              />
            ))}
          </div>
        )}

        {/* Dynamic Conversational State Capsule */}
        <div className="alexa-state-label">
          {assistantState === 'listening' && (
            <span className="state-badge listening">
              <span className="wave-dot" /> {t.state_listening}
            </span>
          )}
          {assistantState === 'speaking' && (
            <span className="state-badge speaking">
              <Volume2 size={16} /> {t.state_speaking}
            </span>
          )}
          {assistantState === 'thinking' && (
            <span className="state-badge thinking">
              <Sparkles size={16} className="spin" /> {t.state_thinking}
            </span>
          )}
          {assistantState === 'idle' && (
            <span className="state-badge idle-btn">
              <Mic size={14} /> {step === 0 ? 'Tap orb to start' : t.state_tap_speak}
            </span>
          )}
        </div>

        {/* Start Hint or Idle Hint */}
        {step === 0 ? (
          <div className="voice-start-hint">
            <Mic size={15} />
            <span>Tap the microphone to start</span>
          </div>
        ) : assistantState === 'idle' && step < 5 ? (
          <div className="assistant-idle-hint">
            Tap the orb and speak
          </div>
        ) : null}

        {/* Live Streaming Speech Transcript Capsule */}
        {transcript && (
          <div className="alexa-live-transcript-bubble">
            <span className="transcript-quotes">“</span>
            <span>{transcript}</span>
            <span className="transcript-quotes">”</span>
          </div>
        )}
      </div>

      {/* ==================== INTERACTIVE CONVERSATION STEPS ==================== */}

      {/* STEP 1: CROP */}
      {step === 1 && (
        <div className="alexa-step-content slide-fade">
          <h2 className="alexa-prompt-title">{t.q1}</h2>
          <p className="alexa-prompt-sub">{t.q1_sub}</p>

          <div className="alexa-quick-chips">
            {activeCrops.map(c => (
              <button
                key={c.id}
                type="button"
                className={`alexa-chip ${answers.crop === c.id ? 'active' : ''}`}
                onClick={() => selectCrop(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: QUANTITY */}
      {step === 2 && (
        <div className="alexa-step-content slide-fade">
          <div className="step-back-row">
            <button type="button" className="alexa-back-btn" onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> <span>{answers.crop}</span>
            </button>
          </div>

          <h2 className="alexa-prompt-title">
            {answers.crop} {t.q2_prefix}
          </h2>
          <p className="alexa-prompt-sub">{t.q2_sub}</p>

          <div className="alexa-quick-chips">
            {t.quantities.map(q => (
              <button
                key={q.val}
                type="button"
                className={`alexa-chip ${answers.quantityKg === q.val ? 'active' : ''}`}
                onClick={() => selectQuantity(q.val)}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: LOCATION / GPS */}
      {step === 3 && (
        <div className="alexa-step-content slide-fade">
          <div className="step-back-row">
            <button type="button" className="alexa-back-btn" onClick={() => setStep(2)}>
              <ArrowLeft size={14} /> <span>{answers.quantityKg} kg</span>
            </button>
          </div>

          <h2 className="alexa-prompt-title">{t.q3}</h2>
          <p className="alexa-prompt-sub">{t.q3_sub}</p>

          {/* 1-Tap Geolocation button */}
          <div className="alexa-gps-box">
            <button
              type="button"
              className="alexa-gps-hero-btn"
              onClick={handleEnableGPS}
            >
              <Navigation size={22} />
              <div>
                <strong>{t.gps_btn}</strong>
                <small>Instant 1-tap geolocation from your smartphone</small>
              </div>
            </button>
            {gpsStatus && <div className="alexa-gps-feedback">{gpsStatus}</div>}
          </div>

          <div className="alexa-quick-chips">
            {activeLocations.map(loc => (
              <button
                key={loc.name}
                type="button"
                className={`alexa-chip ${answers.locationText === loc.name ? 'active' : ''}`}
                onClick={() => selectLocation(loc.name, loc.lat, loc.lng)}
              >
                📍 {loc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: TRANSPORT */}
      {step === 4 && (
        <div className="alexa-step-content slide-fade">
          <div className="step-back-row">
            <button type="button" className="alexa-back-btn" onClick={() => setStep(3)}>
              <ArrowLeft size={14} /> <span>{answers.locationText}</span>
            </button>
          </div>

          <h2 className="alexa-prompt-title">{t.q4}</h2>
          <p className="alexa-prompt-sub">{t.q4_sub}</p>

          <div className="alexa-choices-grid">
            <button
              type="button"
              className="alexa-choice-card"
              onClick={() => finishAndEvaluate(true)}
            >
              <Truck size={26} />
              <div>
                <strong>{t.transport_yes}</strong>
                <small>I have my own vehicle to transport produce</small>
              </div>
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              className="alexa-choice-card featured"
              onClick={() => finishAndEvaluate(false)}
            >
              <AlertTriangle size={26} />
              <div>
                <strong>{t.transport_no}</strong>
                <small>RythuMitra calculates freight deductions or matches direct pickup buyers</small>
              </div>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: EVALUATION RESULTS */}
      {step === 5 && (
        <div className="alexa-results-view slide-fade">
          {loading ? (
            <div className="alexa-eval-spinner">
              <div className="alexa-radar-wave">
                <Loader2 size={46} className="spin" />
              </div>
              <h3>{t.analyzing}</h3>
              <p>{t.analyzing_sub}</p>
            </div>
          ) : error ? (
            <div className="error-box">
              <p>{error}</p>
              <button type="button" className="button button-primary" onClick={restartSession}>
                {t.restart}
              </button>
            </div>
          ) : result ? (
            <div className="alexa-verdict-container">
              {/* Alexa Audio Dock Bar */}
              <div className="alexa-audio-dock">
                <button
                  type="button"
                  className="alexa-audio-dock-btn"
                  onClick={() => {
                    if (assistantState === 'speaking') {
                      stopAllAudio();
                    } else {
                      speakText(result.explanation, { autoListen: false });
                    }
                  }}
                >
                  {assistantState === 'speaking' ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span>{assistantState === 'speaking' ? t.stop_audio : t.listen_again}</span>
                </button>
                <span className="dock-lang-label">
                  🎙️ {LANG_DATA[lang]?.name} AI Explanation
                </span>
              </div>

              {/* Optimal Recommendation / Transport Loss Alert Card */}
              {(() => {
                const isLoss = (result.recommendation?.netRealization ?? 0) < 0;
                return (
                  <div className={`alexa-winner-card ${isLoss ? 'is-loss' : ''}`}>
                    <div className={`winner-top-badge ${isLoss ? 'warning' : ''}`}>
                      {isLoss ? <AlertTriangle size={18} /> : <Award size={18} />}
                      <span>{isLoss ? t.loss_badge : t.best_badge}</span>
                    </div>

                    <div className="winner-headline">
                      <div>
                        <h2>{result.recommendation?.companyName || result.recommendation?.name}</h2>
                        <span className="winner-loc">
                          📍 {result.recommendation?.city || result.recommendation?.district} • {Math.round(result.recommendation?.distanceKm)} km away
                        </span>
                      </div>
                      <div className={`winner-net-pill ${isLoss ? 'negative-loss' : ''}`}>
                        <span>{isLoss ? t.loss_net_label : t.net_realization}</span>
                        <strong className={`giant-rupee ${isLoss ? 'loss-text' : ''}`}>
                          {result.recommendation?.netRange || `₹${Math.round(result.recommendation?.netRealization || 0).toLocaleString('en-IN')}`}
                        </strong>
                        <small>
                          {isLoss
                            ? `⚠️ ${result.recommendation?.expectedNetPerKgRange || ('₹' + result.recommendation?.expectedNetPerKg)} / kg ${t.loss_per_kg || 'net loss'}`
                            : `${result.recommendation?.expectedNetPerKgRange || ('₹' + result.recommendation?.expectedNetPerKg)} / kg net in hand`}
                        </small>
                      </div>
                    </div>

                    {/* AI Explanation Box */}
                    <div className={`winner-speech-text ${isLoss ? 'is-loss' : ''}`}>
                      <p>
                        {(result.explanation || '').split(/(\*\*.*?\*\*)/g).map((part, idx) => 
                          part.startsWith('**') && part.endsWith('**') 
                            ? <strong key={idx}>{part.slice(2, -2)}</strong> 
                            : part
                        )}
                      </p>
                    </div>

                    {/* Dedicated Farmer Advisory Callout when net realization is negative */}
                    {isLoss && (
                      <div className="loss-advisory-banner">
                        <div className="loss-advisory-icon">
                          <AlertTriangle size={22} />
                        </div>
                        <div className="loss-advisory-body">
                          <h4>{t.loss_advice_title}</h4>
                          <p>{t.loss_advice_desc}</p>
                        </div>
                      </div>
                    )}

                    {/* Ledger Breakdown */}
                    <div className="alexa-ledger-grid">
                      <div className="ledger-cell positive">
                        <span>{t.gross_val}</span>
                        <strong>₹{Math.round(result.recommendation?.saleValue || 0).toLocaleString('en-IN')}</strong>
                        <small>@ ₹{result.recommendation?.pricePerKg}/kg</small>
                      </div>
                      <div className="ledger-cell negative">
                        <span>{result.recommendation?.vehicleName || t.transport_cost}</span>
                        <strong>{result.recommendation?.transportRange ? (result.recommendation.transportCost === 0 ? result.recommendation.transportRange : `-${result.recommendation.transportRange}`) : `-₹${Math.round(result.recommendation?.transportCost || 0).toLocaleString('en-IN')}`}</strong>
                        <small>{result.recommendation?.pickupProvided ? 'Free Pickup Provided' : (result.recommendation?.vehicleName || 'Freight estimate')}</small>
                      </div>
                      <div className="ledger-cell negative">
                        <span>{t.time_cost}</span>
                        <strong>-₹{Math.round(result.recommendation?.timeCost || 0).toLocaleString('en-IN')}</strong>
                        <small>{result.recommendation?.travelHours} hrs road time</small>
                      </div>
                      <div className="ledger-cell negative">
                        <span>{t.risk_cost}</span>
                        <strong>-₹{Math.round(result.recommendation?.riskCost || 0).toLocaleString('en-IN')}</strong>
                        <small>Spoilage discount</small>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Other Options Considered */}
              <div className="alexa-alternatives-head">
                <h3>Other Mandis & Buyers Evaluated</h3>
                <span className="pill">{result.search?.candidatesEvaluated} Considered</span>
              </div>

              <div className="opportunity-list">
                {result.alternatives?.slice(0, 4).map((opp, idx) => (
                  <OpportunityCard
                    key={opp.id || idx}
                    opportunity={opp}
                    highlight={idx === 0}
                  />
                ))}
              </div>

              {/* Map & Trace */}
              <MarketMap
                opportunities={result.alternatives}
                farmer={{ latitude: answers.latitude, longitude: answers.longitude }}
              />
              <OptimizerTrace search={result.search} />

              {/* Footer Actions */}
              <div className="alexa-footer-actions">
                <button type="button" className="button button-primary" onClick={restartSession}>
                  <RefreshCw size={16} /> <span>{t.restart}</span>
                </button>
                {onSwitchToManual && (
                  <button type="button" className="button button-ghost" onClick={onSwitchToManual}>
                    <span>{t.edit} in Manual Form</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
