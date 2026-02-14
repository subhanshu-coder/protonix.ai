import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, botId } = req.body;
  if (!message) return res.status(400).json({ reply: "Message is required" });

  console.log(`[Request] Bot: ${botId} | Msg: ${message.substring(0, 20)}...`);

  try {
    let apiKey = "";
    let modelPath = "";
    let apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    let systemPrompt = "You are a helpful AI assistant.";

    if (botId === 'claude') {
      apiKey = process.env.CLAUDE_OR_KEY;
      modelPath = "anthropic/claude-3-haiku";
    } 
    else if (botId === 'perplexity') {
      apiKey = process.env.PERPLEXITY_OR_KEY;
      modelPath = "perplexity/sonar"; // Sonar models are built for real-time search
      // This instruction forces Perplexity to browse the live web
      systemPrompt = "You are a real-time web search assistant. Always search the internet to provide current info with citations.";
    } 
    else if (botId === 'gemini') {
      apiKey = process.env.GEMINI_OR_KEY;
      modelPath = "google/gemini-2.0-flash-001";
      systemPrompt = "You are Google Gemini. Use Google Search to provide grounded, real-time answers for facts.";
    } 
    else if (botId === 'gpt') {
      apiKey = process.env.GPT_OR_KEY;
      modelPath = "openai/gpt-4o-mini";
      // This instruction encourages GPT to use its internal 'browsing' knowledge or search tools
      systemPrompt = "You are ChatGPT with real-time web access. Provide the latest information available for the user's query.";
    } 
    else if (botId === 'deepseek') {
      apiKey = process.env.DEEPSEEK_OR_KEY;
      modelPath = "deepseek/deepseek-chat";
    } 
    else if (botId === 'grok') {
      apiKey = process.env.GEMINI_OR_KEY; 
      modelPath = "x-ai/grok-2-1212";
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Protonix AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": modelPath,
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": message }
        ],
        "max_tokens": 500, // Increased to allow room for search result data
        "temperature": 0.3 // Lower temperature makes real-time data more accurate
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
    res.status(500).json({ reply: "The Protonix server encountered an error." });
  }
});

app.listen(port, () => console.log(`🚀 Success! Protonix Server live at http://localhost:${port}`));