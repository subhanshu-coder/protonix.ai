import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
// Render/Railway will provide the PORT automatically via process.env.PORT
const port = process.env.PORT || 5000;

// Update this to your actual GitHub Pages URL
// Change this to your actual Netlify URL
const allowedOrigin = 'https://your-project-name.netlify.app'; 

app.use(cors({
  origin: [allowedOrigin, 'http://localhost:5173'], 
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// 1. Health Check Route (To see if server is running)
app.get('/', (req, res) => {
  res.send('✅ Protonix Server is Online and Running!');
});

app.post('/api/chat', async (req, res) => {
  const { message, botId } = req.body;
  
  // Basic validation to prevent server crashes
  if (!message) return res.status(400).json({ reply: "Message is required" });

  console.log(`[Request] Bot: ${botId} | Msg: ${message.substring(0, 20)}...`);

  try {
    let apiKey = "";
    let modelPath = "";
    let apiUrl = "https://openrouter.ai/api/v1/chat/completions";

    // Logic for selecting models
    if (botId === 'claude') {
      apiKey = process.env.CLAUDE_OR_KEY;
      modelPath = "anthropic/claude-3-haiku";
    } else if (botId === 'perplexity') {
      apiKey = process.env.PERPLEXITY_OR_KEY;
      modelPath = "perplexity/sonar";
    } else if (botId === 'gemini') {
      apiKey = process.env.GEMINI_OR_KEY;
      modelPath = "google/gemini-2.0-flash-001";
    } else if (botId === 'gpt') {
      apiKey = process.env.GPT_OR_KEY;
      modelPath = "openai/gpt-4o-mini";
    } else if (botId === 'deepseek') {
      apiKey = process.env.DEEPSEEK_OR_KEY;
      modelPath = "deepseek/deepseek-chat";
    } else if (botId === 'llama' || botId === 'grok') {
      apiKey = process.env.GROQ_API_KEY;
      modelPath = "llama-3.3-70b-versatile";
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    } else {
      apiKey = process.env.GEMINI_OR_KEY;
      modelPath = "google/gemini-2.0-flash-001";
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": allowedOrigin, // Better for OpenRouter tracking than localhost
        "X-Title": "Protonix AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": modelPath,
        "messages": [
          { "role": "system", "content": "You are a helpful assistant. If the user says 'hi' or 'hello', greet them back briefly. Only search if they ask a question." },
          { "role": "user", "content": message }
        ],
        "max_tokens": 400,
        "temperature": 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error(`[API Error] ${botId}:`, data.error.message);
      return res.status(400).json({ reply: `AI Error: ${data.error.message}` });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error(`[Server Error] ${botId}:`, error.message);
    res.status(500).json({ reply: "The Protonix server encountered an error. Please try again later." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Protonix Server live and listening on port ${port}`);
});