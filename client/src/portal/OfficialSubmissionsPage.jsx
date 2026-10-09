import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Send, CheckCircle2, Clock, AlertCircle, XCircle, ArrowLeft, Edit3, X } from 'lucide-react';
import { api } from '../lib/api.js';

export default function OfficialSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Correction Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [modalMinPrice, setModalMinPrice] = useState('');
  const [modalMaxPrice, setModalMaxPrice] = useState('');
  const [modalModalPrice, setModalModalPrice] = useState('');
  const [modalRemarks, setModalRemarks] = useState('');
  const [modalError, setModalError] = useState('');
  const [savingModal, setSavingModal] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.getMySubmissions();
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter(s => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalMinPrice(item.minPrice);
    setModalMaxPrice(item.maxPrice);
    setModalModalPrice(item.modalPrice);
    setModalRemarks(item.remarks || '');
    setModalError('');
  };

  const handleResubmit = async () => {
    const min = Number(modalMinPrice);
    const max = Number(modalMaxPrice);
    const modal = Number(modalModalPrice);

    if (min <= 0 || max <= 0 || modal <= 0 || min > max || modal < min || modal > max) {
      setModalError('Ensure Min <= Modal <= Max and all prices are positive.');
      return;
    }

    setSavingModal(true);
    setModalError('');
    try {
      await api.updateSubmission(editingItem.id, {
        minPrice: min,
        maxPrice: max,
        modalPrice: modal,
        remarks: modalRemarks,
        submitForReview: true
      });
      setEditingItem(null);
      await fetchSubmissions();
    } catch (err) {
      setModalError(err.message || 'Failed to resubmit.');
    } finally {
      setSavingModal(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#065f46', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={13} /> PUBLISHED</span>;
      case 'PENDING_REVIEW':
        return <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#eff6ff', color: '#1e40af', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> PENDING REVIEW</span>;
      case 'NEEDS_CORRECTION':
        return <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#fffbeb', color: '#92400e', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={13} /> CORRECTION REQUIRED</span>;
      case 'REJECTED':
        return <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#fef2f2', color: '#991b1b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={13} /> REJECTED</span>;
      default:
        return <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/portal/official" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '6px' }}>
            <ArrowLeft size={14} /> Back to Official Desk
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Daily Price Submissions
          </h1>
        </div>

        <Link
          to="/portal/official/submit"
          style={{ padding: '8px 16px', background: '#059669', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Send size={14} /> Submit New Price
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
        {['ALL', 'PENDING_REVIEW', 'PUBLISHED', 'NEEDS_CORRECTION', 'REJECTED', 'DRAFT'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: statusFilter === status ? '1px solid #059669' : '1px solid #cbd5e1',
              background: statusFilter === status ? '#ecfdf5' : '#ffffff',
              color: statusFilter === status ? '#065f46' : '#64748b'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading submissions...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          No submissions found for status: <strong>{statusFilter}</strong>.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(item => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {item.commodityName}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({item.variety || 'Standard'})</span>
                    {getStatusBadge(item.status)}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {item.marketName} • Date: <strong>{item.reportingDate}</strong> • Ref: {item.sourceReference || item.id}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>
                    ₹{Number(item.modalPrice).toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>/Qtl</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Min: ₹{item.minPrice} | Max: ₹{item.maxPrice}
                  </div>
                </div>
              </div>

              {/* Remarks or Feedback */}
              {item.remarks && (
                <div style={{ background: item.status === 'NEEDS_CORRECTION' ? '#fffbeb' : item.status === 'REJECTED' ? '#fef2f2' : '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', color: '#334155', marginTop: '8px' }}>
                  <strong>{item.status === 'NEEDS_CORRECTION' ? 'Correction Note from Admin: ' : item.status === 'REJECTED' ? 'Rejection Reason: ' : 'Remarks: '}</strong>
                  {item.remarks}
                </div>
              )}

              {/* Action Button for Correction / Resubmission */}
              {(item.status === 'NEEDS_CORRECTION' || item.status === 'DRAFT') && (
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => openEditModal(item)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit3 size={13} />
                    <span>Revise & Resubmit for Review</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit / Resubmit Modal */}
      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Revise {editingItem.commodityName} Price
              </h3>
              <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '8px 10px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '12px' }}>
                {modalError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Min Price (₹/Quintal)
                </label>
                <input
                  type="number"
                  value={modalMinPrice}
                  onChange={(e) => setModalMinPrice(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Modal Price (₹/Quintal)
                </label>
                <input
                  type="number"
                  value={modalModalPrice}
                  onChange={(e) => setModalModalPrice(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '2px solid #059669', fontSize: '0.88rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Max Price (₹/Quintal)
                </label>
                <input
                  type="number"
                  value={modalMaxPrice}
                  onChange={(e) => setModalMaxPrice(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Correction Notes / Explanation
                </label>
                <input
                  type="text"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="e.g. Adjusted to reflect physical auction ledger"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingModal}
                onClick={handleResubmit}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                {savingModal ? 'Saving...' : 'Resubmit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
