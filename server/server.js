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
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

// Dynamic CORS configuration to avoid hardcoded secrets
const allowedOrigins = [
  'https://protonixai.netlify.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : 'http://localhost:5173',
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
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      provider: user.provider,
    },
  });
};

// ═══════════════════════════════════════════════════════════
// EMAIL TRANSPORTER
// ═══════════════════════════════════════════════════════════
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ═══════════════════════════════════════════════════════════
// CHAT ROUTE (OpenRouter Integration)
// ═══════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  const { message, botId } = req.body;
  if (!message || !botId) return res.status(400).json({ reply: 'Missing message or botId.' });

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
    }
    else if (botId === 'claude') {
      apiKey = process.env.CLAUDE_OR_KEY;
      modelPath = 'anthropic/claude-3.5-sonnet';
    }
    else if (botId === 'grok') {
      apiKey = process.env.GROQ_API_KEY;
      modelPath = 'x-ai/grok-2';
      temperature = 0.9;
    }
    else if (botId === 'gpt') {
      apiKey = process.env.GPT_OR_KEY;
      modelPath = 'openai/gpt-4o-2024-08-06';
    }
    else if (botId === 'deepseek') {
      apiKey = process.env.DEEPSEEK_OR_KEY;
      modelPath = 'deepseek/deepseek-chat';
    }

    if (!apiKey) return res.status(400).json({ reply: `Error: API Key missing.` });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'https://protonixai.netlify.app',
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

  } catch (error) {
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
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleUserInfo } = req.body;
    const { sub: googleId, email, name, picture } = googleUserInfo;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        googleId,
        avatar: picture,
        provider: 'google',
        isVerified: true
      });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) { res.status(500).json({ success: false, message: 'Google Auth Error.' }); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ success: true, message: 'Check your email.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset — PROTONIX.AI',
      html: `<div style="padding:20px; border-radius:10px; background-color:#f4f4f4;">
               <h2>Reset Your Password</h2>
               <p>Click below to reset your password:</p>
               <a href="${resetUrl}" style="padding:10px 20px; background-color:#6366f1; color:white; text-decoration:none; border-radius:5px;">Reset Password</a>
             </div>`,
    });
    res.status(200).json({ success: true, message: 'Reset email sent.' });
  } catch (err) { res.status(500).json({ success: false, message: 'Error sending reset email.' }); }
});

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Protonix AI Backend Running' }));

app.listen(port, () => console.log(`🚀 Protonix live on port ${port}`));