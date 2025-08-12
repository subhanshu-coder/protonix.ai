import { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

      

// ✅ All component imports
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

// Asset imports
import gptLogo from './assets/logos/gpt.png';
import grokLogo from './assets/logos/grok.png';
import perplexityLogo from './assets/logos/perplexity.png';
import deepseekLogo from './assets/logos/deepseek.png';
import claudeLogo from './assets/logos/claude.png';
import geminiLogo from './assets/logos/gemini.png';

import './App.css';

// Landing Page Component with Sky Blue Accents
const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features", isGhost: true },
    { label: "About", href: "#about", isGhost: true },
    { label: "HowItWork", href: "#HowItWorks", isGhost: true },
    { label: "FAQs", href: "#FAQs", isGhost: true },
    { label: "Login", href: "/login", isGhost: true, isLink: true },
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

  // Logos for SlidingLogoMarquee with Sky Blue text shadows
  const logos = [
    {
      id: 'grok',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={grokLogo} alt="Grok" style={{ height: 100 }} />
          <span style={{ 
            color: 'white', 
            marginTop: 6, 
            fontSize: '1.5rem', 
            fontWeight: 600,
            textShadow: '0 2px 10px rgba(135, 206, 235, 0.4)' 
          }}>Grok</span>
        </div>
      ),
    },
    {
      id: 'perplexity',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={perplexityLogo} alt="Perplexity" style={{ height: 100 }} />
          <span style={{ 
            color: 'white', 
            fontSize: '1.5rem', 
            marginTop: 6, 
            fontWeight: 600,
            textShadow: '0 2px 10px rgba(0, 191, 255, 0.4)' 
          }}>Perplexity</span>
        </div>
      ),
    },
    {
      id: 'gpt',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={gptLogo} alt="ChatGPT" style={{ height: 100 }} />
          <span style={{ 
            color: 'white', 
            marginTop: 6, 
            fontSize: '1.5rem', 
            fontWeight: 600,
            textShadow: '0 2px 10px rgba(135, 206, 235, 0.4)' 
          }}>ChatGPT</span>
        </div>
      ),
    },
    {
      id: 'claude',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={claudeLogo} alt="Claude" style={{ height: 100 }} />
          <span style={{ 
            color: 'white', 
            marginTop: 6, 
            fontSize: '1.5rem', 
            fontWeight: 600,
            textShadow: '0 2px 10px rgba(176, 224, 230, 0.4)' 
          }}>Claude</span>
        </div>
      ),
    },
    {
      id: 'gemini',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={geminiLogo} alt="Gemini" style={{ height: 100 }} />
          <span style={{ 
            color: 'white', 
            marginTop: 6, 
            fontSize: '1.5rem', 
            fontWeight: 600,
            textShadow: '0 2px 10px rgba(0, 191, 255, 0.4)' 
          }}>Gemini</span>
        </div>
      ),
    },
    {
      id: 'deepseek',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={deepseekLogo} alt="DeepSeek" style={{ height: 100 }} />
          <span style={{ 
            color: 'white', 
            fontSize: '1.5rem', 
            marginTop: 6, 
            fontWeight: 600,
            textShadow: '0 2px 10px rgba(135, 206, 235, 0.4)' 
          }}>DeepSeek</span>
        </div>
      ),
    },
  ];

  return (
    <div className="app-container">
      {/* Background Canvas */}
      <div className="background-canvas">
        <Silk
          speed={5}
          scale={1}
          color="3494d8ff"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {/* Navigation */}
      <div className="navbar-wrapper">
        <ModernNav
          items={navItems}
          logoText="Protonix.AI"
          activeSection={activeSection}
        />
      </div>

      {/* Main Content */}
      <main>
        <Home />
        <Features />
        
        <section id="about">
          <About />
        </section>

        {/* Marquee Section with Sky Blue Enhancement */}
        <div className="marquee-special-container">
          <h2 className="marquee-title" style={{
            background: 'linear-gradient(135deg, #fff 0%, rgba(135, 206, 235, 1.0) 50%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none'
          }}>
            Integration of Top AI's in Market
          </h2>
        </div>

        <SlidingLogoMarquee
          items={logos}
          speed={60}
          backgroundColor={"rgba(135, 206, 235, 0.3)"}
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

        <PixelCard variant="skyblue" className="about-pixel-card" />
        
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

// Main App Component with Complete Authentication and GitHub Pages Support
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData, token) => {
    try {
      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Update state
      setIsAuthenticated(true);
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
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
      <div className="loading-screen" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, rgba(135, 206, 235, 0.1) 25%, #1a1a2e 50%, rgba(0, 191, 255, 0.1) 75%, #16213e 100%)',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(135, 206, 235, 0.3)',
          borderTop: '4px solid rgba(135, 206, 235, 1.0)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '25px'
        }}></div>
        
        <h2 style={{ 
          fontSize: '1.4rem', 
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #fff 0%, rgba(135, 206, 235, 1.0) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Loading Protonix.AI...
        </h2>
        
        <p style={{ 
          fontSize: '1rem', 
          opacity: 0.8,
          color: 'rgba(135, 206, 235, 0.8)'
        }}>
          Initializing your AI workspace
        </p>
        
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // ✅ CRITICAL FIX: Proper basename for GitHub Pages deployment
  

const basename = undefined;           

  
   return (
  <Router>
    <Routes>
      <Route path="/"          element={<LandingPage />} />
      <Route path="/login"     element={!isAuthenticated ? <LoginPage onLogin={handleLogin}/> : <Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={ isAuthenticated ? <Dashboard user={user} onLogout={handleLogout}/> : <Navigate to="/login" replace />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
)
export default App;
