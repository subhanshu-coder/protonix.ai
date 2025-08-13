import { useState } from 'react';
<<<<<<< HEAD
import { Link, useLocation } from 'react-router-dom';
=======
import { Link } from 'react-router-dom';
>>>>>>> 6950faf858abf87042f4867c92fca40c2acc953a
import './ModernNav.css';

const ModernNav = ({ items, logoText, activeSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    if (isMenuOpen) {
      toggleMenu();
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
    handleLinkClick();
  };

  return (
    <nav className={`modern-nav-container ${isMenuOpen ? 'open' : ''}`}>
      <div className="logo">
        <button 
          onClick={() => scrollToSection('home')} 
          className="logo-button"
        >
          {logoText}
        </button>
      </div>
      
      <ul className="nav-links">
        {items.map((item) => {
          const isRouteLink = item.isLink || item.href.startsWith('/');
          const isActive = isRouteLink 
            ? location.pathname === item.href 
            : activeSection === item.href.substring(1);

          return (
            <li
              key={item.label}
              className={`${isActive ? 'active' : ''} ${item.isGhost ? 'ghost-button' : ''}`}
            >
              {isRouteLink ? (
                <Link to={item.href} onClick={handleLinkClick}>
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={() => scrollToSection(item.href.substring(1))}
                  className="nav-section-btn"
                >
                  {item.label}
                </button>
              )}
            </li>
            <Link to="/login" className="nav-link">
  Login
</Link>
          );
        })}
      </ul>
      
      <div className="hamburger-menu" onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
    </nav>
  );
};

export default ModernNav;
