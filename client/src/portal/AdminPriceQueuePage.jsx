import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, CheckCircle2, AlertCircle, XCircle, ArrowLeft, Clock, ShieldCheck, User, Calendar } from 'lucide-react';
import { api } from '../lib/api.js';

export default function AdminPriceQueuePage() {
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  // Action Dialog State
  const [activeItem, setActiveItem] = useState(null);
  const [dialogAction, setDialogAction] = useState('REQUEST_CORRECTION'); // 'REQUEST_CORRECTION' | 'REJECT'
  const [adminComment, setAdminComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminPrices(statusFilter === 'ALL' ? '' : statusFilter);
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error('Failed to load price review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleApprove = async (submissionId) => {
    try {
      await api.reviewPriceSubmission(submissionId, {
        action: 'APPROVE',
        comments: 'Verified against APMC official ledger. Authorized for public dissemination.'
      });
      setActionSuccess('Price submission approved and published live.');
      await fetchQueue();
    } catch (err) {
      alert(err.message || 'Approval failed.');
    }
  };

  const handleExecuteReviewAction = async () => {
    if (!adminComment || adminComment.trim().length < 5) {
      alert('A comment/reason of at least 5 characters is mandatory.');
      return;
    }

    setSubmittingAction(true);
    try {
      await api.reviewPriceSubmission(activeItem.id, {
        action: dialogAction,
        comments: adminComment
      });
      setActionSuccess(`Submission marked as ${dialogAction === 'REQUEST_CORRECTION' ? 'Correction Required' : 'Rejected'}.`);
      setActiveItem(null);
      setAdminComment('');
      await fetchQueue();
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setSubmittingAction(false);
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
            Daily Mandi Price Review Queue
          </h1>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', overflowX: 'auto' }}>
        {['PENDING_REVIEW', 'ALL', 'PUBLISHED', 'NEEDS_CORRECTION', 'REJECTED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '6px 14px',
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading price review queue...</div>
      ) : submissions.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          No price submissions waiting in review for status: <strong>{statusFilter}</strong>.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {submissions.map(item => (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {item.commodityName}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>({item.variety || 'Standard'}, {item.grade || 'Grade A'})</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: item.status === 'PUBLISHED' ? '#dcfce7' : item.status === 'PENDING_REVIEW' ? '#dbeafe' : item.status === 'NEEDS_CORRECTION' ? '#fef3c7' : '#fee2e2',
                        color: item.status === 'PUBLISHED' ? '#15803d' : item.status === 'PENDING_REVIEW' ? '#1e40af' : item.status === 'NEEDS_CORRECTION' ? '#b45309' : '#991b1b'
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.86rem', color: '#334155', marginBottom: '6px' }}>
                    <strong>{item.marketName}</strong> ({item.district}, {item.state}) • Date: <strong>{item.reportingDate}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                    <span>Reporter: <strong>{item.submittedByName || 'Official'}</strong></span>
                    <span>Ref: <code>{item.sourceReference || item.id}</code></span>
                    {item.arrivalQuantity > 0 && <span>Arrivals: <strong>{item.arrivalQuantity} Qtl</strong></span>}
                  </div>

                  {item.remarks && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', marginTop: '6px', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                      Official remarks: "{item.remarks}"
                    </div>
                  )}
                </div>

                {/* Price Display */}
                <div style={{ textAlign: 'right', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Modal Rate</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
                    ₹{Number(item.modalPrice).toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>/Qtl</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Min: ₹{item.minPrice} | Max: ₹{item.maxPrice}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                {item.status !== 'PUBLISHED' && (
                  <button
                    onClick={() => handleApprove(item.id)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '6px',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <CheckCircle2 size={14} /> Approve & Publish Live
                  </button>
                )}

                {item.status === 'PENDING_REVIEW' && (
                  <>
                    <button
                      onClick={() => { setActiveItem(item); setDialogAction('REQUEST_CORRECTION'); setAdminComment(''); }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        color: '#d97706',
                        border: '1px solid #fcd34d',
                        fontWeight: 600,
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      Request Correction
                    </button>
                    <button
                      onClick={() => { setActiveItem(item); setDialogAction('REJECT'); setAdminComment(''); }}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        fontWeight: 600,
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Action Modal */}
      {activeItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '440px', width: '100%', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              {dialogAction === 'REQUEST_CORRECTION' ? 'Request Price Correction' : 'Reject Price Submission'}
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.84rem', color: '#64748b' }}>
              Commodity: <strong>{activeItem.commodityName}</strong> ({activeItem.marketName}) • Modal: ₹{activeItem.modalPrice}/Qtl
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Instructions / Reason for Official (Mandatory, min. 5 chars) *
              </label>
              <textarea
                rows={3}
                required
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="e.g. Modal rate appears inconsistent with morning arrivals sheet. Please re-verify lot #102..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleExecuteReviewAction}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: dialogAction === 'REQUEST_CORRECTION' ? '#d97706' : '#dc2626',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                {submittingAction ? 'Saving...' : `Confirm ${dialogAction === 'REQUEST_CORRECTION' ? 'Correction Request' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
