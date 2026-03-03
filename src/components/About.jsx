import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import myLogo from "../assets/LogoImage.svg";
import "./About.css";

/* ── Animated counter ─────────────────────────────── */
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(start);
    }, 35);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const sections = [
  {
    icon: "🎯", title: "Mission", color: "#00c8ff",
    solidBg: "linear-gradient(135deg, #003a4f 0%, #00536b 100%)",
    border: "#00c8ff",
    glow: "rgba(0,200,255,0.35)",
    desc: "To democratize access to artificial intelligence by providing a unified platform that brings together the world's most advanced AI models.",
    points: ["Make AI accessible to everyone","Eliminate platform fragmentation","Accelerate AI adoption globally","Foster innovation through AI"],
  },
  {
    icon: "🔭", title: "Vision", color: "#a78bfa",
    solidBg: "linear-gradient(135deg, #2e1a5e 0%, #3d2270 100%)",
    border: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
    desc: "A world where every individual and organization can harness the full potential of AI without barriers or limitations.",
    points: ["Universal AI access","Seamless AI integration","AI-powered productivity","Ethical AI development"],
  },
  {
    icon: "💎", title: "Values", color: "#34d399",
    solidBg: "linear-gradient(135deg, #063a27 0%, #0a4f35 100%)",
    border: "#34d399",
    glow: "rgba(52,211,153,0.35)",
    desc: "We believe in transparency, privacy, innovation, and putting our users first in everything we do.",
    points: ["User privacy is paramount","Transparent AI interactions","Continuous innovation","Ethical AI practice"],
  },
  {
    icon: "⚡", title: "Technology Stack", color: "#fbbf24",
    solidBg: "linear-gradient(135deg, #3d2a00 0%, #523900 100%)",
    border: "#fbbf24",
    glow: "rgba(251,191,36,0.35)",
    desc: "Built with modern technologies for optimal performance and user experience.",
    points: ["React & JavaScript","Advanced CSS Animations","Canvas API Graphics","Responsive Design"],
  },
  {
    icon: "🚀", title: "Key Features", color: "#f472b6",
    solidBg: "linear-gradient(135deg, #4a0a2a 0%, #610d38 100%)",
    border: "#f472b6",
    glow: "rgba(244,114,182,0.35)",
    desc: "Experience the future of AI interaction with cutting-edge features.",
    points: ["Multi-AI platform integration","Interactive animated interface","Real-time AI switching","Seamless user experience"],
  },
  {
    icon: "👨‍💻", title: "Developer Journey", color: "#38bdf8",
    solidBg: "linear-gradient(135deg, #012e4a 0%, #01405f 100%)",
    border: "#38bdf8",
    glow: "rgba(56,189,248,0.35)",
    desc: "A passion project born from the vision to simplify AI accessibility for everyone.",
    points: ["Solo developer project","Built with dedication","Continuous learning","User-focused development"],
  },
];

const stats = [
  { value: 6,   suffix: "+",   label: "AI Models"    },
  { value: 100, suffix: "%",   label: "Free to Use"  },
  { value: 24,  suffix: "/7",  label: "Available"    },
  { value: 1,   suffix: " Tab",label: "All AIs"      },
];

function SectionCard({ data, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className="ab-card"
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.22,1,0.36,1] }}
      style={{
        "--card-color":  data.color,
        "--card-glow":   data.glow,
        "--card-border": data.border,
        "--card-bg":     data.solidBg,
      }}
    >
      <div className="ab-card-header">
        <span className="ab-card-icon">{data.icon}</span>
        <h3 className="ab-card-title" style={{ color: data.color }}>{data.title}</h3>
      </div>
      <p className="ab-card-desc">{data.desc}</p>
      <ul className="ab-card-points">
        {data.points.map((pt, i) => (
          <li key={i} className="ab-card-point">
            <span className="ab-point-dot" style={{ background: data.color }} />
            {pt}
          </li>
        ))}
      </ul>
      <div className="ab-card-line" style={{ background: `linear-gradient(90deg, transparent, ${data.color}, transparent)` }} />
    </motion.div>
  );
}

export default function About() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <section className="ab-section" id="about">

      {/* ── Hero ── */}
      <div className="ab-hero" ref={heroRef}>

        <motion.div className="ab-hero-badge"
          initial={{ opacity:0, scale:0.8 }}
          animate={heroInView ? { opacity:1, scale:1 } : {}}
          transition={{ duration:0.5 }}
        >
          <span className="ab-badge-dot" />
          
        </motion.div>

        <motion.h1 className="ab-hero-title"
          initial={{ opacity:0, y:24 }}
          animate={heroInView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.6, delay:0.1 }}
        >
          About <span className="ab-gradient-text">PROTONIX.AI</span>
        </motion.h1>

        <motion.p className="ab-hero-sub"
          initial={{ opacity:0, y:16 }}
          animate={heroInView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.6, delay:0.2 }}
        >
          Discover the vision, technology, and passion driving this project
        </motion.p>

        {/* Logo orbital */}
        <motion.div className="ab-logo-wrap"
          initial={{ opacity:0, scale:0.7 }}
          animate={heroInView ? { opacity:1, scale:1 } : {}}
          transition={{ duration:0.7, delay:0.3, ease:[0.34,1.56,0.64,1] }}
        >
          <div className="ab-logo-ring ab-ring-1" />
          <div className="ab-logo-ring ab-ring-2" />
          <div className="ab-logo-core">
            <img src={myLogo} alt="Protonix.AI" className="ab-logo-img" />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div className="ab-stats"
          initial={{ opacity:0, y:20 }}
          animate={heroInView ? { opacity:1, y:0 } : {}}
          transition={{ duration:0.6, delay:0.5 }}
        >
          {stats.map((s, i) => (
            <div key={i} className="ab-stat">
              <div className="ab-stat-value">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="ab-stat-label">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Heading ── */}
      <div className="ab-cards-heading">
        <span className="ab-section-tag">Core Pillars</span>
        <h2 className="ab-cards-title">What Drives Us</h2>
      </div>

      {/* ── Cards grid ── */}
      <div className="ab-cards-grid">
        {sections.map((s, i) => <SectionCard key={i} data={s} index={i} />)}
      </div>

    </section>
  );
}