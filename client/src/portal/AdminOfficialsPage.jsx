import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Building2, MapPin, Search } from 'lucide-react';
import { api } from '../lib/api.js';

export default function AdminOfficialsPage() {
  const [officials, setOfficials] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Reject / Reason Modal
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [actionType, setActionType] = useState('REJECT'); // 'REJECT' | 'SUSPEND'
  const [reasonNotes, setReasonNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchOfficials = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOfficials(statusFilter === 'ALL' ? '' : statusFilter);
      setOfficials(res.officials || []);
    } catch (err) {
      console.error('Failed to load officials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, [statusFilter]);

  const handleApprove = async (officialId) => {
    try {
      await api.updateOfficialStatus(officialId, {
        status: 'APPROVED',
        notes: 'Administrative verification completed. Credentials approved.'
      });
      setActionMessage('Official account successfully approved.');
      await fetchOfficials();
    } catch (err) {
      alert(err.message || 'Approval failed.');
    }
  };

  const handleExecuteStatusUpdate = async () => {
    if (!reasonNotes || reasonNotes.trim().length < 5) {
      alert('Please provide a descriptive reason of at least 5 characters.');
      return;
    }

    setProcessing(true);
    try {
      await api.updateOfficialStatus(selectedOfficial.id, {
        status: actionType === 'REJECT' ? 'REJECTED' : 'SUSPENDED',
        notes: reasonNotes
      });
      setActionMessage(`Official account transitioned to ${actionType === 'REJECT' ? 'REJECTED' : 'SUSPENDED'}.`);
      setSelectedOfficial(null);
      setReasonNotes('');
      await fetchOfficials();
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setProcessing(false);
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
            Mandi Official Verification Queue
          </h1>
        </div>
      </div>

      {actionMessage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', overflowX: 'auto' }}>
        {['ALL', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'SUSPENDED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: statusFilter === status ? '1px solid #2563eb' : '1px solid #cbd5e1',
              background: statusFilter === status ? '#eff6ff' : '#ffffff',
              color: statusFilter === status ? '#1e40af' : '#64748b'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading officials...</div>
      ) : officials.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          No official records found for filter: <strong>{statusFilter}</strong>.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {officials.map(item => (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {item.user?.fullName || 'Official Applicant'}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: item.verificationStatus === 'APPROVED' ? '#dcfce7' : item.verificationStatus === 'PENDING_VERIFICATION' ? '#fef3c7' : '#fee2e2',
                        color: item.verificationStatus === 'APPROVED' ? '#15803d' : item.verificationStatus === 'PENDING_VERIFICATION' ? '#b45309' : '#991b1b'
                      }}
                    >
                      {item.verificationStatus}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '8px' }}>
                    <strong>{item.organizationName}</strong> • ID Ref: <code>{item.officialIdReference}</code>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                    <span>Email: <strong>{item.user?.email}</strong></span>
                    <span>Phone: <strong>{item.user?.phone || 'Not provided'}</strong></span>
                    <span>Assigned Mandi: <strong>{item.assignedMarketNames?.join(', ') || item.assignedMarketIds?.join(', ') || 'None'}</strong></span>
                  </div>

                  {item.verificationNotes && (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', marginTop: '6px' }}>
                      Verification Note: "{item.verificationNotes}"
                    </div>
                  )}
                </div>

                {/* Administrative Action Controls */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {item.verificationStatus !== 'APPROVED' && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      style={{
                        padding: '7px 14px',
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
                      <CheckCircle2 size={13} /> Approve Official
                    </button>
                  )}

                  {item.verificationStatus === 'PENDING_VERIFICATION' && (
                    <button
                      onClick={() => { setSelectedOfficial(item); setActionType('REJECT'); setReasonNotes(''); }}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  )}

                  {item.verificationStatus === 'APPROVED' && (
                    <button
                      onClick={() => { setSelectedOfficial(item); setActionType('SUSPEND'); setReasonNotes(''); }}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        color: '#d97706',
                        border: '1px solid #fcd34d',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Suspend Access
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection / Suspension Modal */}
      {selectedOfficial && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '440px', width: '100%', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              {actionType === 'REJECT' ? 'Reject Official Registration' : 'Suspend Official Access'}
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.84rem', color: '#64748b' }}>
              Official: <strong>{selectedOfficial.user?.fullName}</strong> ({selectedOfficial.organizationName})
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Reason / Justification (Mandatory, min. 5 chars) *
              </label>
              <textarea
                rows={3}
                required
                value={reasonNotes}
                onChange={(e) => setReasonNotes(e.target.value)}
                placeholder="e.g. Identification reference could not be authenticated with APMC board..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedOfficial(null)}
                style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleExecuteStatusUpdate}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: actionType === 'REJECT' ? '#dc2626' : '#d97706',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                {processing ? 'Processing...' : `Confirm ${actionType === 'REJECT' ? 'Rejection' : 'Suspension'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
