import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft, CheckCircle2, AlertTriangle, Plus, Check, X } from 'lucide-react';
import { api } from '../lib/api.js';

export default function AdminMarketsPage() {
  const [activeTab, setActiveTab] = useState('MARKETS'); // 'MARKETS' | 'COMMODITIES'
  const [markets, setMarkets] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Commodity Form
  const [newCommodityName, setNewCommodityName] = useState('');
  const [newVariety, setNewVariety] = useState('');
  const [newGrade, setNewGrade] = useState('Grade A');
  const [addingCommodity, setAddingCommodity] = useState(false);

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
        canonicalUnit: '₹/Quintal'
      });
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
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Register New Commodity Variety
            </h3>
            <form onSubmit={handleAddCommodity} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Commodity Name *</label>
                <input
                  type="text"
                  required
                  value={newCommodityName}
                  onChange={(e) => setNewCommodityName(e.target.value)}
                  placeholder="e.g. Groundnut"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ flex: '1 1 180px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Variety</label>
                <input
                  type="text"
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  placeholder="e.g. Bold / Spanish"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ flex: '0 1 150px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Grade</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                >
                  <option value="Grade A">Grade A</option>
                  <option value="Grade B">Grade B</option>
                  <option value="FAQ">FAQ</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={addingCommodity}
                style={{
                  padding: '9px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#059669',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={15} /> Add Commodity
              </button>
            </form>
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
                {commodities.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: '#0f172a' }}>{c.commodityName}</td>
                    <td style={{ padding: '10px 16px', color: '#64748b' }}>{c.variety || 'Standard'}</td>
                    <td style={{ padding: '10px 16px', color: '#64748b' }}>{c.grade || 'Grade A'}</td>
                    <td style={{ padding: '10px 16px', color: '#334155', fontWeight: 600 }}>{c.canonicalUnit || '₹/Quintal'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.active !== false ? '#15803d' : '#991b1b' }}>
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
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
