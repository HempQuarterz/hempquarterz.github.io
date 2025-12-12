# LSI Quick Start Guide

Get the Linguistic Spirit Interface running in 5 minutes.

---

## Prerequisites

- Node.js 16+ installed
- All4Yah project already running (`npm start` in frontend directory)
- Supabase database with LSI tables deployed (already done in previous session)

---

## Step 1: Access the LSI Demo

The AudioCaptureDemo component is already built but not yet routed. You have two options:

### Option A: Direct Import (Quick Test)
Add to an existing page temporarily:

```jsx
// In frontend/src/pages/HomePage.jsx (or any page)
import AudioCaptureDemo from '../components/lsi/AudioCaptureDemo';

// Add to render:
<AudioCaptureDemo />
```

### Option B: Create LSI Demo Route (Recommended)

**1. Create LSI Demo Page:**

```javascript
// frontend/src/pages/LSIPage.jsx
import React from 'react';
import AudioCaptureDemo from '../components/lsi/AudioCaptureDemo';
import SpiritualJournal from '../components/lsi/SpiritualJournal';

const LSIPage = () => {
  const [view, setView] = React.useState('demo'); // 'demo' or 'journal'

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <button onClick={() => setView('demo')}>Audio Demo</button>
        <button onClick={() => setView('journal')}>Spiritual Journal</button>
      </div>

      {view === 'demo' && <AudioCaptureDemo />}
      {view === 'journal' && <SpiritualJournal />}
    </div>
  );
};

export default LSIPage;
```

**2. Add Route:**

```javascript
// frontend/src/App.js
import LSIPage from './pages/LSIPage';

// In <Routes>:
<Route path="/lsi" element={<LSIPage />} />
```

**3. Add Navigation Link:**

```javascript
// In your navigation component
<Link to="/lsi">LSI Demo</Link>
```

---

## Step 2: Test Audio Capture

1. Navigate to `/lsi` (or wherever you added the component)
2. Click "Initialize Microphone"
3. Grant microphone permission when prompted
4. See waveform visualization appear
5. Click "Start Recording"
6. Speak/pray for a few seconds
7. Click "Stop Recording"
8. Playback audio
9. Click "Save to Cloud" to upload

---

## Step 3: View Saved Sessions

1. Switch to "Spiritual Journal" view
2. See list of saved sessions
3. Click on a session to view details
4. See mock AI insights (real insights require API keys - see below)

---

## Step 4: Enable Real AI Insights (Optional)

### Option A: OpenAI GPT

**1. Get API Key:**
- Sign up at https://platform.openai.com
- Create API key in dashboard

**2. Add to Environment:**

```bash
# frontend/.env
REACT_APP_OPENAI_API_KEY=sk-...
```

**3. Configure InterpretiveAgent:**

```javascript
// In AudioCaptureDemo or custom integration
import { InterpretiveAgent, LLM_PROVIDERS, LLM_MODELS } from '../utils/lsi/interpretiveAgent';

const agent = new InterpretiveAgent({
  provider: LLM_PROVIDERS.OPENAI,
  model: LLM_MODELS.GPT35, // Or GPT4
  useProxy: false // Direct mode (dev only!)
});

// After recording + pattern analysis:
const insights = await agent.generateInsights({
  patterns: patternResult,
  echoes: linguisticEchoes,
  metadata: { duration: 120 }
});

await agent.saveInsights(sessionId, insights.insights);
```

**⚠️ Security Warning**: Direct browser API calls expose your API key! For production, set up backend proxy (see below).

### Option B: Anthropic Claude

Same as OpenAI but:

```bash
REACT_APP_ANTHROPIC_API_KEY=sk-ant-...
```

```javascript
provider: LLM_PROVIDERS.CLAUDE,
model: LLM_MODELS.CLAUDE_HAIKU // Fastest & cheapest
```

---

## Step 5: Enable Deepgram Phoneme Detection (Optional)

**1. Get API Key:**
- Sign up at https://deepgram.com
- Create API key

**2. Add to Environment:**

```bash
REACT_APP_DEEPGRAM_API_KEY=...
```

**3. Configure PhonemeDetector:**

```javascript
// In patternRecognition.js or custom integration
const detector = new PhonemeDetector(process.env.REACT_APP_DEEPGRAM_API_KEY);
const result = await detector.detectPhonemes(audioBlob);
```

**⚠️ Note**: Browser-based Deepgram requires WebSocket setup. Mock mode works without API key.

---

## Production Deployment: Backend Proxy Setup

For security, use a backend proxy to hide API keys from browser.

### Quick Backend (Node.js + Express)

**1. Install dependencies:**

```bash
npm install express cors openai @anthropic-ai/sdk @deepgram/sdk dotenv
```

**2. Create `server.js`:**

```javascript
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI Proxy
app.post('/api/lsi/generate-insights', async (req, res) => {
  try {
    const { prompt, model } = req.body;

    const openai = new OpenAIApi(new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    }));

    const completion = await openai.createChatCompletion({
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7
    });

    res.json({
      insights: completion.data.choices[0].message.content
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
```

**3. Update Frontend:**

```javascript
// In interpretiveAgent.js
const agent = new InterpretiveAgent({
  provider: LLM_PROVIDERS.OPENAI,
  useProxy: true // Enable proxy mode
});

// Will call http://localhost:3001/api/lsi/generate-insights
```

**4. Deploy:**
- Heroku: `git push heroku main`
- Vercel: `vercel deploy`
- Railway: `railway up`

---

