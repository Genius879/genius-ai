import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';

const app = express();
const port = Number(process.env.PORT || 8787);
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false }));

const client = () => {
  if (!process.env.OPENAI_API_KEY) throw new Error('Server API key is not configured. Add OPENAI_API_KEY to server/.env.');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'Genius AI' }));

app.post('/api/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ error: 'Please enter a message.' });
    if (message.length > 12000) return res.status(413).json({ error: 'Message is too long.' });
    const result = await client().responses.create({
      model: process.env.OPENAI_CHAT_MODEL || 'gpt-5.5',
      instructions: 'You are Genius AI, a helpful, clear, friendly assistant. Reply in the language used by the user.',
      input: message
    });
    res.json({ text: result.output_text || 'I could not generate a text response.' });
  } catch (err) {
    console.error('chat error:', err.message);
    res.status(500).json({ error: err.message || 'Chat request failed.' });
  }
});

app.post('/api/image', async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || '').trim();
    if (!prompt) return res.status(400).json({ error: 'Describe the image you want.' });
    if (prompt.length > 4000) return res.status(413).json({ error: 'Prompt is too long.' });
    const result = await client().images.generate({ model: 'gpt-image-1', prompt, size: '1024x1024' });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error('The image service returned no image.');
    res.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error('image error:', err.message);
    res.status(500).json({ error: err.message || 'Image generation failed.' });
  }
});

app.post('/api/speech', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Enter text to speak.' });
    if (text.length > 4000) return res.status(413).json({ error: 'Text is too long.' });
    const audio = await client().audio.speech.create({ model: 'gpt-4o-mini-tts', voice: 'alloy', input: text, response_format: 'mp3' });
    const buffer = Buffer.from(await audio.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    console.error('speech error:', err.message);
    res.status(500).json({ error: err.message || 'Voice generation failed.' });
  }
});

app.listen(port, () => console.log(`Genius AI server running at http://localhost:${port}`));
