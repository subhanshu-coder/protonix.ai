// src/components/Home.jsx

import myLogo from '../assets/LogoImage.svg';
import './Home.css';

// Import AI logos for the trail effect
import gptLogo from '../assets/logos/gpt.png';
import claudeLogo from '../assets/logos/claude.png';
import geminiLogo from '../assets/logos/gemini.png';
import grokLogo from '../assets/logos/grok.png';
import perplexityLogo from '../assets/logos/perplexity.png';
import deepseekLogo from '../assets/logos/deepseek.png';

// Import the ImageTrailEffect component
import ImageTrailEffect from './ImageTrailEffect';

const animatedBoxesData = [
  { title: "🤖 5+ AI Models" },
  { title: "⚡ Instant Switch" },
  { title: "🔒 100% Secure" }
];

const Home = () => (
  <ImageTrailEffect
    imageSources={[gptLogo, claudeLogo, geminiLogo, grokLogo, perplexityLogo, deepseekLogo]}
    imageClassName="trail-img"
    containerClassName="full-page-trail"
    maxTrailImages={12} // More images for smoother trail
    triggerDistance={8}  // Very responsive trigger
    fadeTimeout={600}    // Quick fade for smooth transitions
    style={{ minHeight: '100vh', width: '100%' }}
  >
    <section id="home" className="hero-section">
      <div className="hero-logo">
        <img src={myLogo} alt="AI-Unified Logo" />
      </div>
      
      <h1>TOP AI Chatbot In One Place</h1>
      
      <p>
        Access ChatGPT, Claude, Gemini, and MORE AI models through one unified platform.<br />
        Compare responses, switch between models instantly,<br />
        and supercharge your AI workflow.
      </p>
      
      <div className="hero-buttons">
        <button className="primary-button">Get Started</button>
        <a href="#features" className="secondary-button">Learn More</a>
      </div>
      
      {/* Glass boxes with emoji and titles */}
      <div className="animated-boxes-glass">
        {animatedBoxesData.map(({ title }, idx) => (
          <div key={idx} className="glass-box" tabIndex={0} aria-label={title}>
            <span className="glass-title">{title}</span>
          </div>
        ))}
      </div>
    </section>
  </ImageTrailEffect>
);

export default Home;
