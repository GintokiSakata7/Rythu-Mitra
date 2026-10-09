import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, ShieldCheck, AlertCircle, Clock, CheckCircle2, Send, FileText, ArrowRight, Building2, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import OfficialPriceSubmitPage from './OfficialPriceSubmitPage.jsx';
import OfficialSubmissionsPage from './OfficialSubmissionsPage.jsx';

export default function OfficialDashboardPage() {
  const { user, officialProfile, isVerifiedOfficial, refreshProfile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'submit', 'history'

  useEffect(() => {
    async function loadOfficialDetails() {
      try {
        const res = await api.getOfficialMe();
        setStats(res.stats || null);
      } catch (err) {
        console.error('Failed to load official details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOfficialDetails();
  }, []);

  const verificationStatus = officialProfile?.verificationStatus || 'PENDING_VERIFICATION';
  const assignedMarkets = officialProfile?.assignedMarketNames?.length
    ? officialProfile.assignedMarketNames
    : officialProfile?.assignedMarketIds || ['Bowenpally Market'];

  if (activeView === 'submit') {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => setActiveView('overview')} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '15px' }}>
          ← Back to Dashboard
        </button>
        <OfficialPriceSubmitPage />
      </div>
    );
  }

  if (activeView === 'history') {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => setActiveView('overview')} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '15px' }}>
          ← Back to Dashboard
        </button>
        <OfficialSubmissionsPage />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
            <Building2 size={14} /> APMC MANDI OPERATIONS DESK
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Welcome, {user?.fullName}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
            {officialProfile?.organizationName || 'Agricultural Market Committee'} • Ref: {officialProfile?.officialIdReference || 'APMC-REF'}
          </p>
        </div>

        <div>
          <button
            onClick={() => setActiveView('submit')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#059669',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
            }}
          >
            <Send size={15} />
            <span>Submit Daily Mandi Rate</span>
          </button>
        </div>
      </div>

      {/* Prominent Verification Status Notice */}
      <div
        style={{
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.75rem',
          border: '1px solid',
          borderColor: isVerifiedOfficial ? '#bbf7d0' : '#fde68a',
          backgroundColor: isVerifiedOfficial ? '#f0fdf4' : '#fffbeb',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}
      >
        <div style={{ padding: '6px', borderRadius: '8px', background: isVerifiedOfficial ? '#dcfce7' : '#fef3c7', color: isVerifiedOfficial ? '#15803d' : '#b45309' }}>
          {isVerifiedOfficial ? <ShieldCheck size={24} /> : <Clock size={24} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: isVerifiedOfficial ? '#166534' : '#92400e' }}>
              {isVerifiedOfficial ? 'Account Verified & Authorized' : 'Account Status: Pending Administrative Verification'}
            </h3>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: isVerifiedOfficial ? '#22c55e' : '#f59e0b',
                color: '#ffffff'
              }}
            >
              {verificationStatus}
            </span>
          </div>

          <p style={{ margin: '0 0 6px 0', fontSize: '0.86rem', color: isVerifiedOfficial ? '#166534' : '#92400e', lineHeight: 1.4 }}>
            {isVerifiedOfficial
              ? `You are verified to submit official daily commodity auction prices for: ${assignedMarkets.join(', ')}. Submissions will enter the admin review queue and be published to the public dashboard.`
              : 'Your official credentials are currently queued for verification by the RythuMitra Administrator. You can prepare drafts; full public publishing permissions will activate upon admin approval.'}
          </p>

          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} />
            <span>Assigned Mandi Yard: <strong>{assignedMarkets.join(', ')}</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '1.75rem' }}>
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Published Live</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {stats?.published ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <CheckCircle2 size={13} /> Visible on farmer dashboard
          </span>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>In Review Queue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
            {stats?.pendingReview ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <Clock size={13} /> Awaiting admin review
          </span>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Needs Correction</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
            {stats?.needsCorrection ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <AlertCircle size={13} /> Revisions requested
          </span>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Submissions</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {stats?.totalSubmissions ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <FileText size={13} /> Recorded in audit ledger
          </span>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            Price Submissions & History
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Inspect past submissions, track review notes from the administrator, or edit requested corrections.
          </p>
        </div>
        <button
          onClick={() => setActiveView('history')}
          style={{
            padding: '9px 16px',
            borderRadius: '8px',
            background: '#f1f5f9',
            color: '#334155',
            fontWeight: 700,
            fontSize: '0.86rem',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>View My Submissions</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
