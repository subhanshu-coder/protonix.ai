import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState('en-US');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // From your shared code
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk;
        } else {
          interimTranscript += transcriptChunk;
        }
      }

      // Merge final text into the input field
      if (finalTranscript) {
        setInputValue(prev => prev + finalTranscript);
      }
      // Note: we don't 'set' interim to the main state to avoid flickering, 
      // but you see it happening in real-time.
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => console.error("Speech Error:", event.error);
    
    recognitionRef.current = recognition;
  }, [lang]);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Use your API Key to verify session if your provider requires it
      const key = import.meta.env.VITE_STT_API_KEY; 
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-logo">🤖 <span>Protonix.ai</span></div>
        <div className="header-actions">
           {/* Language Selector from your shared logic */}
           <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="hi-IN">Hindi</option>
           </select>
           <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <main className="chat-area">
        <div className="messages-window">
          <div className="bot-welcome">Welcome back, {user?.name || 'Protonix User'}!</div>
        </div>

        {/* This is where the REAL Speech-to-Text happens */}
        <div className="chat-input-section">
          <div className={`input-glow-container ${isListening ? 'active-listening' : ''}`}>
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isListening ? "Listening deeply..." : "Type or click mic to speak..."}
            />
            <button className={`mic-toggle ${isListening ? 'is-on' : ''}`} onClick={toggleMic}>
              {isListening ? '🛑' : '🎤'}
            </button>
            <button className="send-msg-btn">➤</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;