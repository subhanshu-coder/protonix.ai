// main.jsx — wrap your entire App with GoogleOAuthProvider
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

// NOTE: BrowserRouter stays inside App.jsx — do NOT add it here
ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="284288639436-mmf0fvddlca01cu9rhtrc5qrs00g8uqh.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);