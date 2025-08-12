// src/components/ModernNav.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ModernNav.css';

const ModernNav = ({ items, logoText, activeSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    if (isMenuOpen) {
      toggleMenu();
    }
  };

  return (
    <nav className={`modern-nav-container ${isMenuOpen ? 'open' : ''}`}>
      <div className="logo">
        <a href="#home" onClick={handleLinkClick}>{logoText}</a>
      </div>
      <ul className="nav-links">
        {items.map((item) => {
          const isActive = activeSection === item.href.substring(1);
          return (
            <li
              key={item.label}
              className={`${isActive ? 'active' : ''} ${item.isGhost ? 'ghost-button' : ''}`}
            >
              <a href={item.href} onClick={handleLinkClick}>
                {item.label}
              </a>
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
