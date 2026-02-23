// ResetPasswordPage.jsx
// Add this route in your App.jsx:
// <Route path="/reset-password/:token" element={<ResetPasswordPage onLogin={handleLogin}/>}/>

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LogoImage from '../assets/LogoImage.svg';
import './LoginPage.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const getStrength = (p) => {
  let s = 0;
  if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
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
        {[1,2,3,4].map(i => <div key={i} className={`pwd-bar ${i <= s ? cls : ''}`}/>)}
      </div>
      <span className="pwd-strength-label">{lbl}</span>
    </div>
  );
};

const ResetPasswordPage = ({ onLogin }) => {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [pwd, setPwd]       = useState('');
  const [conf, setConf]     = useState('');
  const [showP, setShowP]   = useState(false);
  const [showC, setShowC]   = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [alert, setAlert]   = useState(null);
  const [errs, setErrs]     = useState({});

  const handleReset = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!pwd)          e2.pwd  = 'Password is required';
    else if (pwd.length < 8) e2.pwd = 'Min 8 characters';
    if (pwd !== conf)  e2.conf = 'Passwords do not match';
    setErrs(e2); if (Object.keys(e2).length) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/reset-password/${token}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ password: pwd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');
      localStorage.setItem('protonix_token', data.token);
      if (onLogin) onLogin(data.user);
      setAlert({ type:'success', text:'Password reset! Redirecting…' });
      setTimeout(() => navigate('/chat'), 1500);
    } catch (err) {
      setAlert({ type:'error', text: err.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="compressed-login-page">
      <div className="login-form-area" style={{flex:1}}>
        <div className="form-container">
          <div className="brand-header">
            <div className="brand-logo">
              <div className="ai-icon">
                <img src={LogoImage} alt="PROTONIX.AI" className="logo-image"/>
              </div>
              <h1 className="brand-name">PROTONIX.AI</h1>
            </div>
            <h2 className="form-title">Set New Password</h2>
          </div>

          {alert && (
            <div className={`error-message ${alert.type==='success'?'success-message':''}`}>
              {alert.type==='success'?'✓ ':'⚠ '}{alert.text}
            </div>
          )}

          <form onSubmit={handleReset} className="compact-form">
            <div className="form-group">
              <div className="password-wrapper">
                <input type={showP?'text':'password'} className={`form-input ${errs.pwd?'input-error':''}`}
                  placeholder="New password (min 8 characters)" value={pwd}
                  onChange={e => { setPwd(e.target.value); setErrs(p=>({...p,pwd:''})); }}/>
                <button type="button" className="password-toggle" onClick={() => setShowP(v=>!v)}>
                  {showP ? <EyeOff/> : <EyeOpen/>}
                </button>
              </div>
              {errs.pwd && <p className="field-error">⚠ {errs.pwd}</p>}
              <StrengthBar password={pwd}/>
            </div>
            <div className="form-group">
              <div className="password-wrapper">
                <input type={showC?'text':'password'} className={`form-input ${errs.conf?'input-error':''}`}
                  placeholder="Confirm new password" value={conf}
                  onChange={e => { setConf(e.target.value); setErrs(p=>({...p,conf:''})); }}/>
                <button type="button" className="password-toggle" onClick={() => setShowC(v=>!v)}>
                  {showC ? <EyeOff/> : <EyeOpen/>}
                </button>
              </div>
              {errs.conf && <p className="field-error">⚠ {errs.conf}</p>}
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading || alert?.type==='success'}>
              {isLoading ? <><span className="loading-spinner"/>Resetting…</> : 'Reset Password'}
            </button>
          </form>

          <div className="form-footer" style={{marginTop:'14px'}}>
            <button onClick={() => navigate('/login')}>← Back to sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;