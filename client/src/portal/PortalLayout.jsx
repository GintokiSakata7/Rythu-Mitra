import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, LayoutDashboard, Send, FileText, Users, CheckSquare, Layers, History, Home, Lock, PackagePlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function PortalLayout() {
  const { user, officialProfile, isAdmin, isOfficial, isVerifiedOfficial, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/portal/login');
  };

  return (
    <div className="portal-system-wrapper" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Top Security Operational Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', color: '#0f172a', padding: '0.75rem 1.25rem', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#2563eb', borderRadius: '8px', padding: '6px', display: 'flex', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}>
              <ShieldCheck size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                RythuMitra <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>APMC Operations & Admin</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Secured Administrative & Mandi Official Entry Point
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{user?.fullName}</span>
                    <span style={{ fontSize: '0.7rem', color: isAdmin ? '#d97706' : '#0284c7', textTransform: 'uppercase', fontWeight: 700 }}>
                      {isAdmin ? 'System Administrator' : 'APMC Mandi Official'}
                    </span>
                  </div>
                  {isOfficial && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: isVerifiedOfficial ? '#065f46' : '#78350f',
                        color: isVerifiedOfficial ? '#34d399' : '#fde68a'
                      }}
                    >
                      {officialProfile?.verificationStatus || 'PENDING'}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out of portal"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to="/portal/login"
                  style={{ background: '#2563eb', color: '#fff', padding: '5px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Sign In
                </Link>
                <Link
                  to="/portal/register"
                  style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '5px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  Register Official
                </Link>
              </div>
            )}

            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderLeft: '1px solid #cbd5e1',
                paddingLeft: '12px'
              }}
            >
              <Home size={14} />
              <span>Farmer App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Bar for Logged-In Roles */}
      {isAuthenticated && (
        <nav style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0.5rem 1.25rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {isAdmin ? (
              <>
                <NavLink
                  to="/portal/admin"
                  end
                  className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isActive ? '#f1f5f9' : 'transparent',
                    color: isActive ? '#0f172a' : '#64748b'
                  })}
                >
                  <LayoutDashboard size={15} /> Dashboard
                </NavLink>
                <NavLink
                  to="/portal/admin/officials"
                  className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isActive ? '#f1f5f9' : 'transparent',
                    color: isActive ? '#0f172a' : '#64748b'
                  })}
                >
                  <Users size={15} /> Official Verifications
                </NavLink>
                <NavLink
                  to="/portal/admin/prices"
                  className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isActive ? '#f1f5f9' : 'transparent',
                    color: isActive ? '#0f172a' : '#64748b'
                  })}
                >
                  <CheckSquare size={15} /> Price Approval Queue
                </NavLink>
                <NavLink
                  to="/portal/admin/markets"
                  className={({ isActive }) => `portal-nav-tab ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => ({
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isActive ? '#f1f5f9' : 'transparent',
                    color: isActive ? '#0f172a' : '#64748b'
                  })}
                >
                  <Layers size={15} /> Mandis & Commodities
                </NavLink>
              </>
            ) : null}
          </div>
        </nav>
      )}

      {/* Main Portal Viewport */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
