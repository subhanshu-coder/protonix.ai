import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, Settings, Menu, User, 
  Mic, MicOff, MessageSquare, X, Wand2, LogOut, Loader2, 
  ArrowDown 
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
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  
  const [selectedBot, setSelectedBot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [chatHistory, setChatHistory] = useState([]);
  const [isPurifying, setIsPurifying] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
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

  const isChatEmpty = !selectedBot && messages.length === 0;

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const styles = `
    .bot-grid-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Comparison Logic */
    .comparison-wrapper {
      display: flex;
      gap: 16px;
      height: 100%;
      padding: 10px 20px;
      overflow-x: auto;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x mandatory; /* Snap effect for mobile */
    }

    .bot-column {
      flex: 0 0 320px; /* Fixed width for columns */
      background: ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
      border-radius: 20px;
      border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      display: flex;
      flex-direction: column;
      height: 100%;
      scroll-snap-align: start;
    }

    .column-header {
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      background: rgba(0,0,0,0.1);
      border-radius: 20px 20px 0 0;
    }

    .column-messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
    }

    .chat-scroll-container::-webkit-scrollbar { width: 6px; display: block; }
    .chat-scroll-container::-webkit-scrollbar-track { background: transparent; }
    .chat-scroll-container::-webkit-scrollbar-thumb {
      background-color: ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'};
      border-radius: 10px;
    }

    @media (max-width: 768px) {
      .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 45; }
      .sidebar-container { position: fixed !important; inset: 0 auto 0 0 !important; width: 85% !important; z-index: 50 !important; transform: translateX(-100%); transition: transform 0.3s ease !important; }
      .sidebar-container.open { transform: translateX(0) !important; }
      .bot-grid-container { grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 10px; }
      .bot-card { padding: 15px !important; min-height: 100px; }
      
      /* Mobile Snap Columns */
      .bot-column {
        flex: 0 0 85vw; /* Each bot takes 85% of screen width */
        margin-right: 10px;
      }
      .comparison-wrapper {
        padding: 10px;
      }
    }
  `;

  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { 
    if (textareaRef.current) { 
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; 
    } 
  }, [inputMessage]);

  const handleVoiceToggle = async () => { 
      if (isListening) { if (silenceTimer.current) clearTimeout(silenceTimer.current); recognitionRef.current?.stop(); setIsListening(false); return; }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        const updateVisualizer = () => { if (!analyserRef.current || !isListeningRef.current) return; analyserRef.current.getByteFrequencyData(dataArray); setVolume(dataArray.reduce((a, b) => a + b) / dataArray.length); requestAnimationFrame(updateVisualizer); };
        recognitionRef.current = new SpeechRecognition(); recognitionRef.current.continuous = true; recognitionRef.current.interimResults = true;
        recognitionRef.current.onstart = () => { setIsListening(true); isListeningRef.current = true; textRef.current = inputMessage; updateVisualizer(); };
        recognitionRef.current.onresult = (e) => { if (silenceTimer.current) clearTimeout(silenceTimer.current); silenceTimer.current = setTimeout(() => { recognitionRef.current.stop(); }, 2500); setInputMessage(textRef.current + (textRef.current && !textRef.current.endsWith(' ') ? ' ' : '') + Array.from(e.results).map(r => r[0].transcript).join('')); };
        recognitionRef.current.onend = () => { setIsListening(false); isListeningRef.current = false; setVolume(0); stream.getTracks().forEach(t => t.stop()); };
        recognitionRef.current.start();
      } catch (err) { setIsListening(false); }
  };
  
  const handlePurify = async () => { if (!inputMessage.trim()) return; setIsPurifying(true); await new Promise(r => setTimeout(r, 800)); setInputMessage(`Act as an expert. ${inputMessage}?`); setIsPurifying(false); };
  
  const handleSend = () => {
    if (!inputMessage.trim()) return;
    
    let targets = [];
    const lowerInput = inputMessage.toLowerCase();
    
    if (lowerInput.includes("@all")) {
      targets = bots;
      setIsComparisonMode(true);
    } else {
      const tagged = bots.filter(b => lowerInput.includes(`@${b.id}`));
      targets = tagged.length > 0 ? tagged : (selectedBot ? [selectedBot] : []);
      setIsComparisonMode(false);
    }
    
    if (targets.length === 0) {
        const deepseek = bots.find(b => b.id === 'deepseek');
        targets = [deepseek];
        setSelectedBot(deepseek);
    }

    const userMsg = { text: inputMessage, sender: 'user', time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    
    if (messages.length === 0) {
        setChatHistory([{ id: Date.now(), title: inputMessage }, ...chatHistory]);
    }

    targets.forEach(async (bot) => {
      const tempId = Date.now() + Math.random();
      setMessages(prev => [...prev, { 
        text: "Thinking...", 
        sender: 'bot', 
        botId: bot.id, 
        botLogo: bot.logo, 
        isLoading: true,
        tempId: tempId
      }]);

      try {
        const response = await fetch('https://protonix-ai.onrender.com/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: inputMessage, botId: bot.id })
        });
        const data = await response.json();
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.tempId !== tempId);
          return [...filtered, { text: data.reply, sender: 'bot', botId: bot.id, botLogo: bot.logo }];
        });
      } catch (error) {
        setMessages(prev => {
           const filtered = prev.filter(msg => msg.tempId !== tempId);
           return [...filtered, { text: "Error: No response.", sender: 'bot', botId: bot.id, botLogo: bot.logo }];
        });
      }
    });
    setInputMessage('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleLogout = () => { onLogout(); navigate('/'); };

  const isMobile = window.innerWidth <= 768;
  const desktopSidebarWidth = sidebarOpen ? '280px' : '0';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: isDarkMode ? '#0d0d0e' : '#f8fafc', color: isDarkMode ? '#fff' : '#1e293b', overflow: 'hidden' }}>
      <style>{styles}</style>

      {isMobile && sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      
      <aside 
        className={`sidebar-container ${sidebarOpen ? 'open' : ''}`} 
        style={{ 
          width: isMobile ? undefined : desktopSidebarWidth, 
          minWidth: isMobile ? undefined : desktopSidebarWidth, 
          background: isDarkMode ? '#171719' : '#fff', 
          borderRight: sidebarOpen ? '1px solid #33333322' : 'none', 
          display: 'flex', 
          flexDirection: 'column', 
          flexShrink: 0,
          whiteSpace: 'nowrap', 
          overflow: 'hidden',
          transition: 'width 0.3s ease, min-width 0.3s ease'
        }}
      >
        <div style={{ padding: '20px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontWeight: 'bold', opacity: 0.5, fontSize: '12px' }}>MENU</span>
            {isMobile && <X style={{cursor:'pointer'}} onClick={() => setSidebarOpen(false)} />}
          </div>
          <button onClick={() => {setMessages([]); setSelectedBot(null); setIsComparisonMode(false); if(isMobile) setSidebarOpen(false);}} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+ New Chat</button>
          
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '11px', opacity: 0.5, fontWeight: 'bold' }}>HISTORY</p>
            {chatHistory.map(h => (
              <div key={h.id} style={{ padding: '10px', fontSize: '13px', opacity: 0.7, display: 'flex', gap: '8px', cursor: 'pointer' }}>
                <MessageSquare size={14} /> 
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.title}</span>
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

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', overflow: 'hidden' }}>
        <header style={{ height: '50px', padding: '0 20px', borderBottom: '1px solid #33333322', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Menu onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer' }} />
          <div style={{ fontWeight: 'bold' }}>Protonix AI</div>
          <div style={{width: 20}} />
        </header>

        <div 
          ref={chatContainerRef} 
          onScroll={handleScroll}
          className="chat-scroll-container" 
          style={{ 
            flex: isChatEmpty ? '0 0 auto' : '1', 
            overflowY: isComparisonMode ? 'hidden' : 'auto', 
            padding: isComparisonMode ? '0' : '40px', 
            display: 'flex', 
            flexDirection: 'column'
          }}
        >
          {isChatEmpty ? (
            <div style={{ textAlign: 'center', marginTop: '5vh' }}>
              <h1 style={{ fontSize: '25px', fontWeight: '900', marginBottom: '30px' }}>Choose Intelligence</h1>
              <div className="bot-grid-container">
                {bots.map(bot => (
                  <div key={bot.id} className="bot-card" onClick={() => setSelectedBot(bot)} style={{ background: isDarkMode ? '#1e1e21' : '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #33333322', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: '50px', height: '40px', background: 'white', borderRadius: '10px', padding: '8px', margin: '0 auto 10px' }}>
                      <img src={bot.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={bot.name} />
                    </div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{bot.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : isComparisonMode ? (
            <div className="comparison-wrapper">
              {bots.map(bot => (
                <div key={bot.id} className="bot-column">
                  <div className="column-header">
                    <img src={bot.logo} style={{ width: 20, height: 20 }} alt={bot.name} />
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{bot.name}</span>
                  </div>
                  <div className="column-messages">
                    {messages.filter(m => m.botId === bot.id || m.sender === 'user').map((m, i) => (
                      <div key={i} style={{ marginBottom: '15px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                        <div style={{ display: 'inline-block', padding: '10px 14px', borderRadius: '15px', background: m.sender === 'user' ? '#4f46e5' : '#252529', fontSize: '13px', maxWidth: '95%' }}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
{messages.map((m, i) => (
  <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row' }}>
    
    {/* FIXED: Reduced padding from 15px to 5px so the image is larger */}
    <div style={{ 
      width: '36px', 
      height: '36px', 
      background: 'white', 
      borderRadius: '8px', 
      padding: '5px',  // <--- CHANGED THIS
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {m.sender === 'user' ? 
        <User size={20} color="black" /> : 
        <img src={m.botLogo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="bot" />
      }
    </div>

    <div style={{ background: m.sender === 'user' ? '#4f46e5' : '#1e1e21', padding: '14px 20px', borderRadius: '16px', maxWidth: '85%' }}>
      <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
    </div>
  </div>
))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

{/* chat textarea container */}
        <div style={{ padding: '5px', maxWidth: '750px', width: '90%', margin: '0 auto', flexShrink: 0 }}>
          {isListening && (
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '10px', alignItems: 'flex-end', height: '20px' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ width: '4px', height: `${Math.max(6, volume * (i % 2 === 0 ? 0.6 : 0.9))}px`, background: '#4f46e5', borderRadius: '10px' }} />
              ))}
            </div>
          )}
          <div style={{ display: 'flex', background: isDarkMode ? '#1e1e21' : '#fff', border: '1px solid #33333322', borderRadius: '24px', padding: '15px 20px', alignItems: 'flex-end', gap: '15px' }}>
             <div style={{ display: 'flex', gap: '10px', paddingBottom: '2px' }}>
               {!isListening ? <Mic size={20} onClick={handleVoiceToggle} style={{cursor: 'pointer'}} color="#94a3b8" /> : <MicOff size={20} onClick={handleVoiceToggle} color="#ef4444" />}
               {isPurifying ? <Loader2 size={20} className="animate-spin" color="#a855f7" /> : <Wand2 size={20} onClick={handlePurify} color="#a855f7" style={{cursor: 'pointer'}} />}
             </div>
             <textarea ref={textareaRef} rows={1} placeholder="Message..." style={{ flex: 1, background: 'transparent', border: 'none', color: 'inherit', outline: 'none', resize: 'none' }} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={handleKeyDown} />
             <Send size={20} onClick={handleSend} color="#4f46e5" style={{ cursor: 'pointer', marginBottom: '5px' }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;