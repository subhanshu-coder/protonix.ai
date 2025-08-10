// src/components/HowItWorks.jsx
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent
} from "framer-motion";
import './HowItWorks.css';

const stepsData = [
  {
    id: "step-1",
    year: "01",
    title: "🔐 Login/Register",
    subtitle: "Quick & Secure Access",
    description: "Create your account or login with existing credentials. Get instant access to our unified AI platform in seconds.",
    icon: "🔐"
  },
  {
    id: "step-2",
    year: "02",
    title: "🤖 Choose AI Models",
    subtitle: "15+ Premium Models",
    description: "Select from ChatGPT, Claude, Gemini, Grok, Perplexity, and more. Pick multiple models for comparison.",
    icon: "🤖"
  },
  {
    id: "step-3",
    year: "03",
    title: "💬 Ask Your Question",
    subtitle: "One Query, Multiple Responses",
    description: "Type your question once and get responses from all selected AI models simultaneously.",
    icon: "💬"
  },
  {
    id: "step-4",
    year: "04",
    title: "⚖️ Compare Results",
    subtitle: "Side-by-Side Analysis",
    description: "View all AI responses in a clean comparison interface to find the best answer.",
    icon: "⚖️"
  },
  {
    id: "step-5",
    year: "05",
    title: "⚡ Switch & Continue",
    subtitle: "Seamless Conversations",
    description: "Switch between models mid-conversation without losing context or starting over.",
    icon: "⚡"
  },
  {
    id: "step-6",
    year: "06",
    title: "💾 Save & Export",
    subtitle: "Keep Your Work",
    description: "Save important conversations, export results, and build your personal AI knowledge base.",
    icon: "💾"
  }
];

