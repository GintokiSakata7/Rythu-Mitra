import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Navigation, MapPin, Check,
  ChevronRight, ArrowLeft, RefreshCw, Sparkles, TrendingUp,
  Truck, Clock, AlertTriangle, ShieldCheck, Award, Loader2
} from 'lucide-react';
import { api } from '../lib/api.js';
import OpportunityCard from './OpportunityCard.jsx';
import OptimizerTrace from './OptimizerTrace.jsx';
import MarketMap from './MarketMap.jsx';

// Multi-language text dictionary
const LANG_DATA = {
  te: {
    name: 'తెలుగు',
    nativeLabel: 'తెలుగు (Telugu)',
    code: 'te-IN',
    greeting: 'నమస్కారం! మండిమిత్ర వాయిస్ అసిస్టెంట్‌కు స్వాగతం. మీరు సరైన మార్కెట్ ఎంచుకోవడానికి కొన్ని ప్రశ్నలు అడుగుతాను.',
    q1: 'మీరు ఏ పంటను అమ్మాలనుకుంటున్నారు?',
    q1_sub: 'పంట పేరు చెప్పండి లేదా కింద ఉన్న ఎంపికలలో ఒకదాన్ని తాకండి:',
    q2: 'మీ దగ్గర ఎంత పరిమాణం ఉంది? (కిలోలు లేదా టన్నుల్లో)',
    q2_sub: 'పరిమాణం చెప్పండి లేదా కింద ఉన్న బటన్‌ను ఎంచుకోండి:',
    q3: 'మీ పొలం ఎక్కడ ఉంది? లొకేషన్ చెప్పండి లేదా GPS బటన్ నొక్కండి.',
    q3_sub: 'లొకేషన్ చెప్పండి లేదా నేరుగా GPS ద్వారా స్థానాన్ని గుర్తించండి:',
    q4: 'మీకు స్వంత రవాణా వాహనం ఉందా?',
    q4_sub: 'వాహన సదుపాయం మరియు నాణ్యతను ఎంచుకోండి:',
    analyzing: 'సమీప మార్కెట్లు మరియు కొనుగోలుదారులను విశ్లేషిస్తున్నాము...',
    analyzing_sub: 'రవాణా, సమయం, నష్టభయం లెక్కించి అత్యధిక నికర లాభం ఇచ్చే మార్కెట్‌ను వెతుకుతున్నాము...',
    gps_btn: '📍 నా GPS లొకేషన్ ఉపయోగించండి',
    gps_success: 'GPS స్థానం విజయవంతంగా గుర్తించబడింది!',
    gps_error: 'GPS అనుమతి లభించలేదు. దయచేసి కింద ఉన్న పట్టణాన్ని ఎంచుకోండి.',
    transport_yes: '🚚 అవును, నా వాహనం ఉంది',
    transport_no: '❌ లేదు, రవాణా కావాలి',
    grade_a: 'గ్రేడ్ A (ఉత్తమ నాణ్యత)',
    grade_b: 'గ్రేడ్ B (సాధారణ నాణ్యత)',
    best_badge: 'అత్యుత్తమ మార్కెట్ సిఫార్సు',
    net_realization: 'చేతికందే నికర మొత్తం (Net Realization)',
    gross_val: 'మొత్తం అమ్మకపు విలువ',
    transport_cost: 'రవాణా ఖర్చు',
    time_cost: 'ప్రయాణ సమయ ఖర్చు',
    risk_cost: 'నష్టభయం / వృధా ఖర్చు',
    net_per_kg: 'ప్రతి కిలోకు నికర ధర',
    why_this_won: 'ఈ మార్కెట్ ఎందుకు ఉత్తమమైనది?',
    listen_again: 'మళ్ళీ వినండి',
    stop_audio: 'ఆపండి',
    restart: 'మళ్ళీ ప్రారంభించండి',
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
    greeting: 'नमस्ते! मंडीमित्र वॉइस असिस्टेंट में आपका स्वागत है। सही मंडी चुनने के लिए मैं आपसे कुछ आसान सवाल पूछूंगा।',
    q1: 'आप कौन सी फसल बेचना चाहते हैं?',
    q1_sub: 'फसल का नाम बोलें या नीचे दिए गए विकल्पों पर टैप करें:',
    q2: 'आपके पास कितनी मात्रा है? (किलो या टन में)',
    q2_sub: 'मात्रा बोलें या नीचे से चुनें:',
    q3: 'आपका खेत कहाँ है? स्थान बताएं या GPS चालू करें।',
    q3_sub: 'बोलकर बताएं या GPS बटन दबाकर अपना स्थान दर्ज करें:',
    q4: 'क्या आपके पास अपनी गाड़ी / परिवहन है?',
    q4_sub: 'परिवहन और फसल की गुणवत्ता चुनें:',
    analyzing: 'आसपास की मंडियों और खरीदारों का विश्लेषण हो रहा है...',
    analyzing_sub: 'भाड़ा, यात्रा का समय और जोखिम घटाकर अधिकतम शुद्ध मुनाफा खोज रहे हैं...',
    gps_btn: '📍 मेरा GPS स्थान उपयोग करें',
    gps_success: 'GPS स्थान सफलतापूर्वक मिल गया!',
    gps_error: 'GPS अनुमति नहीं मिली। कृपया नीचे से शहर चुनें।',
    transport_yes: '🚚 हाँ, अपनी गाड़ी है',
    transport_no: '❌ नहीं, परिवहन चाहिए',
    grade_a: 'ग्रेड A (उत्तम गुणवत्ता)',
    grade_b: 'ग्रेड B (सामान्य)',
    best_badge: 'सर्वश्रेष्ठ मंडी / खरीदार सिफ़ारिश',
    net_realization: 'शुद्ध प्राप्ति (Net Realization)',
    gross_val: 'कुल बिक्री मूल्य',
    transport_cost: 'ट्रांसपोर्ट / ढुलाई खर्च',
    time_cost: 'यात्रा समय खर्च',
    risk_cost: 'खराबी / जोखिम खर्च',
    net_per_kg: 'प्रति किलो शुद्ध भाव',
    why_this_won: 'यह विकल्प सबसे अच्छा क्यों है?',
    listen_again: 'फिर से सुनें',
    stop_audio: 'रोकें',
    restart: 'नया सर्च करें',
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
    greeting: 'Welcome to MandiMitra Voice Assistant! I will ask a few quick questions to find your highest net profit market.',
    q1: 'What crop do you want to sell?',
    q1_sub: 'Speak the crop name or tap one of the options below:',
    q2: 'How much quantity do you have? (in kg or tonnes)',
    q2_sub: 'Speak the quantity or select a button:',
    q3: 'Where is your farm located? Speak or enable GPS.',
    q3_sub: 'Speak your town/district or tap to enable real GPS location:',
    q4: 'Do you have your own transport vehicle?',
    q4_sub: 'Select transportation & produce grade:',
    analyzing: 'Evaluating nearby markets & direct buyers...',
    analyzing_sub: 'Computing transport, time, and spoilage risk to maximize your net take-home realization...',
    gps_btn: '📍 Enable GPS Location',
    gps_success: 'GPS location captured successfully!',
    gps_error: 'Could not access GPS. Please choose a nearby town.',
    transport_yes: '🚚 Yes, I have a vehicle',
    transport_no: '❌ No, need transport (MandiMitra arranges)',
    grade_a: 'Grade A (Premium quality)',
    grade_b: 'Grade B (Standard)',
    best_badge: 'Optimal Recommendation',
    net_realization: 'Expected Net Realization',
    gross_val: 'Gross Sale Value',
    transport_cost: 'Transport Cost',
    time_cost: 'Travel Time Cost',
    risk_cost: 'Spoilage & Risk Discount',
    net_per_kg: 'Net Realization per kg',
    why_this_won: 'Why this option delivers highest profit',
    listen_again: 'Listen Again',
    stop_audio: 'Stop Audio',
    restart: 'Start New Voice Search',
    edit: 'Edit Details',
    crops: [
      { id: 'Tomato', label: '🍅 Tomato' },
      { id: 'Onion', label: '🧅 Onion' },
      { id: 'Potato', label: '🥔 Potato' },
      { id: 'Chilli', label: '🌶️ Chilli' },
      { id: 'Cotton', label: '🌾 Cotton' }
    ],
    quantities: [
      { val: 1000, label: '1,000 kg (1 Ton)' },
      { val: 2500, label: '2,500 kg (2.5 Tons)' },
      { val: 5000, label: '5,000 kg (5 Tons)' },
      { val: 10000, label: '10,000 kg (10 Tons)' }
    ],
    locations: [
      { name: 'Nalgonda', label: 'Nalgonda', lat: 17.05, lng: 79.27 },
      { name: 'Suryapet', label: 'Suryapet', lat: 17.14, lng: 79.62 },
      { name: 'Miryalaguda', label: 'Miryalaguda', lat: 16.87, lng: 79.56 },
      { name: 'Hyderabad', label: 'Hyderabad', lat: 17.385, lng: 78.4867 }
    ]
  }
};

