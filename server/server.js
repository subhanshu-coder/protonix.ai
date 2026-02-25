// ═══════════════════════════════════════════════════════════
// server.js — PROTONIX.AI Complete Backend
// Place this file at: server/server.js
// Run with: node server/server.js
// ═══════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

// Load .env from the same folder as server.js (works from any CWD)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

// ═══════════════════════════════════════════════════════════
// MONGODB CONNECTION
// ═══════════════════════════════════════════════════════════
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ═══════════════════════════════════════════════════════════
// USER SCHEMA & MODEL
// ═══════════════════════════════════════════════════════════
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: function () { return !this.googleId; },
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String },
  googleId: { type: String, sparse: true, unique: true },
  avatar: { type: String, default: '' },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  isVerified: { type: Boolean, default: false },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);

});

// Compare password method
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
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      provider: user.provider,
    },
  });
};

// ═══════════════════════════════════════════════════════════
// EMAIL TRANSPORTER (for password reset)
// ═══════════════════════════════════════════════════════════
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ✅ Verify Gmail credentials on startup
transporter.verify((err) => {
  if (err) {
    console.error('❌ Gmail transporter FAILED:', err.message);
    console.error('   → Check EMAIL_FROM and EMAIL_PASSWORD in .env');
    console.error('   → Make sure you are using a Gmail App Password (not your regular password)');
    console.error('   → Generate one at: https://myaccount.google.com/apppasswords');
  } else {
    console.log('✅ Gmail transporter ready — emails will work');
  }
});

// ═══════════════════════════════════════════════════════════
// YOUR EXISTING CHAT ROUTE — UNCHANGED
// ═══════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  const { message, botId } = req.body;

  if (!message || !botId) {
    return res.status(400).json({ reply: 'Missing message or botId.' });
  }

  console.log(`[Request] Bot: ${botId} | Message: ${message.substring(0, 25)}...`);

  try {
    let apiKey = '';
    let modelPath = '';
    let apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    let temperature = 0.4;
    let systemPrompt = 'You are a helpful assistant.';

    if (botId === 'perplexity') {
      apiKey = process.env.PERPLEXITY_OR_KEY;
      modelPath = 'perplexity/sonar';
      systemPrompt = 'You are a real-time search specialist. Always use the web for 2026 data. Provide citations.';
    }
    else if (botId === 'gemini') {
      apiKey = process.env.GEMINI_OR_KEY;
      modelPath = 'google/gemini-2.5-flash-preview';
      systemPrompt = 'You are Google Gemini. Use Google Search grounding for real-time accuracy.';
    }
    else if (botId === 'claude') {
      apiKey = process.env.CLAUDE_OR_KEY;
      modelPath = 'anthropic/claude-3.5-sonnet';
    }
    else if (botId === 'grok') {
      apiKey = process.env.GROQ_API_KEY;
      modelPath = 'x-ai/grok-2';
      temperature = 0.9;
      systemPrompt = "You are Grok. You are savage, witty, and full of 'masti'. Use humor and talk about social media trends like a cool friend.";
    }
    else if (botId === 'gpt') {
      apiKey = process.env.GPT_OR_KEY;
      modelPath = 'openai/gpt-4o-2024-08-06';
    }
    else if (botId === 'deepseek') {
      apiKey = process.env.DEEPSEEK_OR_KEY;
      modelPath = 'deepseek/deepseek-chat';
    }

    if (!apiKey) {
      return res.status(400).json({ reply: `Error: API Key for ${botId} is missing in .env file.` });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': 'https://protonix-ai.onrender.com',
        'X-Title': 'Protonix AI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelPath,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 800,
        temperature,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error(`[API Error] ${botId}:`, data.error.message || data.error);
      return res.status(400).json({ reply: `AI Error: ${data.error.message || 'Failed to fetch response.'}` });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error(`[Server Error] ${botId}:`, error.message);
    res.status(500).json({ reply: 'Server crashed. Check your terminal logs.' });
  }
});

// ═══════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════

// ── POST /api/auth/signup ────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });

    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

    const user = await User.create({ fullName, email, password, provider: 'local' });
    sendTokenResponse(user, 201, res);

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    sendTokenResponse(user, 200, res);

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// ── POST /api/auth/google ────────────────────────────────
// Receives googleUserInfo + accessToken from @react-oauth/google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleUserInfo, accessToken } = req.body;

    if (!googleUserInfo || !accessToken)
      return res.status(400).json({ success: false, message: 'Google credentials required.' });

    const { sub: googleId, email, name, picture } = googleUserInfo;

    if (!email)
      return res.status(400).json({ success: false, message: 'Could not get email from Google.' });

    if (!googleId)
      return res.status(400).json({ success: false, message: 'Could not get Google ID (sub) from Google.' });

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // New user — create from Google profile
      user = await User.create({
        fullName: name || email.split('@')[0],
        email,
        googleId,
        avatar: picture || '',
        provider: 'google',
        isVerified: true,
      });
    } else {
      // Existing user — link Google if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
        user.provider = 'google';
        await user.save();
      }
    }

    sendTokenResponse(user, 200, res);

  } catch (err) {
    console.error('Google auth error:', err.message, err.stack);
    res.status(500).json({ success: false, message: 'Google authentication failed: ' + err.message });
  }
});

// ── POST /api/auth/forgot-password ──────────────────────
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return same message for security
    if (!user)
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    if (user.provider === 'google')
      return res.status(400).json({ success: false, message: 'This account uses Google Sign-In. Please sign in with Google.' });

    // ... inside forgot-password route
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    // FIX: Add await here
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    try {
      await transporter.sendMail({
        from: `"PROTONIX.AI" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: 'Password Reset — PROTONIX.AI',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0f23;color:#fff;padding:40px;border-radius:12px;">
            <h1 style="color:#a5b4fc;">PROTONIX.AI</h1>
            <h2>Reset Your Password</h2>
            <p style="color:#c4c4dc;line-height:1.6;">Click the button below — this link expires in 15 minutes.</p>
            <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;text-decoration:none;border-radius:8px;font-weight:600;">Reset Password</a>
            <p style="color:#888;font-size:13px;">If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
      res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (emailErr) {
      console.error('❌ Email send error:', emailErr.message, emailErr.code);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      // Return specific error so you can debug
      const isDev = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        success: false,
        message: isDev
          ? `Email failed: ${emailErr.message}`
          : 'Failed to send email. Please try again.',
      });
    }

  } catch (err) {
    console.error('Forgot password error:', err.message, err.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// ── POST /api/auth/reset-password/:token ────────────────
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 8)
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);

  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
      return res.status(401).json({ success: false, message: 'Not authorized.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({
      success: true,
      user: { id: user._id, fullName: user.fullName, email: user.email, avatar: user.avatar },
    });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
});

// ── Health check ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '🚀 Protonix API running' });
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════
app.listen(port, () => console.log(`🚀 Protonix live at http://localhost:${port}`));