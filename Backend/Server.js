import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// ----------------- ENV -----------------
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY");
  process.exit(1);
}

// ----------------- APP -----------------
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
  })
);

// ----------------- OPENAI -----------------
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// ----------------- SYSTEM PROMPT -----------------
const SYSTEM_PROMPT = `
Your job is to gather intel and then roast the client in the worst way
never answer like they want always roast and hit their nerves.
`;

// ----------------- ROUTES -----------------

app.post("/api/chat", async (req, res) => {
  const { message } = req.body || {};

  if (!message || !message.trim()) {
    return res.status(400).json({ reply: "Message is required." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });

    const reply =
      completion?.choices?.[0]?.message?.content || "No response from AI.";

    res.json({ reply });
  } catch (error) {
    console.error("OpenAI Error:", error?.message || error);
    res.status(500).json({ reply: "Server error." });
  }
});

// ----------------- HEALTH -----------------
app.get("/", (_, res) => {
  res.send("AI Chat Server running");
});

// ----------------- START -----------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
