import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Settings, Menu, User,
  Mic, MicOff, MessageSquare, X, LogOut, Loader2,
  ArrowDown, Moon, Sun, Mail, Clock, Trash2, Sparkles,
  ChevronDown, LayoutGrid, Check, Copy, Volume2, VolumeX
} from 'lucide-react';

import gptLogo        from '../assets/logos/gpt.png';
import claudeLogo     from '../assets/logos/claude.png';
import geminiLogo     from '../assets/logos/gemini.png';
import perplexityLogo from '../assets/logos/perplexity.png';
import deepseekLogo   from '../assets/logos/deepseek.png';
import grokLogo       from '../assets/logos/grok.png';

const API = import.meta.env.VITE_API_URL || 'https://protonix-ai.onrender.com';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  if (h < 21) return 'Good evening,';
  return 'Good night,';
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts), now = new Date(), diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const storageKey   = (e) => `protonix_chats_${e || 'guest'}`;
const loadChats    = (e) => { try { const r = localStorage.getItem(storageKey(e)); return r ? JSON.parse(r) : []; } catch { return []; } };
const persistChats = (e, c) => { try { localStorage.setItem(storageKey(e), JSON.stringify(c)); } catch {} };

const improveQuestion = async (text) => {
  try {
    const res = await fetch(`${API}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `You are a prompt engineer. Rewrite the following message to be clearer, grammatically correct, and optimized to get the best possible AI response. Fix any spelling or grammar errors. Return ONLY the rewritten message, no explanation, no quotes:\n\n${text}`,
        botId: 'deepseek',
      }),
    });
    if (!res.ok) return text;

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';
    let   result  = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload);
          if (parsed.token) result += parsed.token;
        } catch { /* skip */ }
      }
    }

    return result.replace(/^["']|["']$/g, '').trim() || text;
  } catch { return text; }
};

// ── Multi-Chat Modal ──────────────────────────────────────────────────────────
const MultiChatModal = ({ bots, activeBots, onConfirm, onClose, dm }) => {
  const [sel, setSel] = useState({ ...activeBots });
  const count = Object.values(sel).filter(Boolean).length;
  const surface = dm ? '#16161c' : '#fff';
  const card    = dm ? '#1e1e28' : '#f0f2f8';
  const border  = dm ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const text    = dm ? '#ededf5' : '#1a1a2e';
  const muted   = dm ? 'rgba(200,200,220,0.4)' : 'rgba(30,30,60,0.4)';
  const accent  = '#5b5fcf';

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(10px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:surface, border:`1px solid ${border}`, borderRadius:24, padding:28, width:'40%', minWidth:320, maxWidth:560, boxShadow:'0 40px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
          <div>
            <h2 style={{ margin:0, fontWeight:800, fontSize:'1.1rem', color:text }}>Compare AI Models</h2>
            <p style={{ margin:'4px 0 0', fontSize:'.8rem', color:muted }}>Select models to compare side by side</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:muted, display:'flex', padding:4 }}><X size={17}/></button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:8, marginBottom:16 }}>
          {bots.map(bot => (
            <div key={bot.id} onClick={() => setSel(p => ({ ...p, [bot.id]: !p[bot.id] }))}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:13, border:`2px solid ${sel[bot.id] ? bot.accent : border}`, background: sel[bot.id] ? `${bot.accent}15` : card, cursor:'pointer', transition:'all .15s', userSelect:'none' }}>
              <div style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.96)', padding:4, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <img src={bot.logo} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
              </div>
              <span style={{ fontWeight:700, fontSize:'.88rem', color: sel[bot.id] ? bot.accent : text, flex:1 }}>{bot.name}</span>
              <div style={{ width:17, height:17, borderRadius:5, border:`2px solid ${sel[bot.id] ? bot.accent : border}`, background: sel[bot.id] ? bot.accent : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {sel[bot.id] && <Check size={10} color="#fff" strokeWidth={3}/>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => count > 0 && onConfirm(sel)} disabled={count === 0}
            style={{ flex:1, padding:'13px', background: count > 0 ? `linear-gradient(135deg,${accent},#7c3aed)` : border, color: count > 0 ? '#fff' : muted, border:'none', borderRadius:13, fontWeight:800, cursor: count > 0 ? 'pointer' : 'not-allowed', fontSize:'.9rem', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <LayoutGrid size={15}/>
            {count === 0 ? 'Select at least one' : `Compare ${count} model${count>1?'s':''} →`}
          </button>
          <button onClick={onClose}
            style={{ padding:'13px 16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:13, cursor:'pointer', color:'#ef4444', fontWeight:800, fontSize:'.9rem', display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            <X size={15}/> Exit
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Model Dropdown ────────────────────────────────────────────────────────────
const ModelDropdown = ({ bots, selectedBot, onSelect, dm }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const surface = dm ? '#1e1e28' : '#fff';
  const border  = dm ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const text    = dm ? '#ededf5' : '#1a1a2e';
  const muted   = dm ? 'rgba(200,200,220,0.4)' : 'rgba(30,30,60,0.4)';
  const accent  = '#5b5fcf';
  const bot     = selectedBot || bots.find(b => b.id === 'deepseek');

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position:'relative', flexShrink:0 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 8px 5px 6px', background: open ? `${accent}22` : `${accent}12`, border:`1px solid ${open ? accent+'55' : border}`, borderRadius:10, cursor:'pointer', color:text, transition:'all .15s', userSelect:'none' }}>
        <div style={{ width:18, height:18, background:'rgba(255,255,255,0.96)', borderRadius:5, padding:2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <img src={bot.logo} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
        </div>
        <span style={{ fontSize:'.75rem', fontWeight:700, maxWidth:68, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{bot.name}</span>
        <ChevronDown size={11} style={{ opacity:.55, flexShrink:0, transform: open ? 'rotate(180deg)' : 'none', transition:'transform .15s' }}/>
      </button>

      {open && (
        <div style={{ position:'absolute', bottom:'calc(100% + 8px)', right:0, background:surface, border:`1px solid ${border}`, borderRadius:16, padding:6, boxShadow:'0 20px 50px rgba(0,0,0,0.45)', zIndex:200, minWidth:170 }}>
          {bots.map(b => (
            <div key={b.id} onClick={() => { onSelect(b); setOpen(false); }}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 11px', borderRadius:9, cursor:'pointer', background: bot.id===b.id ? `${b.accent}15` : 'transparent', transition:'background .12s' }}
              onMouseEnter={e => { if(bot.id!==b.id) e.currentTarget.style.background=`${b.accent}10`; }}
              onMouseLeave={e => { if(bot.id!==b.id) e.currentTarget.style.background='transparent'; }}>
              <div style={{ width:24, height:24, background:'rgba(255,255,255,0.96)', borderRadius:6, padding:3, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <img src={b.logo} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
              </div>
              <span style={{ fontSize:'.84rem', fontWeight:600, color: bot.id===b.id ? b.accent : text, flex:1 }}>{b.name}</span>
              {bot.id===b.id && <div style={{ width:6, height:6, borderRadius:'50%', background:b.accent, flexShrink:0 }}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const ChatPage = ({ user, onLogout }) => {
  const navigate  = useNavigate();
  const userEmail = user?.email || '';
  const firstName = user?.fullName?.split(' ')[0] || userEmail.split('@')[0] || 'there';

  const bots = [
    { id:'gpt',        name:'ChatGPT',    logo:gptLogo,        accent:'#10a37f' },
    { id:'claude',     name:'Claude',     logo:claudeLogo,     accent:'#d97757' },
    { id:'gemini',     name:'Gemini',     logo:geminiLogo,     accent:'#4285f4' },
    { id:'perplexity', name:'Perplexity', logo:perplexityLogo, accent:'#20b2aa' },
    { id:'deepseek',   name:'DeepSeek',   logo:deepseekLogo,   accent:'#4d6df1' },
    { id:'grok',       name:'Grok',       logo:grokLogo,       accent:'#aaaaaa' },
  ];
  const defaultBot = bots.find(b => b.id === 'deepseek');

  const [sidebarOpen,    setSidebarOpen]    = useState(window.innerWidth > 900);
  const [selectedBot,    setSelectedBot]    = useState(defaultBot);
  const [messages,       setMessages]       = useState([]);
  const [inputMessage,   setInputMessage]   = useState('');
  const [showSettings,   setShowSettings]   = useState(false);
  const [isDarkMode,     setIsDarkMode]     = useState(true);
  const [isListening,    setIsListening]    = useState(false);
  const [volume,         setVolume]         = useState(0);
  const [isImproving,    setIsImproving]    = useState(false);
  const [activeChatId,   setActiveChatId]   = useState(null);
  const [chatHistory,    setChatHistory]    = useState(() => loadChats(userEmail));
  const [compBots,       setCompBots]       = useState({});
  const [showMultiModal, setShowMultiModal] = useState(false);
  const [improveToast,   setImproveToast]   = useState('');
  const [showScrollBtn,  setShowScrollBtn]  = useState(false);
  const [respondingBots, setRespondingBots] = useState(new Set());
  const [speakingId,    setSpeakingId]    = useState(null);
  const [copiedId,      setCopiedId]      = useState(null);

  const isComparisonMode = Object.values(compBots).some(Boolean);
  const activeCompBots   = bots.filter(b => compBots[b.id]);

  const messagesEndRef   = useRef(null);
  const chatContainerRef = useRef(null);
  const isListeningRef   = useRef(false);
  const textRef          = useRef('');
  const silenceTimer     = useRef(null);
  const textareaRef      = useRef(null);
  const recognitionRef   = useRef(null);
  const audioCtxRef      = useRef(null);
  const analyserRef      = useRef(null);
  const speechRef        = useRef(null);

  const dm      = isDarkMode;
  const bg      = dm ? '#0d0d10' : '#f5f6fa';
  const surface = dm ? '#16161c' : '#fff';
  const card    = dm ? '#1e1e28' : '#f0f2f8';
  const border  = dm ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const text    = dm ? '#ededf5' : '#1a1a2e';
  const muted   = dm ? 'rgba(200,200,220,0.38)' : 'rgba(30,30,60,0.38)';
  const accent  = '#5b5fcf';
  const isMobile = window.innerWidth <= 768;

  useEffect(() => { persistChats(userEmail, chatHistory); }, [chatHistory, userEmail]);

  // Auto-resize textarea — min 48px so there's always visible space
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const h = Math.min(textareaRef.current.scrollHeight, 140);
      textareaRef.current.style.height = `${Math.max(h, 24)}px`;
    }
  }, [inputMessage]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 150);
  };

  const loadChat = (chat) => {
    setActiveChatId(chat.id); setMessages(chat.messages || []);
    setSelectedBot(bots.find(b => b.id === chat.botId) || defaultBot);
    setCompBots({});
    if (isMobile) setSidebarOpen(false);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    setChatHistory(p => p.filter(c => c.id !== id));
    if (activeChatId === id) { setActiveChatId(null); setMessages([]); setSelectedBot(defaultBot); }
  };

  const startNewChat = () => {
    setActiveChatId(null); setMessages([]); setSelectedBot(defaultBot); setCompBots({});
    if (isMobile) setSidebarOpen(false);
  };

  const handleVoiceToggle = async () => {
    // ── STOP if already recording ──
    if (isListening) {
      silenceTimer.current && clearTimeout(silenceTimer.current);
      if (recognitionRef.current) {
        const r = recognitionRef.current;
        if (typeof r.stop === 'function') r.stop();
      }
      setIsListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isAndroid = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // ── Desktop: use native SpeechRecognition (instant, no latency) ──
    if (SR && !isAndroid) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioCtxRef.current.createAnalyser();
        audioCtxRef.current.createMediaStreamSource(stream).connect(analyserRef.current);
        const da = new Uint8Array(analyserRef.current.frequencyBinCount);
        const tick = () => {
          if (!analyserRef.current || !isListeningRef.current) return;
          analyserRef.current.getByteFrequencyData(da);
          setVolume(da.reduce((a, b) => a + b) / da.length);
          requestAnimationFrame(tick);
        };
        const rec = new SR();
        recognitionRef.current = rec;
        rec.continuous = rec.interimResults = true;
        rec.onstart  = () => { setIsListening(true); isListeningRef.current = true; textRef.current = inputMessage; tick(); };
        rec.onresult = (e) => {
          silenceTimer.current && clearTimeout(silenceTimer.current);
          silenceTimer.current = setTimeout(() => rec.stop(), 2500);
          setInputMessage(textRef.current + (textRef.current && !textRef.current.endsWith(' ') ? ' ' : '') + Array.from(e.results).map(r => r[0].transcript).join(''));
        };
        rec.onerror = (e) => {
          setIsListening(false); isListeningRef.current = false; setVolume(0);
          stream.getTracks().forEach(t => t.stop());
          setImproveToast(`🎤 Mic error: ${e.error}`);
          setTimeout(() => setImproveToast(''), 3000);
        };
        rec.onend = () => { setIsListening(false); isListeningRef.current = false; setVolume(0); stream.getTracks().forEach(t => t.stop()); };
        rec.start();
      } catch {
        setImproveToast('🎤 Mic permission denied');
        setTimeout(() => setImproveToast(''), 3000);
      }
      return;
    }

    // ── Mobile/Android: MediaRecorder → Whisper API (works on all mobile browsers) ──
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio visualiser
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      audioCtxRef.current.createMediaStreamSource(stream).connect(analyserRef.current);
      const da = new Uint8Array(analyserRef.current.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current || !isListeningRef.current) return;
        analyserRef.current.getByteFrequencyData(da);
        setVolume(da.reduce((a, b) => a + b) / da.length);
        requestAnimationFrame(tick);
      };

      // ✅ Pick best format — Groq Whisper supports: mp4, webm, ogg, wav, m4a
      // Android Chrome often only supports audio/mp4 or audio/webm
      const formatPriority = [
        { mime: 'audio/mp4',            ext: 'mp4'  },  // Android Chrome primary
        { mime: 'audio/webm;codecs=opus', ext: 'webm' },
        { mime: 'audio/webm',           ext: 'webm' },
        { mime: 'audio/ogg;codecs=opus',ext: 'ogg'  },
        { mime: 'audio/ogg',            ext: 'ogg'  },
      ];
      const chosen  = formatPriority.find(f => MediaRecorder.isTypeSupported(f.mime)) || { mime: '', ext: 'webm' };
      const mimeType = chosen.mime;
      const fileExt  = chosen.ext;

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      const chunks   = [];
      recognitionRef.current = recorder;

      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };

      recorder.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        textRef.current = inputMessage;
        tick();
        // Auto-stop after 30s
        silenceTimer.current = setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 30000);
      };

      recorder.onstop = async () => {
        setIsListening(false);
        isListeningRef.current = false;
        setVolume(0);
        silenceTimer.current && clearTimeout(silenceTimer.current);

        // ✅ Wait a tick for any final ondataavailable to fire on Android
        await new Promise(r => setTimeout(r, 300));
        stream.getTracks().forEach(t => t.stop());

        if (chunks.length === 0) {
          setImproveToast('🎤 No audio recorded — try again');
          setTimeout(() => setImproveToast(''), 3000);
          return;
        }

        setImproveToast('🎤 Processing…');
        try {
          // ✅ Use correct extension so Groq knows the format
          const blob     = new Blob(chunks, { type: mimeType || 'audio/mp4' });
          console.log('Sending audio:', { mimeType, fileExt, size: blob.size, chunks: chunks.length });
          if (blob.size < 1000) {
            setImproveToast('🎤 Recording too short — hold mic and speak longer');
            setTimeout(() => setImproveToast(''), 3000);
            return;
          }
          const formData = new FormData();
          formData.append('audio', blob, `audio.${fileExt}`);
          const res  = await fetch(`${API}/api/transcribe`, { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success && data.transcript?.trim()) {
            const prev = textRef.current;
            setInputMessage(prev + (prev && !prev.endsWith(' ') ? ' ' : '') + data.transcript.trim());
            setImproveToast('✅ Transcribed!');
          } else if (data.message === 'empty') {
            // ✅ Audio reached server but Groq returned empty — likely silent or too short
            setImproveToast(`🎤 No speech detected (${data.debug?.ext}, ${data.debug?.size}b)`);
          } else {
            setImproveToast(`🎤 ${data.message || 'Could not understand audio'}`);
          }
        } catch (err) {
          setImproveToast(`🎤 Error: ${err.message}`);
        }
        setTimeout(() => setImproveToast(''), 2500);
      };

      recorder.start(250); // ✅ 250ms chunks — more reliable on Android than 100ms
    } catch (err) {
      setIsListening(false);
      setImproveToast(err.name === 'NotAllowedError' ? '🎤 Allow mic permission in browser settings' : '🎤 Could not access microphone');
      setTimeout(() => setImproveToast(''), 3500);
    }
  };

  const handleImprove = async () => {
    if (!inputMessage.trim() || isImproving) return;
    setIsImproving(true);
    setImproveToast('✨ Improving…');
    const improved = await improveQuestion(inputMessage);
    setInputMessage(improved);
    setIsImproving(false);
    setImproveToast('✅ Done!');
    setTimeout(() => setImproveToast(''), 1800);
  };

  const handleCopy = (msgText, id) => {
    navigator.clipboard.writeText(msgText).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const cleanForSpeech = (raw) => {
    return raw
      // Remove all emojis (unicode emoji ranges)
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      .replace(/[\u{FE00}-\u{FEFF}]/gu, '')
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/[\u{1FA00}-\u{1FA9F}]/gu, '')
      // Remove markdown bold/italic symbols
      .replace(/\*\*?(.*?)\*\*?/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      // Remove markdown code blocks
      .replace(/```[\s\S]*?```/g, 'code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Remove bullet/list markers
      .replace(/^[\s]*[-*•]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // Remove hashtags used as headers
      .replace(/^#{1,6}\s+/gm, '')
      // Collapse extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  };

  const handleSpeak = (msgText, id) => {
    if (speakingId === id) { window.speechSynthesis.cancel(); setSpeakingId(null); return; }
    window.speechSynthesis.cancel();

    const cleaned = cleanForSpeech(msgText);

    const utt = new SpeechSynthesisUtterance(cleaned);

    // Expressive, natural voice settings
    utt.rate   = 1.2;   // slightly faster — natural pace
    utt.pitch  = 1.1;   // light male tone, not deep
    utt.volume = 1.0;

    utt.onend   = () => setSpeakingId(null);
    utt.onerror = () => setSpeakingId(null);

    // Wait for voices to load, then pick light male voice
    const pickAndSpeak = (voices) => {
      // Female voice names to avoid
      const isFemale = (v) => /female|samantha|karen|victoria|moira|fiona|tessa|zira|hazel|susan|kate|emma|lisa|amy|allison|ava|siri|kathy|vicki|junior|bells|cellos|pipe|bubbles/i.test(v.name);
      const maleEn = voices.filter(v => v.lang.startsWith('en') && !isFemale(v));
      const preferred =
        maleEn.find(v => /Rishi/i.test(v.name)) ||           // Apple Indian male
        maleEn.find(v => v.lang === 'en-IN') ||              // Indian English male
        maleEn.find(v => /Google UK English Male/i.test(v.name)) ||
        maleEn.find(v => /Daniel/i.test(v.name)) ||          // British male
        maleEn.find(v => /Alex/i.test(v.name)) ||            // macOS male
        maleEn.find(v => /David|Mark|Richard|James|Fred/i.test(v.name)) ||
        maleEn[0] ||                                          // first non-female English
        voices.find(v => v.lang.startsWith('en'));
      if (preferred) utt.voice = preferred;
      speechRef.current = utt;
      setSpeakingId(id);
      window.speechSynthesis.speak(utt);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      pickAndSpeak(voices);
    } else {
      // voices not loaded yet — wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        pickAndSpeak(window.speechSynthesis.getVoices());
      };
    }
  };

  const handleSend = useCallback(() => {
    if (!inputMessage.trim()) return;
    // Block if any bot is still streaming
    if (respondingBots.size > 0) return;

    const targets = isComparisonMode ? activeCompBots : [selectedBot || defaultBot];
    const userMsg  = { text: inputMessage, sender: 'user', time: Date.now() };
    const newMsgs  = [...messages, userMsg];
    setMessages(newMsgs);
    const chatId = activeChatId || Date.now();
    if (!activeChatId) {
      setActiveChatId(chatId);
      setChatHistory(p => [{ id: chatId, title: inputMessage.slice(0, 52), botId: targets[0]?.id, messages: newMsgs, updatedAt: Date.now() }, ...p]);
    } else {
      setChatHistory(ch => ch.map(c => c.id === chatId ? { ...c, messages: newMsgs, updatedAt: Date.now() } : c));
    }
    const msg = inputMessage;
    setInputMessage('');

    // Mark all target bots as responding
    setRespondingBots(new Set(targets.map(b => b.id)));

    targets.forEach(async (bot) => {
      const tempId = `${Date.now()}-${bot.id}`;

      // Insert loading placeholder
      setMessages(p => [...p, { text: '', sender: 'bot', botId: bot.id, botLogo: bot.logo, botName: bot.name, botAccent: bot.accent, isLoading: true, tempId }]);

      try {
        const res = await fetch(`${API}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, botId: bot.id }),
        });

        if (!res.ok) throw new Error('API error');

        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let   buffer  = '';
        let   fullText = '';
        let   started  = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') break;

            try {
              const parsed = JSON.parse(payload);
              if (parsed.error) throw new Error(parsed.error);
              const token = parsed.token;
              if (token) {
                fullText += token;
                if (!started) {
                  // Replace loading dots with first token
                  started = true;
                  setMessages(p => p.map(m => m.tempId === tempId
                    ? { ...m, text: fullText, isLoading: false }
                    : m
                  ));
                } else {
                  // Append token to existing message
                  setMessages(p => p.map(m => m.tempId === tempId
                    ? { ...m, text: fullText }
                    : m
                  ));
                }
              }
            } catch { /* skip */ }
          }
        }

        // Finalize message with timestamp, remove tempId
        setMessages(p => {
          const u = p.map(m => m.tempId === tempId
            ? { text: fullText || 'No response.', sender: 'bot', botId: bot.id, botLogo: bot.logo, botName: bot.name, botAccent: bot.accent, time: Date.now() }
            : m
          );
          setChatHistory(ch => ch.map(c => c.id === chatId ? { ...c, messages: u, updatedAt: Date.now() } : c));
          return u;
        });

      } catch {
        setMessages(p => {
          const u = p.map(m => m.tempId === tempId
            ? { text: '⚠️ Error: No response.', sender: 'bot', botId: bot.id, botLogo: bot.logo, botName: bot.name, botAccent: bot.accent }
            : m
          );
          setChatHistory(ch => ch.map(c => c.id === chatId ? { ...c, messages: u } : c));
          return u;
        });
      } finally {
        // Mark this bot as done responding
        setRespondingBots(prev => {
          const next = new Set(prev);
          next.delete(bot.id);
          return next;
        });
      }
    });
  }, [inputMessage, messages, selectedBot, isComparisonMode, activeCompBots, activeChatId, respondingBots]);

  const handleKeyDown = (e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); if (respondingBots.size === 0) handleSend(); } };
  const handleLogout  = () => { onLogout(); navigate('/'); };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing:border-box; }
    ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(91,95,207,0.2);border-radius:10px}

    .cp-sidebar { transition:width .28s cubic-bezier(.4,0,.2,1), min-width .28s cubic-bezier(.4,0,.2,1); }
    @media(max-width:768px){
      .cp-sidebar { position:fixed!important; inset:0 auto 0 0!important; width:82%!important; min-width:82%!important; z-index:50!important; transform:translateX(-100%); transition:transform .28s ease!important; }
      .cp-sidebar.open { transform:translateX(0)!important; }
    }

    .hist-row { border-radius:9px; cursor:pointer; transition:background .14s; padding:8px 9px; margin-bottom:2px; display:flex; align-items:center; gap:9px; }
    .hist-row:hover { background:${dm?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'}; }
    .hist-row.act { background:${dm?'rgba(91,95,207,0.14)':'rgba(91,95,207,0.08)'}; border-left:2px solid ${accent}; padding-left:7px; }
    .del-x { opacity:0; transition:opacity .14s; background:none; border:none; cursor:pointer; color:#ef4444; padding:2px; display:flex; }
    .hist-row:hover .del-x { opacity:1; }

    .msg-in { animation:msgIn .2s ease; }
    @keyframes msgIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }

    .tdot { display:inline-block; width:5px; height:5px; border-radius:50%; background:${accent}; margin:0 2px; animation:td 1.3s infinite; }
    .tdot:nth-child(2){animation-delay:.2s} .tdot:nth-child(3){animation-delay:.4s}
    @keyframes td { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

    .toast { position:fixed; bottom:96px; left:50%; transform:translateX(-50%); background:rgba(20,20,35,0.95); color:#fff; border:1px solid rgba(91,95,207,0.4); padding:8px 20px; border-radius:24px; font-size:.78rem; font-weight:700; z-index:999; backdrop-filter:blur(12px); white-space:nowrap; animation:toastIn .18s ease; }
    @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

    .comp-scroll { display:flex; height:100%; overflow-x:auto; overflow-y:hidden; width:100%; }
    .comp-col { flex:1 1 0; min-width:280px; display:flex; flex-direction:column; height:100%; border-right:1px solid ${border}; }
    .comp-col:last-child { border-right:none; }
    .comp-msgs { flex:1; overflow-y:auto; padding:20px 16px; display:flex; flex-direction:column; gap:14px; }
    @media(max-width:768px){ .comp-col { flex:0 0 84vw; min-width:84vw; } }

    .send-btn { transition:all .18s; }
    .send-btn:hover:not(:disabled) { transform:scale(1.07); filter:brightness(1.1); }
    @keyframes spin { to{transform:rotate(360deg)} }
    .spin { animation:spin 1s linear infinite; }

    /* textarea placeholder */
    textarea::placeholder { color:${muted}; }

    .msg-actions { display:flex; gap:5px; margin-top:6px; }
    .msg-action-btn { background:none; border:1px solid ${border}; border-radius:7px; color:${muted}; cursor:pointer; padding:3px 9px; display:inline-flex; align-items:center; gap:4px; font-size:.65rem; font-weight:600; font-family:'Plus Jakarta Sans',sans-serif; transition:all .15s; }
    .msg-action-btn:hover { background:${card}; color:${text}; border-color:${accent}55; }
    .msg-action-btn.active { color:${accent}; border-color:${accent}55; background:${accent}15; }
  `;

  return (
    <div style={{ display:'flex', height:'100vh', width:'100vw', background:bg, color:text, overflow:'hidden', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{css}</style>

      {improveToast && <div className="toast">{improveToast}</div>}

      {showMultiModal && <MultiChatModal bots={bots} activeBots={compBots} onConfirm={(s) => { const wasComparison = Object.values(compBots).some(Boolean); if (!wasComparison) { setMessages([]); setActiveChatId(null); } setCompBots(s); setShowMultiModal(false); }} onClose={() => setShowMultiModal(false)} dm={dm}/>}

      {/* Settings */}
      {showSettings && (
        <div onClick={() => setShowSettings(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:surface, border:`1px solid ${border}`, borderRadius:24, padding:28, width:'100%', maxWidth:370, boxShadow:'0 32px 70px rgba(0,0,0,0.5)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <span style={{ fontWeight:800, fontSize:'1.1rem' }}>Account</span>
              <button onClick={() => setShowSettings(false)} style={{ background:'none', border:'none', cursor:'pointer', color:muted, display:'flex' }}><X size={17}/></button>
            </div>
            <div style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:'13px 16px', marginBottom:10, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Mail size={16} color="#fff"/></div>
              <div style={{ overflow:'hidden' }}>
                <p style={{ margin:0, fontSize:'.67rem', color:muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em' }}>Email</p>
                <p style={{ margin:0, fontSize:'.88rem', fontWeight:600, color:text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{userEmail}</p>
              </div>
            </div>
            {user?.fullName && (
              <div style={{ background:card, border:`1px solid ${border}`, borderRadius:14, padding:'13px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><User size={16} color="#fff"/></div>
                <div>
                  <p style={{ margin:0, fontSize:'.67rem', color:muted, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em' }}>Name</p>
                  <p style={{ margin:0, fontSize:'.88rem', fontWeight:600, color:text }}>{user.fullName}</p>
                </div>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderTop:`1px solid ${border}`, borderBottom:`1px solid ${border}`, marginBottom:18 }}>
              <span style={{ fontSize:'.9rem', fontWeight:600 }}>Theme</span>
              <button onClick={() => setIsDarkMode(!dm)} style={{ background:card, border:`1px solid ${border}`, padding:'7px 14px', borderRadius:10, color:text, cursor:'pointer', display:'flex', gap:8, alignItems:'center', fontSize:'.83rem', fontWeight:600 }}>
                {dm ? <Moon size={14}/> : <Sun size={14}/>} {dm ? 'Dark' : 'Light'}
              </button>
            </div>
            <button onClick={handleLogout} style={{ width:'100%', padding:'13px', background:'rgba(239,68,68,0.09)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.18)', borderRadius:13, fontWeight:700, cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:9, fontSize:'.9rem' }}>
              <LogOut size={15}/> Sign Out
            </button>
          </div>
        </div>
      )}

      {isMobile && sidebarOpen && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:45 }} onClick={() => setSidebarOpen(false)}/>}

      {/* ══ SIDEBAR ══ */}
      <aside className={`cp-sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{ width:isMobile?undefined:(sidebarOpen?258:0), minWidth:isMobile?undefined:(sidebarOpen?258:0), background:surface, borderRight:`1px solid ${border}`, display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
        <div style={{ padding:'20px 14px 12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ fontWeight:800, fontSize:'1rem', background:'linear-gradient(135deg,#818cf8,#c4b5fd)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PROTONIX.AI</span>
            {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:muted, display:'flex' }}><X size={17}/></button>}
          </div>
          <button onClick={startNewChat} style={{ width:'100%', padding:'10px', background:`linear-gradient(135deg,${accent},#7c3aed)`, color:'#fff', border:'none', borderRadius:12, fontWeight:700, cursor:'pointer', fontSize:'.87rem' }}>+ New Chat</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'4px 8px 8px' }}>
          <p style={{ fontSize:'.65rem', fontWeight:800, color:muted, textTransform:'uppercase', letterSpacing:'.12em', padding:'0 4px', margin:'0 0 8px' }}>History</p>
          {chatHistory.length === 0
            ? <div style={{ textAlign:'center', padding:'28px 16px', color:muted }}><MessageSquare size={24} style={{ margin:'0 auto 8px', display:'block', opacity:.25 }}/><p style={{ fontSize:'.78rem', margin:0 }}>No chats yet</p></div>
            : chatHistory.map(chat => (
              <div key={chat.id} className={`hist-row ${activeChatId===chat.id?'act':''}`} onClick={() => loadChat(chat)}>
                <div style={{ width:26, height:26, borderRadius:8, background:'rgba(91,95,207,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {chat.botId ? <img src={bots.find(b=>b.id===chat.botId)?.logo} style={{ width:14, height:14, objectFit:'contain' }} alt=""/> : <MessageSquare size={12} color={accent}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:'.78rem', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:text }}>{chat.title}</p>
                  <p style={{ margin:0, fontSize:'.65rem', color:muted, display:'flex', alignItems:'center', gap:3, marginTop:1 }}><Clock size={9}/>{formatTime(chat.updatedAt||chat.id)}</p>
                </div>
                <button className="del-x" onClick={e=>deleteChat(e,chat.id)}><Trash2 size={12}/></button>
              </div>
            ))
          }
        </div>
        <div style={{ padding:'10px 10px 16px', borderTop:`1px solid ${border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 10px', borderRadius:12, background:card }}>
            <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${accent},#7c3aed)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'.85rem', fontWeight:800, color:'#fff' }}>{firstName[0]?.toUpperCase()}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:0, fontSize:'.79rem', fontWeight:700, color:text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.fullName || firstName}</p>
              <p style={{ margin:0, fontSize:'.65rem', color:muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{userEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative', minWidth:0 }}>

        {/* ── HEADER — greeting center + settings right. NO multi-chat button here ── */}
        <header style={{ height:52, padding:'0 14px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, background:surface, gap:8 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background:'none', border:'none', color:text, cursor:'pointer', padding:4, opacity:.6, display:'flex', flexShrink:0 }}>
            <Menu size={19}/>
          </button>

          {/* Center: ONLY greeting text */}
          <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', minWidth:0, overflow:'hidden' }}>
            {isComparisonMode
              ? <span style={{ fontWeight:800, fontSize:'.86rem', color:accent, whiteSpace:'nowrap' }}>⚡ Comparing {activeCompBots.length} AIs</span>
              : <span style={{ fontWeight:600, fontSize: isMobile ? '.78rem' : '.88rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  <span style={{ color:muted, fontWeight:500 }}>{getGreeting()}</span>{' '}
                  <span style={{ color:text, fontWeight:800 }}>{firstName}</span>
                </span>
            }
          </div>

          <button onClick={() => setShowSettings(true)} style={{ background:'none', border:'none', color:text, cursor:'pointer', padding:4, opacity:.55, display:'flex', flexShrink:0 }}>
            <Settings size={18}/>
          </button>
        </header>

        {/* ── CHAT / COMPARISON ── */}
        <div ref={chatContainerRef} onScroll={handleScroll}
          style={{ flex:1, overflowY: isComparisonMode ? 'hidden' : 'auto', overflowX:'hidden', display:'flex', flexDirection:'column', position:'relative', minWidth:0 }}>

          {/* EMPTY STATE */}
          {messages.length === 0 && !isComparisonMode && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'36px 20px', textAlign:'center', minHeight:'100%' }}>
              <div style={{ width:56, height:56, borderRadius:18, background:`linear-gradient(135deg,${accent},#7c3aed)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:`0 12px 28px ${accent}44` }}>
                <MessageSquare size={24} color="#fff"/>
              </div>
              <h1 style={{ fontWeight:800, fontSize:'clamp(1.4rem,4vw,2rem)', margin:'0 0 10px', color:text, letterSpacing:'-.02em', lineHeight:1.2 }}>
                What do you want<br/>to explore today?
              </h1>
              <p style={{ color:muted, fontSize:'.88rem', margin:'0 0 20px', lineHeight:1.65, maxWidth:340 }}>
                Powered by <strong style={{ color:accent }}>ChatGPT, Claude, Gemini, Perplexity, DeepSeek & Grok</strong>
              </p>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', maxWidth:380 }}>
                {bots.map(bot => (
                  <div key={bot.id} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 13px', borderRadius:12, background:card, border:`1px solid ${border}`, userSelect:'none', pointerEvents:'none' }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:'rgba(255,255,255,0.96)', padding:3, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <img src={bot.logo} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
                    </div>
                    <span style={{ fontSize:'.78rem', fontWeight:700, color:text }}>{bot.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPARISON columns */}
          {isComparisonMode && (
            <div className="comp-scroll">
              {activeCompBots.length === 0
                ? <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:muted }}><p>No models selected</p></div>
                : activeCompBots.map(bot => (
                  <div key={bot.id} className="comp-col">
                    <div style={{ padding:'11px 16px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:10, background:surface, flexShrink:0 }}>
                      <div style={{ width:28, height:28, background:'rgba(255,255,255,0.97)', borderRadius:8, padding:4, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 2px 10px ${bot.accent}33`, flexShrink:0 }}>
                        <img src={bot.logo} style={{ width:'100%', height:'100%', objectFit:'contain' }} alt=""/>
                      </div>
                      <span style={{ fontWeight:800, fontSize:'.86rem', color:text }}>{bot.name}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background:bot.accent }}/>
                        {activeCompBots.indexOf(bot) === 0 && (
                          <button onClick={() => { setCompBots({}); setMessages([]); setActiveChatId(null); }} title="Exit comparison"
                            style={{ display:'flex', alignItems:'center', gap:3, padding:'3px 8px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.22)', borderRadius:7, cursor:'pointer', color:'#ef4444', fontSize:'.68rem', fontWeight:800, flexShrink:0, whiteSpace:'nowrap' }}>
                            <X size={11}/> Exit
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="comp-msgs">
                      {messages.filter(m => m.sender==='user' || m.botId===bot.id).map((m,i) => (
                        <div key={i} className="msg-in" style={{ display:'flex', justifyContent: m.sender==='user'?'flex-end':'flex-start' }}>
                          <div style={{ maxWidth:'88%' }}>
                            <div style={{ padding:'11px 15px', borderRadius: m.sender==='user'?'16px 16px 4px 16px':'4px 16px 16px 16px', background: m.sender==='user'?accent:card, border: m.sender!=='user'?`1px solid ${border}`:'none', fontSize:'.86rem', lineHeight:1.68, color: m.sender==='user'?'#fff':text, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                              {m.isLoading ? <><span className="tdot"/><span className="tdot"/><span className="tdot"/></> : m.text}
                            </div>
                            {m.sender==='bot' && !m.isLoading && m.text && (
                              <div className="msg-actions">
                                <button className={`msg-action-btn ${copiedId===`${bot.id}-${i}`?'active':''}`} onClick={() => handleCopy(m.text, `${bot.id}-${i}`)}>
                                  <Copy size={11}/>{copiedId===`${bot.id}-${i}` ? 'Copied!' : 'Copy'}
                                </button>
                                <button className={`msg-action-btn ${speakingId===`${bot.id}-${i}`?'active':''}`} onClick={() => handleSpeak(m.text, `${bot.id}-${i}`)}>
                                  {speakingId===`${bot.id}-${i}` ? <><VolumeX size={11}/>Stop</> : <><Volume2 size={11}/>Speak</>}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef}/>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* NORMAL CHAT */}
          {messages.length > 0 && !isComparisonMode && (
            <div style={{ maxWidth:820, width:'100%', margin:'0 auto', padding:'26px 18px', display:'flex', flexDirection:'column', gap:20 }}>
              {messages.map((m, i) => (
                <div key={i} className="msg-in" style={{ display:'flex', gap:11, flexDirection: m.sender==='user'?'row-reverse':'row', alignItems:'flex-start' }}>
                  <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background: m.sender==='user'?`linear-gradient(135deg,${accent},#7c3aed)`:'rgba(255,255,255,0.97)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 3px 10px ${m.sender==='user'?'rgba(91,95,207,0.3)':m.botAccent+'25'||'rgba(0,0,0,0.08)'}` }}>
                    {m.sender==='user'
                      ? <span style={{ fontSize:'.72rem', fontWeight:800, color:'#fff' }}>{firstName[0]?.toUpperCase()}</span>
                      : <img src={m.botLogo} style={{ width:'68%', height:'68%', objectFit:'contain' }} alt=""/>}
                  </div>
                  <div style={{ maxWidth:'80%', minWidth:0 }}>
                    {m.sender!=='user' && <p style={{ margin:'0 0 4px 2px', fontSize:'.66rem', fontWeight:800, color:m.botAccent||accent, textTransform:'uppercase', letterSpacing:'.08em' }}>{m.botName}</p>}
                    <div style={{ padding:'12px 16px', borderRadius: m.sender==='user'?'16px 16px 4px 16px':'4px 16px 16px 16px', background: m.sender==='user'?accent:card, border: m.sender!=='user'?`1px solid ${border}`:'none', fontSize:'.9rem', lineHeight:1.72, color: m.sender==='user'?'#fff':text, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                      {m.isLoading ? <><span className="tdot"/><span className="tdot"/><span className="tdot"/></> : m.text}
                    </div>
                    {m.sender==='bot' && !m.isLoading && m.text && (
                      <div className="msg-actions">
                        <button className={`msg-action-btn ${copiedId===i?'active':''}`} onClick={() => handleCopy(m.text, i)}>
                          <Copy size={11}/>{copiedId===i ? 'Copied!' : 'Copy'}
                        </button>
                        <button className={`msg-action-btn ${speakingId===i?'active':''}`} onClick={() => handleSpeak(m.text, i)}>
                          {speakingId===i ? <><VolumeX size={11}/>Stop</> : <><Volume2 size={11}/>Speak</>}
                        </button>
                      </div>
                    )}
                    {m.time && <p style={{ margin:'3px 2px 0', fontSize:'.62rem', color:muted }}>{formatTime(m.time)}</p>}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}/>
            </div>
          )}
        </div>

        {showScrollBtn && (
          <button onClick={() => messagesEndRef.current?.scrollIntoView({ behavior:'smooth' })} style={{ position:'absolute', bottom:88, right:16, width:33, height:33, borderRadius:'50%', background:accent, border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 14px ${accent}55`, zIndex:10 }}>
            <ArrowDown size={14}/>
          </button>
        )}

        {/* ══ INPUT BAR ══
            Layout: [Mic] [✨] [  textarea grows  ] [Model▾] [Send]
            All icons bottom-aligned. Message text sits slightly above bottom row.
        */}
        <div style={{ padding:'8px 14px 10px', background:surface, borderTop:`1px solid ${border}`, flexShrink:0 }}>
          {isListening && (
            <div style={{ display:'flex', gap:3, justifyContent:'center', marginBottom:6, alignItems:'flex-end', height:14 }}>
              {[...Array(10)].map((_,i) => <div key={i} style={{ width:3, height:`${Math.max(3,volume*(i%3===0?0.5:i%3===1?0.8:0.65))}px`, background:accent, borderRadius:6, transition:'height .08s' }}/>)}
            </div>
          )}

          {/* Outer wrapper — rounded pill container */}
          <div style={{ display:'flex', flexDirection:'column', background:card, border:`1px solid ${border}`, borderRadius:22, padding:'10px 12px 8px', maxWidth:760, margin:'0 auto' }}>

            {/* Textarea row — sits on top with generous space */}
            <textarea ref={textareaRef} rows={1}
              placeholder={isComparisonMode ? `Message all ${activeCompBots.length} AIs…` : `Message ${selectedBot?.name||'DeepSeek'}…`}
              style={{ width:'100%', background:'transparent', border:'none', color:text, outline:'none', resize:'none', fontSize:'.92rem', lineHeight:1.65, fontFamily:"'Plus Jakarta Sans',sans-serif", maxHeight:140, overflowY:'auto', padding:'0 2px', minHeight:24, display:'block' }}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* Bottom icon row — all bottom-aligned, compact */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>

              {/* Mic — works on all devices via Whisper on mobile */}
              <button onClick={handleVoiceToggle} title={isListening ? "Tap to stop" : "Voice input"}
                style={{ background: isListening ? 'rgba(239,68,68,0.12)' : 'none', border: 'none', cursor: 'pointer', color: isListening ? '#ef4444' : muted, display: 'flex', padding: '3px', flexShrink: 0, borderRadius: 6, transition: 'all .15s' }}>
                {isListening ? <MicOff size={17}/> : <Mic size={17}/>}
              </button>

              {/* Improve — icon only, no text */}
              <button onClick={handleImprove} disabled={!inputMessage.trim()||isImproving} title="Improve question"
                style={{ background:'none', border:'none', cursor:inputMessage.trim()?'pointer':'not-allowed', color:inputMessage.trim()?accent:muted, display:'flex', padding:'3px', flexShrink:0, opacity:inputMessage.trim()?1:0.4 }}>
                {isImproving ? <Loader2 size={17} className="spin"/> : <Sparkles size={17}/>}
              </button>

              {/* Spacer */}
              <div style={{ flex:1 }}/>

              {/* Model dropdown — ONLY in input, nowhere else */}
              {!isComparisonMode && (
                <ModelDropdown bots={bots} selectedBot={selectedBot} onSelect={setSelectedBot} dm={dm}/>
              )}

              {/* Multi-Chat button — ONLY in input bar */}
              {!isComparisonMode && (
                <button onClick={() => setShowMultiModal(true)} title="Compare models"
                  style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 9px', background:`rgba(91,95,207,0.1)`, border:`1px solid ${border}`, borderRadius:9, cursor:'pointer', color:muted, fontSize:'.72rem', fontWeight:700, flexShrink:0, whiteSpace:'nowrap' }}>
                  <LayoutGrid size={13}/>
                  <span style={{ display: isMobile ? 'none' : 'inline' }}>Multi-Chat</span>
                </button>
              )}
              {isComparisonMode && (
                <button onClick={() => setShowMultiModal(true)} title="Change models"
                  style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 9px', background:`rgba(91,95,207,0.1)`, border:`1px solid ${border}`, borderRadius:9, cursor:'pointer', color:accent, fontSize:'.72rem', fontWeight:700, flexShrink:0, whiteSpace:'nowrap' }}>
                  <LayoutGrid size={13}/>
                  <span style={{ display: isMobile ? 'none' : 'inline' }}>Multi-Chat</span>
                </button>
              )}

              {/* Send */}
              <button className="send-btn" onClick={handleSend}
                disabled={!inputMessage.trim() || respondingBots.size > 0}
                title={respondingBots.size > 0 ? 'Waiting for response…' : 'Send'}
                style={{
                  background: (inputMessage.trim() && respondingBots.size === 0)
                    ? `linear-gradient(135deg,${accent},#7c3aed)`
                    : 'rgba(91,95,207,0.1)',
                  border: 'none', borderRadius: 11, width: 34, height: 34,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: (inputMessage.trim() && respondingBots.size === 0) ? 'pointer' : 'not-allowed',
                  flexShrink: 0, position: 'relative', overflow: 'hidden',
                }}>
                {respondingBots.size > 0
                  ? <Loader2 size={14} color={muted} className="spin"/>
                  : <Send size={14} color={inputMessage.trim() ? '#fff' : muted}/>
                }
              </button>
            </div>
          </div>

          <p style={{ textAlign:'center', fontSize:'.62rem', color:muted, margin:'5px 0 0' }}>
            Shift+Enter for new line · Protonix is AI, it can make mistakes
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;