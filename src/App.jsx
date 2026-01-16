import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ✅ All component imports
import LoginPage from './components/LoginPage';
import ChatPage from './components/ChatPage'; // Renamed from Dashboard to ChatPage for your workspace
import LandingPage from './components/LandingPage';

import './App.css'; //

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData, token) => {
    try {
      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Update state
      setIsAuthenticated(true);
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Update state
    setIsAuthenticated(false);
    setUser(null);
    // Note: Navigation to home happens inside ChatPage via useNavigate() after calling this
  };

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="loading-screen" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, rgba(135, 206, 235, 0.1) 25%, #1a1a2e 50%, rgba(0, 191, 255, 0.1) 75%, #16213e 100%)',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(135, 206, 235, 0.3)',
          borderTop: '4px solid rgba(135, 206, 235, 1.0)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '25px'
        }}></div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#fff' }}>Loading Protonix.AI...</h2>
      </div>
    );
  }
  
  // Basename for GitHub Pages support
  const basename = window.location.hostname === 'localhost' ? '/' : '/protonix.ai';
  
  return (
    <Router basename={basename}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Login: Opens first, then redirects to /chat */}
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <LoginPage onLogin={handleLogin} />
            ) : (
              <Navigate to="/chat" replace /> // Redirects to Chat chatbot page after login
            )
          } 
        />
        
        {/* Protected Chat Route: Only accessible if authenticated */}
        <Route 
          path="/chat" 
          element={
            isAuthenticated ? (
              <ChatPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Fallback route - redirects unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; //