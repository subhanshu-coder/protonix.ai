import { useEffect, useRef } from "react";
import './PixelCard.css';

// Pixel animation logic class
class Pixel {
  constructor(canvas, context, x, y, color, speed, delay) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

function getEffectiveSpeed(value, reducedMotion) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;
  const parsed = parseInt(value, 10);

  if (parsed <= min || reducedMotion) {
    return min;
  } else if (parsed >= max) {
    return max * throttle;
  } else {
    return parsed * throttle;
  }
}

// White pixels for all cards
const VARIANTS = {
  mission: {
    gap: 8,
    speed: 25,
    colors: "#ffffff,#f8f9fa,#e9ecef",
    noFocus: false
  },
  vision: {
    gap: 10,
    speed: 30,
    colors: "#ffffff,#f8f9fa,#e9ecef",
    noFocus: false
  },
  values: {
    gap: 6,
    speed: 20,
    colors: "#ffffff,#f8f9fa,#e9ecef",
    noFocus: false
  },
  tech: {
    gap: 7,
    speed: 28,
    colors: "#ffffff,#f8f9fa,#e9ecef",
    noFocus: false
  },
  features: {
    gap: 9,
    speed: 22,
    colors: "#ffffff,#f8f9fa,#e9ecef",
    noFocus: false
  },
  journey: {
    gap: 5,
    speed: 26,
    colors: "#ffffff,#f8f9fa,#e9ecef",
    noFocus: false
  }
};

// Single Card Component
function SinglePixelCard({ variant, title, content, className = "" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const pixelsRef = useRef([]);
  const animationRef = useRef(null);
  const timePreviousRef = useRef(performance.now());
  const reducedMotion = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;

  const variantCfg = VARIANTS[variant] || VARIANTS.mission;
  const finalGap = variantCfg.gap;
  const finalSpeed = variantCfg.speed;
  const finalColors = variantCfg.colors;
  const finalNoFocus = variantCfg.noFocus;

  const initPixels = () => {
    if (!containerRef.current || !canvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const ctx = canvasRef.current.getContext("2d");

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;

    const colorsArray = finalColors.split(",");
    const pxs = [];
    for (let x = 0; x < width; x += parseInt(finalGap, 10)) {
      for (let y = 0; y < height; y += parseInt(finalGap, 10)) {
        const color =
          colorsArray[Math.floor(Math.random() * colorsArray.length)];

        const dx = x - width / 2;
        const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = reducedMotion ? 0 : distance;

        pxs.push(
          new Pixel(
            canvasRef.current,
            ctx,
            x,
            y,
            color,
            getEffectiveSpeed(finalSpeed, reducedMotion),
            delay
          )
        );
      }
    }
    pixelsRef.current = pxs;
  };

  const doAnimate = (fnName) => {
    animationRef.current = requestAnimationFrame(() => doAnimate(fnName));
    const timeNow = performance.now();
    const timePassed = timeNow - timePreviousRef.current;
    const timeInterval = 1000 / 60;

    if (timePassed < timeInterval) return;
    timePreviousRef.current = timeNow - (timePassed % timeInterval);

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    let allIdle = true;
    for (let i = 0; i < pixelsRef.current.length; i++) {
      const pixel = pixelsRef.current[i];
      pixel[fnName]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleAnimation = (name) => {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(() => doAnimate(name));
  };

  const onMouseEnter = () => handleAnimation("appear");
  const onMouseLeave = () => handleAnimation("disappear");

  useEffect(() => {
    initPixels();
    const observer = new ResizeObserver(() => {
      initPixels();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, [finalGap, finalSpeed, finalColors, finalNoFocus]);

  return (
    <div
      ref={containerRef}
      className={`single-pixel-card ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={0}
    >
      <canvas className="pixel-canvas" ref={canvasRef} />
      <div className="card-content">
        <h3>{title}</h3>
        {content}
      </div>
    </div>
  );
}

// Main Component with 6 cards
export default function PixelCard() {
  const cardData = [
    {
      variant: "mission",
      title: "Mission",
      content: (
        <div>
          <p>To democratize access to artificial intelligence by providing a unified platform that brings together the world's most advanced AI models.</p>
          <ul>
            <li>Make AI accessible to everyone</li>
            <li>Eliminate platform fragmentation</li>
            <li>Accelerate AI adoption globally</li>
            <li>Foster innovation through AI</li>
          </ul>
        </div>
      )
    },
    {
      variant: "vision", 
      title: "Vision",
      content: (
        <div>
          <p>A world where every individual and organization can harness the full potential of AI without barriers or limitations.</p>
          <ul>
            <li>Universal AI access</li>
            <li>Seamless AI integration</li>
            <li>AI-powered productivity</li>
            <li>Ethical AI development</li>
          </ul>
        </div>
      )
    },
    {
      variant: "values",
      title: "Values", 
      content: (
        <div>
          <p>We believe in transparency, privacy, innovation, and putting our users first in everything we do.</p>
          <ul>
            <li>User privacy is paramount</li>
            <li>Transparent AI interactions</li>
            <li>Continuous innovation</li>
            <li>Ethical AI practice</li>
          </ul>
        </div>
      )
    },
    {
      variant: "tech",
      title: "Technology Stack",
      content: (
        <div>
          <p>Built with modern technologies for optimal performance and user experience.</p>
          <ul>
            <li>React & JavaScript</li>
            <li>Advanced CSS Animations</li>
            <li>Canvas API Graphics</li>
            <li>Responsive Design</li>
          </ul>
        </div>
      )
    },
    {
      variant: "features",
      title: "Key Features",
      content: (
        <div>
          <p>Experience the future of AI interaction with cutting-edge features.</p>
          <ul>
            <li>Multi-AI platform integration</li>
            <li>Interactive animated interface</li>
            <li>Real-time AI switching</li>
            <li>Seamless user experience</li>
          </ul>
        </div>
      )
    },
    {
      variant: "journey",
      title: "Developer Journey",
      content: (
        <div>
          <p>A passion project born from the vision to simplify AI accessibility for everyone.</p>
          <ul>
            <li>Solo developer project</li>
            <li>Built with dedication</li>
            <li>Continuous learning</li>
            <li>User-focused development</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="pixel-cards-container">
      <div className="section-header">
        <h2 className="main-title">Behind The AI Hub</h2>
        <p className="section-subtitle">Discover the vision, technology, and passion driving this project</p>
      </div>
      <div className="cards-grid staggered-layout">
        {cardData.map((card, index) => (
          <SinglePixelCard
            key={card.title}
            variant={card.variant}
            title={card.title}
            content={card.content}
            className={`card-${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}



