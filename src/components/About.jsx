import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import myLogo from "../assets/LogoImage.svg";
import "./About.css";

const styles = {
  wrapper: {
    display: "inline-block",
    whiteSpace: "pre-wrap",
    minWidth: "100%", // Reserve minimum width to prevent layout shift
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    border: 0,
  },
};

function DecryptedText({
  text,
  speed = 50,
  maxIterations = 8,
  sequential = true,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "view",
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let interval;
    let currentIteration = 0;

    const getNextIndex = (revealedSet) => {
      const len = text.length;
      switch (revealDirection) {
        case "start":
          return revealedSet.size;
        case "end":
          return len - 1 - revealedSet.size;
        case "center": {
          const mid = Math.floor(len / 2);
          const offset = Math.floor(revealedSet.size / 2);
          const candidate =
            revealedSet.size % 2 === 0 ? mid + offset : mid - offset - 1;
          if (candidate >= 0 && candidate < len && !revealedSet.has(candidate))
            return candidate;
          for (let i = 0; i < len; i++) if (!revealedSet.has(i)) return i;
          return 0;
        }
        default:
          return revealedSet.size;
      }
    };

    const availableChars = useOriginalCharsOnly
      ? Array.from(new Set(text.split(""))).filter((c) => c !== " ")
      : characters.split("");

    const shuffle = (origin, revealed) => {
      if (useOriginalCharsOnly) {
        const positions = origin.split("").map((ch, i) => ({
          ch,
          isSpace: ch === " ",
          idx: i,
          revealed: revealed.has(i),
        }));
        const scrambleChars = positions
          .filter((p) => !p.isSpace && !p.revealed)
          .map((p) => p.ch);
        for (let i = scrambleChars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [scrambleChars[i], scrambleChars[j]] = [scrambleChars[j], scrambleChars[i]];
        }
        let idx = 0;
        return positions
          .map((p) => (p.isSpace ? " " : p.revealed ? origin[p.idx] : scrambleChars[idx++]))
          .join("");
      }
      return origin
        .split("")
        .map((ch, i) =>
          ch === " "
            ? " "
            : revealed.has(i)
            ? origin[i]
            : availableChars[Math.floor(Math.random() * availableChars.length)]
        )
        .join("");
    };

    if (isHovering) {
      setIsScrambling(true);
      interval = setInterval(() => {
        setRevealedIndices((prev) => {
          if (sequential) {
            if (prev.size < text.length) {
              const nextIdx = getNextIndex(prev);
              const newSet = new Set(prev);
              newSet.add(nextIdx);
              setDisplayText(shuffle(text, newSet));
              return newSet;
            }
            clearInterval(interval);
            setIsScrambling(false);
            return prev;
          } else {
            setDisplayText(shuffle(text, prev));
            currentIteration++;
            if (currentIteration >= maxIterations) {
              clearInterval(interval);
              setIsScrambling(false);
              setDisplayText(text);
            }
            return prev;
          }
        });
      }, speed);
    } else {
      setDisplayText(text);
      setRevealedIndices(new Set());
      setIsScrambling(false);
    }

    return () => interval && clearInterval(interval);
  }, [isHovering, sequential, speed, text, maxIterations, revealDirection, characters, useOriginalCharsOnly]);

  useEffect(() => {
    if (animateOn !== "view") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsHovering(true);
            setHasAnimated(true);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [animateOn, hasAnimated]);

  const hoverProps =
    animateOn === "hover"
      ? {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false),
        }
      : {};

  const visibleClass =
    isScrambling && isHovering
      ? "txt-scramble"
      : !isScrambling && hasAnimated
      ? "txt-reveal"
      : "txt-visible";

  return (
    <motion.span
      ref={containerRef}
      className={`${parentClassName} ${className} ${visibleClass}`}
      style={styles.wrapper}
      {...hoverProps}
      {...props}
    >
      <span style={styles.srOnly}>{text}</span>
      <span aria-hidden="true">
        {displayText.split("").map((ch, i) => (
          <span
            key={i}
            className={revealedIndices.has(i) || !isScrambling || !isHovering ? "" : encryptedClassName}
          >
            {ch}
          </span>
        ))}
      </span>
    </motion.span>
  );
}

export default function About() {
  const lines = [
    "AI Hub is a revolutionary platform unifying AI models under one interface.",
    "We support ChatGPT, Claude, Gemini, and many more exciting tools.",
    "Our mission is to democratize AI for everyone, everywhere.",
    "Enjoy switching between models, seamless comparisons, and chat history.",
    "Experience enterprise-grade security and unparalleled workflow.",
    "Ideal for developers, researchers, and business professionals.",
    "Join thousands transforming AI interactions today.",
    "Unlock potential and innovation with AI Hub.",
    "Step into the future with decrypted AI at your fingertips."
  ];

  return (
    <section className="about-section">
      <h1 className="about-title">About PROTONIX.AI</h1>
      <h2 className="about-heading">Decrypting the Future of AI</h2>

      <div className="unified-container">
        <div className="logo-section">
          <div className="logo-background">
            <img src={myLogo} alt="AI Hub Logo" className="logo-image" />
          </div>
        </div>

        <div className="text-section">
          {lines.map((line, idx) => (
            <div key={idx} className="line-wrapper" tabIndex={0}>
              <DecryptedText
                text={line}
                speed={30}
                maxIterations={8}
                sequential={true}
                revealDirection="start"
                className="decrypted-text"
                encryptedClassName="encrypted-char"
                animateOn="view"
                parentClassName="line-container"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}