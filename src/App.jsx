import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import LoginPage         from './components/LoginPage';
import ChatPage          from './components/ChatPage';
import LandingPage       from './components/LandingPage';
import ResetPasswordPage from './components/Resetpasswordpage';
import Silk              from './components/Silk';

import './App.css';

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
      {/* Silk WebGL background — fixed, covers full viewport, behind everything */}
      <div style={{
        position:      'fixed',
        inset:         0,
        width:         '100%',
        height:        '100%',
        zIndex:        0,
        pointerEvents: 'none',
        background:    '#08080f',
      }}>
        <Silk
          speed={5}
          scale={1}
          color="#3494d8"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

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