// ResetPasswordPage.jsx
// Route: /reset-password/:token
// Add to App.jsx: <Route path="/reset-password/:token" element={<ResetPasswordPage />}/>

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LogoImage from '../assets/LogoImage.svg';
import './LoginPage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const getStrength = (p) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

const StrengthBar = ({ password }) => {
  if (!password) return null;
  const s = getStrength(password);
  const cls = s <= 1 ? 'active-weak' : s <= 2 ? 'active-fair' : 'active-strong';
  const lbl = s <= 1 ? '⚠ Weak' : s <= 2 ? '◐ Fair' : s <= 3 ? '✓ Strong' : '✦ Very strong';
  return (
    <div className="pwd-strength">
      <div className="pwd-strength-bars">
        {[1, 2, 3, 4].map(i => <div key={i} className={`pwd-bar ${i <= s ? cls : ''}`} />)}
      </div>
      <span className="pwd-strength-label">{lbl}</span>
    </div>
  );
};

// ── Countdown timer component ──────────────────────────────────────────────────
const Countdown = ({ seconds }) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const pct = (seconds / 900) * 100; // 900 = 15 mins
  const color = seconds < 120 ? '#ef4444' : seconds < 300 ? '#f59e0b' : '#10b981';
  return (
    <div className="countdown-wrap">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
        <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${2 * Math.PI * 20}`}
          strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke .5s' }}
        />
      </svg>
      <div className="countdown-time" style={{ color }}>
        {m}:{s.toString().padStart(2, '0')}
      </div>
      <span className="countdown-label">remaining</span>
    </div>
  );
};

const ResetPasswordPage = ({ onLogin }) => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState('form'); // 'form' | 'success' | 'expired'
  const [pwd, setPwd] = useState('');
  const [conf, setConf] = useState('');
  const [showP, setShowP] = useState(false);
  const [showC, setShowC] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [errs, setErrs] = useState({});
  const [alert, setAlert] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins in seconds
  const [redirectIn, setRedirectIn] = useState(5);

  // ── Countdown timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'form') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); setStep('expired'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // ── Auto redirect after success ──────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'success') return;
    const timer = setInterval(() => {
      setRedirectIn(t => {
        if (t <= 1) { clearInterval(timer); navigate('/chat'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, navigate]);

  // ── Validate token exists ────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || token.length < 10) setStep('expired');
  }, [token]);

  // ── Handle reset ─────────────────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!pwd) e2.pwd = 'Password is required';
    else if (pwd.length < 8) e2.pwd = 'Minimum 8 characters';
    else if (getStrength(pwd) < 2) e2.pwd = 'Password is too weak';
    if (pwd !== conf) e2.conf = 'Passwords do not match';
    setErrs(e2);
    if (Object.keys(e2).length) return;

    setLoading(true);
    setAlert(null);
    try {
      const res = await fetch(`${API}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.message?.includes('invalid') || data.message?.includes('expired')) {
          setStep('expired');
        } else {
          throw new Error(data.message || 'Reset failed');
        }
        return;
      }
      // Log in via parent handler (handles storage + state)
      if (onLogin) onLogin(data.user, data.token);
      setStep('success');
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── EXPIRED STATE ─────────────────────────────────────────────────────────────
  if (step === 'expired') return (
    <div className="compressed-login-page" style={{ justifyContent: 'center' }}>
      <div className="login-form-area" style={{ flex: '0 0 100%', maxWidth: '460px' }}>
        <div className="form-container">
          <div className="brand-header">
            <div className="brand-logo">
              <div className="ai-icon"><img src={LogoImage} alt="PROTONIX.AI" className="logo-image" /></div>
              <h1 className="brand-name">PROTONIX.AI</h1>
            </div>
          </div>

          <div className="reset-state-card expired-card">
            <div className="state-icon">⏰</div>
            <h2 className="state-title">Link Expired</h2>
            <p className="state-desc">
              This password reset link has expired or is invalid.
              Reset links are only valid for <strong>15 minutes</strong> for security.
            </p>
            <button className="submit-btn" onClick={() => navigate('/login')} style={{ marginTop: '8px' }}>
              Request New Reset Link
            </button>
          </div>

          <div className="form-footer" style={{ marginTop: '16px' }}>
            Remember your password? <button onClick={() => navigate('/login')}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── SUCCESS STATE ─────────────────────────────────────────────────────────────
  if (step === 'success') return (
    <div className="compressed-login-page" style={{ justifyContent: 'center' }}>
      <div className="login-form-area" style={{ flex: '0 0 100%', maxWidth: '460px' }}>
        <div className="form-container">
          <div className="brand-header">
            <div className="brand-logo">
              <div className="ai-icon"><img src={LogoImage} alt="PROTONIX.AI" className="logo-image" /></div>
              <h1 className="brand-name">PROTONIX.AI</h1>
            </div>
          </div>

          <div className="reset-state-card success-card">
            <div className="success-checkmark">
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none" stroke="#10b981" strokeWidth="2" />
                <path fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  d="M14 27l8 8 16-16" strokeDasharray="40" strokeDashoffset="0"
                  style={{ animation: 'checkDraw .5s ease forwards' }}
                />
              </svg>
            </div>
            <h2 className="state-title" style={{ color: '#6ee7b7' }}>Password Reset!</h2>
            <p className="state-desc">
              Your password has been successfully updated.
              You're now logged in and will be redirected in <strong>{redirectIn}s</strong>.
            </p>
            <button className="submit-btn" onClick={() => navigate('/chat')}>
              Go to Chat Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── FORM STATE ────────────────────────────────────────────────────────────────
  return (
    <div className="compressed-login-page" style={{ justifyContent: 'center' }}>
      <div className="login-form-area" style={{ flex: '0 0 100%', maxWidth: '460px' }}>
        <div className="form-container">

          <div className="brand-header">
            <div className="brand-logo">
              <div className="ai-icon"><img src={LogoImage} alt="PROTONIX.AI" className="logo-image" /></div>
              <h1 className="brand-name">PROTONIX.AI</h1>
            </div>
            <h2 className="form-title">Set New Password</h2>
            <p className="form-subtitle">Choose a strong password for your account</p>
          </div>

          {/* Timer */}
          <div className="timer-section">
            <Countdown seconds={timeLeft} />
            <p className="timer-note">
              {timeLeft < 120
                ? '⚠ Link expiring soon!'
                : 'This link expires in 15 minutes'}
            </p>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`error-message ${alert.type === 'success' ? 'success-message' : ''}`}>
              {alert.type === 'success' ? '✓ ' : '⚠ '}{alert.text}
            </div>
          )}

          <form onSubmit={handleReset} className="compact-form" autoComplete="off">

            {/* New Password */}
            <div className="form-group">
              <label className="reset-label">New Password</label>
              <div className="password-wrapper">
                <input
                  type={showP ? 'text' : 'password'}
                  className={`form-input ${errs.pwd ? 'input-error' : ''}`}
                  placeholder="Min 8 characters"
                  value={pwd}
                  autoComplete="new-password"
                  onChange={e => { setPwd(e.target.value); setErrs(p => ({ ...p, pwd: '' })); }}
                />
                <button type="button" className="password-toggle" onClick={() => setShowP(v => !v)}>
                  {showP ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {errs.pwd && <p className="field-error">⚠ {errs.pwd}</p>}
              <StrengthBar password={pwd} />
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="reset-label">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showC ? 'text' : 'password'}
                  className={`form-input ${errs.conf ? 'input-error' : ''}`}
                  placeholder="Repeat your new password"
                  value={conf}
                  autoComplete="new-password"
                  onChange={e => { setConf(e.target.value); setErrs(p => ({ ...p, conf: '' })); }}
                />
                <button type="button" className="password-toggle" onClick={() => setShowC(v => !v)}>
                  {showC ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {errs.conf && <p className="field-error">⚠ {errs.conf}</p>}
              {/* Match indicator */}
              {conf && pwd && (
                <p style={{ fontSize: '.74rem', marginTop: '3px', color: pwd === conf ? '#6ee7b7' : '#fca5a5' }}>
                  {pwd === conf ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Password requirements */}
            <div className="pwd-requirements">
              <p className="req-title">Password must have:</p>
              <ul>
                <li className={pwd.length >= 8 ? 'met' : ''}>At least 8 characters</li>
                <li className={/[A-Z]/.test(pwd) ? 'met' : ''}>One uppercase letter</li>
                <li className={/[0-9]/.test(pwd) ? 'met' : ''}>One number</li>
                <li className={/[^A-Za-z0-9]/.test(pwd) ? 'met' : ''}>One special character (!@#$...)</li>
              </ul>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading} style={{ marginTop: '6px' }}>
              {isLoading
                ? <><span className="loading-spinner" />Resetting Password…</>
                : '🔐 Reset Password'
              }
            </button>
          </form>

          <div className="form-footer" style={{ marginTop: '14px' }}>
            Remember your password? <button onClick={() => navigate('/login')}>Sign in</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;