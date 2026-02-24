import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, Settings, Menu, User, 
  Mic, MicOff, MessageSquare, X, Wand2, LogOut, Loader2, 
  ArrowDown, Moon, Sun
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
  const [selectedBots, setSelectedBots] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

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

  // Helper function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Load chat history from localStorage for current user
  useEffect(() => {
    if (user?.email) {
      const storageKey = `protonix_chat_history_${user.email}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setChatHistory(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
      }
    }
  }, [user?.email]);

  // Save chat to history and localStorage
  const saveChat = (chatId, title, messages) => {
    if (!user?.email) return;
    const storageKey = `protonix_chat_history_${user.email}`;
    const storageMessagesKey = `protonix_chat_messages_${user.email}_${chatId}`;
    
    try {
      // Save messages
      localStorage.setItem(storageMessagesKey, JSON.stringify(messages));
      
      // Update history
      setChatHistory(prev => {
        const updated = prev.filter(h => h.id !== chatId);
        const newHistory = [{ id: chatId, title, timestamp: new Date().toISOString() }, ...updated];
        localStorage.setItem(storageKey, JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (err) {
      console.error('Error saving chat:', err);
    }
  };

  // Load previous chat
  const loadChat = (chatId) => {
    if (!user?.email) return;
    const storageMessagesKey = `protonix_chat_messages_${user.email}_${chatId}`;
    try {
      const saved = localStorage.getItem(storageMessagesKey);
      if (saved) {
        setMessages(JSON.parse(saved));
        setCurrentChatId(chatId);
        setSelectedBot(null);
        setIsComparisonMode(false);
        if (window.innerWidth <= 768) setSidebarOpen(false);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
    }
  };
  
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

    .settings-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .settings-content {
      background: ${isDarkMode ? '#171719' : '#fff'};
      width: 90%;
      max-width: 400px;
      padding: 24px;
      border-radius: 24px;
      border: 1px solid ${isDarkMode ? '#333' : '#eee'};
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .comparison-wrapper {
      display: flex;
      gap: 16px;
      height: 100%;
      padding: 10px 20px;
      overflow-x: auto;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      scroll-snap-type: x mandatory;
    }

    .bot-column {
      flex: 0 0 320px;
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
      .bot-column { flex: 0 0 85vw; margin-right: 10px; }
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
    
    // Use selected bots from toggles if in comparison mode
    if (isComparisonMode && selectedBots.length > 0) {
      targets = selectedBots;
    } else if (selectedBot) {
      targets = [selectedBot];
    } else {
      const deepseek = bots.find(b => b.id === 'deepseek');
      targets = [deepseek];
      setSelectedBot(deepseek);
    }

    const userMsg = { text: inputMessage, sender: 'user', time: new Date().toLocaleTimeString() };
    
    setMessages(prev => {
      const newMessages = [...prev, userMsg];
      
      // Auto-save chat
      if (!currentChatId) {
        const chatId = Date.now();
        setCurrentChatId(chatId);
        saveChat(chatId, inputMessage, newMessages);
      } else {
        saveChat(currentChatId, inputMessage, newMessages);
      }
      
      return newMessages;
    });

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
          const newMessages = [...filtered, { text: data.reply, sender: 'bot', botId: bot.id, botLogo: bot.logo }];
          
          // Auto-save after bot response
          if (currentChatId) {
            saveChat(currentChatId, inputMessage, newMessages);
          }
          
          return newMessages;
        });
      } catch (error) {
        setMessages(prev => {
           const filtered = prev.filter(msg => msg.tempId !== tempId);
           const newMessages = [...filtered, { text: "Error: No response.", sender: 'bot', botId: bot.id, botLogo: bot.logo }];
           
           // Auto-save after error
           if (currentChatId) {
             saveChat(currentChatId, inputMessage, newMessages);
           }
           
           return newMessages;
        });
      }
    });
    setInputMessage('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  
  const handleLogout = () => { 
    onLogout(); 
    navigate('/'); 
  };

  const isMobile = window.innerWidth <= 768;
  const desktopSidebarWidth = sidebarOpen ? '280px' : '0';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: isDarkMode ? '#0d0d0e' : '#f8fafc', color: isDarkMode ? '#fff' : '#1e293b', overflow: 'hidden' }}>
      <style>{styles}</style>

      {/* Settings Modal - Logout is INSIDE here */}
      {showSettings && (
        <div className="settings-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Settings</h2>
              <X size={20} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => setShowSettings(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Email</span>
                <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user?.email || 'Not available'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem' }}>Appearance</span>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  style={{ background: isDarkMode ? '#222' : '#f0f0f0', border: 'none', padding: '8px 12px', borderRadius: '12px', color: 'inherit', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                  {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                  {isDarkMode ? 'Dark' : 'Light'}
                </button>
              </div>

              <div style={{ borderTop: '1px solid #33333322', paddingTop: '20px' }}>
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    color: '#ef4444', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '10px' 
                  }}
                >
                  <LogOut size={18} /> Logout session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <button onClick={() => {setMessages([]); setSelectedBot(null); setSelectedBots([]); setIsComparisonMode(false); setCurrentChatId(null); if(isMobile) setSidebarOpen(false);}} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+ New Chat</button>
          
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '11px', opacity: 0.5, fontWeight: 'bold' }}>HISTORY</p>
            {chatHistory.map(h => (
              <div key={h.id} onClick={() => loadChat(h.id)} style={{ padding: '10px', fontSize: '13px', opacity: 0.7, display: 'flex', gap: '8px', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s', backgroundColor: currentChatId === h.id ? 'rgba(79, 70, 229, 0.2)' : 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentChatId === h.id ? 'rgba(79, 70, 229, 0.2)' : 'transparent'}>
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

        {/* User Greeting Banner */}
        {messages.length > 0 && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #33333322', background: isDarkMode ? 'rgba(79, 70, 229, 0.05)' : 'rgba(79, 70, 229, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '4px', fontFamily: 'Georgia, serif' }}>
                {getGreeting()} {user?.firstName || user?.email?.split('@')[0]}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.5 }}>{user?.email}</div>
            </div>
          </div>
        )}

        <div 
          ref={chatContainerRef} 
          onScroll={handleScroll}
          className="chat-scroll-container" 
          style={{ 
            flex: isChatEmpty ? '0 0 auto' : '1', 
            overflowY: isComparisonMode ? 'auto' : 'auto', 
            padding: isComparisonMode ? '20px' : '40px', 
            display: 'flex', 
            flexDirection: 'column'
          }}
        >
          {isChatEmpty ? (
            <div style={{ textAlign: 'center', marginTop: '5vh' }}>
              <h1 style={{ fontSize: '25px', fontWeight: '900', marginBottom: '30px' }}>Choose Intelligence</h1>
              <div className="bot-grid-container">
                {bots.map(bot => (
                  <div key={bot.id} className="bot-card" onClick={() => {setSelectedBot(bot); setSelectedBots([bot]); setIsComparisonMode(false);}} style={{ background: isDarkMode ? '#1e1e21' : '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #33333322', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ width: '50px', height: '40px', background: 'white', borderRadius: '10px', padding: '8px', margin: '0 auto 10px' }}>
                      <img src={bot.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={bot.name} />
                    </div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{bot.name}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button onClick={() => {setIsComparisonMode(true); setSelectedBot(null);}} style={{ padding: '12px 24px', background: 'rgba(79, 70, 229, 0.2)', border: '1px solid #4f46e5', color: '#4f46e5', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Compare Multiple Models
                </button>
              </div>
            </div>
          ) : isComparisonMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #33333322' }}>
                {bots.map(bot => (
                  <button
                    key={bot.id}
                    onClick={() => {
                      setSelectedBots(prev => 
                        prev.find(b => b.id === bot.id)
                          ? prev.filter(b => b.id !== bot.id)
                          : [...prev, bot]
                      );
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: selectedBots.find(b => b.id === bot.id) ? '2px solid #4f46e5' : `1px solid ${isDarkMode ? '#33333322' : '#ccc'}`,
                      background: selectedBots.find(b => b.id === bot.id) ? 'rgba(79, 70, 229, 0.1)' : isDarkMode ? '#1e1e21' : '#fff',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: selectedBots.find(b => b.id === bot.id) ? '600' : '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={bot.logo} style={{ width: 16, height: 16 }} alt={bot.name} />
                    {bot.name}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: selectedBots.length > 0 ? `repeat(${Math.min(selectedBots.length, 2)}, 1fr)` : '1fr', gap: '20px' }}>
                {selectedBots.length > 0 ? selectedBots.map(bot => (
                  <div key={bot.id} style={{ 
                    background: isDarkMode ? '#1e1e21' : '#fff',
                    borderRadius: '16px',
                    border: `1px solid ${isDarkMode ? '#33333322' : '#eee'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '500px'
                  }}>
                    <div style={{ padding: '16px', borderBottom: `1px solid ${isDarkMode ? '#33333322' : '#eee'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={bot.logo} style={{ width: 24, height: 24 }} alt={bot.name} />
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{bot.name}</span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column' }}>
                      {messages.filter(m => m.botId === bot.id || m.sender === 'user').map((m, i) => (
                        <div key={i} style={{ marginBottom: '12px', display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div style={{ padding: '10px 14px', borderRadius: '12px', background: m.sender === 'user' ? '#4f46e5' : isDarkMode ? '#252529' : '#f0f0f0', fontSize: '12px', maxWidth: '90%' }}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', opacity: 0.5, paddingTop: '40px' }}>
                    <p>Select models above to compare responses</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
{messages.map((m, i) => (
  <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row' }}>
    
    <div style={{ 
      width: '36px', 
      height: '36px', 
      background: 'white', 
      borderRadius: '8px', 
      padding: '5px',
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