## Common Issues & Fixes

### Issue: Microphone not working

**Fix:**
- Ensure HTTPS (required for getUserMedia)
- Check browser permissions
- Test in Chrome/Firefox (Safari has limitations)

### Issue: No waveform appearing

**Fix:**
```javascript
// Check audioProcessor initialization
console.log('Audio context state:', processor.audioContext.state);

// Resume if suspended
if (processor.audioContext.state === 'suspended') {
  await processor.audioContext.resume();
}
```

### Issue: Recording produces empty Blob

**Fix:**
- Check codec support: `MediaRecorder.isTypeSupported('audio/webm;codecs=opus')`
- Try WAV fallback if WebM not supported
- Ensure microphone input is active (check waveform for movement)

### Issue: AI insights showing "Mock data"

**Fix:**
- Add API key to `.env` file
- Restart dev server (`npm start`)
- Check console for API key loading: `console.log(process.env.REACT_APP_OPENAI_API_KEY)`

### Issue: Pattern recognition not detecting features

**Fix:**
```javascript
// Increase analyzer sensitivity
audioProcessor.analyser.smoothingTimeConstant = 0.5; // Lower = more sensitive

// Check if audio is detected
const inputLevel = audioProcessor.getInputLevel();
console.log('Input level:', inputLevel); // Should be > 0 when speaking
```

---

## Example: Complete Integration

Here's a full example of integrating all LSI components:

```javascript
import React, { useState, useRef } from 'react';
import AudioProcessor from '../utils/lsi/audioProcessor';
import { PatternRecognitionService } from '../utils/lsi/patternRecognition';
import { LinguisticEchoDetector } from '../utils/lsi/linguisticMapping';
import { InterpretiveAgent, LLM_PROVIDERS } from '../utils/lsi/interpretiveAgent';
import { uploadAudioFile, createPrayerSession } from '../utils/lsi/supabaseStorage';

const CompleteLSIDemo = () => {
  const [status, setStatus] = useState('Ready');
  const [insights, setInsights] = useState(null);
  const processorRef = useRef(null);
  const patternServiceRef = useRef(null);

  const startSession = async () => {
    try {
      // 1. Initialize audio
      setStatus('Initializing...');
      processorRef.current = new AudioProcessor();
      await processorRef.current.initialize();

      // 2. Start pattern recognition
      patternServiceRef.current = new PatternRecognitionService(processorRef.current);
      patternServiceRef.current.startAnalysis(100);

      // 3. Begin recording
      await processorRef.current.startRecording();
      setStatus('Recording...');

    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  const stopSession = async () => {
    try {
      setStatus('Processing...');

      // 1. Stop recording
      const audioBlob = await processorRef.current.stopRecording();
      patternServiceRef.current.stopAnalysis();

      // 2. Analyze patterns
      const patternResult = await patternServiceRef.current.analyzeRecording(audioBlob);

      // 3. Detect linguistic echoes
      const detector = new LinguisticEchoDetector();
      const echoes = await detector.detectEchoes(patternResult.transcript || '', 0.6);

      // 4. Generate AI insights
      const agent = new InterpretiveAgent({ provider: LLM_PROVIDERS.MOCK });
      const result = await agent.generateInsights({
        patterns: patternResult,
        echoes,
        metadata: { duration: Math.floor(patternResult.patterns.length / 10) }
      });

      // 5. Save to database
      const sessionData = await createPrayerSession({
        duration_seconds: Math.floor(patternResult.patterns.length / 10),
        sample_rate: 44100,
        session_title: 'LSI Session ' + new Date().toLocaleString()
      });

      await uploadAudioFile(audioBlob, { sessionId: sessionData.session.id });
      await agent.saveInsights(sessionData.session.id, result.insights);

      setInsights(result.insights);
      setStatus('Complete! Session ID: ' + sessionData.session.id);

    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Complete LSI Demo</h2>
      <p>Status: {status}</p>

      <button onClick={startSession}>Start Prayer Session</button>
      <button onClick={stopSession}>Stop & Analyze</button>

      {insights && (
        <div>
          <h3>Insights</h3>
          <p><strong>Summary:</strong> {insights.summary}</p>
          <p><strong>Detected Echoes:</strong></p>
          <ul>
            {insights.detectedEchoes?.map((echo, i) => (
              <li key={i}>
                {echo.word} ({echo.transliteration}) - {echo.meaning}
                (Similarity: {(echo.similarity * 100).toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompleteLSIDemo;
```

---

## Next Steps

1. **Try the Demo**: Start with AudioCaptureDemo to test recording
2. **Browse Sessions**: Use SpiritualJournal to view saved sessions
3. **Add API Keys**: Enable real AI insights with OpenAI/Claude
4. **Deploy Backend**: Set up proxy for production security
5. **User Testing**: Share with prayer groups for feedback
6. **Theological Review**: Get spiritual advisors to review AI outputs

---

## Documentation Links

- **Complete System Guide**: `docs/LSI_SYSTEM_COMPLETE.md`
- **Storage Integration**: `docs/LSI_STORAGE_INTEGRATION.md`
- **Session Summary**: `SESSION_SUMMARY_LSI_PHASE1_COMPLETE.md`
- **Database Schema**: `database/lsi-schema.sql` (already deployed)

---

## Support

For questions or issues:
- Check console for errors (`F12` → Console tab)
- Review component documentation in `docs/LSI_SYSTEM_COMPLETE.md`
- Test with mock mode first before adding API keys

---

**Happy Prayer Analysis!** 🙏
