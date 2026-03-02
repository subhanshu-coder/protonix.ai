import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import LoginPage         from './components/LoginPage';
import ChatPage          from './components/ChatPage';
import LandingPage       from './components/LandingPage';
import ResetPasswordPage from './components/Resetpasswordpage';

import './App.css';

/* ══════════════════════════════════════════════════════════════
   SILK BACKGROUND — canvas 2D, paints #08080f on frame 1.
   Replaces the three.js WebGL canvas that caused the blue flash.
   Drop this <SilkBackground /> anywhere and it covers the screen.
══════════════════════════════════════════════════════════════ */
const SilkBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Five slow-drifting orbs — same sky-blue palette as the old Silk
    const orbs = [
      { x:0.15, y:0.25, r:0.50, ox:0.07, oy:0.04, sp:0.00017, ph:0.0  },
      { x:0.80, y:0.60, r:0.44, ox:0.05, oy:0.07, sp:0.00013, ph:2.1  },
      { x:0.50, y:0.92, r:0.38, ox:0.07, oy:0.03, sp:0.00021, ph:4.3  },
      { x:0.88, y:0.14, r:0.32, ox:0.04, oy:0.06, sp:0.00015, ph:1.2  },
      { x:0.25, y:0.78, r:0.30, ox:0.06, oy:0.05, sp:0.00019, ph:3.5  },
    ];

    // Parse the same color used in LandingPage: "3494d8ff"
    const R = 0x34, G = 0x94, B = 0xd8;

    const draw = (ts) => {
      const W = canvas.width, H = canvas.height;

      // 1. Solid dark base — ALWAYS painted first, never transparent
      ctx.fillStyle = '#08080f';
      ctx.fillRect(0, 0, W, H);

      // 2. Animated silk orbs — slow, smooth, hypnotic
      orbs.forEach(o => {
        const cx  = (o.x + Math.sin(ts * o.sp + o.ph)         * o.ox) * W;
        const cy  = (o.y + Math.cos(ts * o.sp * 1.3 + o.ph)   * o.oy) * H;
        const rad = o.r * Math.max(W, H);
        const g   = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0,   `rgba(${R},${G},${B},0.13)`);
        g.addColorStop(0.45,`rgba(${R},${G},${B},0.05)`);
        g.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // 3. Cooler accent orb (blue-violet) — depth layering
      const ax = (0.62 + Math.sin(ts * 0.000095) * 0.14) * W;
      const ay = (0.28 + Math.cos(ts * 0.000082) * 0.18) * H;
      const ag = ctx.createRadialGradient(ax, ay, 0, ax, ay, 0.40 * Math.max(W, H));
      ag.addColorStop(0,   'rgba(90,110,255,0.07)');
      ag.addColorStop(0.5, 'rgba(70, 90,220,0.03)');
      ag.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, W, H);

      // 4. Silk wave shimmer — horizontal band sweeping slowly
      const sy = ((ts * 0.012) % (H + 80)) - 40;
      const sg = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
      sg.addColorStop(0,   'rgba(135,206,235,0)');
      sg.addColorStop(0.5, 'rgba(135,206,235,0.022)');
      sg.addColorStop(1,   'rgba(135,206,235,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 40, W, 80);

      // 5. Sine-wave texture lines (mimics the silk fabric pattern)
      ctx.save();
      ctx.globalAlpha = 0.018;
      ctx.strokeStyle = `rgb(${R},${G},${B})`;
      ctx.lineWidth   = 1;
      const lineCount = 18;
      for (let i = 0; i < lineCount; i++) {
        const baseY = (i / lineCount) * H;
        const tOff  = ts * 0.0003 * 5; // speed=5 equivalent
        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const y = baseY
            + 18 * Math.sin(8 * (x / W) - tOff)
            + 9  * Math.sin(20 * (x / W) - tOff * 0.5)
            + 5  * Math.cos(3  * (x / W) + ts * 0.00008);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 6. Vignette — pull focus to center
      const vig = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H) * 0.78);
      vig.addColorStop(0,   'rgba(0,0,0,0)');
      vig.addColorStop(0.55,'rgba(0,0,0,0)');
      vig.addColorStop(1,   'rgba(0,0,0,0.6)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:   'fixed',
        inset:      0,
        width:      '100%',
        height:     '100%',
        display:    'block',
        background: '#08080f',   // solid before first frame
        zIndex:     0,
        pointerEvents: 'none',
      }}
    />
  );
};

