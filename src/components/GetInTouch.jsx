// src/components/GetInTouch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './GetInTouch.css';

const GetInTouch = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const getInTouchRef = useRef(null);

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

    if (getInTouchRef.current) {
      observer.observe(getInTouchRef.current);
    }

    return () => {
      if (getInTouchRef.current) {
        observer.unobserve(getInTouchRef.current);
      }
    };
  }, [isVisible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Us',
      value: 'hello@aiplatform.com',
      description: 'Send us an email anytime',
      action: () => window.location.href = 'mailto:hello@aiplatform.com'
    },
    {
      icon: '📞',
      title: 'Call Us',
      value: '+1 (555) 123-4567',
      description: 'Mon-Fri from 8am to 6pm',
      action: () => window.location.href = 'tel:+15551234567'
    },
    {
      icon: '📍',
      title: 'Visit Us',
      value: '123 Innovation Street, Tech City, TC 12345',
      description: 'Come say hello at our office',
      action: () => window.open('https://maps.google.com', '_blank')
    },
    {
      icon: '🕐',
      title: 'Working Hours',
      value: 'Mon-Fri: 8am-6pm PST',
      description: 'We\'re here to help during business hours',
      action: null
    }
  ];

  const socialLinks = [
    { 
      platform: 'twitter',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: 'https://twitter.com' 
    },
    { 
      platform: 'linkedin',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: 'https://linkedin.com' 
    },
    { 
      platform: 'github',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      url: 'https://github.com' 
    },
    { 
      platform: 'instagram',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      url: 'https://instagram.com' 
    }
  ];

  return (
    <div 
      ref={getInTouchRef} 
      className={`get-in-touch-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="get-in-touch-container">
        {/* Header */}
        <motion.div 
          className="get-in-touch-header"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="get-in-touch-title">Get In Touch</h2>
          <p className="get-in-touch-description">
            Ready to start your next project? Have questions about our platform? We'd love to hear from you. Let's build something amazing together.
          </p>
        </motion.div>

        <div className="get-in-touch-content">
          {/* Contact Form */}
          <motion.div 
            className="contact-form-section"
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="form-header">
              <h3>Send us a Message</h3>
            </div>
            
            <form className="main-contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="What's your message about?"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  placeholder="Tell us more about your project or question..."
                />
              </div>
              
              <motion.button 
                type="submit" 
                className="send-message-btn"
                disabled={isSubmitting || isSubmitted}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Sending...' : isSubmitted ? '✓ Message Sent!' : 'Send Message'}
              </motion.button>

              {/* Success Message */}
              {isSubmitted && (
                <motion.div
                  className="success-message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Thank you for your message! We'll get back to you soon. 🚀
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Right Side - Contact Information */}
          <div className="right-side-content">
            <motion.div 
              className="contact-info-section"
              initial={{ opacity: 0, x: 30 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="contact-info-header">
                <h3>Contact Information</h3>
              </div>
              
              <div className="contact-methods">
                {contactMethods.map((method, index) => (
                  <motion.div 
                    key={index} 
                    className={`contact-method ${method.action ? 'clickable' : ''}`}
                    onClick={method.action}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="contact-method-icon">
                      {method.icon}
                    </div>
                    <div className="contact-method-content">
                      <h4>{method.title}</h4>
                      <p className="contact-method-value">{method.value}</p>
                      <span className="contact-method-desc">{method.description}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="follow-us-section">
                <h4>Follow Us</h4>
                <div className="social-links-icons-only">
                  {socialLinks.map((link, index) => (
                    <motion.a 
                      key={index}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-icon-link"
                      data-platform={link.platform}
                      whileHover={{ scale: 1.1, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Response Guarantee - Full Width */}
        <motion.div 
          className="quick-response-guarantee"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="guarantee-icon">⚡</div>
          <div className="guarantee-content">
            <h3>Quick Response Guarantee</h3>
            <p>We typically respond to all inquiries within 24 hours. For urgent matters, don't hesitate to call us directly during business hours.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GetInTouch;
