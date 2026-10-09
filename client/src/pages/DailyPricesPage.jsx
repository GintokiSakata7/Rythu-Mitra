import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, ShieldCheck, CheckCircle2, Clock, Calendar, ArrowRight, RefreshCw, Filter, Sparkles } from 'lucide-react';
import { api } from '../lib/api.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';

export default function DailyPricesPage() {
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchCrop, setSearchCrop] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pricesRes, summaryRes] = await Promise.all([
        api.getPrices(),
        api.getPriceSummary()
      ]);
      setPrices(pricesRes.prices || []);
      setSummary(summaryRes || null);
    } catch (err) {
      console.error('Failed to load daily prices:', err);
      setError('Unable to load verified mandi prices. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered prices
  const districts = ['ALL', ...new Set(prices.map(p => p.district).filter(Boolean))];

  const filteredPrices = prices.filter(p => {
    const matchesCrop = !searchCrop || p.commodityName.toLowerCase().includes(searchCrop.toLowerCase());
    const matchesDistrict = selectedDistrict === 'ALL' || p.district === selectedDistrict;
    const matchesSource = selectedSource === 'ALL' || (selectedSource === 'OFFICIAL' ? p.isVerifiedSource : !p.isVerifiedSource);
    return matchesCrop && matchesDistrict && matchesSource;
  });

  return (
    <div className="daily-prices-page" style={{ padding: '1.25rem 0 3rem' }}>
      {/* Header Banner */}
      <div className="finder-header" style={{ marginBottom: '1.5rem' }}>
        <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '4px 12px', borderRadius: '999px', background: '#ecfdf5', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>
          <ShieldCheck size={16} color="#059669" />
          <span>VERIFIED APMC MARKET PRICE BULLETIN</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Daily Mandi Prices & Live Rates
        </h1>
        <p style={{ color: 'var(--muted, #64748b)', fontSize: '0.95rem', margin: 0, maxWidth: '640px' }}>
          Official daily agricultural auction prices reported directly by APMC mandi secretaries and verified through RythuMitra protocols.
        </p>
      </div>

      {/* Summary Stats Row */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '1.75rem' }}>
          <div className="info-stat-card" style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Markets Reporting Today</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              {summary.reportingMarketsToday} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>Mandis</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <CheckCircle2 size={12} /> Active auction yards
            </span>
          </div>

          <div className="info-stat-card" style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Verified Submissions Today</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
              {summary.recordsPublishedToday} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>Commodities</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Clock size={12} /> Published after admin review
            </span>
          </div>

          <div className="info-stat-card" style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Active Records</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {summary.totalVerifiedRecords} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>lots</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Calendar size={12} /> Cycle: {summary.latestSyncDate}
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Crop Search */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search crop (e.g. Tomato, Onion, Chilli)..."
              value={searchCrop}
              onChange={(e) => setSearchCrop(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#f8fafc'
              }}
            />
          </div>

          {/* District Filter */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Districts</option>
              {districts.filter(d => d !== 'ALL').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Verification Source Filter */}
          <div style={{ flex: '0 1 190px' }}>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Sources</option>
              <option value="OFFICIAL">Verified Official Only</option>
            </select>
          </div>

          <button
            onClick={fetchData}
            title="Refresh prices"
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Content State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px', animation: 'spin 1.5s linear infinite' }} />
          <p style={{ margin: 0, fontSize: '0.95rem' }}>Loading verified market auction data...</p>
        </div>
      ) : error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredPrices.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '14px', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 0 12px 0' }}>No daily price records found matching your filters.</p>
          <button
            onClick={() => { setSearchCrop(''); setSelectedDistrict('ALL'); setSelectedSource('ALL'); }}
            style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredPrices.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '1.25rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                {/* Top badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: item.freshness?.color === 'emerald' ? '#ecfdf5' : item.freshness?.color === 'blue' ? '#eff6ff' : '#fef3c7',
                        color: item.freshness?.color === 'emerald' ? '#065f46' : item.freshness?.color === 'blue' ? '#1e40af' : '#92400e'
                      }}
                    >
                      {item.freshness?.label || 'Today'}
                    </span>
                    {item.isVerifiedSource ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#166534',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ShieldCheck size={12} color="#16a34a" /> APMC Official
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#475569'
                        }}
                      >
                        Market Cache
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{item.reportingDate}</span>
                </div>

                {/* Mandi & Commodity Title */}
                <h3 style={{ margin: '0 0 2px 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {item.commodityName}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
                  {item.marketName} • <span style={{ color: '#334155', fontWeight: 500 }}>{item.district}</span>
                </div>

                {/* Price Display */}
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', border: '1px solid #f1f5f9', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Modal Rate (₹/Qtl)</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
                      ₹{Number(item.modalPrice).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                    <span>Min: ₹{item.minPrice}</span>
                    <span>Max: ₹{item.maxPrice}</span>
                    <span style={{ fontWeight: 600, color: '#334155' }}>₹{(item.modalPrice / 100).toFixed(1)}/kg</span>
                  </div>
                </div>

                {/* Remarks / Arrivals */}
                {item.remarks && (
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0', fontStyle: 'italic', background: '#fafafa', padding: '6px 8px', borderRadius: '6px' }}>
                    "{item.remarks}"
                  </p>
                )}
              </div>

              {/* Action: Compare or Calculate Net Return */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Ref: {item.sourceReference || 'Daily APMC Report'}
                </span>
                <Link
                  to={`/find?crop=${encodeURIComponent(item.commodityName)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#059669',
                    textDecoration: 'none'
                  }}
                >
                  <span>Test Net Profit</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
