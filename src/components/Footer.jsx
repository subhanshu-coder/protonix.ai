import { motion } from 'framer-motion';
import { useState } from 'react';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // ── Easy to update: just add/remove models here ──
  const aiModels = [
    { name: 'ChatGPT',    status: 'live',    color: '#10a37f' },
    { name: 'Claude',     status: 'live',    color: '#d97757' },
    { name: 'Gemini',     status: 'live',    color: '#4285f4' },
    { name: 'Grok',       status: 'live',    color: '#ffffff' },
    { name: 'Perplexity', status: 'live',    color: '#20b8cd' },
    { name: 'DeepSeek',   status: 'live',    color: '#4d6bfe' },
    { name: 'Llama',      status: 'coming',  color: '#a78bfa' },
    { name: 'Mistral',    status: 'coming',  color: '#f59e0b' },
  ];

  // ── Easy to update: add subscription plans here ──
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      color: '#00e5ff',
      features: ['6 AI Models', 'Basic chat history', 'Standard speed'],
      cta: 'Current Plan',
      active: true,
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      color: '#a78bfa',
      features: ['All AI Models', 'Unlimited history', 'Priority speed', 'Side-by-side compare'],
      cta: 'Coming Soon',
      active: false,
    },
    {
      name: 'Team',
      price: '$29',
      period: '/month',
      color: '#f472b6',
      features: ['Everything in Pro', 'Team workspace', 'API access', 'Priority support'],
      cta: 'Coming Soon',
      active: false,
    },
  ];

  const socialLinks = [
    {
      name: 'X / Twitter',
      href: 'https://twitter.com',
      color: '#ffffff',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      color: '#0a66c2',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      name: 'GitHub',
      href: 'https://github.com',
      color: '#ffffff',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
    {
      name: 'Discord',
      href: 'https://discord.com',
      color: '#5865f2',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
        </svg>
      ),
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/protonix.ai/',
      color: '#e1306c',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* ── AI Models Status ── */}
        <motion.div className="footer-models"
          initial={{ opacity:0, y:30 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.6 }}
        >
          <div className="models-header">
            <span className="models-tag">Integrated Models</span>
            <h3 className="models-title">Supported AI Platforms</h3>
            <p className="models-sub">More models added regularly — stay tuned for updates</p>
          </div>
          <div className="models-grid">
            {aiModels.map((m, i) => (
              <motion.div key={i} className={`model-chip ${m.status}`}
                initial={{ opacity:0, scale:0.85 }}
                whileInView={{ opacity:1, scale:1 }}
                viewport={{ once:true }}
                transition={{ delay: i * 0.06 }}
              >
                <span className="model-dot" style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
                <span className="model-name">{m.name}</span>
                {m.status === 'coming' && <span className="model-badge">Soon</span>}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Plans Preview ── */}
        <motion.div className="footer-plans"
          initial={{ opacity:0, y:30 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.6, delay:0.1 }}
        >
          <div className="plans-header">
            <span className="models-tag">Pricing</span>
            <h3 className="models-title">Simple, Transparent Plans</h3>
            <p className="models-sub">Currently 100% free — paid plans coming soon</p>
          </div>
          <div className="plans-grid">
            {plans.map((p, i) => (
              <motion.div key={i}
                className={`plan-card ${p.active ? 'plan-active' : ''}`}
                style={{ '--plan-color': p.color }}
                initial={{ opacity:0, y:24 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="plan-top">
                  <span className="plan-name" style={{ color: p.color }}>{p.name}</span>
                  <div className="plan-price">
                    <span className="price-amount">{p.price}</span>
                    <span className="price-period">{p.period}</span>
                  </div>
                </div>
                <ul className="plan-features">
                  {p.features.map((f, j) => (
                    <li key={j}>
                      <span className="plan-check" style={{ color: p.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div className={`plan-cta ${p.active ? 'cta-active' : 'cta-soon'}`}
                  style={ p.active ? { background: `linear-gradient(135deg, ${p.color}22, ${p.color}44)`, borderColor: p.color } : {} }
                >
                  {p.cta}
                </div>
                <div className="plan-line" style={{ background: p.color }} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Newsletter ── */}
        <motion.div className="footer-newsletter"
          initial={{ opacity:0, y:30 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.6, delay:0.2 }}
        >
          <h3>Stay in the Loop</h3>
          <p>Get notified when new AI models, features or plans launch.</p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="newsletter-input"
              required
            />
            <motion.button type="submit" className="newsletter-btn"
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
            >
              {isSubscribed ? '✓ Done!' : 'Notify Me'}
            </motion.button>
          </form>
          {isSubscribed && (
            <motion.p className="success-message" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              You're on the list! 🎉
            </motion.p>
          )}
        </motion.div>

        {/* ── Bottom bar ── */}
        <motion.div className="footer-bottom"
          initial={{ opacity:0 }}
          whileInView={{ opacity:1 }}
          viewport={{ once:true }}
          transition={{ duration:0.6, delay:0.3 }}
        >
          {/* Brand */}
          <div className="footer-brand">
            <h2 className="brand-name">PROTONIX<span>.AI</span></h2>
            <p className="brand-desc">All AIs, One Tab.</p>
            {/* Social icons only */}
            <div className="social-links">
              {socialLinks.map((s, i) => (
                <motion.a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="social-link" title={s.name}
                  whileHover={{ scale:1.15, y:-3 }}
                  style={{ '--s-color': s.color }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Status + copyright */}
          <div className="footer-meta">
            <div className="status-row">
              <span className="status-dot" />
              <span className="status-text">All systems operational</span>
            </div>
            <span className="version-badge">v2.1.0</span>
            <p className="copyright">© 2026 Protonix.AI · Made with ❤️ by Subhanshu Pal</p>
          </div>
        </motion.div>

      </div>
    </footer>
  );
};

export default Footer;