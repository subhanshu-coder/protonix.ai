import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, botId } = req.body;

  let apiKey = "";
  let modelPath = "";

  // Switch Logic for Grok, Perplexity, GPT, Gemini, and DeepSeek
  if (botId === 'grok') {
    apiKey = process.env.GROK_OR_KEY;
    modelPath = "x-ai/grok-2-1212"; 
  } else if (botId === 'perplexity') {
    apiKey = process.env.PERPLEXITY_OR_KEY;
    modelPath = "perplexity/sonar";
  } else if (botId === 'gpt') {
    apiKey = process.env.GPT_OR_KEY;
    modelPath = "openai/gpt-4o-mini";
  } else if (botId === 'gemini') {
    apiKey = process.env.GEMINI_OR_KEY;
    modelPath = "google/gemini-2.0-flash-001";
  } else if (botId === 'deepseek') {
    apiKey = process.env.DEEPSEEK_OR_KEY;
    modelPath = "deepseek/deepseek-chat";
  } else {
    // Default fallback (e.g., for Claude)
    apiKey = process.env.GEMINI_OR_KEY;
    modelPath = "google/gemini-2.0-flash-lite";
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Protonix AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": modelPath,
        "messages": [{ "role": "user", "content": message }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("API Error Details:", data.error);
      return res.status(500).json({ reply: `AI Error: ${data.error.message}` });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ reply: "Connection failed. Please check your terminal." });
  }
});

app.listen(port, () => {
  console.log(`Protonix Server running at http://localhost:${port}`);
});