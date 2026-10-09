import { useMemo, useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Check, Crosshair, Edit3, Loader2, MapPin, Mic, Mic2,
  Navigation, RefreshCw, Sparkles, Truck, Wheat
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import OptimizerTrace from '../components/OptimizerTrace.jsx';
import MarketMap from '../components/MarketMap.jsx';
import VoiceFlow from '../components/VoiceFlow.jsx';
import { api } from '../lib/api.js';

export default function FindOpportunityPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const requestedMode = location.state?.mode || searchParams.get('mode');
  const [mode, setMode] = useState(requestedMode === 'voice' ? 'voice' : 'manual');

  useEffect(() => {
    const currentRequestedMode = location.state?.mode || searchParams.get('mode');
    if (currentRequestedMode === 'voice' || currentRequestedMode === 'manual') {
      setMode(currentRequestedMode);
    }
  }, [location.state, searchParams]);
  const [locations, setLocations] = useState({});
  const [commodities, setCommodities] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [form, setForm] = useState({
    crop: '',
    quantityKg: 5000,
    locationText: '',
    latitude: 0,
    longitude: 0,
    quality: 'A',
    hasTransport: false,
    perishability: 'high',
    includeBuyers: true,
    language: 'en'
  });

  useEffect(() => {
    let isMounted = true;

    Promise.all([api.markets(), api.commodities()])
      .then(([mktData, commData]) => {
        if (!isMounted) return;

        const newLocs = {};
        let firstLoc = null;

        if (mktData?.markets?.length) {
          mktData.markets.forEach(m => {
            if (m.name) {
              const cleanName = m.name.replace(/ market/i, '').trim();
              newLocs[cleanName] = { latitude: m.latitude, longitude: m.longitude };
              if (!firstLoc) firstLoc = { name: cleanName, lat: m.latitude, lng: m.longitude };
            }
            if (m.district && !newLocs[m.district]) {
              newLocs[m.district] = { latitude: m.latitude, longitude: m.longitude };
            }
          });
          setLocations(newLocs);
        }

        const commList = commData?.commodities || [];
        setCommodities(commList);

        setForm(prev => ({
          ...prev,
          crop: prev.crop || commList[0]?.name || '',
          locationText: prev.locationText || firstLoc?.name || '',
          latitude: prev.latitude || firstLoc?.lat || 17.38,
          longitude: prev.longitude || firstLoc?.lng || 78.48
        }));

        setDataLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load live database metadata:', err);
      });

    return () => { isMounted = false; };
  }, []);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const coordinates = useMemo(() => {
    if (form.latitude && form.longitude) {
      return { latitude: form.latitude, longitude: form.longitude };
    }
    return locations[form.locationText] || locations.Nalgonda;
  }, [form.locationText, form.latitude, form.longitude]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let name = `GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          if (data && data.address) {
            name = `📍 ${data.address.city || data.address.town || data.address.village || data.address.county || 'Your Location'}`;
          }
        } catch (e) {
          console.error('Reverse geocode failed', e);
        }

        setForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          locationText: name
        }));
        setGpsLoading(false);
      },
      () => {
        alert('Could not access your location. Please select a city/town.');
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  };

  async function submit(e) {
    e?.preventDefault();
    setLoading(true);
    setError('');

    let finalLat = form.latitude;
    let finalLng = form.longitude;

    if (!locations[form.locationText] && (!finalLat || !finalLng)) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.locationText + ', Telangana, India')}`);
        const data = await res.json();
        if (data && data.length > 0) {
          finalLat = parseFloat(data[0].lat);
          finalLng = parseFloat(data[0].lon);
          setForm(prev => ({ ...prev, latitude: finalLat, longitude: finalLng }));
        } else {
          setError(`Could not find coordinates for "${form.locationText}". Please try a different nearby town.`);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Geocoding failed', err);
        setError('Location search failed. Please try again or use the GPS button.');
        setLoading(false);
        return;
      }
    } else if (locations[form.locationText]) {
      finalLat = locations[form.locationText].latitude;
      finalLng = locations[form.locationText].longitude;
    } else if (!finalLat) {
      finalLat = locations.Nalgonda.latitude;
      finalLng = locations.Nalgonda.longitude;
    }

    try {
      const payload = {
        ...form,
        latitude: finalLat,
        longitude: finalLng,
        quantityKg: Number(form.quantityKg)
      };
      setResult(await api.recommend(payload));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="find-page-container">
      {/* Top Mobile-First Mode Selector Switcher */}
      <div className="entry-mode-switch-card">
        <div className="entry-mode-options">
          <button
            type="button"
            className={`entry-mode-btn ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => setMode('manual')}
          >
            <Edit3 size={18} />
            <div>
              <strong>Manually Enter</strong>
              <small>Type crop & location form</small>
            </div>
          </button>

          <button
            type="button"
            className={`entry-mode-btn special-voice ${mode === 'voice' ? 'active' : ''}`}
            onClick={() => setMode('voice')}
          >
            <Mic size={20} className="pulse-mic-icon" />
            <div>
              <div className="badge-line">
                <strong>Voice Mode</strong>
                <span className="mode-pill-tag">AI సహచరి</span>
              </div>
              <small>Speak in Telugu, Hindi or English</small>
            </div>
          </button>
        </div>
      </div>

      {mode === 'voice' ? (
        <VoiceFlow onSwitchToManual={() => setMode('manual')} />
      ) : (
        <div>
          <SectionHeader
            eyebrow="MANUAL SEARCH ENGINE"
            title="Search only as far as the economics justify."
            description="Start nearby. Expand only when a farther market or buyer could realistically beat your current best realization."
          />

          <div className="finder-layout">
            <form className="panel form-panel" onSubmit={submit}>
              <div className="form-title">
                <div className="form-icon">
                  <Wheat size={20} />
                </div>
                <div>
                  <h3>Harvest Details</h3>
                  <p>Tell us what you have and where you are.</p>
                </div>
              </div>

              <Field label="Crop">
                <select 
                  value={form.crop} 
                  onChange={e => setForm({ ...form, crop: e.target.value })}
                  disabled={commodities.length === 0}
                >
                  {commodities.length > 0 ? (
                    commodities.map(c => (
                      <option key={c.code || c.name} value={c.name}>{c.name}</option>
                    ))
                  ) : (
                    <option value="">Loading commodities from database...</option>
                  )}
                </select>
              </Field>

              <div className="form-row">
                <Field label="Quantity (kg)">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={form.quantityKg}
                    onChange={e => setForm({ ...form, quantityKg: e.target.value })}
                  />
                </Field>
                <Field label="Quality">
                  <select value={form.quality} onChange={e => setForm({ ...form, quality: e.target.value })}>
                    <option value="A">Grade A (Premium)</option>
                    <option value="B+">Grade B+ (Good)</option>
                    <option value="B">Grade B (Standard)</option>
                  </select>
                </Field>
              </div>

              <Field label="Farm / Nearest Town">
                <div className="location-input-group">
                  <input
                    type="text"
                    list="locations-list"
                    className="form-input"
                    placeholder="Search city or market..."
                    value={form.locationText}
                    onChange={e => {
                      const sel = e.target.value;
                      const c = locations[sel];
                      setForm({
                        ...form,
                        locationText: sel,
                        latitude: c ? c.latitude : form.latitude,
                        longitude: c ? c.longitude : form.longitude
                      });
                    }}
                  />
                  <datalist id="locations-list">
                    {Object.keys(locations).sort().map(x => (
                      <option key={x} value={x} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    className="gps-quick-btn"
                    onClick={handleUseGPS}
                    disabled={gpsLoading}
                    title="Detect GPS location"
                  >
                    {gpsLoading ? <Loader2 className="spin" size={16} /> : <Navigation size={16} />}
                    <span>GPS</span>
                  </button>
                </div>
              </Field>

              <div className="transport-toggle">
                <div>
                  <span className="field-label">Transportation</span>
                  <p>Can you move the harvest yourself?</p>
                </div>
                <button
                  type="button"
                  className={form.hasTransport ? 'toggle on' : 'toggle'}
                  onClick={() => setForm({ ...form, hasTransport: !form.hasTransport })}
                >
                  <span />
                </button>
              </div>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.includeBuyers}
                  onChange={e => setForm({ ...form, includeBuyers: e.target.checked })}
                />
                <span>
                  <strong>Include direct buyers</strong>
                  <small>Factories, restaurants and processors with open requirements.</small>
                </span>
              </label>

              {error && <div className="error-box">{error}</div>}

              <button className="button button-primary full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="spin" size={17} /> Optimizing...
                  </>
                ) : (
                  <>
                    <Crosshair size={17} /> Find best option
                  </>
                )}
              </button>

              <div className="demo-note">
                <Sparkles size={15} />
                <span>Runs optimizer with deterministic real-world cost functions.</span>
              </div>
            </form>

            <div className="finder-results">
              {!result ? (
                <div className="empty-state panel">
                  <div className="empty-orbit">
                    <Navigation size={26} />
                  </div>
                  <h3>Your search result will appear here</h3>
                  <p>
                    Try 5,000 kg of tomatoes in Nalgonda with no transport to see progressive search and direct-buyer matching.
                  </p>
                  <button
                    className="button button-ghost"
                    onClick={() => {
                      setForm({ ...form, quantityKg: 5000, locationText: 'Nalgonda', hasTransport: false });
                    }}
                  >
                    <RefreshCw size={15} /> Load demo values
                  </button>
                </div>
              ) : (
                <>
                  {(() => {
                    const isLoss = (result.recommendation?.netRealization ?? 0) < 0;
                    return (
                      <div className={`recommendation-banner ${isLoss ? 'warning-loss' : ''}`}>
                        <div>
                          <div className={`eyebrow ${isLoss ? 'eyebrow-loss' : ''}`}>
                            {isLoss ? '⚠️ TRANSPORT LOSS ALERT' : 'BEST OPPORTUNITY'}
                          </div>
                          <h2>{result.recommendation?.companyName || result.recommendation?.name}</h2>
                          <p>
                            {(result.explanation || '').split(/(\*\*.*?\*\*)/g).map((part, idx) => 
                              part.startsWith('**') && part.endsWith('**') 
                                ? <strong key={idx}>{part.slice(2, -2)}</strong> 
                                : part
                            )}
                          </p>
                          {isLoss && (
                            <div className="loss-advisory-pill">
                              💡 <strong>Advisory:</strong> Freight and travel costs exceed crop value for small quantities. Consider selling at farmgate or pooling transit with neighbors.
                            </div>
                          )}
                        </div>
                        <div className="banner-value">
                          <span>{isLoss ? 'Expected net loss' : 'Expected net'}</span>
                          <strong className={isLoss ? 'loss-num' : ''}>
                            ₹{Math.round(result.recommendation?.netRealization || 0).toLocaleString('en-IN')}
                          </strong>
                          <small>AI: {result.aiProvider}</small>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="results-top">
                    <div>
                      <span className="result-caption">Top opportunities</span>
                      <h3>What the engine considered</h3>
                    </div>
                    <span className="pill">{result.search?.candidatesEvaluated} evaluated</span>
                  </div>

                  <div className="opportunity-list">
                    {result.alternatives?.slice(0, 6).map((x, i) => (
                      <OpportunityCard key={x.id || `${x.name}-${i}`} opportunity={x} highlight={i === 0} />
                    ))}
                  </div>

                  <MarketMap opportunities={result.alternatives} farmer={coordinates} />
                  <OptimizerTrace search={result.search} />

                  <div className="assumption-strip">
                    <Check size={16} />
                    <span>
                      Prototype assumptions: transport ₹18/km, time ₹300/hr, configurable risk coefficient.
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}
