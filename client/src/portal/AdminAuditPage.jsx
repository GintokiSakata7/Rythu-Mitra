import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, ArrowLeft, ShieldCheck, Clock, FileText } from 'lucide-react';
import { api } from '../lib/api.js';

export default function AdminAuditPage({ standalone = true }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.getAdminAuditLogs(100);
        setLogs(res.logs || []);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {standalone && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link to="/portal/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '6px' }}>
              <ArrowLeft size={14} /> Back to Admin Console
            </Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              System Security & Price Audit Trail
            </h1>
          </div>
        </div>
      )}

      {!standalone && (
        <div style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} /> Security Audit Trail Logs
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Immutable ledger of all administrative and official price actions.</p>
        </div>
      )}

      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Immutable Ledger Entries ({logs.length})</span>
          <span style={{ fontSize: '0.75rem', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> Tamper-Evident State Logging
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No audit entries recorded yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', background: '#f8fafc' }}>
                  <th style={{ padding: '10px 14px' }}>Timestamp</th>
                  <th style={{ padding: '10px 14px' }}>Actor</th>
                  <th style={{ padding: '10px 14px' }}>Action</th>
                  <th style={{ padding: '10px 14px' }}>Previous → New State</th>
                  <th style={{ padding: '10px 14px' }}>Justification</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {log.actorName}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: log.action.includes('APPROVE') ? '#dcfce7' : log.action.includes('REJECT') ? '#fee2e2' : log.action.includes('SUBMIT') ? '#dbeafe' : '#f1f5f9',
                          color: log.action.includes('APPROVE') ? '#15803d' : log.action.includes('REJECT') ? '#991b1b' : log.action.includes('SUBMIT') ? '#1e40af' : '#475569'
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#334155' }}>
                      <code>{log.previousValues?.status || 'INIT'}</code> → <strong style={{ color: '#059669' }}>{log.newValues?.status || 'UPDATED'}</strong>
                      {log.newValues?.modalPrice && <span style={{ marginLeft: '6px', color: '#64748b' }}>(Modal: ₹{log.newValues.modalPrice})</span>}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569', fontSize: '0.82rem' }}>
                      {log.reason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
