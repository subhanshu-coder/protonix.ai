import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, botId } = req.body;
  console.log(`[Request] Bot: ${botId} | Message: ${message.substring(0, 25)}...`);

  try {
    let apiKey = "";
    let modelPath = "";
    let systemPrompt = "You are a helpful assistant.";
    let apiUrl = "https://openrouter.ai/api/v1/chat/completions";

    if (botId === 'perplexity') {
      apiKey = process.env.PERPLEXITY_OR_KEY;
      modelPath = "perplexity/sonar"; 
      // Forces real-time web search
      systemPrompt = "You are a real-time search engine. Always browse the web to provide the latest information with citations.";
    } 
    else if (botId === 'gemini') {
      apiKey = process.env.GEMINI_OR_KEY;
      modelPath = "google/gemini-2.0-flash-001";
      // Forces Google Search Grounding
      systemPrompt = "You are Google Gemini. Use Google Search to provide grounded, real-time answers for current events.";
    } 
    else if (botId === 'claude') {
      apiKey = process.env.CLAUDE_OR_KEY;
      modelPath = "anthropic/claude-3-opus";
    }
    else if (botId === 'gpt') {
      apiKey = process.env.GPT_OR_KEY;
      modelPath = "openai/gpt-4o-mini";
    } 
    else if (botId === 'deepseek') {
      apiKey = process.env.DEEPSEEK_OR_KEY;
      modelPath = "deepseek/deepseek-chat";
    } 
    else if (botId === 'grok' || botId === 'llama') {
      apiKey = process.env.GROQ_API_KEY;
      modelPath = "llama-3.3-70b-versatile"; 
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    }

    if (!apiKey) {
      return res.status(400).json({ reply: `Error: API Key for ${botId} is missing in server environment.` });
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://protonix-ai.onrender.com", // Updated for production
        "X-Title": "Protonix AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": modelPath,
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": message }
        ],
        "max_tokens": 500,
        "temperature": 0.4 // Lower temperature is better for factual/real-time data
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
    res.status(500).json({ reply: "Connection lost. Please check the server logs." });
  }
});

app.listen(port, () => console.log(`🚀 Protonix live at port ${port}`));