import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
        Verifying secure credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div style={{ maxWidth: '480px', margin: '4rem auto', textAlign: 'center', background: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #fee2e2' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <ShieldAlert size={26} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991b1b', margin: '0 0 8px 0' }}>
          Access Restricted
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Your current account role is <strong>{user?.role}</strong>. This module strictly requires: <strong>{allowedRoles.join(' or ')}</strong> privileges.
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Link
            to="/portal"
            style={{ padding: '8px 16px', background: '#f1f5f9', color: '#334155', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
          >
            Portal Gateway
          </Link>
          <Link
            to="/"
            style={{ padding: '8px 16px', background: '#059669', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
          >
            Farmer App
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
