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

  const isChatEmpty = messages.length === 0;

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
      max-width: 800px;
      margin: 0 auto;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* Comparison Logic */
    .comparison-wrapper {
      display: flex;
      gap: 16px;
      height: 100%;
      padding: 0 20px;
      overflow-x: auto;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
    }

    .bot-column {
      flex: 0 0 350px;
      background: ${isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'};
      border-radius: 24px;
      border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
      display: flex;
      flex-direction: column;
      height: 100%;
      scroll-snap-align: center;
    }

    .column-header {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(0,0,0,0.15);
      border-radius: 24px 24px 0 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .column-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .chat-scroll-container::-webkit-scrollbar { width: 6px; display: block; }
    .chat-scroll-container::-webkit-scrollbar-thumb {
      background-color: ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      border-radius: 10px;
    }

    @media (max-width: 768px) {
      .sidebar-container { position: fixed !important; width: 85% !important; z-index: 100 !important; transform: translateX(-100%); transition: 0.3s ease; }
      .sidebar-container.open { transform: translateX(0) !important; }
      .bot-grid-container { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .bot-column { flex: 0 0 90vw; }
      .comparison-wrapper { padding: 0 10px; }
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
      if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
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
        recognitionRef.current.onresult = (e) => { setInputMessage(textRef.current + (textRef.current && !textRef.current.endsWith(' ') ? ' ' : '') + Array.from(e.results).map(r => r[0].transcript).join('')); };
        recognitionRef.current.onend = () => { setIsListening(false); isListeningRef.current = false; stream.getTracks().forEach(t => t.stop()); };
        recognitionRef.current.start();
      } catch (err) { setIsListening(false); }
  };
  
  const handlePurify = async () => { if (!inputMessage.trim()) return; setIsPurifying(true); await new Promise(r => setTimeout(r, 800)); setInputMessage(`Optimize and expand on this: ${inputMessage}`); setIsPurifying(false); };
  
  const handleSend = () => {
    if (!inputMessage.trim()) return;
    
    let targets = [];
    const lowerInput = inputMessage.toLowerCase();
    
    if (lowerInput.includes("@all")) {
      targets = bots;
      setIsComparisonMode(true);
    } else {
      const tagged = bots.filter(b => lowerInput.includes(`@${b.id}`));
      targets = tagged.length > 0 ? tagged : (selectedBot ? [selectedBot] : [bots.find(b => b.id === 'deepseek')]);
      setIsComparisonMode(false);
    }

    const userMsg = { text: inputMessage, sender: 'user', time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    
    if (messages.length === 0) {
        setChatHistory([{ id: Date.now(), title: inputMessage }, ...chatHistory]);
    }

    targets.forEach(async (bot) => {
      const tempId = Date.now() + Math.random();
      setMessages(prev => [...prev, { text: "Thinking...", sender: 'bot', botId: bot.id, botLogo: bot.logo, isLoading: true, tempId: tempId }]);

      try {
        const response = await fetch('http://localhost:5000/api/chat', {
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
           return [...filtered, { text: "Connection failed.", sender: 'bot', botId: bot.id, botLogo: bot.logo }];
        });
      }
    });
    setInputMessage('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleLogout = () => { onLogout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: isDarkMode ? '#0d0d0e' : '#f8fafc', color: isDarkMode ? '#fff' : '#1e293b', overflow: 'hidden' }}>
      <style>{styles}</style>

      {/* Sidebar Overlay (Mobile) */}
      {window.innerWidth <= 768 && sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} onClick={() => setSidebarOpen(false)} />}
      
      {/* SIDEBAR */}
      <aside className={`sidebar-container ${sidebarOpen ? 'open' : ''}`} style={{ width: '280px', background: isDarkMode ? '#171719' : '#fff', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: '0.3s ease' }}>
        <div style={{ padding: '20px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontWeight: 'bold', opacity: 0.5, fontSize: '11px', letterSpacing: '1px' }}>PROTONIX CLOUD</span>
            {window.innerWidth <= 768 && <X size={20} onClick={() => setSidebarOpen(false)} style={{ cursor: 'pointer' }} />}
          </div>
          <button onClick={() => { setMessages([]); setSelectedBot(null); setIsComparisonMode(false); }} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>+ New Chat</button>
          
          <div style={{ marginTop: '25px' }}>
            <p style={{ fontSize: '11px', opacity: 0.5, fontWeight: 'bold', marginBottom: '10px' }}>RECENT HISTORY</p>
            {chatHistory.map(h => (
              <div key={h.id} style={{ padding: '10px', fontSize: '13px', opacity: 0.7, display: 'flex', gap: '10px', cursor: 'pointer', borderRadius: '10px' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <MessageSquare size={14} /> 
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'center', width: '100%' }}>
                <Settings size={18} /> Settings
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* Header */}
        <header style={{ height: '56px', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Menu onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer', opacity: 0.7 }} />
          <div style={{ fontWeight: 'bold', letterSpacing: '0.5px' }}>Protonix AI</div>
          <div style={{ width: '20px' }} />
        </header>

        {/* Settings Modal */}
        {showSettings && (
           <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
             <div style={{ background: isDarkMode ? '#1e1e21' : '#fff', padding: '32px', borderRadius: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}><h2 style={{margin:0, fontSize: '20px'}}>Settings</h2><X onClick={()=>setShowSettings(false)} style={{cursor:'pointer', opacity: 0.5}}/></div>
               
               <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#4f46e5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><User color="white" size={24}/></div>
                 <div style={{ flex: 1 }}>
                    <p style={{margin:0, fontWeight:'bold', fontSize: '15px'}}>Protonix User</p>
                    <p style={{margin:'2px 0 0', fontSize:'12px', opacity:0.5}}>{user?.email}</p>
                 </div>
               </div>

               <button onClick={handleLogout} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #ef4444', color: '#ef4444', background: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                 <LogOut size={18}/> Logout Session
               </button>
             </div>
          </div>
        )}

        {/* Chat Scroll Container */}
        <div ref={chatContainerRef} onScroll={handleScroll} className="chat-scroll-container" style={{ flex: 1, overflowY: isComparisonMode ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
          {isChatEmpty ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '40px', textAlign: 'center' }}>Choose Intelligence</h1>
              <div className="bot-grid-container">
                {bots.map(bot => (
                  <div key={bot.id} onClick={() => setSelectedBot(bot)} style={{ background: isDarkMode ? '#1e1e21' : '#fff', padding: '28px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: '0.2s' }}>
                    <div style={{ width: '56px', height: '44px', background: '#fff', borderRadius: '12px', padding: '10px', marginBottom: '8px' }}>
                      <img src={bot.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={bot.name} />
                    </div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{bot.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : isComparisonMode ? (
            <div className="comparison-wrapper">
              {bots.map(bot => (
                <div key={bot.id} className="bot-column">
                  <div className="column-header">
                    <img src={bot.logo} style={{ width: 22, height: 22 }} alt={bot.name} />
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{bot.name}</span>
                  </div>
                  <div className="column-messages">
                    {messages.filter(m => m.botId === bot.id || m.sender === 'user').map((m, i) => (
                      <div key={i} style={{ marginBottom: '16px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                        <div style={{ display: 'inline-block', padding: '12px 16px', borderRadius: '16px', background: m.sender === 'user' ? '#4f46e5' : 'rgba(255,255,255,0.05)', fontSize: '13px', maxWidth: '95%', border: m.sender === 'bot' ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
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
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '40px 20px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: '38px', height: '38px', background: '#fff', borderRadius: '10px', padding: '6px', flexShrink: 0 }}>
                    {m.sender === 'user' ? <User size={26} color="#000" /> : <img src={m.botLogo} style={{ width: '100%' }} alt="bot" />}
                  </div>
                  <div style={{ background: m.sender === 'user' ? '#4f46e5' : (isDarkMode ? '#1e1e21' : '#fff'), padding: '14px 20px', borderRadius: '20px', border: m.sender === 'bot' ? '1px solid rgba(255,255,255,0.05)' : 'none', maxWidth: '85%', lineHeight: '1.6' }}>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '15px' }}>{m.text}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '20px', maxWidth: '800px', width: '100%', margin: '0 auto', flexShrink: 0 }}>
          {isListening && (
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '12px', alignItems: 'flex-end', height: '20px' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ width: '4px', height: `${Math.max(6, volume * (i % 2 === 0 ? 0.7 : 1))}px`, background: '#4f46e5', borderRadius: '10px', transition: '0.1s' }} />
              ))}
            </div>
          )}
          <div style={{ display: 'flex', background: isDarkMode ? '#1e1e21' : '#fff', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '14px 20px', alignItems: 'flex-end', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
             <div style={{ display: 'flex', gap: '12px', paddingBottom: '4px' }}>
                {!isListening ? <Mic size={20} onClick={handleVoiceToggle} style={{ cursor: 'pointer', opacity: 0.6 }} /> : <MicOff size={20} onClick={handleVoiceToggle} color="#ef4444" style={{ cursor: 'pointer' }} />}
                {isPurifying ? <Loader2 size={20} className="animate-spin" color="#a855f7" /> : <Wand2 size={20} onClick={handlePurify} color="#a855f7" style={{ cursor: 'pointer' }} />}
             </div>
             <textarea ref={textareaRef} rows={1} placeholder="Ask Protonix..." style={{ flex: 1, background: 'transparent', border: 'none', color: 'inherit', outline: 'none', resize: 'none', fontSize: '16px', padding: '2px 0' }} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={handleKeyDown} />
             <Send size={22} onClick={handleSend} color="#4f46e5" style={{ cursor: 'pointer', marginBottom: '4px' }} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default ChatPage;