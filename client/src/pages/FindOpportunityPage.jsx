import { useMemo, useState, useEffect } from 'react';
import {
  Check, Crosshair, Edit3, Loader2, MapPin, Mic, Mic2,
  Navigation, RefreshCw, Sparkles, Truck, Wheat
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader.jsx';
import OpportunityCard from '../components/OpportunityCard.jsx';
import OptimizerTrace from '../components/OptimizerTrace.jsx';
import MarketMap from '../components/MarketMap.jsx';
import { api } from '../lib/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { translateCrop } from '../lib/cropTranslations.js';

export default function FindOpportunityPage() {
  const [mode, setMode] = useState('manual');
  const [locations, setLocations] = useState({
    Nalgonda: { latitude: 17.05, longitude: 79.27 },
    Miryalaguda: { latitude: 16.87, longitude: 79.56 },
    Hyderabad: { latitude: 17.385, longitude: 78.4867 },
    Suryapet: { latitude: 17.14, longitude: 79.62 }
  });

  const [commodities, setCommodities] = useState([]);

  useEffect(() => {
    api.markets().then(data => {
      if (data && data.markets) {
        const newLocs = { ...locations };
        data.markets.forEach(m => {
          if (m.name) {
            const cleanName = m.name.replace(/ market/i, '').trim();
            newLocs[cleanName] = { latitude: m.latitude, longitude: m.longitude };
          }
          if (m.district) {
            newLocs[m.district] = { latitude: m.latitude, longitude: m.longitude };
          }
        });
        setLocations(newLocs);
      }
    }).catch(console.error);

    api.commodities().then(data => {
      if (data && data.commodities) {
        setCommodities(data.commodities);
      }
    }).catch(console.error);
  }, []);

  const [form, setForm] = useState({
    crop: 'Tomato',
    quantityKg: 5000,
    locationText: 'Nalgonda',
    latitude: 17.05,
    longitude: 79.27,
    quality: 'A',
    hasTransport: false,
    perishability: 'high',
    includeBuyers: true
  });
  
  const { language, t } = useLanguage();

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
    try {
      const payload = {
        ...form,
        ...coordinates,
        language: language || 'en',
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
      <div>
        <SectionHeader
          eyebrow={t('find_eyebrow')}
          title={t('find_title')}
          description={t('find_desc')}
        />

        <div className="finder-layout">
          <form className="panel form-panel" onSubmit={submit}>
              <div className="form-title">
                <div className="form-icon">
                  <Wheat size={20} />
                </div>
                <div>
                  <h3>{t('find_form_title')}</h3>
                  <p>{t('find_form_desc')}</p>
                </div>
              </div>

              <Field label={t('find_label_crop')}>
                <select value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}>
                  {commodities.length > 0 ? commodities.map(c => (
                    <option key={c.code} value={c.name}>{translateCrop(c.name, language)}</option>
                  )) : (
                    <>
                      <option value="Tomato">{translateCrop('Tomato', language)}</option>
                      <option value="Onion">{translateCrop('Onion', language)}</option>
                      <option value="Potato">{translateCrop('Potato', language)}</option>
                    </>
                  )}
                </select>
              </Field>

              <div className="form-row">
                <Field label={t('find_label_qty')}>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={form.quantityKg}
                    onChange={e => setForm({ ...form, quantityKg: e.target.value })}
                  />
                </Field>
                <Field label={t('find_label_quality')}>
                  <select value={form.quality} onChange={e => setForm({ ...form, quality: e.target.value })}>
                    <option value="A">{t('find_grade_a')}</option>
                    <option value="B+">{t('find_grade_b_plus')}</option>
                    <option value="B">{t('find_grade_b')}</option>
                  </select>
                </Field>
              </div>

              <Field label={t('find_label_loc')}>
                <div className="location-input-group">
                  <input
                    type="text"
                    list="locations-list"
                    className="form-input"
                    placeholder={t('find_search_loc')}
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
                    <span>{t('find_gps')}</span>
                  </button>
                </div>
              </Field>

              <div className="transport-toggle">
                <div>
                  <span className="field-label">{t('find_label_transport')}</span>
                  <p>{t('find_transport_desc')}</p>
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
                  <strong>{t('find_label_buyers')}</strong>
                  <small>{t('find_buyers_desc')}</small>
                </span>
              </label>

              {error && <div className="error-box">{error}</div>}

              <button className="button button-primary full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="spin" size={17} /> {t('find_btn_loading')}
                  </>
                ) : (
                  <>
                    <Crosshair size={17} /> {t('find_btn_submit')}
                  </>
                )}
              </button>

              <div className="demo-note">
                <Sparkles size={15} />
                <span>{t('find_note')}</span>
              </div>
            </form>

            <div className="finder-results">
              {!result ? (
                <div className="empty-state panel">
                  <div className="empty-orbit">
                    <Navigation size={26} />
                  </div>
                  <h3>{t('find_empty_title')}</h3>
                  <p>
                    {t('find_empty_desc')}
                  </p>
                  <button
                    className="button button-ghost"
                    onClick={() => {
                      setForm({ ...form, quantityKg: 5000, locationText: 'Nalgonda', hasTransport: false });
                    }}
                  >
                    <RefreshCw size={15} /> {t('find_btn_demo')}
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
                          <p>{result.explanation}</p>
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