/* ══════════════════════════════════════════════════════════════
   PRELOADER — counts 0 → 100 over ~3 s, then fades out
══════════════════════════════════════════════════════════════ */
const Preloader = ({ onDone }) => {
  const [count,   setCount]   = useState(0);
  const [leaving, setLeaving] = useState(false);
  const rafRef   = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const DURATION = 3000;
    const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

    const tick = ts => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / DURATION, 1);
      setCount(Math.floor(ease(p) * 100));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setLeaving(true);
          setTimeout(onDone, 650);
        }, 320);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onDone]);

  const status =
    count < 20  ? 'Initializing…'         :
    count < 45  ? 'Loading AI models…'     :
    count < 70  ? 'Connecting interfaces…' :
    count < 90  ? 'Almost ready…'          :
    count < 100 ? 'Finalizing…'            :
                  'Welcome to Protonix.AI';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;700;800&display=swap');
        .pl {
          position:fixed; inset:0; z-index:9999;
          background:#08080f;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          font-family:'Manrope',sans-serif; overflow:hidden;
          transition:opacity 0.65s ease,transform 0.65s ease;
          will-change:opacity,transform;
        }
        .pl.out { opacity:0; transform:scale(1.03); pointer-events:none; }
        .pl::before {
          content:''; position:absolute; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
          opacity:0.28; pointer-events:none;
        }
        .pl-b { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; }
        .pl-b1 { width:480px;height:480px; background:radial-gradient(circle,rgba(52,148,216,0.12),transparent 70%); top:-130px;left:-110px; animation:pld1 9s ease-in-out infinite alternate; }
        .pl-b2 { width:380px;height:380px; background:radial-gradient(circle,rgba(135,206,235,0.09),transparent 70%); bottom:-100px;right:-80px; animation:pld2 11s ease-in-out infinite alternate; }
        .pl-scan { position:absolute;left:0;right:0;height:1px; background:linear-gradient(90deg,transparent,rgba(52,148,216,0.14),transparent); animation:plscan 3s linear infinite; pointer-events:none; }
        .pl-c { position:absolute;font-size:0.57rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(135,206,235,0.16);opacity:0;animation:plin 0.5s 0.5s ease forwards;line-height:1.6; }
        .pl-c.tl{top:26px;left:26px;} .pl-c.tr{top:26px;right:26px;text-align:right;} .pl-c.bl{bottom:26px;left:26px;} .pl-c.br{bottom:26px;right:26px;text-align:right;}
        .pl-logo { display:flex;align-items:center;gap:9px;margin-bottom:50px;opacity:0;animation:plin 0.5s 0.1s ease forwards; }
        .pl-icon { width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#87CEEB,#00BFFF);display:flex;align-items:center;justify-content:center;font-size:1rem;box-shadow:0 0 22px rgba(0,191,255,0.38); }
        .pl-name { font-size:1rem;font-weight:700;color:rgba(255,255,255,0.82);letter-spacing:0.04em; }
        .pl-name span { background:linear-gradient(110deg,#87CEEB,#00BFFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .pl-num { font-size:clamp(5rem,17vw,10.5rem);font-weight:800;line-height:1;letter-spacing:-0.04em; background:linear-gradient(135deg,rgba(255,255,255,0.95) 0%,rgba(135,206,235,0.9) 40%,rgba(0,191,255,0.85) 70%,rgba(165,180,252,0.8) 100%); -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; filter:drop-shadow(0 0 36px rgba(0,191,255,0.22));min-width:3ch;text-align:center;opacity:0;animation:plin 0.5s 0.15s ease forwards; }
        .pl-pct { font-size:clamp(1.3rem,3.5vw,2.2rem);font-weight:300;color:rgba(135,206,235,0.45);vertical-align:super;margin-left:2px; }
        .pl-bar { width:min(320px,78vw);margin-top:36px;opacity:0;animation:plin 0.5s 0.28s ease forwards; }
        .pl-track { width:100%;height:2px;background:rgba(135,206,235,0.09);border-radius:100px;overflow:hidden; }
        .pl-fill { height:100%;border-radius:100px;background:linear-gradient(90deg,#87CEEB,#00BFFF,#a5b4fc);transition:width 0.05s linear;position:relative; }
        .pl-fill::after { content:'';position:absolute;top:0;right:-18px;width:18px;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent);animation:plshim 0.9s ease-in-out infinite; }
        .pl-lbl { margin-top:14px;font-size:0.65rem;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:rgba(135,206,235,0.38);text-align:center;min-height:1em; }
        @keyframes plin    { from{opacity:0;transform:translateY(7px);}to{opacity:1;transform:translateY(0);} }
        @keyframes pld1    { from{transform:translate(0,0) scale(1);}to{transform:translate(55px,38px) scale(1.1);} }
        @keyframes pld2    { from{transform:translate(0,0) scale(1);}to{transform:translate(-45px,-28px) scale(1.08);} }
        @keyframes plscan  { from{top:-1px;}to{top:100%;} }
        @keyframes plshim  { 0%,100%{opacity:0;}50%{opacity:1;} }
      `}</style>

      <div className={`pl${leaving ? ' out' : ''}`}>
        <div className="pl-b pl-b1"/><div className="pl-b pl-b2"/>
        <div className="pl-scan"/>
        <div className="pl-c tl">Protonix.AI<br/>v2.0</div>
        <div className="pl-c tr">Initializing<br/>System</div>
        <div className="pl-c bl">© 2025</div>
        <div className="pl-c br">All AIs,<br/>One Tab</div>
        <div className="pl-logo">
          <div className="pl-icon">✦</div>
          <div className="pl-name">PROTONIX<span>.AI</span></div>
        </div>
        <div className="pl-num">{count}<span className="pl-pct">%</span></div>
        <div className="pl-bar">
          <div className="pl-track">
            <div className="pl-fill" style={{ width:`${count}%` }}/>
          </div>
          <div className="pl-lbl">{status}</div>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════════ */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user,            setUser]            = useState(null);
  const [authReady,       setAuthReady]       = useState(false);
  const [preloaderDone,   setPreloaderDone]   = useState(false);

  useEffect(() => {
    try {
      const token    = localStorage.getItem('protonix_token');
      const userData = localStorage.getItem('protonix_user');
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
    } catch {
      localStorage.removeItem('protonix_token');
      localStorage.removeItem('protonix_user');
    } finally {
      setAuthReady(true);
    }
  }, []);

  const handleLogin = (userData, token) => {
    try {
      localStorage.setItem('protonix_token', token);
      localStorage.setItem('protonix_user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('protonix_token');
    localStorage.removeItem('protonix_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const basename = window.location.hostname.includes('github.io')
    ? '/protonix.ai' : '/';

  return (
    <>
      {/*
        SilkBackground renders immediately — it paints #08080f on
        the very first frame, long before the preloader finishes.
        So when the preloader fades out, the silk bg is already
        running underneath — zero flash of any colour.
      */}
      <SilkBackground />

      {/* App — renders behind preloader, already painted when preloader exits */}
      {authReady && (
        <div style={{
          opacity:    preloaderDone ? 1 : 0,
          visibility: preloaderDone ? 'visible' : 'hidden',
          transition: 'opacity 0.5s ease',
          position:   'relative',
          zIndex:     1,
        }}>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <Router basename={basename}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/login"
                  element={!isAuthenticated ? <LoginPage onLogin={handleLogin}/> : <Navigate to="/chat" replace/>}
                />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPasswordPage onLogin={handleLogin}/>}
                />
                <Route
                  path="/chat"
                  element={isAuthenticated ? <ChatPage user={user} onLogout={handleLogout}/> : <Navigate to="/login" replace/>}
                />
                <Route path="*" element={<Navigate to="/" replace/>}/>
              </Routes>
            </Router>
          </GoogleOAuthProvider>
        </div>
      )}

      {/* Preloader — on top of everything, unmounts after animation */}
      {!preloaderDone && (
        <Preloader onDone={() => setPreloaderDone(true)}/>
      )}
    </>
  );
}

export default App;