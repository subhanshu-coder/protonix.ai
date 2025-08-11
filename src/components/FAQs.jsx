// src/components/FAQs.jsx
import React, { useState, useEffect, useRef } from "react";
import "./FAQs.css";

const faqsData = [
  {
    id: 1,
    question: "? How many AI models can I access with your platform?",
    answer: "You get access to 15+ premium AI models including ChatGPT, Claude, Gemini, Grok, Perplexity, and many more. All in one unified interface.",
    icon: "🤖",
    category: "models"
  },
  {
    id: 2,
    question: "? Can I compare responses from different AI models?",
    answer: "Absolutely! Our platform allows you to query multiple AI models simultaneously and compare their responses side-by-side to get the best answers.",
    icon: "⚖️",
    category: "features"
  },
  {
    id: 3,
    question: "? Do I need separate accounts for each AI service?",
    answer: "No! With our platform, you only need one account to access all AI models. We handle all the integrations for you.",
    icon: "🔗",
    category: "account"
  },
  {
    id: 4,
    question: "? Is there a free trial available?",
    answer: "Yes, we offer a free trial with no credit card required. You can test all features and see which AI models work best for your needs.",
    icon: "🎁",
    category: "pricing"
  },
  {
    id: 5,
    question: "? Can I switch between AI models mid-conversation?",
    answer: "Yes! You can seamlessly switch between different AI models without losing context or starting your conversation over.",
    icon: "🔄",
    category: "features"
  },
  {
    id: 6,
    question: "? How secure is my data?",
    answer: "Your data security is our top priority. We use enterprise-grade encryption and never store your conversations longer than necessary.",
    icon: "🔒",
    category: "security"
  }
];

const FAQs = () => {
  const [openFAQs, setOpenFAQs] = useState(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const faqsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (faqsRef.current) {
      observer.observe(faqsRef.current);
    }

    return () => {
      if (faqsRef.current) {
        observer.unobserve(faqsRef.current);
      }
    };
  }, [isVisible]);

  const toggleFAQ = (index) => {
    const newOpenFAQs = new Set(openFAQs);
    if (newOpenFAQs.has(index)) {
      newOpenFAQs.delete(index);
    } else {
      newOpenFAQs.add(index);
    }
    setOpenFAQs(newOpenFAQs);
  };

  // UPDATED: Navigate to Get In Touch section
  const handleContactClick = () => {
    const getInTouchSection = document.getElementById('getintouch');
    if (getInTouchSection) {
      getInTouchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEmailClick = () => {
    // Same navigation as contact button
    const getInTouchSection = document.getElementById('getintouch');
    if (getInTouchSection) {
      getInTouchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { key: 'all', label: 'All Questions', icon: '📋' },
    { key: 'models', label: 'AI Models', icon: '🤖' },
    { key: 'features', label: 'Features', icon: '⚡' },
    { key: 'account', label: 'Account', icon: '👤' },
    { key: 'pricing', label: 'Pricing', icon: '💰' },
    { key: 'security', label: 'Security', icon: '🔒' }
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqsData 
    : faqsData.filter(faq => faq.category === activeCategory);

  return (
    <div 
      ref={faqsRef} 
      className={`faqs-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="faqs-container">
        {/* Decorative Elements */}
        <div className="faq-decoration">
          <div className="floating-question">?</div>
          <div className="floating-question">?</div>
          <div className="floating-question">?</div>
        </div>

        {/* Title and Subtitle */}
        <div className="faq-header-simple">
          <h2 className="faqs-title-horizontal">
            <span className="title-main">
              Frequently Asked <span className="questions-white">Questions</span>
            </span>
            <span className="title-sub">Everything you need to know about our revolutionary AI platform</span>
          </h2>
        </div>

        {/* Category Filter */}
        <div className="category-filter-single-line">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`category-btn-enhanced ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span className="cat-icon">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="faqs-list">
          {filteredFAQs.map((faq, index) => (
            <div 
              key={faq.id} 
              className={`faq-item category-${faq.category}`}
              style={{ '--index': index }}
            >
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openFAQs.has(index)}
              >
                <div className="question-content">
                  <span className="faq-emoji">{faq.icon}</span>
                  <span className="question-text">{faq.question}</span>
                </div>
                <div className="expand-indicator">
                  <span className={`faq-icon ${openFAQs.has(index) ? 'open' : ''}`}>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="M12 8l6 6H6l6-6z" fill="currentColor"/>
                    </svg>
                  </span>
                </div>
              </button>
              
              <div className={`faq-answer ${openFAQs.has(index) ? 'open' : ''}`}>
                <div className="answer-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Section - UPDATED: Simple navigation buttons */}
        <div className="still-have-questions">
          <h3 className="still-questions-title">Still Have Questions?</h3>
          <p className="still-questions-subtitle">
            Our support team is here to help you 24/7. Get in touch and we'll respond as quickly as possible.
          </p>
          <div className="contact-buttons">
            <button 
              className="contact-support-btn"
              onClick={handleContactClick}
            >
              Contact Support
            </button>
            <button 
              className="email-support-btn"
              onClick={handleEmailClick}
            >
              📧 Email Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
