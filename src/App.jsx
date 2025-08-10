import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ✅ CORRECT - All imports fixed
import ModernNav from './components/ModernNav';
import Silk from './components/Silk';
import Home from './components/Home';
import Features from './components/Features';
import About from './components/About';
import SlidingLogoMarquee from './components/SlidingLogoMarquee';
import PixelCard from './components/PixelCard';
import HowItWorks from './components/HowItWorks';
import FAQs from './components/FAQs';
import GetInTouch from './components/GetInTouch';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

// ✅ CORRECT - Asset imports
import gptLogo from './assets/logos/gpt.png';
import grokLogo from './assets/logos/grok.png';
import perplexityLogo from './assets/logos/perplexity.png';
import deepseekLogo from './assets/logos/deepseek.png';
import claudeLogo from './assets/logos/claude.png';
import geminiLogo from './assets/logos/gemini.png';

import './App.css';


// Landing Page Component (your current main content)
const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features", isGhost: true },
    { label: "About", href: "#about", isGhost: true },
    { label: "HowItWork", href: "#HowItWorks", isGhost: true },
    { label: "FAQs", href: "#FAQs", isGhost: true },
    { label: "Login", href: "/login", isGhost: true, isLink: true }, // Changed to route link
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let currentSection = 'home';

      sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.scrollY >= sectionTop) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);

      // Add 'visible' class to features and about when entering viewport
      const featuresEl = document.getElementById('features');
      if (featuresEl) {
        const rect = featuresEl.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          featuresEl.classList.add('visible');
        }
      }
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        const rect = aboutEl.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          aboutEl.classList.add('visible');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Logos for SlidingLogoMarquee
  const logos = [
    {
      id: 'grok',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={grokLogo} alt="Grok" style={{ height: 100 }} />
          <span style={{ color: 'white', marginTop: 6, fontSize: '1.5rem', fontWeight: 600 }}>Grok</span>
        </div>
      ),
    },
    {
      id: 'perplexity',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={perplexityLogo} alt="Perplexity" style={{ height: 100 }} />
          <span style={{ color: 'white', fontSize: '1.5rem', marginTop: 6, fontWeight: 600 }}>Perplexity</span>
        </div>
      ),
    },
    {
      id: 'gpt',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={gptLogo} alt="ChatGPT" style={{ height: 100 }} />
          <span style={{ color: 'white', marginTop: 6, fontSize: '1.5rem', fontWeight: 600 }}>ChatGPT</span>
        </div>
      ),
    },
    {
      id: 'claude',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={claudeLogo} alt="Claude" style={{ height: 100 }} />
          <span style={{ color: 'white', marginTop: 6, fontSize: '1.5rem', fontWeight: 600 }}>Claude</span>
        </div>
      ),
    },
    {
      id: 'gemini',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={geminiLogo} alt="Gemini" style={{ height: 100 }} />
          <span style={{ color: 'white', marginTop: 6, fontSize: '1.5rem', fontWeight: 600 }}>Gemini</span>
        </div>
      ),
    },
    {
      id: 'deepseek',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={deepseekLogo} alt="DeepSeek" style={{ height: 100 }} />
          <span style={{ color: 'white', fontSize: '1.5rem', marginTop: 6, fontWeight: 600 }}>DeepSeek</span>
        </div>
      ),
    },
  ];

  return (
    <div className="app-container">
      <div className="background-canvas">
        <Silk
          speed={5}
          scale={1}
          color="#9908e1ff"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      <div className="navbar-wrapper">
        <ModernNav
          items={navItems}
          logoText="AI Hub"
          activeSection={activeSection}
        />
      </div>

      <main>
        <Home />
        <Features />
        <section id="about">
          <About />
        </section>

        <div className="marquee-special-container">
          <h2 className="marquee-title">Integration of Top AI's in Market</h2>
        </div>

        <SlidingLogoMarquee
          items={logos}
          speed={60}
          backgroundColor={"rgba(106, 173, 227, 0.5)"}
          pauseOnHover={true}
          width="90%"
          height="180px"
          gap="0rem"
          enableBlur={true}
          blurIntensity={1}
          showControls={true}
          scale={1}
          className="marquee-special-bg"
        />

        {/* PixelCard with animated pixel background including mission/vision/values content */}
        <PixelCard variant="blue" className="about-pixel-card" />

        <HowItWorks />
        <section id="FAQs">
          <FAQs />
        </section> 

        <section id="getintouch">
          <GetInTouch />
        </section>

        <section>
          <Footer />
        </section>
      </main>
    </div>
  );
};

// Main App Component with Authentication
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData, token) => {
    // Store authentication data
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update state
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Update state
    setIsAuthenticated(false);
    setUser(null);
  };

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading AI Hub...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
