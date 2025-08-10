import React, { useState } from 'react';
import CardSwap, { Card } from './CardSwap';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log(isLogin ? 'Login attempt:' : 'Signup attempt:', formData);
      // Add your authentication logic here
      setTimeout(() => {
        setIsLoading(false);
        alert(isLogin ? 'Welcome to AI ChatBot!' : 'Account created successfully!');
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      console.error('Auth error:', error);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Add Google OAuth logic here
  };

  const handleGitHubLogin = () => {
    console.log('GitHub login clicked');
    // Add GitHub OAuth logic here
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
  };

  const switchAuthMode = (loginMode) => {
    setIsLogin(loginMode);
    resetForm();
  };

  return (
    <div className="login-page">
      {/* Animated Background - Left Side */}
      <CardSwap
        width={280}
        height={200}
        cardDistance={40}
        verticalDistance={50}
        delay={3000}
        pauseOnHover={false}
        skewAmount={3}
        easing="elastic"
      >
        <Card customClass="card-1" />
        <Card customClass="card-2" />
        <Card customClass="card-3" />
        <Card customClass="card-4" />
        <Card customClass="card-5" />
      </CardSwap>

      {/* Login/Signup Form - Right Side */}
      <div className="login-container">
        <div className="login-header">
          <div className="brand-section">
            <div className="ai-icon">
              🤖
            </div>
            <h1 className="brand-name">AI ChatBot</h1>
          </div>
          <h2 className="login-title">
            {isLogin ? 'Welcome Back' : 'Join the Future'}
          </h2>
          <p className="login-subtitle">
            {isLogin ? 'Continue your AI conversations' : 'Start your AI journey today'}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => switchAuthMode(true)}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => switchAuthMode(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Social Login Buttons */}
        <div className="social-login-section">
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleLogin}
          >
            <svg className="social-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="github-btn"
            onClick={handleGitHubLogin}
          >
            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-btn"
            disabled={isLoading}
          >
            {isLoading && <span className="loading-spinner"></span>}
            {isLoading 
              ? (isLogin ? 'Signing In...' : 'Creating Account...') 
              : (isLogin ? 'Sign In to AI ChatBot' : 'Create AI Account')
            }
          </button>
        </form>

        {isLogin && (
          <div className="forgot-password">
            <a href="#forgot">Forgot your password?</a>
          </div>
        )}

        <div className="form-footer">
          {isLogin ? (
            <>Don't have an account? <a href="#signup" onClick={() => switchAuthMode(false)}>Sign up for free</a></>
          ) : (
            <>Already have an account? <a href="#login" onClick={() => switchAuthMode(true)}>Sign in</a></>
          )}
        </div>

        {/* AI Features Section */}
        <div className="ai-features">
          <h4>🚀 What's waiting for you:</h4>
          <ul>
            <li>Advanced AI conversations</li>
            <li>Smart assistance & automation</li>
            <li>Personalized AI experience</li>
            <li>24/7 intelligent support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
