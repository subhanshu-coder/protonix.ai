import React from 'react';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand-section">
            <div className="dashboard-logo">
              <div className="logo-icon">🤖</div>
              <h1 className="brand-title">AI ChatBot Dashboard</h1>
            </div>
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">{user?.avatar || '👨‍💻'}</div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <span>Logout</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h2 className="welcome-title">Welcome back, {user?.name || 'User'}!</h2>
            <p className="welcome-subtitle">
              Manage your AI conversations and explore powerful features
            </p>
          </section>

          {/* Stats Cards */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon ai-icon">🤖</div>
                <div className="stat-content">
                  <h3 className="stat-number">847</h3>
                  <p className="stat-label">AI Conversations</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon chat-icon">💬</div>
                <div className="stat-content">
                  <h3 className="stat-number">23</h3>
                  <p className="stat-label">Active Chats</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon time-icon">⚡</div>
                <div className="stat-content">
                  <h3 className="stat-number">0.8s</h3>
                  <p className="stat-label">Avg Response Time</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon model-icon">🧠</div>
                <div className="stat-content">
                  <h3 className="stat-number">6</h3>
                  <p className="stat-label">AI Models Available</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="actions-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="actions-grid">
              <div className="action-card">
                <div className="action-icon">🚀</div>
                <h4>Start New Chat</h4>
                <p>Begin a conversation with AI</p>
                <button className="action-btn">Start Chat</button>
              </div>
              
              <div className="action-card">
                <div className="action-icon">📊</div>
                <h4>View Analytics</h4>
                <p>Check your usage statistics</p>
                <button className="action-btn">View Stats</button>
              </div>
              
              <div className="action-card">
                <div className="action-icon">⚙️</div>
                <h4>Settings</h4>
                <p>Customize your preferences</p>
                <button className="action-btn">Open Settings</button>
              </div>
              
              <div className="action-card">
                <div className="action-icon">🎯</div>
                <h4>AI Models</h4>
                <p>Switch between AI models</p>
                <button className="action-btn">Explore Models</button>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="activity-section">
            <h3 className="section-title">Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">💬</div>
                <div className="activity-content">
                  <h4>Chat with GPT-4</h4>
                  <p>Discussed project planning strategies</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">🤖</div>
                <div className="activity-content">
                  <h4>Claude Conversation</h4>
                  <p>Code review and optimization</p>
                  <span className="activity-time">5 hours ago</span>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon">⚡</div>
                <div className="activity-content">
                  <h4>Perplexity Search</h4>
                  <p>Research on AI technologies</p>
                  <span className="activity-time">1 day ago</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
