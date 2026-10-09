import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, CheckSquare, Layers, History, CheckCircle2, ArrowRight, PackagePlus } from 'lucide-react';
import { api } from '../lib/api.js';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getAdminDashboard();
        setStats(res.stats || null);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
          <ShieldCheck size={14} /> STATE APMC ADMINISTRATION CONSOLE
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          Governance & System Overview
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
          Supervise mandi official verification requests, approve daily commodity prices, and monitor reporting compliance.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '2rem' }}>
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pending Price Reviews</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: (stats?.pendingPrices || 0) > 0 ? '#2563eb' : '#059669', marginTop: '4px' }}>
            {stats?.pendingPrices ?? 0}
          </div>
          <Link to="/portal/admin/prices" style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <span>Review price queue</span> <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Official Registrations</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: (stats?.pendingOfficials || 0) > 0 ? '#d97706' : '#059669', marginTop: '4px' }}>
            {stats?.pendingOfficials ?? 0}
          </div>
          <Link to="/portal/admin/officials" style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <span>Verify official accounts</span> <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Published Today</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {stats?.publishedToday ?? 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <CheckCircle2 size={13} /> Active in farmer search
          </span>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Mandi Officials</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {stats?.activeOfficials ?? 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <Users size={13} /> Authorized reporters
          </span>
        </div>
      </div>

      {/* Operational Modules Grid */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
        Administrative Control Desks
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <Link
          to="/portal/admin/prices"
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            textDecoration: 'none',
            display: 'block',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}>
              <CheckSquare size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Price Approval Queue</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Review daily reported auction lots</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>
            Examine Min, Max, and Modal prices submitted by officials. Authorize publication, request corrections, or reject abnormal bids.
          </p>
        </Link>

        <Link
          to="/portal/admin/officials"
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            textDecoration: 'none',
            display: 'block'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Official Verifications</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Approve, suspend, and assign mandis</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>
            Review new APMC official registration applications, inspect government appointment references, and assign authorized markets.
          </p>
        </Link>

        <Link
          to="/portal/admin/commodities"
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            textDecoration: 'none',
            display: 'block'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
              <PackagePlus size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Commodities & Items Catalog</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Register crops, varieties & active status</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>
            Add new crops, grains, and spices to the state APMC system. Manage standard varieties, grades, and toggle catalog availability.
          </p>
        </Link>

        <Link
          to="/portal/admin/markets"
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            textDecoration: 'none',
            display: 'block'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: '#f8fafc', color: '#475569' }}>
              <Layers size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Mandi Compliance Monitoring</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Daily reporting tracking</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>
            Monitor which regional wholesale mandis have submitted prices today, identify overdue reports, and enforce timely data.
          </p>
        </Link>

        <Link
          to="/portal/admin/audit"
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            textDecoration: 'none',
            display: 'block'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: '#fef3c7', color: '#d97706' }}>
              <History size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Security Audit Trail</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Cryptographic action logs</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>
            Inspect full immutable change logs of all price submissions, approvals, rejections, and user account status transitions.
          </p>
        </Link>
      </div>
    </div>
  );
}
