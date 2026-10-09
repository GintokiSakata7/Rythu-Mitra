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
      <header style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', color: '#ffffff', padding: '0.75rem 1.25rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#3b82f6', borderRadius: '8px', padding: '6px', display: 'flex' }}>
              <ShieldCheck size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                RythuMitra <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem' }}>APMC Operations & Admin Portal</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Secured Administrative & Mandi Official Entry Point
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{user?.fullName}</span>
                    <span style={{ fontSize: '0.7rem', color: isAdmin ? '#f59e0b' : '#38bdf8', textTransform: 'uppercase', fontWeight: 600 }}>
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
                    background: '#334155',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
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
                  style={{ background: '#334155', color: '#fff', padding: '5px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}
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
                color: '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.8rem',
                borderLeft: '1px solid #334155',
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
                  <Layers size={15} /> Mandis Compliance
                </NavLink>
                <NavLink
                  to="/portal/admin/commodities"
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
                  <PackagePlus size={15} /> Commodities & Items
                </NavLink>
                <NavLink
                  to="/portal/admin/audit"
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
                  <History size={15} /> Security Audit Trail
                </NavLink>
              </>
            ) : isOfficial ? (
              <>
                <NavLink
                  to="/portal/official"
                  end
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
                  <LayoutDashboard size={15} /> Official Overview
                </NavLink>
                <NavLink
                  to="/portal/official/submit"
                  style={({ isActive }) => ({
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isActive ? '#ecfdf5' : 'transparent',
                    color: isActive ? '#065f46' : '#64748b'
                  })}
                >
                  <Send size={15} /> Daily Price Entry Form
                </NavLink>
                <NavLink
                  to="/portal/official/submissions"
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
                  <FileText size={15} /> My Submissions & History
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
