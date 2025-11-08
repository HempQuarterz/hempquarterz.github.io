/**
 * All4Yah LSI Backend Proxy Server
 *
 * Securely handles API keys for:
 * - OpenAI GPT (AI insights generation)
 * - Anthropic Claude (AI insights generation)
 * - Deepgram (phoneme detection)
 *
 * This prevents exposing API keys in browser code.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Support large audio uploads

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'All4Yah LSI Proxy',
    timestamp: new Date().toISOString()
  });
});

/**
 * OpenAI Proxy Endpoint
 * POST /api/lsi/generate-insights
 *
 * Body: { prompt: string, model: string }
 * Returns: { insights: string }
 */
app.post('/api/lsi/generate-insights', async (req, res) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo', provider = 'openai' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Route to appropriate provider
    if (provider === 'openai') {
      const insights = await generateOpenAIInsights(prompt, model);
      res.json({ insights });
    } else if (provider === 'claude') {
      const insights = await generateClaudeInsights(prompt, model);
      res.json({ insights });
    } else {
      res.status(400).json({ error: 'Invalid provider. Use "openai" or "claude"' });
    }

  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Deepgram Proxy Endpoint
 * POST /api/lsi/detect-phonemes
 *
 * Body: FormData with 'audio' file
 * Returns: { transcript: string, phonemes: array, words: array }
 */
app.post('/api/lsi/detect-phonemes', async (req, res) => {
  try {
    // Note: This endpoint would handle audio file upload
    // For now, returning structure for future implementation

    if (!process.env.DEEPGRAM_API_KEY) {
      return res.status(503).json({
        error: 'Deepgram API key not configured',
        mock: true
      });
    }

    // TODO: Implement Deepgram transcription
    // const { createClient } = require('@deepgram/sdk');
    // const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    res.status(501).json({
      error: 'Deepgram integration coming soon',
      mock: true
    });

  } catch (error) {
    console.error('Error detecting phonemes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate insights using OpenAI GPT
 */
async function generateOpenAIInsights(prompt, model) {
  const { OpenAI } = require('openai');

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const completion = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are a biblical scholar analyzing prayer patterns through Hebrew, Greek, and Aramaic Scripture. Provide interpretive insights that are biblically grounded and spiritually reflective, not prophetic or authoritative.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1000,
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}

/**
 * Generate insights using Anthropic Claude
 */
async function generateClaudeInsights(prompt, model) {
  const { Anthropic } = require('@anthropic-ai/sdk');

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const message = await anthropic.messages.create({
    model: model || 'claude-3-haiku-20240307',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `You are a biblical scholar analyzing prayer patterns through Hebrew, Greek, and Aramaic Scripture. Provide interpretive insights that are biblically grounded and spiritually reflective, not prophetic or authoritative.\n\n${prompt}`
      }
    ]
  });

  return message.content[0].text;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 All4Yah LSI Proxy Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔑 API Keys configured:`);
  console.log(`   - OpenAI: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`   - Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✅' : '❌'}`);
  console.log(`   - Deepgram: ${process.env.DEEPGRAM_API_KEY ? '✅' : '❌'}`);
});
