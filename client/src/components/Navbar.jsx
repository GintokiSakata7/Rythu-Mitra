import { NavLink, useLocation } from 'react-router-dom';
import { Factory, Home, Leaf, Mic2, Search, Store } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/find', label: 'Find Best Option', icon: Search },
    { to: '/assistant', label: 'Voice Assistant', icon: Mic2, badge: 'AI' },
    { to: '/buyers', label: 'Buyer Network', icon: Factory },
    { to: '/post-requirement', label: 'Post Demand', icon: Store }
  ];

  return (
    <>
      <header className="mobile-navbar">
        <div className="nav-container">
          <NavLink to="/" className="brand-group">
            <div className="brand-leaf-icon">
              <Leaf size={22} />
            </div>
            <div className="brand-text">
              <span className="brand-name">MandiMitra</span>
              <span className="brand-sub">మండిమిత్ర • मंडीमित्र</span>
            </div>
          </NavLink>

          <nav className="desktop-nav-menu">
            {navLinks.map(({ to, label, icon: Icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
              >
                <Icon size={16} />
                <span>{label}</span>
                {badge && <span className="nav-badge">{badge}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="nav-right-actions">
            <div className="status-pill">
              <span className="live-pulse" />
              <span>Engine Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom bar for mobile screens */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/find" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <Search size={20} />
          <span>Find</span>
        </NavLink>
        <NavLink to="/assistant" className={({ isActive }) => (isActive ? 'mobile-nav-item special-active' : 'mobile-nav-item special')}>
          <div className="special-mic-btn">
            <Mic2 size={22} />
          </div>
          <span>Voice Mode</span>
        </NavLink>
        <NavLink to="/buyers" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <Factory size={20} />
          <span>Buyers</span>
        </NavLink>
      </nav>
    </>
  );
}
