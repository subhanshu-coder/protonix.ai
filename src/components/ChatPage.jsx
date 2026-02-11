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

  // Helper to check if we are in the "Empty State" (Logos visible)
  const isChatEmpty = !selectedBot && messages.length === 0;

  // Scroll Logic
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // CSS Styles
  const styles = `
    .bot-grid-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    .chat-scroll-container::-webkit-scrollbar { width: 6px; display: block; }
    .chat-scroll-container::-webkit-scrollbar-track { background: transparent; }
    .chat-scroll-container::-webkit-scrollbar-thumb {
      background-color: ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'};
      border-radius: 10px;
    }
    .chat-scroll-container::-webkit-scrollbar-thumb:hover {
      background-color: ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};
    }

    textarea::-webkit-scrollbar { width: 4px; }
    textarea::-webkit-scrollbar-thumb {
      background-color: ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 45; }
      .sidebar-container { position: fixed !important; inset: 0 auto 0 0 !important; width: 85% !important; z-index: 50 !important; transform: translateX(-100%); transition: transform 0.3s ease !important; }
      .sidebar-container.open { transform: translateX(0) !important; }
      .bot-grid-container { grid-template-columns: repeat(2, 1fr); gap: 12px; padding: 0 10px; }
      .bot-card { padding: 15px !important; min-height: 100px; }
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
  
  const handleHistoryClick = (historyItem) => {
    if (window.innerWidth <= 768) setSidebarOpen(false);
    setSelectedBot(bots.find(b => b.id === 'deepseek'));
    setMessages([
        { text: historyItem.title, sender: 'user', time: 'Yesterday' },
        { text: "Here is the context from your previous session...", sender: 'bot', botLogo: deepseekLogo }
    ]);
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

  // Store the message you typed before we clear the input box
  const currentMessage = inputMessage;
  setInputMessage(''); // Clear the input box immediately for a better UI

  targets.forEach(async (bot) => {
    const tempId = Date.now() + Math.random();
    setMessages(prev => [...prev, { 
      text: "Thinking...", 
      sender: 'bot', 
      botLogo: bot.logo, 
      isLoading: true,
      tempId: tempId
    }]);

    try {
      // Send the ACTUAL message and ACTUAL bot selection to your live Render server
      const response = await fetch("https://protonix-ai.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      // Ensure this line in ChatPage.jsx uses 'inputMessage' or your text variable
body: JSON.stringify({ 
  message: inputMessage, // Don't use "Hello" here!
  botId: bot.id 
}),
      });

      const data = await response.json();

      setMessages(prev => {
        const filtered = prev.filter(msg => msg.tempId !== tempId);
        return [...filtered, { 
          text: data.reply, 
          sender: 'bot', 
          botLogo: bot.logo 
        }];
      });

    } catch (error) {
      console.error("Error connecting to server:", error);
      setMessages(prev => {
         const filtered = prev.filter(msg => msg.tempId !== tempId);
         return [...filtered, { 
           text: "Error: Could not connect to Protonix Server. It might be waking up (wait 30s) or Render keys are missing.", 
           sender: 'bot', 
           botLogo: bot.logo 
         }];
      });
    }
  });

    
    setInputMessage('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleLogout = () => { onLogout(); navigate('/'); };

  // Calculate desktop width props
  const isMobile = window.innerWidth <= 768;
  const desktopSidebarWidth = sidebarOpen ? '280px' : '0';
  const desktopBorder = (!isMobile && !sidebarOpen) ? 'none' : '1px solid #33333322';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: isDarkMode ? '#0d0d0e' : '#f8fafc', color: isDarkMode ? '#fff' : '#1e293b', overflow: 'hidden' }}>
      <style>{styles}</style>

      {/* Sidebar Overlay (Mobile Only) */}
      {isMobile && sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      
      {/* SIDEBAR */}
      <aside 
        className={`sidebar-container ${sidebarOpen ? 'open' : ''}`} 
        style={{ 
          width: isMobile ? undefined : desktopSidebarWidth, 
          minWidth: isMobile ? undefined : desktopSidebarWidth, 
          background: isDarkMode ? '#171719' : '#fff', 
          borderRight: desktopBorder, 
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
          <button onClick={() => {setMessages([]); setSelectedBot(null); if(isMobile) setSidebarOpen(false);}} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+ New Chat</button>
          
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '11px', opacity: 0.5, fontWeight: 'bold' }}>HISTORY</p>
            {chatHistory.map(h => (
              <div 
                key={h.id} 
                onClick={() => handleHistoryClick(h)}
                style={{ padding: '10px', fontSize: '13px', opacity: 0.7, display: 'flex', gap: '8px', cursor: 'pointer', transition: '0.2s', borderRadius: '8px' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <MessageSquare size={14} /> 
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #33333322' }}>
            <button onClick={() => { 
                setShowSettings(true); 
                if (isMobile) setSidebarOpen(false); 
            }} style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', gap: '10px', cursor: 'pointer', alignItems: 'center' }}>
                <Settings size={18} /> Settings
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', overflow: 'hidden' }}>
        
        {/* Header */}
        <header style={{ height: '50px', padding: '0 20px', borderBottom: '1px solid #33333322', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Menu onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer' }} />
          <div style={{ fontWeight: 'bold' }}>Protonix AI</div>
        </header>

        {/* Settings Modal */}
        {showSettings && (
           <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ background: isDarkMode ? '#1e1e21' : '#fff', padding: '30px', borderRadius: '24px', width: '400px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{margin:0}}>Settings</h3><X onClick={()=>setShowSettings(false)} style={{cursor:'pointer'}}/></div>
               <div style={{ padding: '15px', background: '#8882', borderRadius: '12px', margin: '20px 0', display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4f46e5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><User color="white"/></div>
                 <div><p style={{margin:0, fontWeight:'bold'}}>Protonix User</p><p style={{margin:0, fontSize:'11px', opacity:0.5}}>{user?.email}</p></div>
               </div>
               <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ef4444', color: '#ef4444', background: 'none', cursor: 'pointer' }}>Logout</button>
             </div>
          </div>
        )}

        {/* TOP SPACER (Only when empty) - pushes logos down from top */}
        {isChatEmpty && <div style={{ flex: '0.4 1 auto' }} />}

        {/* Chat Scroll Container */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="chat-scroll-container" 
          style={{ 
            // FIXED: Use '1' (flex-grow: 1, flex-shrink: 1, flex-basis: 0%) to allow shrinking
            flex: isChatEmpty ? '0 0 auto' : '1', 
            overflowY: 'auto', 
            padding: '40px', 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0,
            justifyContent: 'flex-start'
          }}
        >
          {isChatEmpty ? (
            <div style={{ textAlign: 'center', paddingBottom: '0px' }}>
              <h1 style={{ fontSize: '25px', fontWeight: '900', marginBottom: '40px' }}>Choose Intelligence</h1>
              <div className="bot-grid-container">
                {bots.map(bot => (
                  <div key={bot.id} className="bot-card" onClick={() => setSelectedBot(bot)} style={{ background: isDarkMode ? '#1e1e21' : '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #33333322', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '50px', height: '40px', background: 'white', borderRadius: '10px', padding: '8px', marginBottom: '5px' }}>
                      <img src={bot.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt={bot.name} />
                    </div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{bot.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', paddingBottom: '30px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexDirection: m.sender === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '8px', padding: '5px', flexShrink: 0 }}>
                    {m.sender === 'user' ? <User size={24} color="black" /> : <img src={m.botLogo} style={{ width: '100%' }} alt="bot" />}
                  </div>
                  <div style={{ background: m.sender === 'user' ? '#4f46e5' : (isDarkMode ? '#1e1e21' : '#fff'), padding: '14px 20px', borderRadius: '16px', border: m.sender === 'bot' ? '1px solid #33333322' : 'none', maxWidth: '85%', wordBreak: 'break-word' }}>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{m.text}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {showScrollBtn && (
          <button onClick={scrollToBottom} style={{ position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '40px', borderRadius: '50%', background: isDarkMode ? '#333' : '#fff', color: isDarkMode ? '#fff' : '#333', border: '1px solid #33333344', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 20 }}>
            <ArrowDown size={20} />
          </button>
        )}

        {/* Input Area */}
        <div style={{ padding: '20px', maxWidth: '750px', width: '100%', margin: '0 auto', flexShrink: 0, zIndex: 10 }}>
          
          {/* Visualizer (Bottom-anchored) */}
          {isListening && (
            <div style={{ 
              display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '10px', 
              alignItems: 'flex-end', height: '20px' 
            }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ 
                  width: '4px', 
                  height: `${Math.max(6, volume * (i % 2 === 0 ? 0.6 : 0.9))}px`, 
                  background: '#4f46e5', 
                  borderRadius: '10px', 
                  transition: '0.1s' 
                }} />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', background: isDarkMode ? '#1e1e21' : '#fff', border: '1px solid #33333322', borderRadius: '24px', padding: '15px 20px', alignItems: 'flex-end', gap: '15px' }}>
             
             <div style={{ display: 'flex', gap: '10px', paddingBottom: '3px' }}>
                {!isListening ? <Mic size={20} onClick={handleVoiceToggle} style={{ cursor: 'pointer' }} color="#94a3b8" /> : <MicOff size={20} onClick={handleVoiceToggle} color="#ef4444" style={{ cursor: 'pointer' }} />}
                {isPurifying ? <Loader2 size={20} className="animate-spin" color="#a855f7" /> : <Wand2 size={20} onClick={handlePurify} color="#a855f7" style={{ cursor: 'pointer' }} />}
             </div>

             <textarea 
               ref={textareaRef} 
               rows={1} 
               placeholder="Message..." 
               style={{ flex: 1, background: 'transparent', border: 'none', color: 'inherit', outline: 'none', resize: 'none', overflowY: 'auto', minHeight: '24px', maxHeight: '200px', fontSize: '16px', lineHeight: '1.5' }} 
               value={inputMessage} 
               onChange={(e) => setInputMessage(e.target.value)} 
               onKeyDown={handleKeyDown}
             />
             
             <Send size={20} onClick={handleSend} color="#4f46e5" style={{ cursor: 'pointer', marginBottom: '5px' }} />
          </div>
        </div>

        {/* BOTTOM SPACER (Only when empty) - pushes everything else UP */}
        {isChatEmpty && <div style={{ flex: '1 1 auto' }} />}

      </main>
    </div>
  );
};

export default ChatPage;