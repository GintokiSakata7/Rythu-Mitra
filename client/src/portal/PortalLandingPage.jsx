import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, UserCheck, ArrowRight, Lock, CheckCircle,
  Building2, KeyRound, Sparkles, ArrowLeft, AlertCircle, FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function PortalLandingPage() {
  const { isAuthenticated, isAdmin, isOfficial, user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickLogin = async (email, password, targetRole) => {
    setLoadingRole(targetRole);
    setErrorMsg('');
    try {
      const res = await login(email, password);
      if (res?.user?.role === 'admin') {
        navigate('/portal/admin');
      } else if (res?.user?.role === 'official') {
        navigate('/portal/official');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Quick login failed.');
      setLoadingRole(null);
    }
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '1.5rem auto 4rem', padding: '0 1rem' }}>
      {/* Official Government / Mandi Portal Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1d4ed8',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: '14px'
          }}
        >
          <Lock size={14} />
          <span>RESTRICTED OPERATIONS & GOVERNANCE GATEWAY</span>
        </div>

        <h1
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 10px 0',
            letterSpacing: '-0.03em',
            lineHeight: 1.2
          }}
        >
          RythuMitra Operations Portal
        </h1>
        <p
          style={{
            color: '#64748b',
            fontSize: '1.05rem',
            margin: '0 auto',
            maxWidth: '680px',
            lineHeight: 1.6
          }}
        >
          Secure management system for authorized APMC Mandi Secretaries, Yard Supervisors, and State Agriculture Directorate Administrators.
        </p>

        {errorMsg && (
          <div
            style={{
              maxWidth: '500px',
              margin: '1rem auto 0',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Active Session Notification if already signed in */}
      {isAuthenticated && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '14px 20px',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center' }}>
              <CheckCircle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534' }}>
                Active Session: {user?.fullName}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                Role: {isAdmin ? 'System Administrator' : 'APMC Mandi Official'} ({user?.email})
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to={isAdmin ? '/portal/admin' : '/portal/official'}
              style={{
                background: '#15803d',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Go to My Dashboard</span>
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={logout}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#475569',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* TWO PRIMARY OPERATIONAL OPTIONS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '2.5rem'
        }}
      >
        {/* OPTION 1: MANDI OFFICIAL */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #cbd5e1',
            padding: '2rem',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #10b981, #059669)'
            }}
          />

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #a7f3d0'
                }}
              >
                <Building2 size={26} />
              </div>
              <span
                style={{
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px'
                }}
              >
                OPTION 1
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              APMC Mandi Official
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, marginBottom: '12px' }}>
              మార్కెట్ కమిటీ అధికారులు • Market Yard Staff
            </div>

            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 16px 0' }}>
              Authorized market secretaries and supervisors submit daily auction prices (Min, Max, Modal) and lot arrival reports.
            </p>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                Key Capabilities:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={15} color="#10b981" /> Daily commodity price submissions
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={15} color="#10b981" /> Market yard verification credentials
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={15} color="#10b981" /> Historical submission audit tracking
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <Link
                to="/portal/login"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                  transition: 'background 0.15s ease'
                }}
              >
                <span>Official Sign In</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/portal/register"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  transition: 'background 0.15s ease'
                }}
              >
                Register
              </Link>
            </div>

            {/* Quick 1-Click Demo */}
            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleQuickLogin('official@bowenpally.mandi.gov.in', 'Official@123', 'official')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px dashed #059669',
                background: '#ecfdf5',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} color="#059669" />
              <span>{loadingRole === 'official' ? 'Signing in...' : '1-Click Test: Bowenpally Mandi Official'}</span>
            </button>
          </div>
        </div>

        {/* OPTION 2: ADMINISTRATOR */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #cbd5e1',
            padding: '2rem',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #2563eb, #1d4ed8)'
            }}
          />

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #bfdbfe'
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1e40af',
                  border: '1px solid #bfdbfe',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px'
                }}
              >
                OPTION 2
              </span>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              System Administrator
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700, marginBottom: '12px' }}>
              వ్యవస్థ నిర్వాహకులు • State Agriculture Directorate
            </div>

            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.55, margin: '0 0 16px 0' }}>
              Review pending official applications, approve daily price queues, manage mandi master catalogs, and inspect audit logs.
            </p>

            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
                Key Capabilities:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={15} color="#2563eb" /> Verify official applications & market assignments
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={15} color="#2563eb" /> Review & approve price publication queue
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={15} color="#2563eb" /> Complete cryptographic security audit trail
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: '12px' }}>
              <Link
                to="/portal/login"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.25)',
                  transition: 'background 0.15s ease'
                }}
              >
                <KeyRound size={16} />
                <span>Admin Secure Sign In</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Quick 1-Click Demo */}
            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleQuickLogin('admin@mandimitra.gov.in', 'Admin@123', 'admin')}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px dashed #2563eb',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} color="#2563eb" />
              <span>{loadingRole === 'admin' ? 'Signing in...' : '1-Click Test: State Agriculture Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Return Navigation to Farmer Public Site */}
      <div style={{ textAlign: 'center' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '0.92rem',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to RythuMitra Farmer Application</span>
        </Link>
      </div>
    </div>
  );
}
