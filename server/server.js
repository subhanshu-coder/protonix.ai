// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config';

// const app = express();
// const port = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// app.post('/api/chat', async (req, res) => {
//   const { message, botId } = req.body;
//   console.log(`[Request] Bot: ${botId} | Message: ${message.substring(0, 25)}...`);

//   try {
//     let apiKey = "";
//     let modelPath = "";
//     let systemPrompt = "You are a helpful assistant.";
//     let apiUrl = "https://openrouter.ai/api/v1/chat/completions";

//     if (botId === 'perplexity') {
//       apiKey = process.env.PERPLEXITY_OR_KEY;
//       modelPath = "perplexity/sonar"; 
//       // Forces real-time web search
//       systemPrompt = "You are a real-time search engine. Always browse the web to provide the latest information with citations.";
//     } 
//     else if (botId === 'gemini') {
//       apiKey = process.env.GEMINI_OR_KEY;
//       modelPath = "google/gemini-2.0-flash-001";
//       // Forces Google Search Grounding
//       systemPrompt = "You are Google Gemini. Use Google Search to provide grounded, real-time answers for current events.";
//     } 
//     else if (botId === 'claude') {
//       apiKey = process.env.CLAUDE_OR_KEY;
//       modelPath = "anthropic/claude-3-opus";
//     }
//     else if (botId === 'gpt') {
//       apiKey = process.env.GPT_OR_KEY;
//       modelPath = "openai/gpt-4o-mini";
//     } 
//     else if (botId === 'deepseek') {
//       apiKey = process.env.DEEPSEEK_OR_KEY;
//       modelPath = "deepseek/deepseek-chat";
//     } 
//     // ... inside your app.post('/api/chat', async (req, res) => { logic
//       else if (botId === 'grok' || botId === 'llama') {
//       // Use your new OpenRouter key for Grok/Llama
//       apiKey = process.env.GROQ_API_KEY; 
//       modelPath = "meta-llama/llama-3.3-70b-instruct"; // OpenRouter path for Llama
//       apiUrl = "https://openrouter.ai/api/v1/chat/completions"; // OpenRouter URL
//     } 

// // ... rest of the fetch call

//     if (!apiKey) {
//       return res.status(400).json({ reply: `Error: API Key for ${botId} is missing in server environment.` });
//     }

//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${apiKey}`,
//         "HTTP-Referer": "https://protonix-ai.onrender.com", // Updated for production
//         "X-Title": "Protonix AI",
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         "model": modelPath,
//         "messages": [
//           { "role": "system", "content": systemPrompt },
//           { "role": "user", "content": message }
//         ],
//         "max_tokens": 500,
//         "temperature": 0.4 // Lower temperature is better for factual/real-time data
//       })
//     });

//     const data = await response.json();

//     if (data.error) {
//       console.error(`[API Error] ${botId}:`, data.error.message);
//       return res.status(400).json({ reply: `AI Error: ${data.error.message}` });
//     }

//     res.json({ reply: data.choices[0].message.content });

//   } catch (error) {
//     console.error(`[Server Error] ${botId}:`, error.message);
//     res.status(500).json({ reply: "Connection lost. Please check the server logs." });
//   }
// });

// app.listen(port, () => console.log(`🚀 Protonix live at port ${port}`));

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
// import fetch from 'node-fetch'; // Ensure you have node-fetch installed or use global fetch in Node 18+

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, botId } = req.body;
  
  // Safety check for request body
  if (!message || !botId) {
    return res.status(400).json({ reply: "Missing message or botId." });
  }

  console.log(`[Request] Bot: ${botId} | Message: ${message.substring(0, 25)}...`);

  try {
    let apiKey = "";
    let modelPath = "";
    // let systemPrompt = "You are a helpful assistant.";
    let apiUrl = "https://openrouter.ai/api/v1/chat/completions";
   let temperature = 0.4; // Default
    let systemPrompt = "You are a helpful assistant.";

    if (botId === 'grok') {
      apiKey = process.env.GROQ_API_KEY; 
      modelPath = "x-ai/grok-2-1212"; 
      temperature = 0.9; // High temp = more 'masti' (fun/funny)
      systemPrompt = "You are Grok. You are edgy, savage, and full of 'masti'. You know all current social media trends and Twitter (X) tea. Answer with attitude and humor.";
    } 
    else if (botId === 'perplexity') {
      apiKey = process.env.PERPLEXITY_OR_KEY;
      modelPath = "perplexity/sonar"; 
      systemPrompt = "You are a real-time search engine. Always search the web for 2026 data. Give current facts with citations.";
    }
    else if (botId === 'gemini') {
      apiKey = process.env.GEMINI_OR_KEY;
      modelPath = "google/gemini-2.0-flash-001";
      systemPrompt = "You are Google Gemini. Use your real-time Google Search grounding to give the most up-to-date answers for 2026.";
    }
    
      else if (botId === 'claude') {
      apiKey = process.env.CLAUDE_OR_KEY;
      // CHANGE THIS LINE:
      modelPath = "anthropic/claude-3.5-sonnet"; 
    
    }
 
    else if (botId === 'gpt') {
      apiKey = process.env.GPT_OR_KEY;
      modelPath = "openai/gpt-4o-2024-08-06";
    } 
    else if (botId === 'deepseek') {
      apiKey = process.env.DEEPSEEK_OR_KEY;
      modelPath = "deepseek/deepseek-chat";
    }
    if (!apiKey) {
      return res.status(400).json({ reply: `Error: API Key for ${botId} is missing in .env file.` });
    }

    // --- OPENROUTER API CALL ---
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://protonix-ai.onrender.com", 
        "X-Title": "Protonix AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": modelPath,
        "messages": [
          { "role": "system", "content": systemPrompt },
          { "role": "user", "content": message }
        ],
        "max_tokens": 800,
        "temperature": temperature
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error(`[API Error] ${botId}:`, data.error.message || data.error);
      return res.status(400).json({ reply: `AI Error: ${data.error.message || "Failed to fetch response."}` });
    }

    res.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error(`[Server Error] ${botId}:`, error.message);
    res.status(500).json({ reply: "Server crashed. Check your terminal logs." });
  }
});

app.listen(port, () => console.log(`🚀 Protonix live at http://localhost:${port}`));