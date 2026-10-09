import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function PortalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await login(email, password);
      if (res.user.role === 'admin') {
        navigate('/portal/admin');
      } else if (res.user.role === 'official') {
        navigate('/portal/official');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto 4rem' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Lock size={22} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
            Sign In to Operations Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            Enter your authorized official or administrator credentials
          </p>
        </div>

        {/* Demo Fast Logins for Testing */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            <Sparkles size={13} color="#2563eb" /> Quick Demo Test Accounts:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@mandimitra.gov.in', 'Admin@123')}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.78rem', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span><strong>APMC State Admin</strong> (Full Privileges)</span>
              <span style={{ color: '#2563eb', fontWeight: 600 }}>Use</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('official@bowenpally.mandi.gov.in', 'Official@123')}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.78rem', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span><strong>Verified Official</strong> (Bowenpally APMC)</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>Use</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('official@warangal.mandi.gov.in', 'Official@123')}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.78rem', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span><strong>Pending Official</strong> (Warangal Yard)</span>
              <span style={{ color: '#d97706', fontWeight: 600 }}>Use</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Official Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mandimitra.gov.in"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '11px',
              borderRadius: '8px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              marginTop: '6px'
            }}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          Are you a Mandi Official without an account?{' '}
          <Link to="/portal/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            Register for verification
          </Link>
        </div>
      </div>
    </div>
  );
}
