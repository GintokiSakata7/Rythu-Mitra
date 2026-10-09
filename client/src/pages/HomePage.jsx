import { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight, Factory, Gauge, IndianRupee, Mic2, Search,
  ShieldCheck, Sparkles, Truck, Wheat, Edit3, MapPin, RefreshCw,
  Navigation, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import BottomCallout from '../components/BottomCallout.jsx';
import { api } from '../lib/api.js';

const POPULAR_CROPS = [
  { name: 'Tomato', label: '🍅 Tomato', price: '₹28 - 34/kg', trend: '+12%' },
  { name: 'Onion', label: '🧅 Onion', price: '₹22 - 26/kg', trend: '+4%' },
  { name: 'Chilli', label: '🌶️ Green Chilli', price: '₹45 - 55/kg', trend: '-2%' },
  { name: 'Cotton', label: '🌾 Cotton', price: '₹72 - 78/kg', trend: '+8%' },
  { name: 'Potato', label: '🥔 Potato', price: '₹18 - 22/kg', trend: '+5%' }
];

export default function HomePage() {
  const navigate = useNavigate();

  // Location State
  const [coords, setCoords] = useState({ lat: 17.47, lng: 78.48 });
  const [locationName, setLocationName] = useState('Bowenpally, Hyderabad');
  const [locStatus, setLocStatus] = useState('detecting'); // 'detecting' | 'detected' | 'fallback'
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedQty, setSelectedQty] = useState(2500);
  const [nearbyMarkets, setNearbyMarkets] = useState([]);
  const [marketsLoading, setMarketsLoading] = useState(false);

  // Geolocation detector
  const detectLocation = useCallback(() => {
    setLocStatus('detecting');

    if (!navigator.geolocation) {
      setLocStatus('fallback');
      return;
    }

    const onSuccess = async (pos) => {
      const lat = Number(pos.coords.latitude.toFixed(4));
      const lng = Number(pos.coords.longitude.toFixed(4));
      setCoords({ lat, lng });

      // Identify locality from backend or reverse geocode
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county;
        const state = data?.address?.state || 'Telangana';
        const locLabel = city ? `${city}, ${state}` : `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`;
        setLocationName(locLabel);
      } catch {
        setLocationName(`Farm (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`);
      }
      setLocStatus('detected');
    };

    const onError = () => {
      setLocStatus('fallback');
      setLocationName('Bowenpally, Hyderabad (Default)');
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      () => {
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          onError,
          { timeout: 4500, enableHighAccuracy: true, maximumAge: 60000 }
        );
      },
      { timeout: 3000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // Load live nearby markets from engine backend when coordinates or crop change
  useEffect(() => {
    let active = true;
    setMarketsLoading(true);

    api.candidates(coords.lat, coords.lng, selectedCrop, 4)
      .then(res => {
        if (!active) return;
        if (res?.markets?.length) {
          setNearbyMarkets(res.markets);
        } else {
          // Fallback static market cards
          setNearbyMarkets([
            { name: 'Bowenpally APMC', distanceKm: 8.5, modalPriceKg: 32 },
            { name: 'Gudimalkapur Yard', distanceKm: 14.2, modalPriceKg: 34 },
            { name: 'Shamshabad Mandi', distanceKm: 26.0, modalPriceKg: 31 },
            { name: 'Medchal Market', distanceKm: 32.8, modalPriceKg: 30 }
          ]);
        }
      })
      .catch(() => {
        if (!active) return;
        setNearbyMarkets([
          { name: 'Bowenpally APMC', distanceKm: 8.5, modalPriceKg: 32 },
          { name: 'Gudimalkapur Yard', distanceKm: 14.2, modalPriceKg: 34 },
          { name: 'Shamshabad Mandi', distanceKm: 26.0, modalPriceKg: 31 },
          { name: 'Medchal Market', distanceKm: 32.8, modalPriceKg: 30 }
        ]);
      })
      .finally(() => {
        if (active) setMarketsLoading(false);
      });

    return () => { active = false; };
  }, [coords.lat, coords.lng, selectedCrop]);

  // Trigger Instant Prediction in Optimizer Engine
  const runPrediction = (overrideCrop = selectedCrop, overrideMarket = null) => {
    navigate('/find', {
      state: {
        crop: overrideCrop,
        quantityKg: selectedQty,
        locationText: overrideMarket || locationName,
        latitude: coords.lat,
        longitude: coords.lng,
        autoRun: true
      }
    });
  };

  return (
    <div className="home-page-container">
      {/* Hero Header */}
      <section className="mobile-hero-panel">
        <div className="hero-top-badge">
          <Sparkles size={16} />
          <span>PROGRESSIVE MARKET-SEARCH OPTIMIZER</span>
        </div>

        <h1 className="hero-main-title">
          Find the market that pays you best <em>after</em> the journey.
        </h1>
        <p className="hero-sub-text">
          RythuMitra calculates fuel, driver time, road tolls, and spoilage risk from your exact farm location to give you real take-home cash profit.
        </p>

        {/* ─── LIVE LOCATION BANNER ─── */}
        <div className="dashboard-loc-banner">
          <div className="dashboard-loc-left">
            <div className="dashboard-loc-icon-bubble">
              <MapPin size={20} />
            </div>
            <div className="dashboard-loc-info">
              <h4>
                <span>{locationName}</span>
                <span className={`dashboard-loc-pill ${locStatus}`}>
                  {locStatus === 'detecting' ? 'Locating...' : locStatus === 'detected' ? '● GPS Active' : '● Default'}
                </span>
              </h4>
              <p>
                {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E • Predictions tuned to this origin
              </p>
            </div>
          </div>
          <div className="dashboard-loc-actions">
            <button className="btn-refresh-gps" onClick={detectLocation} title="Refresh GPS coordinates">
              <RefreshCw size={14} className={locStatus === 'detecting' ? 'spin' : ''} />
              <span>{locStatus === 'detecting' ? 'Locating...' : 'Refresh GPS'}</span>
            </button>
          </div>
        </div>

        {/* ─── INSTANT ENGINE PREDICTOR CARD ─── */}
        <div className="dashboard-engine-card">
          <div className="dashboard-engine-header">
            <h3>
              <Zap size={20} color="#0d5d36" />
              <span>Instant Profit Predictor</span>
            </h3>
            <span className="dashboard-engine-badge">Live Engine Connected</span>
          </div>

          {/* Crop Selector Pills */}
          <div className="crop-pills-row">
            {POPULAR_CROPS.map(c => (
              <button
                key={c.name}
                className={`crop-pill-btn ${selectedCrop === c.name ? 'active' : ''}`}
                onClick={() => setSelectedCrop(c.name)}
              >
                <span>{c.label}</span>
                <small style={{ opacity: 0.85, fontSize: '11px' }}>{c.price}</small>
              </button>
            ))}
          </div>

          {/* Quantity Selector */}
          <div className="qty-toggle-row">
            <span className="qty-toggle-label">Harvest Quantity:</span>
            {[1000, 2500, 5000, 10000].map(q => (
              <button
                key={q}
                className={`qty-pill ${selectedQty === q ? 'active' : ''}`}
                onClick={() => setSelectedQty(q)}
              >
                {q.toLocaleString()} kg
              </button>
            ))}
          </div>

          {/* Big Hero Launch Engine Button */}
          <button
            className="btn-run-engine-hero"
            onClick={() => runPrediction()}
          >
            <Navigation size={18} />
            <span>Optimize {selectedCrop} ({selectedQty} kg) from {locationName.split(',')[0]} →</span>
          </button>
        </div>

        {/* ─── NEARBY MANDIS & REALIZATION SECTION ─── */}
        <div className="dashboard-nearby-section">
          <div className="dashboard-nearby-header">
            <h3>Nearby Telangana Mandis for {selectedCrop}</h3>
            <span>Distance calculated from your GPS</span>
          </div>

          <div className="dashboard-nearby-grid">
            {nearbyMarkets.map((m, idx) => (
              <div key={idx} className="nearby-market-card">
                <div className="nearby-market-top">
                  <h4>{m.name || m.market_name}</h4>
                  <span className="nearby-dist-badge">
                    {m.distanceKm != null ? `${Number(m.distanceKm).toFixed(1)} km` : `${(idx + 1) * 8} km`}
                  </span>
                </div>
                <div className="nearby-market-price">
                  <span>₹{m.modalPriceKg || m.modal_price || 30}</span>
                  <small>/ kg modal rate</small>
                </div>
                <button
                  className="btn-nearby-optimize"
                  onClick={() => runPrediction(selectedCrop, m.name || m.market_name)}
                >
                  <span>Check Net Realization</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PRIMARY SIDE-BY-SIDE ENTRY MODES */}
        <div className="home-entry-modes-grid">
          {/* Card 1: Voice Mode */}
          <Link
            to="/assistant"
            state={{ origin: locationName, latitude: coords.lat, longitude: coords.lng }}
            className="home-mode-card voice-card-accent"
          >
            <div className="mode-card-icon-bubble voice-pulse">
              <Mic2 size={26} />
            </div>
            <div className="mode-card-content">
              <div className="mode-title-tag">
                <h3>Voice Mode</h3>
                <span className="lang-bubble">తెలుగు • हिंदी • EN</span>
              </div>
              <p>Speak naturally in Telugu, Hindi or English. Assistant pre-calibrated to {locationName.split(',')[0]}.</p>
              <div className="mode-card-cta">
                <span>Start Voice Search</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* Card 2: Manually Enter */}
          <Link
            to="/find"
            state={{ mode: 'manual', locationText: locationName, latitude: coords.lat, longitude: coords.lng, crop: selectedCrop }}
            className="home-mode-card manual-card-accent"
          >
            <div className="mode-card-icon-bubble">
              <Edit3 size={24} />
            </div>
            <div className="mode-card-content">
              <div className="mode-title-tag">
                <h3>Manually Enter</h3>
                <span className="manual-bubble">GPS Pre-Filled</span>
              </div>
              <p>Customize crop, weight, transport & quality with 1-click GPS detection to run the engine.</p>
              <div className="mode-card-cta">
                <span>Fill Details</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        </div>

        <div className="proof-pills-row">
          <span><ShieldCheck size={15} /> Transparent net math</span>
          <span><Gauge size={15} /> Progressive radius search</span>
          <span><IndianRupee size={15} /> Real profit in hand</span>
        </div>
      </section>

      {/* Difference Explanation */}
      <SectionHeader
        eyebrow="THE CORE DIFFERENCE"
        title="Higher price is not necessarily higher profit."
        description="RythuMitra treats market selection as a transportation economics problem, not just a price bulletin."
      />

      <div className="stats-grid">
        <StatCard
          icon={<Search size={19} />}
          label="Search Strategy"
          value="5 → 15 → Expand"
          note="Expands only when farther markets can beat local net"
        />
        <StatCard
          icon={<IndianRupee size={19} />}
          label="Objective"
          value="Max Net Realization"
          note="Expected Sale - Freight - Travel Time - Spoilage"
          tone="sand"
        />
        <StatCard
          icon={<Truck size={19} />}
          label="Travel Aware"
          value="Freight & Road Time"
          note="Especially calibrated for perishable commodities"
          tone="blue"
        />
        <StatCard
          icon={<Factory size={19} />}
          label="Opportunity Set"
          value="Mandis + Buyers"
          note="APMC markets, food factories & restaurant buyers"
          tone="rose"
        />
      </div>

      <BottomCallout
        title="Ready to test with your harvest?"
        text="Choose Voice Mode to speak in Telugu or Hindi, or Manually Enter to test custom crop volumes."
      />
    </div>
  );
}

