import { NavLink, useLocation } from 'react-router-dom';
import { Factory, Home, Mic2, Search, Store, Globe, TrendingUp, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const { t, language, changeLanguage } = useLanguage();

  // If in Portal root, hide farmer public navbar for clean separation of concerns
  if (location.pathname.startsWith('/portal')) {
    return null;
  }

  const navLinks = [
    { to: '/', label: t('nav_home'), icon: Home },
    { to: '/find', label: t('nav_find'), icon: Search },
    { to: '/assistant', label: t('nav_voice'), icon: Mic2, isVoiceFocus: true },
    { to: '/buyers', label: t('nav_buyers'), icon: Factory },
    { to: '/post-requirement', label: t('nav_post'), icon: Store }
  ];

  return (
    <>
      <header className="mobile-navbar">
        <div className="nav-container">
          <NavLink to="/" className="brand-group">
            <div className="brand-leaf-icon" style={{ backgroundColor: 'transparent', padding: 0 }}>
              <img src="/logo.png" alt="RythuMitra Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            </div>
            <div className="brand-text">
              <span className="brand-name">RythuMitra</span>
              <span className="brand-sub">రైతుమిత్ర • रैతుमित्र</span>
            </div>
          </NavLink>

          {/* Desktop Navigation Menu */}
          <nav className="desktop-nav-menu">
            {navLinks.map(({ to, label, icon: Icon, badge, isVoiceFocus }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isVoiceFocus
                    ? `nav-tab voice-focus-pill ${isActive ? 'active' : ''}`
                    : `nav-tab ${isActive ? 'active' : ''}`
                }
              >
                {isVoiceFocus ? (
                  <>
                    <span className="voice-mic-glow-icon">
                      <Mic2 size={16} />
                    </span>
                    <span className="voice-tab-label">{label}</span>
                    <span className="voice-focus-ai-tag">AI Voice</span>
                  </>
                ) : (
                  <>
                    <Icon size={16} />
                    <span>{label}</span>
                    {badge && <span className="nav-badge">{badge}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="nav-right-actions">
            {/* Mobile-only Quick Voice Assistant Mic Button */}
            <NavLink
              to="/assistant"
              className="mobile-quick-voice-btn"
              title="Voice Assistant"
              aria-label="Start Voice Assistant"
            >
              <Mic2 size={15} />
              <span>Voice</span>
            </NavLink>

            <div className="lang-picker-box">
              <Globe size={13} className="lang-globe-icon" color="#15803d" />
              <select 
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="clean-language-select"
                aria-label="Select Language"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
            
            <NavLink
              to="/portal/login"
              className="nav-profile-btn"
              title="Login / Profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#334155',
                textDecoration: 'none',
                marginLeft: '8px'
              }}
            >
              <User size={18} />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Bottom bar for mobile screens */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <Home size={20} />
          <span>{t('nav_home')}</span>
        </NavLink>
        <NavLink to="/find" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <Search size={20} />
          <span>{t('nav_find')}</span>
        </NavLink>
        <NavLink to="/assistant" className={({ isActive }) => (isActive ? 'mobile-nav-item special active' : 'mobile-nav-item special')}>
          <div className="special-mic-btn">
            <Mic2 size={24} />
            <span className="mic-pulse-ring" />
          </div>
          <span className="voice-nav-text">{t('nav_voice')}</span>
        </NavLink>
        <NavLink to="/prices" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <TrendingUp size={20} />
          <span>Rates</span>
        </NavLink>
        <NavLink to="/buyers" className={({ isActive }) => (isActive ? 'mobile-nav-item active' : 'mobile-nav-item')}>
          <Factory size={20} />
          <span>{t('nav_buyers')}</span>
        </NavLink>
      </nav>
    </>
  );
}