export default function VoiceFlow({ onSwitchToManual }) {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState('te');
  const t = LANG_DATA[lang] || LANG_DATA.en;

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

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [gpsStatus, setGpsStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const recognitionRef = useRef(null);
  const synthesisUtteranceRef = useRef(null);

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = t.code;
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(lang) || v.lang === t.code);
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use the quick tap options.');
      return;
    }

    stopSpeaking();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = t.code;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const current = Array.from(event.results)
        .map(r => r[0].transcript)
        .join(' ');
      setTranscript(current);
      handleSpokenAnswer(current);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSpokenAnswer = (text) => {
    const lower = text.toLowerCase();
    if (step === 1) {
      if (/tomato|టమాట|टमाटर/i.test(lower)) selectCrop('Tomato');
      else if (/onion|ఉల్లి|प्याज/i.test(lower)) selectCrop('Onion');
      else if (/potato|ఆలూ|आलू|బంగాళా/i.test(lower)) selectCrop('Potato');
      else if (/chilli|మిరప|मिर्च/i.test(lower)) selectCrop('Chilli');
      else if (/cotton|పత్తి|कपास/i.test(lower)) selectCrop('Cotton');
    } else if (step === 2) {
      const match = text.match(/(\d+)/);
      if (match) {
        let val = parseInt(match[1], 10);
        if (/ton|టన్|टन/i.test(text)) val *= 1000;
        if (val > 0) selectQuantity(val);
      }
    } else if (step === 3) {
      if (/nalgonda|నల్గొండ|नलगोंडा/i.test(lower)) selectLocation('Nalgonda', 17.05, 79.27);
      else if (/suryapet|సూర్యాపేట|सूर्यापेट/i.test(lower)) selectLocation('Suryapet', 17.14, 79.62);
      else if (/miryalaguda|మిర్యాలగూడ|मिर्यालगुडा/i.test(lower)) selectLocation('Miryalaguda', 16.87, 79.56);
      else if (/hyderabad|హైదరాబాద్|हैदराबाद/i.test(lower)) selectLocation('Hyderabad', 17.385, 78.4867);
    } else if (step === 4) {
      if (/yes|ఉంది|हाँ|vehicle|vehicle undi|gaadi hai/i.test(lower)) {
        finishAndEvaluate(true);
      } else if (/no|లేదు|नहीं|no vehicle|ledu|nahi/i.test(lower)) {
        finishAndEvaluate(false);
      }
    }
  };

  useEffect(() => {
    if (step === 0) {
      speak('Please select your language. దయచేసి మీ భాషను ఎంచుకోండి. कृपया अपनी भाषा चुनें.');
    } else if (step === 1) {
      speak(t.q1);
    } else if (step === 2) {
      speak(t.q2);
    } else if (step === 3) {
      speak(t.q3);
    } else if (step === 4) {
      speak(t.q4);
    }
    return () => stopSpeaking();
  }, [step, lang]);

  const selectLanguage = (selectedLang) => {
    setLang(selectedLang);
    setStep(1);
  };

  const selectCrop = (cropName) => {
    setAnswers(prev => ({ ...prev, crop: cropName }));
    setTranscript('');
    setStep(2);
  };

  const selectQuantity = (qty) => {
    setAnswers(prev => ({ ...prev, quantityKg: qty }));
    setTranscript('');
    setStep(3);
  };

  const selectLocation = (locName, lat, lng) => {
    setAnswers(prev => ({
      ...prev,
      locationText: locName,
      latitude: lat,
      longitude: lng
    }));
    setTranscript('');
    setStep(4);
  };

  const handleEnableGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus(t.gps_error);
      return;
    }
    setGpsStatus('📍 Detecting location via GPS...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setAnswers(prev => ({
          ...prev,
          latitude,
          longitude,
          locationText: `GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
        }));
        setGpsStatus(t.gps_success);
        setTimeout(() => {
          setStep(4);
        }, 800);
      },
      () => {
        setGpsStatus(t.gps_error);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const finishAndEvaluate = async (hasOwnVehicle, quality = 'A') => {
    const payload = {
      ...answers,
      hasTransport: hasOwnVehicle,
      quality,
      language: lang
    };
    setAnswers(payload);
    setStep(5);
    setLoading(true);
    setError('');

    speak(t.analyzing);

    try {
      const res = await api.recommend(payload);
      setResult(res);

      if (res.explanation) {
        setTimeout(() => {
          speak(res.explanation);
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  const restartFlow = () => {
    stopSpeaking();
    setStep(0);
    setResult(null);
    setTranscript('');
    setGpsStatus('');
  };

  return (
    <div className="voice-flow-container">
      <div className="voice-flow-header">
        <div className="voice-flow-badge">
          <Sparkles size={16} />
          <span>VOICE ASSISTANT • AI సహచరి</span>
        </div>
        <div className="voice-steps-progress">
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              className={`step-dot ${step === s ? 'current' : step > s ? 'done' : ''}`}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="voice-step-card slide-in">
          <div className="voice-assistant-avatar">
            <Mic size={32} />
          </div>
          <h2 className="voice-step-title">Choose Your Language / భాషను ఎంచుకోండి</h2>
          <p className="voice-step-subtitle">
            మాట్లాడటానికి మీ ఇష్టమైన భాషను ఎంచుకోండి • बोलकर जानकारी देने के लिए भाषा चुनें
          </p>

          <div className="language-selector-grid">
            <button
              type="button"
              className="lang-card featured"
              onClick={() => selectLanguage('te')}
            >
              <span className="lang-icon">🌾</span>
              <strong>తెలుగు</strong>
              <span>Telugu (మాట్లాడండి)</span>
            </button>

            <button
              type="button"
              className="lang-card"
              onClick={() => selectLanguage('hi')}
            >
              <span className="lang-icon">🇮🇳</span>
              <strong>हिंदी</strong>
              <span>Hindi (बोलें)</span>
            </button>

            <button
              type="button"
              className="lang-card"
              onClick={() => selectLanguage('en')}
            >
              <span className="lang-icon">🇬🇧</span>
              <strong>English</strong>
              <span>English (Speak)</span>
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="voice-step-card slide-in">
          <button type="button" className="step-back-btn" onClick={() => setStep(0)}>
            <ArrowLeft size={16} /> <span>భాష / Language</span>
          </button>

          <div className="voice-speaking-indicator">
            <div className={`audio-visualizer ${isSpeaking ? 'active' : ''}`}>
              <span /><span /><span /><span /><span />
            </div>
            <h2 className="voice-step-title">{t.q1}</h2>
            <p className="voice-step-subtitle">{t.q1_sub}</p>
          </div>

          <div className="mic-interactive-bar">
            <button
              type="button"
              className={`big-mic-button ${isListening ? 'listening' : ''}`}
              onClick={startListening}
            >
              {isListening ? <MicOff size={28} /> : <Mic size={28} />}
              <span>{isListening ? 'Listening...' : 'Tap to Speak'}</span>
            </button>
            {transcript && <div className="live-transcript-bubble">"{transcript}"</div>}
          </div>

          <div className="quick-chips-grid">
            {t.crops.map(c => (
              <button
                key={c.id}
                type="button"
                className={`quick-chip ${answers.crop === c.id ? 'active' : ''}`}
                onClick={() => selectCrop(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="voice-step-card slide-in">
          <button type="button" className="step-back-btn" onClick={() => setStep(1)}>
            <ArrowLeft size={16} /> <span>{answers.crop}</span>
          </button>

          <div className="voice-speaking-indicator">
            <div className={`audio-visualizer ${isSpeaking ? 'active' : ''}`}>
              <span /><span /><span /><span /><span />
            </div>
            <h2 className="voice-step-title">{t.q2}</h2>
            <p className="voice-step-subtitle">{t.q2_sub}</p>
          </div>

          <div className="mic-interactive-bar">
            <button
              type="button"
              className={`big-mic-button ${isListening ? 'listening' : ''}`}
              onClick={startListening}
            >
              {isListening ? <MicOff size={28} /> : <Mic size={28} />}
              <span>{isListening ? 'Listening...' : 'Tap to Speak'}</span>
            </button>
            {transcript && <div className="live-transcript-bubble">"{transcript}"</div>}
          </div>

          <div className="quick-chips-grid">
            {t.quantities.map(q => (
              <button
                key={q.val}
                type="button"
                className={`quick-chip ${answers.quantityKg === q.val ? 'active' : ''}`}
                onClick={() => selectQuantity(q.val)}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="voice-step-card slide-in">
          <button type="button" className="step-back-btn" onClick={() => setStep(2)}>
            <ArrowLeft size={16} /> <span>{answers.quantityKg} kg</span>
          </button>

          <div className="voice-speaking-indicator">
            <div className={`audio-visualizer ${isSpeaking ? 'active' : ''}`}>
              <span /><span /><span /><span /><span />
            </div>
            <h2 className="voice-step-title">{t.q3}</h2>
            <p className="voice-step-subtitle">{t.q3_sub}</p>
          </div>

          <div className="gps-action-container">
            <button
              type="button"
              className="gps-hero-button"
              onClick={handleEnableGPS}
            >
              <Navigation size={22} />
              <div>
                <strong>{t.gps_btn}</strong>
                <small>Auto-detect latitude & longitude from device</small>
              </div>
            </button>
            {gpsStatus && <div className="gps-status-banner">{gpsStatus}</div>}
          </div>

          <div className="mic-interactive-bar">
            <button
              type="button"
              className={`big-mic-button ${isListening ? 'listening' : ''}`}
              onClick={startListening}
            >
              {isListening ? <MicOff size={28} /> : <Mic size={28} />}
              <span>{isListening ? 'Listening...' : 'Or Speak City / Town'}</span>
            </button>
            {transcript && <div className="live-transcript-bubble">"{transcript}"</div>}
          </div>

          <div className="quick-chips-grid">
            {t.locations.map(loc => (
              <button
                key={loc.name}
                type="button"
                className={`quick-chip ${answers.locationText === loc.name ? 'active' : ''}`}
                onClick={() => selectLocation(loc.name, loc.lat, loc.lng)}
              >
                📍 {loc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="voice-step-card slide-in">
          <button type="button" className="step-back-btn" onClick={() => setStep(3)}>
            <ArrowLeft size={16} /> <span>{answers.locationText}</span>
          </button>

          <div className="voice-speaking-indicator">
            <div className={`audio-visualizer ${isSpeaking ? 'active' : ''}`}>
              <span /><span /><span /><span /><span />
            </div>
            <h2 className="voice-step-title">{t.q4}</h2>
            <p className="voice-step-subtitle">{t.q4_sub}</p>
          </div>

          <div className="transport-choice-cards">
            <button
              type="button"
              className="choice-card"
              onClick={() => finishAndEvaluate(true, 'A')}
            >
              <Truck size={28} />
              <div>
                <strong>{t.transport_yes}</strong>
                <small>I can transport the harvest myself</small>
              </div>
              <ChevronRight size={20} />
            </button>

            <button
              type="button"
              className="choice-card primary"
              onClick={() => finishAndEvaluate(false, 'A')}
            >
              <AlertTriangle size={28} />
              <div>
                <strong>{t.transport_no}</strong>
                <small>Optimizer factors in freight cost or matches direct pickup buyers</small>
              </div>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="voice-results-container slide-in">
          {loading ? (
            <div className="voice-evaluating-panel">
              <div className="eval-radar">
                <Loader2 className="spin" size={44} />
              </div>
              <h3>{t.analyzing}</h3>
              <p>{t.analyzing_sub}</p>
              <div className="eval-progress-tags">
                <span>📍 Nearby Mandis</span>
                <span>🏢 Direct Buyers</span>
                <span>💰 Net Deductions</span>
              </div>
            </div>
          ) : error ? (
            <div className="error-box">
              <p>{error}</p>
              <button type="button" className="button button-primary" onClick={restartFlow}>
                {t.restart}
              </button>
            </div>
          ) : result ? (
            <div className="results-display-wrapper">
              <div className="audio-player-pill">
                <button
                  type="button"
                  className="audio-toggle-btn"
                  onClick={() => (isSpeaking ? stopSpeaking() : speak(result.explanation))}
                >
                  {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span>{isSpeaking ? t.stop_audio : t.listen_again}</span>
                </button>
                <span className="lang-tag">{LANG_DATA[lang]?.name} AI Explanation</span>
              </div>

              <div className="voice-best-card">
                <div className="best-card-badge">
                  <Award size={18} />
                  <span>{t.best_badge}</span>
                </div>

                <div className="best-card-title-row">
                  <div>
                    <h2>{result.recommendation?.companyName || result.recommendation?.name}</h2>
                    <span className="opp-location-tag">
                      📍 {result.recommendation?.city || result.recommendation?.district} • {Math.round(result.recommendation?.distanceKm)} km
                    </span>
                  </div>
                  <div className="net-number-box">
                    <span>{t.net_realization}</span>
                    <strong className="giant-net">
                      ₹{Math.round(result.recommendation?.netRealization || 0).toLocaleString('en-IN')}
                    </strong>
                    <small>₹{result.recommendation?.expectedNetPerKg} / kg net in hand</small>
                  </div>
                </div>

                <div className="ai-explanation-box">
                  <p>{result.explanation}</p>
                </div>

                <div className="ledger-breakdown-grid">
                  <div className="ledger-item positive">
                    <span>{t.gross_val}</span>
                    <strong>₹{Math.round(result.recommendation?.saleValue || 0).toLocaleString('en-IN')}</strong>
                    <small>@ ₹{result.recommendation?.pricePerKg}/kg</small>
                  </div>
                  <div className="ledger-item negative">
                    <span>{t.transport_cost}</span>
                    <strong>-₹{Math.round(result.recommendation?.transportCost || 0).toLocaleString('en-IN')}</strong>
                    <small>{result.recommendation?.pickupProvided ? 'Pickup Provided' : 'Calculated freight'}</small>
                  </div>
                  <div className="ledger-item negative">
                    <span>{t.time_cost}</span>
                    <strong>-₹{Math.round(result.recommendation?.timeCost || 0).toLocaleString('en-IN')}</strong>
                    <small>{result.recommendation?.travelHours} hrs travel</small>
                  </div>
                  <div className="ledger-item negative">
                    <span>{t.risk_cost}</span>
                    <strong>-₹{Math.round(result.recommendation?.riskCost || 0).toLocaleString('en-IN')}</strong>
                    <small>Spoilage discount</small>
                  </div>
                </div>
              </div>

              <div className="alternatives-header">
                <h3>Other Markets & Buyers Evaluated</h3>
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

              <MarketMap
                opportunities={result.alternatives}
                farmer={{ latitude: answers.latitude, longitude: answers.longitude }}
              />
              <OptimizerTrace search={result.search} />

              <div className="voice-actions-footer">
                <button type="button" className="button button-primary" onClick={restartFlow}>
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
