import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardSwap, { Card } from './CardSwap';
import LogoImage from '../assets/LogoImage.svg'; // Import your SVG logo
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
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
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      setTimeout(() => {
        setIsLoading(false);
        const mockUser = {
          id: '1',
          name: formData.fullName || 'AI User',
          email: formData.email,
          avatar: '👨‍💻'
        };
        
        if (onLogin) {
          onLogin(mockUser, 'mock-token-' + Date.now());
        }
        
        if (navigate) {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (error) {
      console.error('Auth error:', error);
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        const googleUser = {
          id: 'google-' + Date.now(),
          name: 'Google User',
          email: 'user@gmail.com',
          avatar: '👨‍💼'
        };
        
        if (onLogin) {
          onLogin(googleUser, 'google-token-' + Date.now());
        }
        
        if (navigate) {
          navigate('/dashboard');
        }
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setError('Google login failed');
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    });
    setError('');
  };

  const switchAuthMode = (loginMode) => {
    setIsLogin(loginMode);
    resetForm();
  };

  return (
    <div className="compressed-login-page">
      {/* Left Side - Login Form */}
      <div className="login-form-area">
        <div className="form-container">
          {/* Brand Header with Logo */}
          <div className="brand-header">
            <div className="brand-logo">
              <div className="ai-icon">
                <img src={LogoImage} alt="AI ChatBot Logo" className="logo-image" />
              </div>
              <h1 className="brand-name">PROTONIX.AI</h1>
            </div>
            <h2 className="form-title">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
          </div>

          {/* Auth Tabs */}
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

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Social Login */}
          <button
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="social-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">
            <span>or continue with email</span>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="compact-form">
            {!isLogin && (
              <div className="form-group">
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="Full Name"
                />
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Email Address"
              />
            </div>

            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Password"
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
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder="Confirm Password"
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
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading && <span className="loading-spinner"></span>}
              {isLoading 
                ? (isLogin ? 'Signing In...' : 'Creating Account...') 
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </button>
          </form>

          {isLogin && (
            <div className="forgot-password">
              <a href="#forgot">Forgot Password?</a>
            </div>
          )}

          <div className="form-footer">
            {isLogin ? (
              <>Don't have an account? <button onClick={() => switchAuthMode(false)}>Sign up for free</button></>
            ) : (
              <>Already have an account? <button onClick={() => switchAuthMode(true)}>Sign in</button></>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - CardSwap */}
      <div className="cards-visual-area">
        <CardSwap
          width={550}          // Bigger cards
          height={380}         // Bigger cards
          cardDistance={80}    // Increased spacing
          verticalDistance={90} // Increased spacing
          delay={3500}
          pauseOnHover={false}
          skewAmount={4}
          easing="elastic"
        >
          <Card customClass="card-1" />
          <Card customClass="card-2" />
          <Card customClass="card-3" />
          <Card customClass="card-4" />
          <Card customClass="card-5" />
        </CardSwap>
      </div>
    </div>
  );
};

export default LoginPage;
