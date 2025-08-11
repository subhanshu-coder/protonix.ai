// src/components/ImageTrailEffect.jsx

import React, { useRef } from "react";
// import gsap from "gsap";

export default function ImageTrailEffect({
  imageSources,
  imageClassName = "trail-img",
  containerClassName = "",
  maxTrailImages = 12, // Increased for smoother trail
  triggerDistance = 8, // Reduced for more responsive trail
  fadeTimeout = 800, // Reduced fade time for faster transitions
  style = {},
  children,
}) {
  const wrapperRef = useRef(null);
  const imgRefs = useRef(imageSources.map(() => React.createRef()));
  const zIndexCounter = useRef(2);
  let imageIndex = 0;
  let lastPosition = { x: 0, y: 0 };

  function activateImage(img, x, y) {
    if (!img || !wrapperRef.current) return;
    
    const bounds = wrapperRef.current.getBoundingClientRect();
    img.style.left = `${x - bounds.left - 30}px`;
    img.style.top = `${y - bounds.top - 30}px`;
    img.style.zIndex = zIndexCounter.current++;
    img.dataset.status = "active";
    
    // Faster fade out for smoother transitions
    setTimeout(() => { 
      if (img) img.dataset.status = "inactive"; 
    }, fadeTimeout);
    
    lastPosition = { x, y };
  }

  function calcDist(x, y) {
    return Math.hypot(x - lastPosition.x, y - lastPosition.y);
  }

  function onMove(e) {
    e.preventDefault();
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    // Much more sensitive trigger for smoother trail
    if (calcDist(x, y) > window.innerWidth / triggerDistance) {
      const i = imageIndex++ % imgRefs.current.length;
      const img = imgRefs.current[i]?.current;
      if (img) activateImage(img, x, y);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={`imagetrail-wrapper ${containerClassName}`.trim()}
      style={{ 
        position: "relative", 
        width: "100%",
        cursor: "crosshair",
        ...style 
      }}
      onMouseMove={onMove}
      onTouchMove={onMove}
    >
      {/* AI logo trail images */}
      {imageSources.map((src, i) => (
        <img
          key={i}
          ref={imgRefs.current[i]}
          src={src}
          alt={`trail-${i}`}
          data-status="inactive"
          className={imageClassName}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            opacity: 0,
            pointerEvents: "none",
            // Smoother, faster transitions
            transition: "transform 0.25s cubic-bezier(.25,.46,.45,.94), opacity 0.2s ease-out",
            transform: "scale(0.3)",
            willChange: "transform, opacity",
            zIndex: 10,
          }}
        />
      ))}
      
      {/* Render the wrapped content */}
      {children}
    </div>
  );
}
