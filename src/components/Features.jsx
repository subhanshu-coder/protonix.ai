// src/components/Features.jsx
import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';
import ScrollVelocity from './ScrollVelocity';
import './Features.css';

/* ────────── helpers ────────────────────────────────── */
const buildKeyframes = (from, steps) => {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);
  const keyframes = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};

/* ────────── BlurText component ─────────────────────── */
const BlurText = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (t) => t,
  onAnimationComplete,
  stepDuration = 0.35,
  as: Component = 'p',
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  /* intersection-observer */
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -50 }
        : { filter: 'blur(10px)', opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      { filter: 'blur(5px)', opacity: 0.5, y: direction === 'top' ? 5 : -5 },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  return (
    <Component ref={ref} className={className}>
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={
              index === elements.length - 1 ? onAnimationComplete : undefined
            }
          >
            {segment}
            {animateBy === 'words' && index < elements.length - 1 && ' '}
          </motion.span>
        );
      })}
    </Component>
  );
};

/* ────────── Main Features component ────────────────── */
const Features = () => {
  const featureList = [
    {
      title: 'Multi-Model Access',
      description:
        'Switch between leading AI models instantly in a single, seamless interface.',
    },
    {
      title: 'Side-by-Side Comparison',
      description:
        'Run prompts on multiple models at once and compare responses in real-time.',
    },
    {
      title: 'Unified Chat History',
      description:
        'All your conversations, across all models, saved in one organized and searchable place.',
    },
    {
      title: 'Real-Time Updates',
      description:
        'Stay updated with the latest features and improvements automatically.',
    },
    {
      title: 'Intuitive Interface',
      description:
        'Designed for ease of use, our interface makes complex AI interactions simple.',
    },
    {
      title: 'AI Model Marketplace',
      description: 'Discover and integrate new AI models from our marketplace.',
    },
    {
      title: 'Voice Interaction',
      description: 'Interact with AI using natural-language voice commands.',
    },
    {
      title: 'Secure and Private',
      description:
        'Your data is protected with end-to-end encryption and strict privacy controls.',
    },
    {
      title: 'Learning Resources',
      description:
        'Access tutorials, guides, and resources to enhance your AI skills.',
    },
  ];

  /* continuous marquee sentences */
  const scrollTexts = [
    '✨GET STARTED TODAY✨JOIN THOUSANDS OF USERS✨TRANSFORM YOUR AI WORKFLOW✨EXPERIENCE THE FUTURE✨AI HUB PLATFORM✨REVOLUTIONARY TECHNOLOGY✨CUTTING EDGE SOLUTIONS',
    '✨NEXT GENERATION AI✨SEAMLESS INTEGRATION✨POWERFUL FEATURES✨ULTIMATE AI EXPERIENCE✨INNOVATION LEADER✨SMART SOLUTIONS✨ADVANCED FEATURES✨BOOST PRODUCTIVITY',
    '✨STREAMLINE WORKFLOW✨CUTTING EDGE TECH✨FUTURE IS HERE✨JOIN THE REVOLUTION✨AI-POWERED SOLUTIONS✨TRANSFORM YOUR BUSINESS✨NEXT LEVEL TECHNOLOGY✨AMAZING RESULTS',
  ];

  return (
    <section id="features" className="features-section">
      {/* animated headings */}
      <BlurText
        text="Powerful Features"
        as="h2"
        className="features-main-title"
        animateBy="words"
        direction="top"
        delay={300}
      />

      <BlurText
        text="Everything you need to harness the power of multiple AI models in one unified platform"
        as="p"
        className="features-main-description"
        animateBy="words"
        direction="top"
        delay={100}
      />

      {/* feature cards grid */}
      <div className="features-grid">
        {featureList.map((feature, index) => (
          <motion.div
            key={index}
            className="feature-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
          >
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* ending section with scrolling marquee */}
      <div className="features-ending">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2>Ready to Transform Your AI Workflow?</h2>
          <p>
            Join thousands of users who are already using AI Hub to streamline
            their workflow and boost productivity.
          </p>

          <div className="scroll-velocity-container">
            <ScrollVelocity
              texts={scrollTexts}
              velocity={20}
              damping={70}
              stiffness={200}
              numCopies={3}
              velocityMapping={{ input: [0, 1000], output: [0, 1] }}
              parallaxClassName="parallax features-parallax"
              scrollerClassName="scroller features-scroller"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;