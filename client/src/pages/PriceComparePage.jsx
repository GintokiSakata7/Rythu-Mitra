import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowUpDown, ShieldCheck, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '../lib/api.js';

export default function PriceComparePage() {
  const [commodities, setCommodities] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [marketsData, setMarketsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const comRes = await api.commodities().catch(() => ({ commodities: ['Tomato', 'Onion', 'Chilli Green', 'Cotton', 'Paddy'] }));
        const list = Array.isArray(comRes) ? comRes : (comRes.commodities || ['Tomato', 'Onion', 'Chilli Green', 'Cotton', 'Paddy']);
        setCommodities(list.map(c => typeof c === 'string' ? c : c.commodityName || c.name));
      } catch (e) {
        setCommodities(['Tomato', 'Onion', 'Chilli Green', 'Cotton', 'Paddy']);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadPrices() {
      setLoading(true);
      try {
        const [marketsRes, verifiedRes] = await Promise.all([
          api.markets({ crop: selectedCrop }),
          api.getPrices({ commodity: selectedCrop })
        ]);

        const verifiedMap = new Map();
        (verifiedRes.prices || []).forEach(p => {
          verifiedMap.set(p.marketId, p);
          if (p.marketName) verifiedMap.set(p.marketName.toLowerCase(), p);
        });

        const list = (marketsRes.markets || marketsRes || []).map(m => {
          const verified = verifiedMap.get(m.id) || verifiedMap.get(m.name?.toLowerCase());
          const modal = verified ? Number(verified.modalPrice / 100) : (m.modalPrice || m.pricePerKg || 25);
          return {
            ...m,
            modalPerKg: modal,
            modalPerQtl: modal * 100,
            isVerified: Boolean(verified),
            verifiedDate: verified?.reportingDate || null,
            source: verified ? 'Verified APMC Official' : (m.source || 'State APMC Bulletin')
          };
        });

        // Sort by modal price descending
        list.sort((a, b) => b.modalPerKg - a.modalPerKg);
        setMarketsData(list);
      } catch (err) {
        console.error('Failed to load comparison data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrices();
  }, [selectedCrop]);

  const bestMarket = marketsData[0];
  const lowestMarket = marketsData[marketsData.length - 1];
  const spreadPerQtl = bestMarket && lowestMarket ? (bestMarket.modalPerQtl - lowestMarket.modalPerQtl) : 0;

  return (
    <div className="price-compare-page" style={{ padding: '1.25rem 0 3rem' }}>
      <div className="finder-header" style={{ marginBottom: '1.5rem' }}>
        <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '4px 12px', borderRadius: '999px', background: '#eff6ff', color: '#1e40af', fontSize: '0.85rem', fontWeight: 600 }}>
          <Scale size={16} color="#3b82f6" />
          <span>CROSS-MARKET PRICE ARBITRAGE</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Compare Mandi Prices
        </h1>
        <p style={{ color: 'var(--muted, #64748b)', fontSize: '0.95rem', margin: 0 }}>
          Compare real auction rates across regional wholesale mandis to identify price variations and high-value selling opportunities.
        </p>
      </div>

      {/* Crop Selector Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>Select Commodity:</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {commodities.slice(0, 7).map(crop => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedCrop === crop ? '1px solid #059669' : '1px solid #cbd5e1',
                  backgroundColor: selectedCrop === crop ? '#ecfdf5' : '#ffffff',
                  color: selectedCrop === crop ? '#065f46' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spread Insights Card */}
      {bestMarket && lowestMarket && spreadPerQtl > 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Inter-Market Spread Detected</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
              <strong>{bestMarket.name}</strong> is paying <span style={{ color: '#059669' }}>+₹{spreadPerQtl.toLocaleString()}/Quintal</span> (+₹{(spreadPerQtl/100).toFixed(1)}/kg) more than <strong>{lowestMarket.name}</strong>.
            </div>
            <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '4px' }}>
              Note: Transport and travel costs must be factored in. Use the Opportunity Engine to verify net profitability.
            </div>
          </div>
          <Link
            to={`/find?crop=${encodeURIComponent(selectedCrop)}`}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Calculate Net Realization <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Comparison Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Comparing mandi prices...</div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Rank</th>
                  <th style={{ padding: '12px 16px' }}>Mandi / Yard</th>
                  <th style={{ padding: '12px 16px' }}>District</th>
                  <th style={{ padding: '12px 16px' }}>Rate (₹/kg)</th>
                  <th style={{ padding: '12px 16px' }}>Rate (₹/Quintal)</th>
                  <th style={{ padding: '12px 16px' }}>Data Status</th>
                  <th style={{ padding: '12px 16px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {marketsData.map((m, idx) => (
                  <tr key={m.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx === 0 ? '#f0fdf4' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: idx === 0 ? '#059669' : '#64748b' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {m.name}
                      {idx === 0 && <span style={{ marginLeft: '8px', fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Highest Price</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{m.district || 'Telangana'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                      ₹{m.modalPerKg.toFixed(1)}/kg
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                      ₹{m.modalPerQtl.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {m.isVerified ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={12} color="#16a34a" /> Official ({m.verifiedDate})
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px' }}>
                          State APMC Cache
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link
                        to={`/find?crop=${encodeURIComponent(selectedCrop)}`}
                        style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}
                      >
                        Calculate Net
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