const HowItWorks = () => {
  const [visibleSteps, setVisibleSteps] = useState(new Set());
  const [activeIndex, setActiveIndex] = useState(-1);
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const stepRefs = useRef([]);
  const stepsContainerRef = useRef(null);

  // Force container positioning
  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.position = 'relative';
      containerRef.current.style.minHeight = '100vh';
      containerRef.current.style.width = '100%';
    }
    if (scrollRef.current) {
      scrollRef.current.style.position = 'relative';
      scrollRef.current.style.minHeight = '100vh';
    }
  }, []);

  // FIXED: Instant start scroll setup
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  // Use spring for smooth movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // FIXED: Dynamic timeline height calculation
  const [timelineHeight, setTimelineHeight] = useState('100%');

  useLayoutEffect(() => {
    const calculateTimelineHeight = () => {
      if (stepRefs.current[5] && scrollRef.current) {
        const lastStep = stepRefs.current[5];
        const container = scrollRef.current;
        
        const containerTop = container.offsetTop;
        const lastStepTop = lastStep.offsetTop;
        const lastStepHeight = lastStep.offsetHeight;
        
        const calculatedHeight = lastStepTop - containerTop + (lastStepHeight / 2);
        setTimelineHeight(`${calculatedHeight}px`);
      }
    };

    const timer = setTimeout(calculateTimelineHeight, 100);
    window.addEventListener('resize', calculateTimelineHeight);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateTimelineHeight);
    };
  }, []);

  // FIXED: INSTANT start progress mapping - starts immediately
  const progressHeight = useTransform(
    smoothProgress, 
    [0, 0.85], // FIXED: Start at 0% scroll for instant response
    ["0px", timelineHeight]
  );

  const cometPosition = useTransform(
    smoothProgress,
    [0, 0.85, 1], // FIXED: Instant start at 0%
    ["0px", timelineHeight, timelineHeight]
  );

  // FIXED: INSTANT step tracking with immediate response for steps 1-3
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((v) => {
      // FIXED: Instant mapping starting from 0% scroll
      const adjustedProgress = Math.min(v / 0.85, 1); // Map 0-85% range to 0-1
      
      // FIXED: Ultra-accelerated step progression for steps 1-3
      let stepProgress;
      if (adjustedProgress <= 0.2) { // First 20% of scroll range covers steps 1-3 (ultra-fast)
        stepProgress = (adjustedProgress / 0.2) * 3; // Map to steps 0-3
      } else { // Remaining 80% of scroll covers steps 4-6 (normal timing)
        stepProgress = 3 + ((adjustedProgress - 0.2) / 0.8) * 3; // Map to steps 3-6
      }
      
      const newIndex = Math.min(Math.floor(stepProgress), stepsData.length - 1);
      
      if (newIndex !== activeIndex && newIndex >= 0) {
        setActiveIndex(newIndex);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, activeIndex]);

  // FIXED: Instant intersection observer for immediate detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.dataset.stepIndex);
            if (!isNaN(stepIndex)) {
              setVisibleSteps(prev => new Set([...prev, stepIndex]));
            }
          }
        });
      },
      { 
        threshold: [0.01, 0.05, 0.1], // Ultra-low thresholds for instant detection
        rootMargin: "100% 0px 0% 0px" // FIXED: Maximum aggressive top margin for instant trigger
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // FIXED: Instant card variants for steps 1-3
  const getCardVariants = (index) => {
    const isEarlyStep = index < 3; // Steps 1-3
    
    return {
      initial: {
        opacity: 0,
        x: index % 2 === 0 ? (isEarlyStep ? -15 : -50) : (isEarlyStep ? 15 : 50),
        y: isEarlyStep ? 3 : 15
      },
      animate: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: isEarlyStep ? 0.15 : 0.6, // FIXED: Ultra-fast 0.15s for steps 1-3
          delay: 0,
          ease: isEarlyStep ? [0.8, 0, 0.2, 1] : [0.25, 0.1, 0.25, 1.0], // Instant easing for steps 1-3
        },
      },
    };
  };

  return (
    <section id="HowItWorks" className="how-it-works-section" ref={containerRef}>
      <div className="timeline-outer-container">
        <div className="timeline-scroll-container" ref={scrollRef}>
          {/* Section Header */}
          <div className="section-header-wrapper">
            <div className="section-header">
              <h2 className="main-title">How It Works</h2>
              <p className="section-subtitle">
                Get started with our AI platform in 6 simple steps
              </p>
            </div>
          </div>

          {/* Timeline Container */}
          <div className="timeline-content-wrapper">
            <div className="timeline-wrapper">
              <div className="steps-container" ref={stepsContainerRef}>
                {/* Background Timeline Line */}
                <div 
                  className="timeline-background-line"
                  style={{ height: timelineHeight }}
                ></div>

                {/* FIXED: Instant Progress Line */}
                <motion.div
                  className="timeline-progress-line"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    borderRadius: '2px',
                    background: 'linear-gradient(to bottom, #22d3ee, #6366f1, #a855f7)',
                    boxShadow: `
                      0 0 15px rgba(99,102,241,0.5),
                      0 0 25px rgba(168,85,247,0.3)
                    `,
                    height: progressHeight,
                  }}
                />

                {/* FIXED: Instant Comet */}
                <motion.div
                  className="timeline-comet"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: cometPosition,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 25,
                  }}
                >
                  <motion.div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(99,102,241,0.5) 40%, rgba(34,211,238,0) 70%)',
                      boxShadow: `
                        0 0 15px 4px rgba(168, 85, 247, 0.6),
                        0 0 25px 8px rgba(99, 102, 241, 0.4),
                        0 0 40px 15px rgba(34, 211, 238, 0.2)
                      `,
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>

                {/* Steps */}
                {stepsData.map((event, index) => (
                  <motion.div
                    key={event.id}
                    ref={(el) => {
                      stepRefs.current[index] = el;
                      if (el) el.dataset.stepIndex = index;
                    }}
                    className={`step-row ${index % 2 === 0 ? 'step-left' : 'step-right'}`}
                    variants={getCardVariants(index)}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ 
                      once: false, 
                      // FIXED: Instant margins for steps 1-3, normal for 4-6
                      margin: index < 3 ? "100% 0px 0% 0px" : "20% 0px -10% 0px",
                      amount: index < 3 ? 0.01 : 0.3 // Instant threshold for steps 1-3
                    }}
                  >
                    {/* Always glowing circle */}
                    <div className="step-circle-wrapper">
                      <motion.div
                        className="step-circle circle-always-glow"
                        animate={{
                          scale: [1, 1.2, 1],
                          boxShadow: [
                            "0 8px 25px rgba(6, 182, 212, 0.6), 0 0 20px rgba(6, 182, 212, 0.4)",
                            "0 12px 35px rgba(6, 182, 212, 0.8), 0 0 30px rgba(6, 182, 212, 0.6)",
                            "0 8px 25px rgba(6, 182, 212, 0.6), 0 0 20px rgba(6, 182, 212, 0.4)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <span className="step-number">{event.year}</span>
                      </motion.div>
                    </div>

                    {/* Always glowing card */}
                    <div className={`step-card-wrapper ${index % 2 === 0 ? 'left-side' : 'right-side'}`}>
                      <div className={`step-card card-always-glow ${index === 3 ? 'card-step-4-special' : ''}`}>
                        <div className="card-content">
                          <div className="step-header">
                            <span className="step-icon">{event.icon}</span>
                            <span className="step-badge">Step {event.year}</span>
                          </div>
                          <h3 className="step-title">{event.title}</h3>
                          <div className="step-highlight">{event.subtitle}</div>
                          <p className="step-description">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="cta-section-enhanced">
                <div className="cta-glow-container">
                  <div className="cta-background-glow"></div>
                  <div className="cta-content-enhanced">
                    <span className="cta-icon">🚀</span>
                    <h3 className="cta-title-enhanced">Ready to Get Started?</h3>
                    <p className="cta-description-enhanced">
                      Join thousands of users who supercharge their productivity daily
                    </p>
                    <div className="cta-buttons-enhanced">
                      <a href="#" className="primary-cta-button-enhanced">
                        <span className="button-text">Start Free Trial</span>
                        <div className="button-glow"></div>
                      </a>
                      <a href="#" className="secondary-cta-button-enhanced">
                        <span className="button-text">Watch Demo</span>
                      </a>
                    </div>
                    <div className="cta-features">
                      <div className="feature-item">
                        <span className="feature-icon">✓</span>
                        <span>No Credit Card Required</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">🔒</span>
                        <span>100% Secure</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">⚡</span>
                        <span>Instant Setup</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
