import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoSvg from '../assets/LogoImage.svg';
import './ModernNav.css';

const ModernNav = ({ items, logoText, activeSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(o => !o);
  const closeMenu  = () => setIsMenuOpen(false);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMenu();
  };

  return (
    <>
      <nav className={`modern-nav-container ${isMenuOpen ? 'open' : ''} ${scrolled ? 'scrolled' : ''}`}>

        {/* ── Logo in navbar ── */}
        <div className="logo">
          <button onClick={() => scrollToSection('home')} className="logo-button">
            <div className="logo-icon">
              <img src={logoSvg} alt="Protonix logo" />
            </div>
            <span className="logo-text">
              PROTONIX<span>.AI</span>
            </span>
          </button>
        </div>

        {/* ── Desktop nav links ── */}
        <ul className="nav-links">
          {items.map((item) => {
            const isRouteLink = item.isLink || item.href.startsWith('/');
            const isActive = isRouteLink
              ? location.pathname === item.href
              : activeSection === item.href.substring(1);
            return (
              <li key={item.label} className={`${isActive ? 'active' : ''} ${item.isGhost ? 'ghost-button' : ''}`}>
                {isRouteLink ? (
                  <Link to={item.href} onClick={closeMenu}>{item.label}</Link>
                ) : (
                  <button className="nav-section-btn" onClick={() => scrollToSection(item.href.substring(1))}>
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {/* ── Hamburger button ── */}
        <button className="hamburger-menu" onClick={toggleMenu} aria-label="Toggle menu">
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </button>
      </nav>

      {/* ── Mobile fullscreen overlay — separate from nav ── */}
      <div className={`mobile-overlay ${isMenuOpen ? 'overlay-open' : ''}`}>

        {/* Close button */}
        <button className="overlay-close" onClick={closeMenu} aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Big logo inside overlay */}
        <div className="overlay-logo">
          <div className="overlay-logo-icon">
            <img src={logoSvg} alt="Protonix logo" />
          </div>
          <div className="overlay-logo-text">
            PROTONIX<span>.AI</span>
          </div>
          <p className="overlay-tagline">All AI's, IN One Tab</p>
        </div>

        {/* Nav items */}
        <ul className="overlay-links">
          {items.map((item, idx) => {
            const isRouteLink = item.isLink || item.href.startsWith('/');
            const isActive = isRouteLink
              ? location.pathname === item.href
              : activeSection === item.href.substring(1);
            return (
              <li key={item.label} className={`overlay-item ${isActive ? 'overlay-active' : ''} ${item.isGhost ? 'overlay-ghost' : ''}`}
                style={{ '--i': idx }}>
                {isRouteLink ? (
                  <Link to={item.href} onClick={closeMenu}>{item.label}</Link>
                ) : (
                  <button onClick={() => scrollToSection(item.href.substring(1))}>
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {/* Bottom decoration */}
        <p className="overlay-footer">© 2026 Protonix.AI</p>

        {/* Decorative blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
    </>
  );
};

export default ModernNav;