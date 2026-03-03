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
// EMAIL — Resend HTTP API (no SMTP, no ports, works on Render)
// Render blocks ALL outbound SMTP ports. Use HTTP API instead.
// ═══════════════════════════════════════════════════════════
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not set in environment variables');
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'Protonix.AI <onboarding@resend.dev>',
      to:      [to],
      subject,
      html,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.name || 'Resend API error');
  return data;
};

// Test email on startup
(async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ Email error: RESEND_API_KEY not set in Render environment variables');
      return;
    }
    // Just verify the key exists and is non-empty
    console.log('✅ Email (Resend HTTP API) ready');
  } catch (err) {
    console.error('❌ Email error:', err.message);
  }
})();

// ═══════════════════════════════════════════════════════════
// CHAT ROUTE
// ═══════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  const { message, botId } = req.body;
  if (!message || !botId) return res.status(400).json({ reply: 'Missing message or botId.' });

  try {
    let apiKey = '', modelPath = '', temperature = 0.4;
    let systemPrompt = 'You are a helpful assistant.';
    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    if      (botId === 'perplexity') { apiKey = process.env.PERPLEXITY_OR_KEY; modelPath = 'perplexity/sonar'; systemPrompt = 'You are a real-time search specialist. Always use the web for 2026 data. Provide citations.'; }
    else if (botId === 'gemini')     { apiKey = process.env.GEMINI_OR_KEY;     modelPath = 'google/gemini-2.5-flash-preview'; }
    else if (botId === 'claude')     { apiKey = process.env.CLAUDE_OR_KEY;     modelPath = 'anthropic/claude-3.5-sonnet'; }
    else if (botId === 'grok')       { apiKey = process.env.GROQ_API_KEY;      modelPath = 'x-ai/grok-2'; temperature = 0.9; }
    else if (botId === 'gpt')        { apiKey = process.env.GPT_OR_KEY;        modelPath = 'openai/gpt-4o-2024-08-06'; }
    else if (botId === 'deepseek')   { apiKey = process.env.DEEPSEEK_OR_KEY;   modelPath = 'deepseek/deepseek-chat'; }

    if (!apiKey) return res.status(400).json({ reply: 'Error: API Key missing.' });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': process.env.CLIENT_URL || '',
        'X-Title': 'Protonix AI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelPath,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        max_tokens: 800,
        temperature,
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ reply: `AI Error: ${data.error.message}` });
    res.json({ reply: data.choices[0].message.content });

  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ reply: 'Server Error during chat processing.' });
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
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
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
      user = await User.create({ fullName: name, email, googleId, avatar: picture, provider: 'google', isVerified: true });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ success: false, message: 'Google Auth Error.' });
  }
});

// ═══════════════════════════════════════════════════════════
// FORGOT PASSWORD  ← FIXED with full error logging
// ═══════════════════════════════════════════════════════════
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email via Resend HTTP API
    await sendEmail({
      to:      user.email,
      subject: 'Reset Your Password — PROTONIX.AI',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0f0f1a;color:#fff;border-radius:12px;">
          <h2 style="color:#87CEEB;margin-bottom:8px;">Reset Your Password</h2>
          <p style="color:rgba(255,255,255,0.65);margin-bottom:24px;">
            Click the button below to reset your password. This link expires in <strong style="color:#fff;">15 minutes</strong>.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#87CEEB,#00BFFF);color:#08080f;font-weight:700;text-decoration:none;border-radius:100px;font-size:0.9rem;">
            Reset Password →
          </a>
          <p style="margin-top:24px;color:rgba(255,255,255,0.3);font-size:0.75rem;">
            If you didn't request this, ignore this email. Your password won't change.
          </p>
        </div>
      `,
    });

    console.log(`✅ Reset email sent to ${user.email}`);
    res.status(200).json({ success: true, message: 'Reset link sent to your email.' });

  } catch (err) {
    // Log the REAL error so you can see it in Render logs
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

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired.' });
    }

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
// START
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Protonix AI Backend Running' }));

// ── Email test route — open in browser to diagnose ──
// https://protonix-ai.onrender.com/api/test-email
app.get('/api/test-email', async (req, res) => {
  const to = req.query.to || 'subhanshupal837@gmail.com';
  try {
    await sendEmail({
      to,
      subject: 'Protonix.AI — Email Test ✅',
      html: '<div style="font-family:Arial;padding:20px;background:#0f0f1a;color:#fff;border-radius:8px;"><h2 style="color:#87CEEB;">Email is working! ✅</h2><p>Resend HTTP API is configured correctly on Render.</p></div>',
    });
    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err) {
    console.error('Test email error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      hint: !process.env.RESEND_API_KEY
        ? 'Add RESEND_API_KEY to Render environment variables'
        : 'Check your RESEND_API_KEY is valid at resend.com/api-keys',
    });
  }
});

app.listen(port, () => console.log(`Protonix live on port ${port}`));