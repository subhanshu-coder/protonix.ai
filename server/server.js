// ═══════════════════════════════════════════════════════════
// server.js — PROTONIX.AI Complete Backend
// ═══════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

// ═══════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_ALT,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));
app.use(express.json());

// ═══════════════════════════════════════════════════════════
// MONGODB
// ═══════════════════════════════════════════════════════════
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ═══════════════════════════════════════════════════════════
// USER SCHEMA
// ═══════════════════════════════════════════════════════════
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: function () { return !this.googleId; },
    trim: true,
  },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  googleId: { type: String, sparse: true, unique: true },
  avatar:   { type: String, default: '' },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  isVerified: { type: Boolean, default: false },
  passwordResetToken:   { type: String },
  passwordResetExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

// ═══════════════════════════════════════════════════════════
// JWT HELPERS
// ═══════════════════════════════════════════════════════════
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:       user._id,
      fullName: user.fullName,
      email:    user.email,
      avatar:   user.avatar,
      provider: user.provider,
    },
  });
};

// ═══════════════════════════════════════════════════════════
// EMAIL — Brevo HTTP API
// ✅ Works on Render free tier (no SMTP ports)
// ✅ Sends to ANY email address worldwide
// ✅ 300 free emails/day
// ═══════════════════════════════════════════════════════════
const sendEmail = async ({ to, subject, html }) => {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'api-key':      process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender:      { name: 'Protonix.AI', email: process.env.BREVO_USER },
      to:          [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Brevo API error');
  return data;
};

console.log('✅ Email (Brevo HTTP API) ready — sends to any email worldwide');

// ═══════════════════════════════════════════════════════════
// CHAT ROUTE
// ═══════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  const { message, botId } = req.body;
  if (!message || !botId) return res.status(400).json({ error: 'Missing message or botId.' });

  try {
    let apiKey = '', modelPath = '', temperature = 0.7;
    let systemPrompt = 'You are a helpful assistant.';
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    if      (botId === 'grok')       { apiKey = process.env.GROK_OR_KEY;       modelPath = 'x-ai/grok-3-mini-beta';       systemPrompt = 'You are Grok, a witty and highly capable AI. Be concise and helpful.'; }
    else if (botId === 'perplexity') { apiKey = process.env.PERPLEXITY_OR_KEY;  modelPath = 'perplexity/sonar';            systemPrompt = 'You are a real-time search specialist. Always use the web for 2026 data. Provide citations.'; }
    else if (botId === 'gemini')     { apiKey = process.env.GEMINI_OR_KEY;      modelPath = 'google/gemini-2.0-flash-001'; }
    else if (botId === 'claude')     { apiKey = process.env.CLAUDE_OR_KEY;      modelPath = 'anthropic/claude-3-haiku'; }
    else if (botId === 'gpt')        { apiKey = process.env.GPT_OR_KEY;         modelPath = 'openai/gpt-4o-mini'; }
    else if (botId === 'deepseek')   { apiKey = process.env.DEEPSEEK_OR_KEY;    modelPath = 'deepseek/deepseek-chat'; }

    if (!apiKey) return res.status(400).json({ error: `No API key for: ${botId}` });

    // SSE streaming headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'HTTP-Referer':  process.env.CLIENT_URL || '',
        'X-Title':       'Protonix AI',
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:       modelPath,
        messages:    [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        max_tokens:  800,
        temperature,
        stream:      true,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json();
      console.error(`${botId} error:`, err);
      res.write(`data: ${JSON.stringify({ error: err.error?.message || 'API error' })}\n\n`);
      return res.end();
    }

    const reader  = upstream.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';

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
        if (payload === '[DONE]') { res.write('data: [DONE]\n\n'); continue; }
        try {
          const parsed = JSON.parse(payload);
          const token  = parsed.choices?.[0]?.delta?.content;
          if (token) res.write(`data: ${JSON.stringify({ token })}\n\n`);
        } catch { /* skip */ }
      }
    }

    console.log(`${botId} stream done`);
    res.end();

  } catch (err) {
    console.error('Chat error:', err.message);
    if (!res.headersSent) return res.status(500).json({ error: err.message });
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ═══════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'User already exists.' });
    const user = await User.create({ fullName, email, password, provider: 'local' });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleUserInfo } = req.body;
    const { sub: googleId, email, name, picture } = googleUserInfo;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({
        fullName: name, email, googleId,
        avatar: picture, provider: 'google', isVerified: true,
      });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ success: false, message: 'Google Auth Error.' });
  }
});

