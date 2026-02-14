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
  const [isComparisonMode, setIsComparisonMode] = useState(false); // Tracks @all mode
  
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
    { id: 'gpt', name: 'ChatGPT', logo: gptLogo },
    { id: 'claude', name: 'Claude', logo: claudeLogo },
    { id: 'gemini', name: 'Gemini', logo: geminiLogo },
    { id: 'perplexity', name: 'Perplexity', logo: perplexityLogo },
    { id: 'deepseek', name: 'DeepSeek', logo: deepseekLogo },
    { id: 'grok', name: 'Grok', logo: grokLogo }
  ];

  const isChatEmpty = messages.length === 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // CSS Styles
  const styles = `
    .bot-grid-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    /* Comparison Layout */
    .comparison-wrapper {
      display: flex;
      gap: 16px;
      height: 100%;
      padding: 0 20px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
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

    .chat-scroll-container::-webkit-scrollbar { width: 6px; }
    .chat-scroll-container::-webkit-scrollbar-thumb {
      background-color: rgba(255,255,255,0.1);
      border-radius: 10px;
    }

    @media (max-width: 768px) {
      .bot-grid-container { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .bot-column { flex: 0 0 85vw; } /* Mobile swipe width */
      .sidebar-container { position: fixed !important; z-index: 100; transform: translateX(-100%); }
      .sidebar-container.open { transform: translateX(0) !important; }
    }
  `;

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

    const currentMessage = inputMessage;
    const userMsg = { text: currentMessage, sender: 'user', time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    
    if (messages.length === 0) {
        setChatHistory([{ id: Date.now(), title: currentMessage }, ...chatHistory]);
    }
    setInputMessage('');

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
        const response = await fetch("https://protonix-ai.onrender.com/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: currentMessage, botId: bot.id }),
        });
        const data = await response.json();
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.tempId !== tempId);
          return [...filtered, { text: data.reply, sender: 'bot', botId: bot.id, botLogo: bot.logo }];
        });
      } catch (error) {
        setMessages(prev => {
           const filtered = prev.filter(msg => msg.tempId !== tempId);
           return [...filtered, { text: "Error connecting.", sender: 'bot', botId: bot.id, botLogo: bot.logo }];
        });
      }
    });
  };

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

  const handlePurify = async () => { if (!inputMessage.trim()) return; setIsPurifying(true); await new Promise(r => setTimeout(r, 800)); setInputMessage(`Act as an expert. ${inputMessage}?`); setIsPurifying(false); };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: isDarkMode ? '#0d0d0e' : '#f8fafc', color: isDarkMode ? '#fff' : '#1e293b', overflow: 'hidden' }}>
      <style>{styles}</style>
      
      {/* SIDEBAR */}
      <aside className={`sidebar-container ${sidebarOpen ? 'open' : ''}`} style={{ width: '280px', background: isDarkMode ? '#171719' : '#fff', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease' }}>
        <div style={{ padding: '20px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontWeight: 'bold', opacity: 0.5, fontSize: '11px' }}>PROTONIX AI</span>
            {window.innerWidth <= 768 && <X size={20} onClick={() => setSidebarOpen(false)} style={{ cursor: 'pointer' }} />}
          </div>
          <button onClick={() => { setMessages([]); setIsComparisonMode(false); }} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+ New Chat</button>
          <div style={{ marginTop: '25px' }}>
            <p style={{ fontSize: '11px', opacity: 0.5, fontWeight: 'bold' }}>HISTORY</p>
            {chatHistory.map(h => <div key={h.id} style={{ padding: '10px', fontSize: '13px', opacity: 0.7 }}><MessageSquare size={14} style={{marginRight:'8px'}}/>{h.title}</div>)}
          </div>
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', gap: '12px', cursor: 'pointer' }}><Settings size={18} /> Settings</button>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: '56px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Menu onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer' }} />
          <div style={{ fontWeight: 'bold' }}>Protonix AI</div>
          <div style={{ width: '24px' }} />
        </header>

        {showSettings && (
           <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ background: isDarkMode ? '#1e1e21' : '#fff', padding: '32px', borderRadius: '28px', width: '350px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}><h2>Settings</h2><X onClick={()=>setShowSettings(false)} style={{cursor:'pointer'}}/></div>
               <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <User size={20}/><p style={{margin:0}}>{user?.email || "Protonix User"}</p>
               </div>
               <button onClick={onLogout} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ef4444', color: '#ef4444', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}><LogOut size={16} style={{marginRight:'8px'}}/> Logout</button>
             </div>
          </div>
        )}

        <div className="chat-scroll-container" style={{ flex: 1, overflowY: isComparisonMode ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
          {isChatEmpty ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <h1 style={{ marginBottom: '40px', fontSize: '28px', fontWeight: '800' }}>Choose Intelligence</h1>
              <div className="bot-grid-container">
                {bots.map(bot => (
                  <div key={bot.id} onClick={() => setSelectedBot(bot)} style={{ background: isDarkMode ? '#1e1e21' : '#fff', padding: '24px', borderRadius: '24px', cursor: 'pointer', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '50px', height: '40px', background: '#fff', borderRadius: '10px', padding: '8px', margin: '0 auto 10px' }}><img src={bot.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{bot.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : isComparisonMode ? (
            <div className="comparison-wrapper">
              {bots.map(bot => (
                <div key={bot.id} className="bot-column">
                  <div className="column-header"><img src={bot.logo} style={{ width: 22 }} /><b>{bot.name}</b></div>
                  <div className="column-messages">
                    {messages.filter(m => m.botId === bot.id || m.sender === 'user').map((m, i) => (
                      <div key={i} style={{ marginBottom: '16px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                        <div style={{ display: 'inline-block', padding: '12px 16px', borderRadius: '16px', background: m.sender === 'user' ? '#4f46e5' : 'rgba(255,255,255,0.05)', fontSize: '13px', maxWidth: '90%' }}>{m.text}</div>
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
                  <div style={{ width: '38px', height: '38px', background: '#fff', borderRadius: '10px', padding: '6px', flexShrink: 0 }}>{m.sender === 'user' ? <User size={26} color="#000" /> : <img src={m.botLogo} style={{ width: '100%' }} />}</div>
                  <div style={{ background: m.sender === 'user' ? '#4f46e5' : '#1e1e21', padding: '14px 20px', borderRadius: '20px', maxWidth: '85%', border: '1px solid rgba(255,255,255,0.05)' }}>{m.text}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div style={{ padding: '20px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          {isListening && <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '12px', height: '20px', alignItems: 'flex-end' }}>{[...Array(8)].map((_, i) => <div key={i} style={{ width: '4px', height: `${Math.max(6, volume * (i % 2 === 0 ? 0.7 : 1))}px`, background: '#4f46e5', borderRadius: '10px' }} />)}</div>}
          <div style={{ display: 'flex', background: isDarkMode ? '#1e1e21' : '#fff', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '14px 20px', alignItems: 'flex-end', gap: '16px' }}>
             <div style={{ display: 'flex', gap: '12px', paddingBottom: '4px' }}>
                {!isListening ? <Mic size={20} onClick={handleVoiceToggle} style={{ cursor: 'pointer', opacity: 0.6 }} /> : <MicOff size={20} onClick={handleVoiceToggle} color="#ef4444" />}
                {isPurifying ? <Loader2 size={20} className="animate-spin" color="#a855f7" /> : <Wand2 size={20} onClick={handlePurify} color="#a855f7" style={{ cursor: 'pointer' }} />}
             </div>
             <textarea ref={textareaRef} rows={1} placeholder="Ask Protonix..." style={{ flex: 1, background: 'transparent', border: 'none', color: 'inherit', outline: 'none', resize: 'none', fontSize: '16px' }} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} />
             <Send size={22} onClick={handleSend} color="#4f46e5" style={{ cursor: 'pointer', marginBottom: '4px' }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;