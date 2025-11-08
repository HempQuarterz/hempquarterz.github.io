# All4Yah LSI Backend Proxy

Secure API key proxy server for the Linguistic Spirit Interface (LSI) system.

## Purpose

This Express server acts as a secure proxy between the frontend and third-party AI APIs (OpenAI, Claude, Deepgram), preventing API key exposure in browser code.

**Security Model:**
- API keys stored server-side only
- Frontend makes requests to proxy endpoints
- Proxy authenticates with third-party APIs
- Response forwarded back to frontend

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
# Edit .env with your actual API keys
```

Required keys (at least one):
- `OPENAI_API_KEY` - For GPT-3.5/GPT-4 insights
- `ANTHROPIC_API_KEY` - For Claude insights
- `DEEPGRAM_API_KEY` - For phoneme detection (future)

### 3. Start Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server runs on port `3001` by default (configurable via `PORT` env var).

### 4. Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "All4Yah LSI Proxy",
  "timestamp": "2025-01-06T..."
}
```

### 5. Configure Frontend

In `frontend/.env`, add proxy URL:

```bash
REACT_APP_PROXY_URL=http://localhost:3001
```

For production deployment (e.g., Heroku):
```bash
REACT_APP_PROXY_URL=https://your-app.herokuapp.com
```

## API Endpoints

### POST /api/lsi/generate-insights

Generate AI insights from prayer session data.

**Request:**
```json
{
  "prompt": "Full LLM prompt with session data...",
  "provider": "openai",
  "model": "gpt-3.5-turbo"
}
```

**Response:**
```json
{
  "insights": "AI-generated reflection insights..."
}
```

**Supported Providers:**
- `openai` - OpenAI GPT models
- `claude` - Anthropic Claude models

**Supported Models:**
- OpenAI: `gpt-4-turbo-preview`, `gpt-3.5-turbo`
- Claude: `claude-3-opus-20240229`, `claude-3-sonnet-20240229`, `claude-3-haiku-20240307`

### POST /api/lsi/detect-phonemes

Detect phonemes from audio (future implementation).

**Status:** 501 Not Implemented (coming soon)

## Frontend Integration

The frontend `InterpretiveAgent` class automatically uses the proxy when `useProxy: true` (default):

```javascript
import { InterpretiveAgent, LLM_PROVIDERS } from '../utils/lsi/interpretiveAgent';

// Create agent with OpenAI
const agent = new InterpretiveAgent({
  provider: LLM_PROVIDERS.OPENAI,
  model: 'gpt-3.5-turbo',
  useProxy: true // Default behavior
});

// Generate insights (automatically uses proxy)
const result = await agent.generateInsights({
  patterns: patternData,
  echoes: echoData,
  metadata: { duration: 120 }
});

console.log(result.insights);
```

## Deployment

### Option 1: Heroku

**1. Create Heroku app:**
```bash
heroku create all4yah-lsi-proxy
```

**2. Set environment variables:**
```bash
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
heroku config:set FRONTEND_URL=https://your-frontend.netlify.app
```

**3. Deploy:**
```bash
git subtree push --prefix backend heroku main
```

### Option 2: Vercel

**1. Install Vercel CLI:**
```bash
npm install -g vercel
```

**2. Deploy:**
```bash
cd backend
vercel
```

**3. Set environment variables** in Vercel dashboard

### Option 3: Railway

**1. Install Railway CLI:**
```bash
npm install -g @railway/cli
```

**2. Initialize:**
```bash
railway init
```

**3. Deploy:**
```bash
railway up
```

### Option 4: VPS (DigitalOcean, AWS EC2, etc.)

**1. Install Node.js** on server

**2. Clone repository:**
```bash
git clone <repo-url>
cd All4Yah/backend
```

**3. Install dependencies:**
```bash
npm install --production
```

**4. Create `.env` file** with API keys

**5. Use PM2 for process management:**
```bash
npm install -g pm2
pm2 start server.js --name all4yah-lsi
pm2 save
pm2 startup
```

**6. Configure nginx** as reverse proxy (recommended)

## Security Considerations

**API Key Protection:**
- Never commit `.env` files to Git (`.gitignore` configured)
- Use environment variables for all sensitive data
- Rotate API keys regularly

**CORS:**
- Configure `FRONTEND_URL` to match your frontend domain
- Do not use `*` (all origins) in production

**Rate Limiting:**
- Consider adding rate limiting middleware (e.g., `express-rate-limit`)
- Monitor API usage to prevent abuse

**Request Validation:**
- Server validates all inputs
- Rejects malformed requests
- Sanitizes error messages in production

## Monitoring

**Health Checks:**
```bash
# Check server status
curl http://localhost:3001/health

# Check API key configuration
# (view server startup logs)
npm start
```

**Logs:**
- Server logs all requests and errors to console
- Use log aggregation service in production (e.g., Papertrail, Loggly)

## Troubleshooting

### Error: "OPENAI_API_KEY not configured"

**Fix:** Add API key to `.env` file and restart server.

### Error: "Proxy API error: 500"

**Fix:** Check server logs for detailed error message. Common causes:
- Invalid API key
- API quota exceeded
- Network connectivity issues

### Frontend can't connect to proxy

**Fix:**
1. Ensure backend server is running (`npm start`)
2. Check `REACT_APP_PROXY_URL` matches backend URL
3. Verify CORS configuration in `server.js`

### Deepgram endpoint returns 501

**Expected:** Deepgram integration is not yet implemented. Use mock mode for now.

## Development Workflow

**1. Start backend proxy:**
```bash
cd backend
npm run dev
```

**2. Start frontend:**
```bash
cd frontend
npm start
```

**3. Test integration:**
- Navigate to `/lsi` in browser
- Record audio session
- Click "Save to Cloud"
- Click "Generate Insights"
- AI insights should load from proxy

## Cost Estimates

**OpenAI GPT-3.5 Turbo:**
- $0.0005 per 1K input tokens
- $0.0015 per 1K output tokens
- ~$0.01-0.02 per prayer session analysis

**Claude 3 Haiku:**
- $0.00025 per 1K input tokens
- $0.00125 per 1K output tokens
- ~$0.005-0.01 per session (cheapest option)

**Deepgram:**
- $0.0043 per minute of audio
- ~$0.02-0.05 per 5-10 minute session

**Recommendation:** Start with Claude Haiku for cost efficiency.

## License

MIT - See LICENSE file in project root.
