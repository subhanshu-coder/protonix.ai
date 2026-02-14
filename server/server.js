import express from 'express';
import cors from 'cors';
import 'dotenv/config';

console.log("--- Starting Protonix AI Multi-Intelligence Server ---");

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
    let apiUrl = "https://openrouter.ai/api/v1/chat/completions"; // Default

    // --- MODEL & KEY ROUTING ---
    if (botId === 'perplexity') {
      apiKey = process.env.PERPLEXITY_OR_KEY;
      modelPath = "perplexity/sonar"; 
    } 
    else if (botId === 'gemini') {
      apiKey = process.env.GEMINI_OR_KEY;
      modelPath = "google/gemini-2.0-flash-001";
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
    else {
      apiKey = process.env.GEMINI_OR_KEY;
      modelPath = "google/gemini-2.0-flash-lite";
    }

    // --- API CALL WITH TOKEN LIMITING ---
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
        "messages": [{ "role": "user", "content": message }],
        "max_tokens": 500, // FIXED: Limits usage to fit your credit balance
        "temperature": 0.7
      })
    });

    const data = await response.json();

    // --- ERROR HANDLING ---
    if (data.error) {
      console.error(`[API Error] ${botId}:`, data.error.message);
      return res.status(400).json({ reply: `AI Error: ${data.error.message}` });
    }

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ reply: "The AI is currently silent. Please try again." });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error(`[Server Error] ${botId}:`, error.message);
    res.status(500).json({ reply: "I'm having trouble connecting to my brain." });
  }
});

app.get('/', (req, res) => res.send('Protonix Backend is Online.'));

app.listen(port, () => {
  console.log(`✅ Success! Protonix Server live at http://localhost:${port}`);
});