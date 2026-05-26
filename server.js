// server.js (Backend)
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const app = express();
app.use(express.json());

// Initialize the Gemini SDK securely on the server
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Create an endpoint for your React app to call
app.post('/api/chama-insights', async (req, res) => {
  try {
    // 1. Get the prompt from the React frontend
    const { userPrompt } = req.body;

    // 2. Securely call Gemini from the backend
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
    });

    // 3. Send the AI's response back to React
    res.json({ result: response.text });

  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    res.status(500).json({ error: "Failed to generate insights." });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Secure backend server running on port ${process.env.PORT || 5000}`);
});

// App.jsx (Frontend)
import { useState } from 'react';

export default function App() {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const getAIResponse = async () => {
    setLoading(true);
    try {
      // Talk to YOUR secure Express backend, NOT directly to Google
      const response = await fetch('http://localhost:5000/api/chama-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userPrompt: "Analyze this loan request against our community contribution rules..." 
        }),
      });

      const data = await response.json();
      setInsight(data.result);
    } catch (error) {
      console.error("Error:", error);
      setInsight("Error loading insights.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2>Generate AI Insights</h2>
      <button onClick={getAIResponse} disabled={loading} className="bg-blue-500 text-white p-2">
        {loading ? "Analyzing..." : "Ask AI"}
      </button>
      <p className="mt-4">{insight}</p>
    </div>
  );
}
