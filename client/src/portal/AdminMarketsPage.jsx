import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Plus, Search, PackagePlus } from 'lucide-react';
import { api } from '../lib/api.js';

const POPULAR_COMMODITY_PRESETS = [
  'Garlic', 'Ginger', 'Wheat', 'Groundnut', 'Cotton', 'Turmeric',
  'Cabbage', 'Cauliflower', 'Capsicum', 'Maize', 'Soybean',
  'Green Gram', 'Black Gram', 'Red Chilli', 'Paddy', 'Potato',
  'Carrot', 'Coriander', 'Mustard', 'Brinjal', 'Bitter Gourd'
];

export default function AdminMarketsPage({ initialTab = 'MARKETS' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'MARKETS' | 'COMMODITIES'
  const [markets, setMarkets] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // New Commodity Form
  const [newCommodityName, setNewCommodityName] = useState('');
  const [newVariety, setNewVariety] = useState('');
  const [newGrade, setNewGrade] = useState('Grade A');
  const [newUnit, setNewUnit] = useState('₹/Quintal');
  const [addingCommodity, setAddingCommodity] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [marketsRes, commoditiesRes] = await Promise.all([
        api.getAdminMarkets(),
        api.getAdminCommodities()
      ]);
      setMarkets(marketsRes.markets || []);
      setCommodities(commoditiesRes.commodities || []);
    } catch (err) {
      console.error('Failed to load markets/commodities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCommodity = async (e) => {
    e.preventDefault();
    if (!newCommodityName.trim()) return;

    setAddingCommodity(true);
    try {
      await api.createCommodity({
        commodityName: newCommodityName.trim(),
        variety: newVariety.trim() || 'Standard',
        grade: newGrade,
        canonicalUnit: newUnit || '₹/Quintal'
      });
      setToastMessage(`✓ "${newCommodityName.trim()}" registered to APMC catalog successfully!`);
      setTimeout(() => setToastMessage(null), 5000);
      setNewCommodityName('');
      setNewVariety('');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to add commodity.');
    } finally {
      setAddingCommodity(false);
    }
  };

  const handleToggleCommodity = async (id, currentActive) => {
    try {
      await api.toggleCommodity(id, !currentActive);
      await fetchData();
    } catch (err) {
      alert('Failed to toggle commodity status.');
    }
  };

  const filteredCommodities = commodities.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.commodityName && c.commodityName.toLowerCase().includes(q)) ||
      (c.variety && c.variety.toLowerCase().includes(q)) ||
      (c.grade && c.grade.toLowerCase().includes(q))
    );
  });

  const activeCount = commodities.filter(c => c.active !== false).length;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/portal/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft size={14} /> Back to Admin Console
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Mandis & Commodities Management
          </h1>
        </div>
      </div>

      {toastMessage && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '10px 14px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={{ fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('MARKETS')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            border: activeTab === 'MARKETS' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeTab === 'MARKETS' ? '#eff6ff' : '#ffffff',
            color: activeTab === 'MARKETS' ? '#1e40af' : '#64748b'
          }}
        >
          Daily Mandi Reporting Compliance ({markets.length})
        </button>
        <button
          onClick={() => setActiveTab('COMMODITIES')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            border: activeTab === 'COMMODITIES' ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: activeTab === 'COMMODITIES' ? '#eff6ff' : '#ffffff',
            color: activeTab === 'COMMODITIES' ? '#1e40af' : '#64748b'
          }}
        >
          Commodity Catalog ({commodities.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
      ) : activeTab === 'MARKETS' ? (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
            Regional Wholesale Mandi Compliance Monitoring (Today's Reporting Status)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 16px' }}>Mandi Yard</th>
                <th style={{ padding: '10px 16px' }}>District</th>
                <th style={{ padding: '10px 16px' }}>Reporting Status</th>
                <th style={{ padding: '10px 16px' }}>Coordinates</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m, idx) => (
                <tr key={m.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: '#0f172a' }}>
                    {m.name}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#64748b' }}>{m.district}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {m.hasReportedToday ? (
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Reported Today
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> Awaiting Report
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {m.latitude?.toFixed(2)}, {m.longitude?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          {/* Add Commodity Form */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <PackagePlus size={18} color="#059669" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Register New Mandi Commodity / Crop Item
              </h3>
            </div>

            {/* Quick Add Suggestion Chips */}
            <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                Quick Fill Popular Mandi Commodities:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_COMMODITY_PRESETS.map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setNewCommodityName(crop)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: newCommodityName.toLowerCase() === crop.toLowerCase() ? '1px solid #059669' : '1px solid #cbd5e1',
                      background: newCommodityName.toLowerCase() === crop.toLowerCase() ? '#ecfdf5' : '#ffffff',
                      color: newCommodityName.toLowerCase() === crop.toLowerCase() ? '#047857' : '#334155',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + {crop}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddCommodity} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Commodity Name *</label>
                <input
                  type="text"
                  required
                  value={newCommodityName}
                  onChange={(e) => setNewCommodityName(e.target.value)}
                  placeholder="e.g. Groundnut, Garlic, Cotton"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ flex: '1 1 160px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Variety</label>
                <input
                  type="text"
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  placeholder="e.g. Hybrid / Desi / Bold"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ flex: '0 1 130px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Grade</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#fff' }}
                >
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                  <option value="FAQ">FAQ</option>
                </select>
              </div>

              <div style={{ flex: '0 1 140px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Canonical Unit</label>
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem', background: '#fff' }}
                >
                  <option value="₹/Quintal">₹/Quintal</option>
                  <option value="₹/Kg">₹/Kg</option>
                  <option value="₹/Bag">₹/Bag</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={addingCommodity}
                style={{
                  padding: '9px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#059669',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: addingCommodity ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={15} /> {addingCommodity ? 'Saving...' : 'Add Item'}
              </button>
            </form>
          </div>

          {/* Commodities List Header with Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing <strong>{filteredCommodities.length}</strong> of <strong>{commodities.length}</strong> commodities ({activeCount} active in farmer feeds)
            </div>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search commodities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.84rem'
                }}
              />
            </div>
          </div>

          {/* Commodities List */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', background: '#f8fafc' }}>
                  <th style={{ padding: '10px 16px' }}>Commodity</th>
                  <th style={{ padding: '10px 16px' }}>Variety</th>
                  <th style={{ padding: '10px 16px' }}>Grade</th>
                  <th style={{ padding: '10px 16px' }}>Canonical Unit</th>
                  <th style={{ padding: '10px 16px' }}>Status</th>
                  <th style={{ padding: '10px 16px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommodities.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: '#0f172a' }}>{c.commodityName}</td>
                    <td style={{ padding: '10px 16px', color: '#64748b' }}>{c.variety || 'Standard'}</td>
                    <td style={{ padding: '10px 16px', color: '#64748b' }}>{c.grade || 'Grade A'}</td>
                    <td style={{ padding: '10px 16px', color: '#334155', fontWeight: 600 }}>{c.canonicalUnit || '₹/Quintal'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.active !== false ? '#15803d' : '#991b1b', background: c.active !== false ? '#dcfce7' : '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>
                        {c.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <button
                        onClick={() => handleToggleCommodity(c.id, c.active !== false)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        {c.active !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCommodities.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                      No commodities match "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
