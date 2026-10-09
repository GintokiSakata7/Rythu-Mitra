import { useState, useEffect } from 'react';
import {
  ArrowRight, Factory, Gauge, IndianRupee, Mic2, Search,
  ShieldCheck, Sparkles, Truck, Edit3,
  TrendingUp, Scale, MapPin, CheckCircle2, ChevronRight, Zap, Volume2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { cropTranslations } from '../lib/cropTranslations.js';
import { api } from '../lib/api.js';

const INITIAL_CROPS = [
  { name: 'Tomato', emoji: '🍅', range: '₹22-26/kg', change: '+5%', isPositive: true },
  { name: 'Onion', emoji: '🧅', range: '₹18-22/kg', change: '+2%', isPositive: true },
  { name: 'Potato', emoji: '🥔', range: '₹12-15/kg', change: '-1%', isPositive: false },
  { name: 'Chilli', query: 'Chilli Green', emoji: '🌶️', range: '₹45-55/kg', change: '+8%', isPositive: true },
  { name: 'Paddy', emoji: '🌾', range: '₹21-25/kg', change: '+3%', isPositive: true },
  { name: 'Cotton', emoji: '☁️', range: '₹68-75/kg', change: '+4%', isPositive: true }
];

const INITIAL_NEARBY_MARKETS = [
  { name: 'Bowenpally Market Yard', district: 'Hyderabad', modalPrice: 26, isVerified: true },
  { name: 'Gudimalkapur Market Yard', district: 'Hyderabad', modalPrice: 25.5, isVerified: true },
  { name: 'Warangal Market Yard', district: 'Hanamkonda', modalPrice: 28, isVerified: true },
  { name: 'Suryapet Market Yard', district: 'Suryapet', modalPrice: 24, isVerified: false }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [crops, setCrops] = useState(INITIAL_CROPS);
  const [nearbyMarkets, setNearbyMarkets] = useState(INITIAL_NEARBY_MARKETS);

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [pricesRes, marketsRes] = await Promise.all([
          api.getPrices().catch(() => ({ prices: [] })),
          api.markets().catch(() => ({ markets: [] }))
        ]);

        if (pricesRes.prices && pricesRes.prices.length > 0) {
          const published = pricesRes.prices;
          setCrops(prev => prev.map(c => {
            const match = published.find(p => p.commodityName.toLowerCase().includes(c.name.toLowerCase()));
            if (match) {
              const minKg = (match.minPrice / 100).toFixed(0);
              const maxKg = (match.maxPrice / 100).toFixed(0);
              return {
                ...c,
                range: `₹${minKg}-${maxKg}/kg`
              };
            }
            return c;
          }));
        }

        const rawMarkets = Array.isArray(marketsRes) ? marketsRes : (marketsRes.markets || []);
        if (rawMarkets.length > 0) {
          setNearbyMarkets(rawMarkets.slice(0, 4).map(m => ({
            name: m.name.includes('Market') ? m.name : `${m.name} Market Yard`,
            district: m.district,
            modalPrice: m.modalPrice || m.pricePerKg || 25,
            isVerified: m.isOfficialVerified || false
          })));
        }
      } catch (err) {
        console.warn('Using baseline price cache on home page:', err);
      }
    }
    loadLiveData();
  }, []);

  const getCropDisplay = (cropName) => {
    if (!language || language === 'en') return cropName;
    return cropTranslations[language]?.[cropName] || cropName;
  };

  return (
    <div className="home-page-container">
      {/* HERO SECTION */}
      <section className="hero-wrapper">
        <div className="hero-content-box">
          <div className="hero-pill-badge">
            <Sparkles size={14} />
            <span>{t('home_badge')}</span>
          </div>

          <h1 className="hero-title-text">
            {t('home_title')}
          </h1>

          <p className="hero-subtitle-text">
            {t('home_subtitle')}
          </p>
        </div>

        {/* PRIMARY SIDE-BY-SIDE ENTRY MODES (VOICE SPOTLIGHT & MANUAL FORM) */}
        <div className="hero-entry-grid">
          {/* Card 1: VOICE ASSISTANT SPOTLIGHT (PRIMARY FOCUS OPTION) */}
          <Link to="/assistant" className="voice-spotlight-card">
            <div>
              <div className="voice-spotlight-top">
                <span className="voice-spotlight-badge">
                  <Sparkles size={12} />
                  <span>AI VOICE ASSISTANT • వాయిస్ అసిస్టెంట్</span>
                </span>
                <span className="voice-lang-chips">
                  తెలుగు • हिंदी • English
                </span>
              </div>

              <div className="voice-spotlight-body">
                <div className="voice-icon-glow-bubble">
                  <Mic2 size={28} />
                </div>
                <div className="voice-spotlight-info">
                  <h2>{t('voice_mode_title')}</h2>
                  <p>{t('voice_mode_desc')}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="voice-spotlight-cta-btn">
                <Mic2 size={18} />
                <span>{t('voice_mode_cta')} (నోటితో మాట్లాడండి)</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* Card 2: MANUAL SEARCH FORM */}
          <Link to="/find" state={{ mode: 'manual' }} className="manual-entry-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>
                  SEARCH FORM • వివరాలు పూరించండి
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  GPS Location
                </span>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#f1f5f9', color: '#334155', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Edit3 size={24} />
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    {t('manual_mode_title')}
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                    {t('manual_mode_desc')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>
                <span>{t('manual_mode_cta')}</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        </div>

        {/* 3 Proof Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginTop: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#15803d" /> {t('proof_1')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Gauge size={16} color="#15803d" /> {t('proof_2')}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <IndianRupee size={16} color="#15803d" /> {t('proof_3')}
          </span>
        </div>
      </section>

      {/* SECTION 2: TODAY'S MANDI PRICES */}
      <section style={{ margin: '1.5rem 0 2.5rem' }}>
        <div className="section-header-row">
          <div className="section-title-group">
            <h2 className="section-heading-h2">
              {t('today_mandi_prices') || "Today's Mandi Prices"}
            </h2>
            <span className="live-rates-pill">
              <span className="live-pulse" style={{ width: '6px', height: '6px', background: '#10b981' }} />
              Live Auction Rates
            </span>
          </div>

          {/* Dedicated Two Option Buttons (Daily Mandi Prices & Compare Mandis) */}
          <div className="top-option-buttons">
            <Link to="/prices" className="top-opt-btn">
              <TrendingUp size={15} color="#059669" />
              <span>{t('view_all_prices') || 'Daily Mandi Prices'}</span>
            </Link>

            <Link to="/compare" className="top-opt-btn">
              <Scale size={15} color="#2563eb" />
              <span>{t('compare_mandis') || 'Compare Mandis'}</span>
            </Link>
          </div>
        </div>

        {/* Commodity Cards Slider (Touch-Friendly on Mobile, 6-col on Desktop) */}
        <div className="commodity-cards-container">
          {crops.map((item, idx) => (
            <Link
              key={idx}
              to={`/find?crop=${encodeURIComponent(item.query || item.name)}`}
              className="crop-price-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                  {getCropDisplay(item.name)}
                </span>
              </div>
              <div style={{ fontSize: '1.12rem', fontWeight: 800, color: '#15803d', letterSpacing: '-0.02em', marginTop: '2px' }}>
                {item.range}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: item.isPositive ? '#166534' : '#991b1b',
                    background: item.isPositive ? '#dcfce7' : '#fee2e2',
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}
                >
                  {item.change}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                  Find <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 3: NEARBY WHOLESALE MARKETS */}
      <section style={{ margin: '2rem 0 2.5rem' }}>
        <div className="section-header-row">
          <div>
            <h2 className="section-heading-h2">
              {t('nearby_markets') || 'Nearby Markets'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
              Telangana APMC market yards with verified daily arrivals
            </p>
          </div>
          <Link
            to="/prices"
            style={{
              fontSize: '0.84rem',
              fontWeight: 700,
              color: '#15803d',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f0fdf4'
            }}
          >
            <span>View All Mandis</span> <ArrowRight size={14} />
          </Link>
        </div>

        <div className="nearby-markets-grid">
          {nearbyMarkets.map((m, idx) => (
            <Link
              key={idx}
              to="/find"
              className="market-item-card"
            >
              <div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} color="#94a3b8" />
                  <span>{m.district}</span>
                  {m.isVerified && (
                    <span
                      style={{
                        color: '#059669',
                        fontWeight: 700,
                        marginLeft: '4px',
                        background: '#ecfdf5',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '0.72rem'
                      }}
                    >
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.12rem', fontWeight: 800, color: '#15803d' }}>
                  ₹{Number(m.modalPrice).toFixed(1)}
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/kg</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Modal Rate
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4: HOW RYTHUMITRA WORKS (SIMPLIFIED FOR FARMERS) */}
      <section style={{ margin: '2.5rem 0 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t('diff_eyebrow')}
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px 0', letterSpacing: '-0.02em' }}>
            {t('diff_title')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0, maxWidth: '640px', marginInline: 'auto' }}>
            {t('diff_desc')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center', marginBottom: '12px' }}>
              <Search size={18} />
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('stat_1_label')}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
              5 → 15 → Expand
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
              {t('stat_1_note')}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fefce8', color: '#b45309', display: 'grid', placeItems: 'center', marginBottom: '12px' }}>
              <IndianRupee size={18} />
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('stat_2_label')}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
              {t('stat_2_val')}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
              {t('stat_2_note')}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center', marginBottom: '12px' }}>
              <Truck size={18} />
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('stat_3_label')}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
              {t('stat_3_val')}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
              {t('stat_3_note')}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fdf2f8', color: '#db2777', display: 'grid', placeItems: 'center', marginBottom: '12px' }}>
              <Factory size={18} />
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              {t('stat_4_label')}
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
              {t('stat_4_val')}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45 }}>
              {t('stat_4_note')}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: READY CALLOUT */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '2rem 1.75rem',
          textAlign: 'center',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
        }}
      >
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          {t('bottom_title')}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '0 auto 1.5rem', maxWidth: '600px', lineHeight: 1.5 }}>
          {t('bottom_desc')}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/assistant"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 22px',
              borderRadius: '12px',
              background: '#15803d',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.92rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(21, 128, 61, 0.35)'
            }}
          >
            <Mic2 size={18} />
            <span>Start Voice Assistant</span>
          </Link>
          <Link
            to="/find"
            state={{ mode: 'manual' }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 22px',
              borderRadius: '12px',
              background: '#334155',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.92rem',
              textDecoration: 'none'
            }}
          >
            <Edit3 size={16} />
            <span>Enter Crop Details</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
