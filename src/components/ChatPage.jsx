import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, Settings, Menu, User, 
  Mic, MicOff, MessageSquare, X, Wand2, LogOut, Loader2
} from 'lucide-react';

// Local Asset Imports
import gptLogo from '../assets/logos/gpt.png';
import claudeLogo from '../assets/logos/claude.png';
import geminiLogo from '../assets/logos/gemini.png';
import perplexityLogo from '../assets/logos/perplexity.png';
import deepseekLogo from '../assets/logos/deepseek.png';
import grokLogo from '../assets/logos/grok.png';

const ChatPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [selectedBot, setSelectedBot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Voice & Audio State
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);

  // ✅ NEW: Purify State
  const [isPurifying, setIsPurifying] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isListeningRef = useRef(false);
  const textRef = useRef('');
  const silenceTimer = useRef(null);
  const textareaRef = useRef(null);

  const bots = [
    { id: 'gpt', name: 'ChatGPT', logo: gptLogo, accent: '#10a37f' },
    { id: 'claude', name: 'Claude', logo: claudeLogo, accent: '#d97757' },
    { id: 'gemini', name: 'Gemini', logo: geminiLogo, accent: '#4285f4' },
    { id: 'perplexity', name: 'Perplexity', logo: perplexityLogo, accent: '#20b2aa' },
    { id: 'deepseek', name: 'DeepSeek', logo: deepseekLogo, accent: '#4d6df1' },
    { id: 'grok', name: 'Grok', logo: grokLogo, accent: '#ffffff' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  // --- VOICE LOGIC (Same as before) ---
  const handleVoiceToggle = async () => {
    if (isListening) {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateVisualizer = () => {
        if (!analyserRef.current || !isListeningRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(avg);
        requestAnimationFrame(updateVisualizer);
      };

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true; 
        textRef.current = inputMessage; 
        updateVisualizer(); 
      };

      recognitionRef.current.onresult = (e) => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        silenceTimer.current = setTimeout(() => {
          recognitionRef.current.stop();
        }, 2500);

        const currentTranscript = Array.from(e.results)
          .map(result => result[0].transcript)
          .join('');

        const prefix = textRef.current;
        const spacing = prefix && !prefix.endsWith(' ') ? ' ' : '';
        setInputMessage(prefix + spacing + currentTranscript);
      };

      recognitionRef.current.onend = () => {
        if (silenceTimer.current) clearTimeout(silenceTimer.current);
        setIsListening(false);
        isListeningRef.current = false; 
        setVolume(0);
        stream.getTracks().forEach(track => track.stop());
      };

      recognitionRef.current.start();

    } catch (err) {
      console.error("Mic access denied:", err);
      setIsListening(false);
    }
  };

  // --- ✅ NEW: PROMPT PURIFIER LOGIC ---
  const handlePurify = async () => {
    if (!inputMessage.trim()) return;
    
    setIsPurifying(true);

    // 1. SIMULATED DELAY (To look like AI is thinking)
    await new Promise(r => setTimeout(r, 800));

    // 2. LOGIC: Here you would ideally call your Backend API:
    // const response = await fetch('/api/purify', { body: { text: inputMessage } });
    // const newText = await response.text();

    // 3. MOCK LOGIC (For now, use basic rules to demonstrate)
    let optimized = inputMessage.trim();
    
    // Rule A: Capitalize First Letter
    optimized = optimized.charAt(0).toUpperCase() + optimized.slice(1);
    
    // Rule B: Add Punctuation if missing
    if (!/[.?!]$/.test(optimized)) {
      optimized += "?"; // Assume question by default
    }

    // Rule C: Heuristic Enhancements (The "Best Prompt" logic)
    const lower = optimized.toLowerCase();
    
    if (lower.includes("code") || lower.includes("script") || lower.includes("function")) {
       optimized = `Act as an expert Senior Developer. ${optimized} Please ensure the code is clean, efficient, and well-commented.`;
    } else if (lower.includes("explain") || lower.includes("what is")) {
       optimized = `Provide a clear, comprehensive explanation of the following concept: "${optimized}". Use analogies if helpful.`;
    } else if (lower.includes("image") || lower.includes("picture")) {
       optimized = `Generate a highly detailed prompt for an image generation model based on: "${optimized}". Include lighting, style, and composition details.`;
    } else {
      // General Grammar Fix Wrapper
      optimized = `Rephrase and optimize the following request for clarity and precision: "${optimized}"`;
    }

    setInputMessage(optimized);
    setIsPurifying(false);
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    let targets = [];
    const lowerInput = inputMessage.toLowerCase();
    
    if (lowerInput.includes("@all")) {
      targets = bots;
    } else {
      const tagged = bots.filter(b => lowerInput.includes(`@${b.id}`));
      targets = tagged.length > 0 ? tagged : (selectedBot ? [selectedBot] : []);
    }
    
    if (targets.length === 0) return;

    const userMsg = { text: inputMessage, sender: 'user', time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    
    if (messages.length === 0) {
      setChatHistory([{ id: Date.now(), title: inputMessage.slice(0, 25) + "..." }, ...chatHistory]);
    }

    targets.forEach((bot, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: `[${bot.name}]: I've analyzed your request and generated a specialized response.`, 
          sender: 'bot', 
          botLogo: bot.logo,
          isVerticalFull: targets.length > 1,
          time: new Date().toLocaleTimeString() 
        }]);
      }, 800 + (index * 250));
    });
    
    setInputMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      handleSend();
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: isDarkMode ? '#0d0d0e' : '#f8fafc', color: isDarkMode ? '#fff' : '#1e293b', transition: '0.3s' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? '280px' : '0', background: isDarkMode ? '#171719' : '#fff', borderRight: '1px solid #33333322', transition: '0.3s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px', flex: 1 }}>
          <button onClick={() => {setMessages([]); setSelectedBot(null);}} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+ New Chat</button>
          
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '11px', opacity: 0.5, fontWeight: 'bold' }}>HISTORY</p>
            {chatHistory.map(h => (
              <div key={h.id} style={{ padding: '10px', fontSize: '13px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={14} /> {h.title}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #33333322' }}>
          <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', gap: '10px', cursor: 'pointer', alignItems: 'center' }}>
            <Settings size={18} /> Settings
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* HEADER */}
        <header style={{ height: '60px', padding: '0 20px', borderBottom: '1px solid #33333322', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Menu onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer' }} />
          <div style={{ fontWeight: 'bold' }}>Protonix AI</div>
        </header>

        {/* SETTINGS MODAL */}
        {showSettings && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: isDarkMode ? '#1e1e21' : '#fff', padding: '30px', borderRadius: '24px', width: '400px', border: '1px solid #33333344' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>System Settings</h3>
                <X onClick={() => setShowSettings(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ padding: '15px', background: '#8882', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User color="white" /></div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Protonix User</p>
                  <p style={{ margin: 0, fontSize: '11px', opacity: 0.5 }}>{user?.email || 'admin@protonix.ai'}</p>
                </div>
              </div>
              <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ef4444', color: '#ef4444', background: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <LogOut size={18} /> Logout to Home
              </button>
            </div>
          </div>
        )}

        {/* CHAT AREA */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {!selectedBot && messages.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px' }}>Choose Intelligence</h1>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '20px', 
                maxWidth: '900px', 
                margin: '0 auto' 
              }}>
                {bots.map(bot => (
                  <div key={bot.id} onClick={() => setSelectedBot(bot)} style={{ background: isDarkMode ? '#1e1e21' : '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #33333322', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '10px', padding: '8px', margin: '0 auto 15px' }}>
                      <img src={bot.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={bot.name} />
                    </div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{bot.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '24px', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', padding: '6px', flexShrink: 0 }}>
                    {m.sender === 'user' ? <User size={24} color="black" /> : <img src={m.botLogo} style={{ width: '100%' }} alt="bot" />}
                  </div>
                  <div style={{ background: m.sender === 'user' ? '#4f46e5' : (isDarkMode ? '#1e1e21' : '#fff'), padding: '14px 20px', borderRadius: '16px', border: m.sender === 'bot' ? '1px solid #33333322' : 'none', width: m.isVerticalFull ? '100%' : 'auto' }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <div style={{ padding: '20px', maxWidth: '850px', width: '100%', margin: '0 auto' }}>
          
          {/* Audio Visualizer */}
          {isListening && (
            <div style={{ display: 'flex', gap: '4px', height: '30px', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ width: '4px', height: `${Math.max(6, volume * (i % 2 === 0 ? 0.8 : 1.2))}px`, background: '#4f46e5', borderRadius: '10px', transition: '0.1s' }} />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', background: isDarkMode ? '#1e1e21' : '#fff', border: '1px solid #33333322', borderRadius: '24px', padding: '14px 20px', alignItems: 'flex-end', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            
            {!isListening ? 
              <Mic size={20} onClick={handleVoiceToggle} style={{ cursor: 'pointer', marginBottom: '5px' }} color="#94a3b8" /> : 
              <MicOff size={20} onClick={handleVoiceToggle} color="#ef4444" style={{ cursor: 'pointer', marginBottom: '5px' }} />
            }
            
            {/* ✅ PURIFY BUTTON (Handles Loading State) */}
            {isPurifying ? (
              <Loader2 size={20} className="animate-spin" color="#a855f7" style={{ marginBottom: '5px' }} />
            ) : (
              <Wand2 size={20} onClick={handlePurify} color="#a855f7" style={{ cursor: 'pointer', marginBottom: '5px' }} />
            )}
            
            <textarea 
              ref={textareaRef}
              rows={1}
              style={{ 
                flex: 1, 
                background: 'transparent', 
                border: 'none', 
                color: 'inherit', 
                outline: 'none', 
                resize: 'none',
                overflow: 'hidden',
                minHeight: '24px',
                maxHeight: '200px',
                fontFamily: 'inherit',
                fontSize: '16px',
                lineHeight: '1.5',
                padding: '0'
              }}
              placeholder="Tag @gpt or @all... (Click Wand to Purify)"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            <Send size={20} onClick={handleSend} color="#4f46e5" style={{ cursor: 'pointer', marginBottom: '5px' }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;