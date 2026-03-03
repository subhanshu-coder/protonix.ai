// ═══════════════════════════════════════════════════════════
// server.js — PROTONIX.AI Complete Backend
// Email: Brevo SMTP — works on Render, sends to ANY email
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
import nodemailer from 'nodemailer';

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
// EMAIL — Brevo SMTP
// ✅ Works on Render free tier
// ✅ Sends to ANY email address worldwide
// ✅ 300 free emails per day
// Setup: brevo.com → SMTP & API → SMTP → copy key
// ═══════════════════════════════════════════════════════════
const transporter = nodemailer.createTransport({
  host:   'smtp-relay.brevo.com',
  port:   587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,  // your brevo login email
    pass: process.env.BREVO_PASS,  // your brevo SMTP key (xsmtpsib-...)
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from:    `"Protonix.AI" <${process.env.BREVO_USER}>`,
    to,       // ANY email address worldwide
    subject,
    html,
  });
  return info;
};

// Verify on startup
(async () => {
  try {
    await transporter.verify();
    console.log('✅ Email (Brevo SMTP) ready — sends to any email worldwide');
  } catch (err) {
    console.error('❌ Brevo email error:', err.message);
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
// FORGOT PASSWORD — sends reset link to ANY email
// ═══════════════════════════════════════════════════════════
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success — don't reveal if email exists (security)
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to:      user.email,
      subject: 'Reset Your Password — PROTONIX.AI',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f0f1a;color:#fff;border-radius:14px;overflow:hidden;">

          <div style="padding:28px 32px;background:linear-gradient(135deg,#0d1117,#1a1f35);border-bottom:1px solid rgba(255,255,255,0.07);text-align:center;">
            <h1 style="margin:0;font-size:1.6rem;font-weight:800;color:#fff;">
              PROTONIX<span style="color:#00e5ff;">.AI</span>
            </h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:0.78rem;letter-spacing:0.08em;">All AIs, One Tab</p>
          </div>

          <div style="padding:36px 32px;">
            <h2 style="margin:0 0 10px;font-size:1.2rem;color:#fff;">Reset Your Password</h2>
            <p style="color:rgba(255,255,255,0.55);line-height:1.65;margin:0 0 28px;font-size:0.92rem;">
              We received a request to reset the password for your Protonix.AI account.
              Click the button below — valid for <strong style="color:#fbbf24;">15 minutes</strong>.
            </p>

            <div style="text-align:center;margin:28px 0;">
              <a href="${resetUrl}"
                style="display:inline-block;padding:13px 34px;background:linear-gradient(135deg,#00e5ff,#0080ff);color:#000;font-weight:700;font-size:0.95rem;text-decoration:none;border-radius:10px;">
                Reset Password →
              </a>
            </div>

            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:14px 16px;">
              <p style="margin:0;color:rgba(255,255,255,0.38);font-size:0.78rem;line-height:1.8;">
                ⏰ Expires in <strong style="color:#fbbf24;">15 minutes</strong><br/>
                🔒 Didn't request this? Ignore this email — nothing will change.<br/>
                🚫 Never share this link with anyone.
              </p>
            </div>

            <p style="margin-top:20px;color:rgba(255,255,255,0.22);font-size:0.72rem;word-break:break-all;">
              Button not working? Copy this into your browser:<br/>
              <span style="color:#00e5ff;">${resetUrl}</span>
            </p>
          </div>

          <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.20);font-size:0.72rem;">
              © 2025 Protonix.AI · Made by Subhanshu Pal
            </p>
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
// TEST EMAIL ROUTE
// Visit: https://protonix-ai.onrender.com/api/test-email?to=anyemail@gmail.com
// ═══════════════════════════════════════════════════════════
app.get('/api/test-email', async (req, res) => {
  const to = req.query.to || process.env.BREVO_USER;
  try {
    await sendEmail({
      to,
      subject: 'Protonix.AI — Email Test ✅',
      html: `
        <div style="font-family:Arial;padding:24px;background:#0f0f1a;color:#fff;border-radius:10px;">
          <h2 style="color:#00e5ff;">Email is working! ✅</h2>
          <p>Brevo SMTP is configured correctly on Render.</p>
          <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;">Sent to: ${to}</p>
        </div>
      `,
    });
    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err) {
    console.error('Test email error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Protonix AI Backend Running' }));

app.listen(port, () => console.log(`Protonix live on port ${port}`));