// ═══════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to:      user.email,
      subject: 'Reset Your Password — PROTONIX.AI',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f0f1a;color:#fff;border-radius:14px;overflow:hidden;">
          <div style="padding:28px 32px;background:linear-gradient(135deg,#0d1117,#1a1f35);border-bottom:1px solid rgba(255,255,255,0.07);text-align:center;">
            <h1 style="margin:0;font-size:1.6rem;font-weight:800;color:#fff;">PROTONIX<span style="color:#00e5ff;">.AI</span></h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:0.78rem;">All AIs, One Tab</p>
          </div>
          <div style="padding:36px 32px;">
            <h2 style="margin:0 0 10px;font-size:1.2rem;color:#fff;">Reset Your Password</h2>
            <p style="color:rgba(255,255,255,0.55);line-height:1.65;margin:0 0 28px;font-size:0.92rem;">
              Click the button below to reset your password. Valid for <strong style="color:#fbbf24;">15 minutes</strong>.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${resetUrl}" style="display:inline-block;padding:13px 34px;background:linear-gradient(135deg,#00e5ff,#0080ff);color:#000;font-weight:700;font-size:0.95rem;text-decoration:none;border-radius:10px;">
                Reset Password →
              </a>
            </div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:14px 16px;">
              <p style="margin:0;color:rgba(255,255,255,0.38);font-size:0.78rem;line-height:1.8;">
                ⏰ Expires in <strong style="color:#fbbf24;">15 minutes</strong><br/>
                🔒 Didn't request this? Ignore this email.<br/>
                🚫 Never share this link with anyone.
              </p>
            </div>
            <p style="margin-top:20px;color:rgba(255,255,255,0.22);font-size:0.72rem;word-break:break-all;">
              Button not working? Copy into browser:<br/>
              <span style="color:#00e5ff;">${resetUrl}</span>
            </p>
          </div>
          <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.20);font-size:0.72rem;">© 2025 Protonix.AI · Made by Subhanshu Pal</p>
          </div>
        </div>
      `,
    });

    console.log(`✅ Reset email sent to ${user.email}`);
    res.status(200).json({ success: true, message: 'Reset link sent to your email.' });

  } catch (err) {
    console.error('❌ Forgot password error:', err.message);
    res.status(500).json({ success: false, message: `Failed to send reset email: ${err.message}` });
  }
});

// ═══════════════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════════════
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Token is invalid or has expired.' });

    user.password             = req.body.password;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// TEST EMAIL
// https://protonix-ai.onrender.com/api/test-email?to=anyone@gmail.com
// ═══════════════════════════════════════════════════════════
app.get('/api/test-email', async (req, res) => {
  const to = req.query.to || process.env.BREVO_USER;
  try {
    await sendEmail({
      to,
      subject: 'Protonix.AI — Email Test ✅',
      html: `<div style="font-family:Arial;padding:24px;background:#0f0f1a;color:#fff;border-radius:10px;"><h2 style="color:#00e5ff;">Email working! ✅</h2><p>Brevo HTTP API working. Sent to: ${to}</p></div>`,
    });
    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err) {
    console.error('Test email error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// ELEVENLABS TTS
// ═══════════════════════════════════════════════════════════
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });
  try {
    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
    const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam — natural male voice
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': ELEVEN_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true },
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: 'TTS failed', detail: err });
    }
    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// SPEECH TO TEXT — Groq Whisper
// ═══════════════════════════════════════════════════════════
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No audio file received.' });

    const apiKey = (process.env.GROQ_SPEECH_KEY || process.env.GROQ_API_KEY || '').trim();
    if (!apiKey) return res.status(400).json({ success: false, message: 'GROQ_SPEECH_KEY not configured.' });

    // Determine correct extension — critical for Groq to parse correctly
    const originalName = req.file.originalname || 'audio.webm';
    const ext = originalName.split('.').pop()?.toLowerCase() || 'webm';
    const safeExt = ['webm','ogg','mp4','m4a','wav','mp3','flac'].includes(ext) ? ext : 'webm';

    // Build multipart form using native Blob + FormData (works with Node 18+ native fetch)
    const mimeType = req.file.mimetype?.split(';')[0] || 'audio/webm';
    const audioBlob = new Blob([req.file.buffer], { type: mimeType });
    const form = new globalThis.FormData();
    form.append('file', audioBlob, `audio.${safeExt}`);
    form.append('model', 'whisper-large-v3-turbo');
    form.append('response_format', 'json');
    form.append('language', 'en');

    console.log(`Transcribe: ext=${safeExt}, size=${req.file.size}b, mime=${mimeType}`);

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: form,
    });

    const data = await groqRes.json();
    if (!groqRes.ok) {
      console.error('Groq Whisper error:', data);
      return res.status(400).json({ success: false, message: data.error?.message || 'Transcription failed.' });
    }

    if (!data.text?.trim()) {
      return res.json({ success: false, message: 'empty' });
    }

    res.json({ success: true, transcript: data.text.trim() });

  } catch (err) {
    console.error('Transcribe error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// START
// ═══════════════════════════════════════════════════════════
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Protonix AI Backend Running' }));
app.listen(port, () => {
  console.log(`Protonix live on port ${port}`);

  // ── Keep-alive ping every 14 min — prevents Render free tier cold starts ──
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
  setInterval(async () => {
    try {
      await fetch(`${SELF_URL}/`);
      console.log('Keep-alive ping sent');
    } catch { /* ignore */ }
  }, 14 * 60 * 1000); // 14 minutes
});