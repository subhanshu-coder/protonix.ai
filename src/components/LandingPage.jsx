import { useState, useEffect } from 'react';

// Component imports
import ModernNav from './ModernNav';
import Silk from './Silk';
import Home from './Home';
import Features from './Features';
import About from './About';
import SlidingLogoMarquee from './SlidingLogoMarquee';
import PixelCard from './PixelCard';
import HowItWorks from './HowItWorks';
import FAQs from './FAQs';
import GetInTouch from './GetInTouch';
import Footer from './Footer';

// Asset imports
import gptLogo from '../assets/logos/gpt.png';
import grokLogo from '../assets/logos/grok.png';
import perplexityLogo from '../assets/logos/perplexity.png';
import deepseekLogo from '../assets/logos/deepseek.png';
import claudeLogo from '../assets/logos/claude.png';
import geminiLogo from '../assets/logos/gemini.png';

// Landing Page Component with Sky Blue Accents
const LandingPage = () => {
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [
    { label: "Home", href: "#home", isGhost: true},
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
        <section id="home">
            <Home />
        </section>

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

export default LandingPage;