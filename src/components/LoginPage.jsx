import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import CardSwap, { Card } from './CardSwap';
import LogoImage from '../assets/LogoImage.svg';
import './LoginPage.css';

// CORRECTION: Ensure this variable matches the key you set in Netlify exactly.
// The fallback is only for local development.
const API = import.meta.env.VITE_API_URL;

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
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [view, setView]         = useState('signin');
  const [isLoading, setLoading] = useState(false);
  const [alert, setAlert]       = useState(null);
  const [showPwd, setShowPwd]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errs, setErrs]         = useState({});
  const [fields, setFields]     = useState({ firstName:'', lastName:'', email:'', password:'', confirmPassword:'' });

  const setField = (k, v) => {
    setFields(p => ({ ...p, [k]: v }));
    setErrs(p => ({ ...p, [k]: '' }));
    setAlert(null);
  };
  const switchView = (v) => {
    setView(v); setAlert(null); setErrs({});
    setFields({ firstName:'', lastName:'', email:'', password:'', confirmPassword:'' });
    setShowPwd(false); setShowConf(false);
  };
  const handleSuccess = (data) => {
    if (onLogin) onLogin(data.user, data.token);
    navigate('/chat');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const googleUserInfo = await userInfoRes.json();
        const res = await fetch(`${API}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleUserInfo, accessToken: tokenResponse.access_token })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Google auth failed');
        handleSuccess(data);
      } catch (err) {
        setAlert({ type: 'error', text: err.message || 'Google sign-in failed.' });
      } finally { setLoading(false); }
    },
    onError: () => setAlert({ type: 'error', text: 'Google sign-in was cancelled.' }),
    flow: 'implicit',
    ux_mode: 'popup',
  });

  const handleSignIn = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!fields.email) e2.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(fields.email)) e2.email = 'Enter a valid email';
    if (!fields.password) e2.password = 'Password is required';
    setErrs(e2); if (Object.keys(e2).length) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: fields.email, password: fields.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      handleSuccess(data);
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!fields.firstName.trim()) e2.firstName = 'Required';
    if (!fields.lastName.trim())  e2.lastName  = 'Required';
    if (!fields.email) e2.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(fields.email)) e2.email = 'Enter a valid email';
    if (!fields.password) e2.password = 'Password is required';
    else if (fields.password.length < 8) e2.password = 'Min 8 characters';
    if (fields.password !== fields.confirmPassword) e2.confirmPassword = 'Passwords do not match';
    setErrs(e2); if (Object.keys(e2).length) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ fullName:`${fields.firstName} ${fields.lastName}`, email:fields.email, password:fields.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      handleSuccess(data);
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    const e2 = {};
    if (!fields.email) e2.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(fields.email)) e2.email = 'Enter a valid email';
    setErrs(e2); if (Object.keys(e2).length) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: fields.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAlert({ type: 'success', text: data.message });
    } catch (err) {
      setAlert({ type: 'error', text: err.message });
    } finally { setLoading(false); }
  };

  const Alert = () => alert ? (
    <div className={`error-message ${alert.type === 'success' ? 'success-message' : ''}`}>
      {alert.type === 'success' ? '✓ ' : '⚠ '}{alert.text}
    </div>
  ) : null;

  const GBtn = () => (
    <button className="google-btn" onClick={() => googleLogin()} disabled={isLoading} type="button">
      <GoogleIcon /> Continue with Google
    </button>
  );

  const Divider = () => <div className="divider"><span>or continue with email</span></div>;

  return (
    <div className="compressed-login-page">

      {/* ── LEFT: Form ── */}
      <div className="login-form-area">
        <div className="form-container">

          <div className="brand-header">
            <div className="brand-logo">
              <div className="ai-icon">
                <img src={LogoImage} alt="PROTONIX.AI" className="logo-image"/>
              </div>
              <h1 className="brand-name">PROTONIX.AI</h1>
            </div>
            <h2 className="form-title">
              {view === 'signin' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
          </div>

          {view !== 'forgot' && (
            <div className="auth-tabs">
              <button className={`auth-tab ${view==='signin'?'active':''}`} onClick={() => switchView('signin')}>Sign In</button>
              <button className={`auth-tab ${view==='signup'?'active':''}`} onClick={() => switchView('signup')}>Sign Up</button>
            </div>
          )}

          {/* ── SIGN IN ── */}
          {view === 'signin' && <>
            <Alert/>
            <GBtn/>
            <Divider/>
            <form onSubmit={handleSignIn} className="compact-form" autoComplete="off">
              <div className="form-group">
                <input
                  type="email"
                  className={`form-input ${errs.email?'input-error':''}`}
                  placeholder="Email Address"
                  value={fields.email}
                  autoComplete="off"
                  onChange={e => setField('email', e.target.value)}
                />
                {errs.email && <p className="field-error">⚠ {errs.email}</p>}
              </div>
              <div className="form-group">
                <div className="password-wrapper">
                  <input
                    type={showPwd?'text':'password'}
                    className={`form-input ${errs.password?'input-error':''}`}
                    placeholder="Password"
                    value={fields.password}
                    autoComplete="new-password"
                    onChange={e => setField('password', e.target.value)}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPwd(v=>!v)}>
                    {showPwd ? <EyeOff/> : <EyeOpen/>}
                  </button>
                </div>
                {errs.password && <p className="field-error">⚠ {errs.password}</p>}
              </div>
              <div className="forgot-password">
                <button type="button" className="forgot-link" onClick={() => switchView('forgot')}>Forgot Password?</button>
              </div>
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? <><span className="loading-spinner"/>Signing In…</> : 'Sign In'}
              </button>
            </form>
            <div className="form-footer">
              Don't have an account? <button onClick={() => switchView('signup')}>Sign up for free</button>
            </div>
          </>}

          {/* ── SIGN UP ── */}
          {view === 'signup' && <>
            <Alert/>
            <GBtn/>
            <Divider/>
            <form onSubmit={handleSignUp} className="compact-form" autoComplete="off">
              <div className="two-col">
                <div className="form-group">
                  <input type="text" className={`form-input ${errs.firstName?'input-error':''}`}
                    placeholder="First Name" value={fields.firstName} autoComplete="off"
                    onChange={e => setField('firstName', e.target.value)}/>
                  {errs.firstName && <p className="field-error">⚠ {errs.firstName}</p>}
                </div>
                <div className="form-group">
                  <input type="text" className={`form-input ${errs.lastName?'input-error':''}`}
                    placeholder="Last Name" value={fields.lastName} autoComplete="off"
                    onChange={e => setField('lastName', e.target.value)}/>
                  {errs.lastName && <p className="field-error">⚠ {errs.lastName}</p>}
                </div>
              </div>
              <div className="form-group">
                <input type="email" className={`form-input ${errs.email?'input-error':''}`}
                  placeholder="Email Address" value={fields.email} autoComplete="off"
                  onChange={e => setField('email', e.target.value)}/>
                {errs.email && <p className="field-error">⚠ {errs.email}</p>}
              </div>
              <div className="two-col">
                <div className="form-group">
                  <div className="password-wrapper">
                    <input type={showPwd?'text':'password'} className={`form-input ${errs.password?'input-error':''}`}
                      placeholder="Password" value={fields.password} autoComplete="new-password"
                      onChange={e => setField('password', e.target.value)}/>
                    <button type="button" className="password-toggle" onClick={() => setShowPwd(v=>!v)}>
                      {showPwd ? <EyeOff/> : <EyeOpen/>}
                    </button>
                  </div>
                  {errs.password && <p className="field-error">⚠ {errs.password}</p>}
                  <StrengthBar password={fields.password}/>
                </div>
                <div className="form-group">
                  <div className="password-wrapper">
                    <input type={showConf?'text':'password'} className={`form-input ${errs.confirmPassword?'input-error':''}`}
                      placeholder="Confirm" value={fields.confirmPassword} autoComplete="new-password"
                      onChange={e => setField('confirmPassword', e.target.value)}/>
                    <button type="button" className="password-toggle" onClick={() => setShowConf(v=>!v)}>
                      {showConf ? <EyeOff/> : <EyeOpen/>}
                    </button>
                  </div>
                  {errs.confirmPassword && <p className="field-error">⚠ {errs.confirmPassword}</p>}
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={isLoading} style={{marginTop:'4px'}}>
                {isLoading ? <><span className="loading-spinner"/>Creating Account…</> : 'Create Account'}
              </button>
            </form>
            <p className="terms-note">By signing up you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>.</p>
            <div className="form-footer">
              Already have an account? <button onClick={() => switchView('signin')}>Sign in</button>
            </div>
          </>}

          {/* ── FORGOT PASSWORD ── */}
          {view === 'forgot' && <>
            <button className="back-link" onClick={() => switchView('signin')}>← Back to sign in</button>
            <Alert/>
            <form onSubmit={handleForgot} className="compact-form" autoComplete="off">
              <div className="form-group">
                <input type="email" className={`form-input ${errs.email?'input-error':''}`}
                  placeholder="Your registered email" value={fields.email} autoComplete="off"
                  onChange={e => setField('email', e.target.value)}/>
                {errs.email && <p className="field-error">⚠ {errs.email}</p>}
              </div>
              <button type="submit" className="submit-btn" disabled={isLoading || alert?.type==='success'}>
                {isLoading ? <><span className="loading-spinner"/>Sending…</> : 'Send Reset Link'}
              </button>
            </form>
            <div className="form-footer" style={{marginTop:'14px'}}>
              Remember your password? <button onClick={() => switchView('signin')}>Sign in</button>
            </div>
          </>}

        </div>
      </div>

      {/* ── RIGHT: CardSwap ── */}
      <div className="cards-visual-area">
        <CardSwap
          width={500} height={360}
          cardDistance={70} verticalDistance={80}
          delay={3500} pauseOnHover={false}
          skewAmount={4} easing="elastic"
        >
          <Card customClass="card-1"/>
          <Card customClass="card-2"/>
          <Card customClass="card-3"/>
          <Card customClass="card-4"/>
          <Card customClass="card-5"/>
        </CardSwap>
      </div>

    </div>
  );
};

export default LoginPage;