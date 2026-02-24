// main.jsx — wrap your entire App with GoogleOAuthProvider
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

// Use environment variable for Google Client ID (can be overridden in .env)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '284288639436-mmf0fvddlca01cu9rhtrc5qrs00g8uqh.apps.googleusercontent.com';

// NOTE: BrowserRouter stays inside App.jsx — do NOT add it here
ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
