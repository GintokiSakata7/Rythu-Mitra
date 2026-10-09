import { useMemo, useState, useEffect, useRef } from 'react';
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

  const incomingCrop = location.state?.crop || searchParams.get('crop');
  const incomingQty = location.state?.quantityKg || searchParams.get('quantityKg');
  const incomingLoc = location.state?.locationText || searchParams.get('locationText');
  const incomingLat = location.state?.latitude || searchParams.get('lat');
  const incomingLng = location.state?.longitude || searchParams.get('lng');
  const autoRunRequested = useRef(Boolean(location.state?.autoRun || searchParams.get('autoRun') === 'true'));

  const [form, setForm] = useState({
    crop: incomingCrop || '',
    quantityKg: incomingQty ? Number(incomingQty) : 5000,
    locationText: incomingLoc || '',
    latitude: incomingLat ? Number(incomingLat) : 0,
    longitude: incomingLng ? Number(incomingLng) : 0,
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
          crop: incomingCrop || prev.crop || commList[0]?.name || 'Tomato',
          locationText: incomingLoc || prev.locationText || firstLoc?.name || 'Bowenpally',
          latitude: incomingLat ? Number(incomingLat) : (prev.latitude || firstLoc?.lat || 17.47),
          longitude: incomingLng ? Number(incomingLng) : (prev.longitude || firstLoc?.lng || 78.48),
          quantityKg: incomingQty ? Number(incomingQty) : prev.quantityKg,
        }));

        setDataLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load live database metadata:', err);
      });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (dataLoaded && autoRunRequested.current) {
      autoRunRequested.current = false;
      submit();
    }
  }, [dataLoaded]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const resolveCoordinates = (name) => {
    if (!name) return null;
    if (locations[name]) return locations[name];
    const clean = name.toLowerCase().replace(/ market/i, '').trim();
    for (const [k, v] of Object.entries(locations)) {
      const kClean = k.toLowerCase().replace(/ market/i, '').trim();
      if (kClean === clean || kClean.includes(clean) || clean.includes(kClean)) {
        return v;
      }
    }
    return null;
  };

  const coordinates = useMemo(() => {
    if (form.latitude && form.longitude) {
      return { latitude: form.latitude, longitude: form.longitude };
    }
    const resolved = resolveCoordinates(form.locationText);
    if (resolved) return resolved;
    const firstLoc = Object.values(locations)[0];
    return firstLoc || { latitude: 17.385, longitude: 78.4867 };
  }, [form.locationText, form.latitude, form.longitude, locations]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please select your mandi or city.');
      return;
    }
    setGpsLoading(true);
    setError('');

    // Safety timeout: Never stay stuck in loading state
    const safetyTimer = setTimeout(() => {
      setGpsLoading(false);
    }, 7000);

    const onPosSuccess = (pos) => {
      clearTimeout(safetyTimer);
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // 1. Instantly match against all loaded mandis by distance
      let closestMandi = '';
      let minDistance = Infinity;
      Object.entries(locations).forEach(([locName, locCoords]) => {
        if (locCoords && locCoords.latitude && locCoords.longitude) {
          const d = Math.hypot(locCoords.latitude - lat, locCoords.longitude - lng);
          if (d < minDistance) {
            minDistance = d;
            closestMandi = locName;
          }
        }
      });

      const label = closestMandi ? `${closestMandi} (GPS Detected)` : `GPS (${lat.toFixed(3)}, ${lng.toFixed(3)})`;

      // 2. IMMEDIATELY update form with exact coordinates so user can search right away
      setForm(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        locationText: label
      }));
      setGpsLoading(false);

      // 3. Best-effort reverse geocoding with strict 2-second timeout (non-blocking)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          signal: controller.signal
        })
          .then(res => res.json())
          .then(data => {
            clearTimeout(timeoutId);
            if (data && data.address) {
              const locality = data.address.suburb || data.address.town || data.address.city || data.address.village || data.address.county;
              if (locality) {
                setForm(prev => ({
                  ...prev,
                  locationText: `${locality} (GPS)`
                }));
              }
            }
          })
          .catch(() => {});
      } catch (_) {}
    };

    const onPosError = (err) => {
      clearTimeout(safetyTimer);
      setGpsLoading(false);
      console.warn('Geolocation error:', err);

      // Fallback: use first available location in database or Bowenpally
      const firstAvailable = Object.keys(locations)[0] || 'Bowenpally';
      const c = locations[firstAvailable] || { latitude: 17.47, longitude: 78.48 };
      
      setForm(prev => ({
        ...prev,
        locationText: prev.locationText || firstAvailable,
        latitude: prev.latitude || c.latitude,
        longitude: prev.longitude || c.longitude
      }));

      setError(
        err?.code === 1
          ? 'Location access was denied in your browser settings. Using closest available market.'
          : 'Could not access GPS signal directly. Please choose your town from the list below.'
      );
    };

    // Try fast low-accuracy first (instant cached/wifi coordinates)
    navigator.geolocation.getCurrentPosition(
      onPosSuccess,
      () => {
        // Fallback: try high accuracy with 4s timeout
        navigator.geolocation.getCurrentPosition(
          onPosSuccess,
          onPosError,
          { timeout: 4000, enableHighAccuracy: true, maximumAge: 60000 }
        );
      },
      { timeout: 3500, enableHighAccuracy: false, maximumAge: 300000 }
    );
  };

  async function submit(e) {
    e?.preventDefault();
    setLoading(true);
    setError('');

    let finalLat = form.latitude;
    let finalLng = form.longitude;

    if (!finalLat || !finalLng) {
      const resolved = resolveCoordinates(form.locationText);
      if (resolved) {
        finalLat = resolved.latitude;
        finalLng = resolved.longitude;
      } else {
        const first = Object.values(locations)[0] || { latitude: 17.385, longitude: 78.4867 };
        finalLat = first.latitude;
        finalLng = first.longitude;
      }
    }

    try {
      const payload = {
        ...form,
        latitude: finalLat,
        longitude: finalLng,
        quantityKg: Number(form.quantityKg)
      };

      const data = await api.recommend(payload);
      setResult(data);
    } catch (err) {
      console.error('Optimization request failed:', err);
      setError(err?.message || 'Failed to calculate recommendations. Please check server connection.');
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
                      const c = resolveCoordinates(sel);
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
                    <span>{gpsLoading ? 'Locating...' : 'GPS'}</span>
                  </button>
                </div>
                <div className="location-quick-pills" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {Object.keys(locations).slice(0, 7).map(mName => (
                    <button
                      key={mName}
                      type="button"
                      className="pill-btn"
                      style={{
                        fontSize: '12px',
                        padding: '3px 9px',
                        borderRadius: '12px',
                        border: form.locationText === mName ? '1.5px solid #137333' : '1px solid #d1d5db',
                        background: form.locationText === mName ? '#e6f4ea' : '#fff',
                        color: form.locationText === mName ? '#137333' : '#374151',
                        fontWeight: form.locationText === mName ? 'bold' : 'normal',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const coords = resolveCoordinates(mName);
                        setForm(prev => ({
                          ...prev,
                          locationText: mName,
                          latitude: coords ? coords.latitude : prev.latitude,
                          longitude: coords ? coords.longitude : prev.longitude
                        }));
                      }}
                    >
                      📍 {mName}
                    </button>
                  ))}
                </div>
                {form.latitude && form.longitude ? (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#137333', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={13} />
                    <span>Coordinates: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</span>
                  </div>
                ) : null}
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
                  <h3>Your Search Results Will Appear Here</h3>
                  <p>
                    Select your crop, quantity, and location on the left, then click &ldquo;Find best option&rdquo; to compare live mandi prices and verified direct buyer contracts.
                  </p>
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
                            {result.recommendation?.netRange || ((result.recommendation?.netRealization || 0) < 0
                              ? `−₹${Math.abs(Math.round(result.recommendation?.netRealization || 0)).toLocaleString('en-IN')}`
                              : `₹${Math.round(result.recommendation?.netRealization || 0).toLocaleString('en-IN')}`)}
                          </strong>
                          {result.recommendation?.vehicleName && (
                            <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.95 }}>
                              🚚 {result.recommendation.vehicleName} ({result.recommendation.transportRange || 'Free'})
                            </div>
                          )}
                          <small>AI: {result.aiProvider}</small>
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const otherOptions = (result.alternatives || []).filter(
                      alt => alt.id !== result.recommendation?.id &&
                             (alt.companyName || alt.name) !== (result.recommendation?.companyName || result.recommendation?.name)
                    );

                    return (
                      <>
                        <div className="results-top">
                          <div>
                            <span className="result-caption">Other Opportunities</span>
                            <h3>Alternative markets &amp; buyers considered</h3>
                          </div>
                          <span className="pill">{result.search?.candidatesEvaluated} evaluated</span>
                        </div>

                        <div className="opportunity-list">
                          {otherOptions.slice(0, 6).map((x, i) => (
                            <OpportunityCard key={x.id || `${x.name}-${i}`} opportunity={x} highlight={false} />
                          ))}
                        </div>
                      </>
                    );
                  })()}

                  <MarketMap opportunities={result.alternatives} farmer={coordinates} />
                  <OptimizerTrace search={result.search} />

                  <div className="assumption-strip">
                    <Check size={16} />
                    <span>
                      Dynamic vehicle tier: {result.recommendation?.vehicleName || 'Load-based freight'} ({result.recommendation?.transportRange || 'Dynamic rates'}) · Round-trip distance & time economics factored.
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
