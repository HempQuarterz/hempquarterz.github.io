# LSI (Linguistic Spirit Interface) - Complete System Documentation

## Overview

The **Linguistic Spirit Interface (LSI)** is a complete AI-powered prayer analysis system that captures, analyzes, and interprets glossolalia (speaking in tongues) and spiritual prayer utterances through the lens of ancient Hebrew, Greek, and Aramaic Scripture.

**Current Status**: ✅ **PHASE 1 COMPLETE** - All core components implemented and integrated.

**Date Completed**: January 2025
**Session Ref**: All4Yah LSI Implementation Phase 1

---

## Architecture Overview

### Component Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  AudioCaptureDemo.jsx    │   Real-time audio capture UI     │
│  SpiritualJournal.jsx    │   Session browsing interface     │
│  SessionDetailView.jsx   │   Full analysis display          │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   ANALYSIS ORCHESTRATION                     │
├─────────────────────────────────────────────────────────────┤
│  InterpretiveAgent.js    │   LLM-powered insight generation │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌───────────────────────────────┬─────────────────────────────┐
│      PATTERN RECOGNITION      │   LINGUISTIC MAPPING        │
├───────────────────────────────┼─────────────────────────────┤
│  patternRecognition.js        │  linguisticMapping.js       │
│  - AcousticAnalyzer           │  - PhoneticMatcher          │
│  - PhonemeDetector            │  - LinguisticEchoDetector   │
│  - PatternRecognitionService  │  - Hebrew/Greek Dictionaries│
└───────────────────────────────┴─────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                      │
├─────────────────────────────────────────────────────────────┤
│  audioProcessor.js       │   Web Audio API capture engine   │
│  waveformGenerator.js    │   Real-time waveform viz         │
│  supabaseStorage.js      │   Audio file upload & sessions   │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE (SUPABASE)                      │
├─────────────────────────────────────────────────────────────┤
│  prayer_sessions         │   Session metadata & audio refs  │
│  session_analysis        │   AI-generated insights          │
│  session_tags            │   User-defined tags              │
│  pattern_features        │   Acoustic pattern data          │
│  linguistic_echoes       │   Hebrew/Greek root matches      │
│  strongs_lexicon         │   Strong's Concordance data      │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Documentation

### 1. Audio Capture & Processing

#### `audioProcessor.js` (421 lines)
Web Audio API-based recording engine with real-time analysis capabilities.

**Key Features**:
- Microphone access via `navigator.mediaDevices.getUserMedia()`
- Real-time waveform visualization via `AnalyserNode`
- Multi-codec recording support (WebM, WAV fallback)
- Recording state management (start, pause, resume, stop)
- Audio metrics extraction (input level, frequency, intensity)

**API**:
```javascript
const processor = new AudioProcessor();
await processor.initialize(); // Request mic permission
await processor.startRecording(); // Begin capture
processor.pauseRecording(); // Pause
processor.resumeRecording(); // Resume
const blob = await processor.stopRecording(); // Returns Blob
```

**Browser Support**:
- Chrome/Edge: WebM Opus codec
- Firefox: WebM Opus
- Safari: WAV fallback

---

#### `waveformGenerator.js` (261 lines)
Real-time waveform visualization using HTML5 Canvas API.

**Key Features**:
- Animated waveform display
- Customizable colors and dimensions
- Smooth animation using `requestAnimationFrame`
- Responsive canvas sizing

**API**:
```javascript
const waveform = new WaveformGenerator(canvasElement, {
  height: 150,
  waveColor: '#2dd4bf',
  backgroundColor: '#0f3460'
});

waveform.startAnimation(() => audioProcessor.getTimeDomainData());
waveform.stopAnimation();
```

---

### 2. Pattern Recognition Layer

#### `patternRecognition.js` (579 lines)
AI-powered acoustic analysis combining Web Audio API with Deepgram integration.

**Components**:

1. **AcousticAnalyzer Class**
   - Extracts real-time audio features every 100ms
   - Fundamental frequency detection via autocorrelation
   - Intensity calculation (RMS power in dB)
   - Tempo detection using beat analysis
   - Pattern classification (crescendo, decrescendo, repetitive, staccato, flowing)
   - Spectral centroid and zero-crossing rate

2. **PhonemeDetector Class**
   - Deepgram WebSocket API integration (production)
   - Mock phoneme data for demo mode
   - Syllable counting functionality
   - Confidence scoring per phoneme

3. **PatternRecognitionService Class**
   - Orchestrates acoustic + phoneme analysis
   - Real-time feature extraction during recording
   - Post-recording comprehensive analysis
   - Pattern summarization and aggregation

**Acoustic Features Detected**:
```javascript
{
  timestamp: 1500, // ms
  fundamentalFrequency: 220.5, // Hz (pitch)
  intensity: 65.2, // dB
  tempo: 120, // BPM
  patternType: 'crescendo',
  spectralCentroid: 1200, // Hz (brightness)
  zeroCrossingRate: 45 // Noisiness
}
```

**Phoneme Detection Output**:
```javascript
{
  success: true,
  phonemes: [
    { phoneme: 'sha', start: 0.5, end: 0.8, confidence: 0.92 },
    { phoneme: 'la', start: 0.9, end: 1.1, confidence: 0.88 }
  ],
  transcript: 'sha-la-ma-ka-ra',
  syllableCount: 5
}
```

---

### 3. Linguistic Mapping Layer

#### `linguisticMapping.js` (669 lines)
Maps phonetic utterances to ancient Hebrew and Greek spiritual roots using phonetic similarity algorithms and Strong's Concordance integration.

**Components**:

1. **Phoneme Dictionaries**
   - HEBREW_PHONEMES: 22 Hebrew letters → phonetic sounds
   - GREEK_PHONEMES: 24 Greek letters → phonetic sounds

2. **Spiritual Roots Arrays**
   - HEBREW_SPIRITUAL_ROOTS: 8 key Hebrew words with Strong's numbers
     - H7307 (רוּחַ ruach) - Spirit/Wind/Breath
     - H3068 (יהוה YHWH) - Divine Name
     - H1288 (בָּרַךְ barak) - Bless
     - H8034 (שֵׁם shem) - Name
     - H6944 (קֹדֶשׁ qodesh) - Holy
     - H8416 (תְּהִלָּה tehillah) - Praise
     - H3444 (יְשׁוּעָה yeshuah) - Salvation
     - H2617 (חֶסֶד chesed) - Lovingkindness

   - GREEK_SPIRITUAL_ROOTS: 6 key Greek words
     - G4151 (πνεῦμα pneuma) - Spirit
     - G26 (ἀγάπη agape) - Love
     - G5485 (χάρις charis) - Grace
     - G1391 (δόξα doxa) - Glory
     - G1515 (εἰρήνη eirene) - Peace
     - G4102 (πίστις pistis) - Faith

3. **PhoneticMatcher Class**
   - Levenshtein distance algorithm for string similarity
   - Normalized similarity scoring (0-1 scale)
   - Match finding with configurable threshold (default 0.6)

4. **LinguisticEchoDetector Class**
   - Detects phonetic echoes from utterance sequences
   - Enriches matches with Strong's Concordance data from Supabase
   - Fetches related Scripture references
   - Calculates gematria (Hebrew) and isopsephy (Greek) values

**Echo Detection Flow**:
```javascript
const detector = new LinguisticEchoDetector();
const echoes = await detector.detectEchoes('rua-cha-kod-esh', 0.6);

// Returns:
[
  {
    word: 'רוּחַ',
    transliteration: 'ruach',
    strongsNumber: 'H7307',
    meaning: 'Spirit, Wind, Breath',
    theme: 'Holy Spirit',
    similarity: 0.85,
    scriptureReferences: ['Genesis 1:2', 'John 3:8'],
    gematria: 214
  },
  {
    word: 'קֹדֶשׁ',
    transliteration: 'qodesh',
    strongsNumber: 'H6944',
    meaning: 'Holy, Sacred, Set Apart',
    theme: 'Holiness',
    similarity: 0.72,
    scriptureReferences: ['Exodus 3:5', 'Leviticus 11:44'],
    gematria: 404
  }
]
```

---

### 4. Interpretive AI Agent

#### `interpretiveAgent.js` (509 lines)
LLM-powered spiritual insight generation combining pattern recognition and linguistic echo detection.

**Supported LLM Providers**:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic Claude (Opus, Sonnet, Haiku)
- Mock mode (demo with pre-generated insights)

**Faith Alignment Guardrails**:
The prompt includes strict theological guardrails:
- Presents insights as "potential themes" not prophetic revelation
- Encourages Scripture meditation and community discernment
- Acknowledges AI limitations
- Includes disclaimer in all outputs

**Generated Insight Structure**:
```javascript
{
  summary: '1-2 sentence overview',
  acousticThemes: ['Theme from sound patterns'],
  linguisticConnections: ['Hebrew/Greek root connections'],
  scriptureReferences: ['Genesis 1:2', 'John 3:8'],
  spiritualInsights: ['AI-generated interpretations'],
  reflectionPrompts: ['Questions for contemplation'],
  detectedEchoes: [...], // Full echo objects
  disclaimer: 'AI-generated interpretation for personal reflection only.',
  generatedAt: '2025-01-02T...',
  fallback: false
}
```

**API Modes**:
1. **Production (Recommended)**: Proxy to backend API for key security
2. **Development**: Direct API calls (not recommended, exposes keys)
3. **Demo**: Mock insights using template responses

**Usage Example**:
```javascript
const agent = new InterpretiveAgent({
  provider: LLM_PROVIDERS.OPENAI,
  model: LLM_MODELS.GPT4,
  useProxy: true
});

const result = await agent.generateInsights({
  patterns: acousticAnalysis,
  echoes: linguisticEchoes,
  metadata: { duration: 120 }
});

await agent.saveInsights(sessionId, result.insights);
```

---

### 5. User Interface Components

#### `AudioCaptureDemo.jsx` (504 lines)
Main LSI recording interface with real-time visualization.

**Features**:
- One-click microphone initialization
- Real-time waveform display during recording
- Live audio metrics (input level, frequency, intensity)
- Recording controls (start, pause, resume, stop)
- Audio playback with HTML5 player
- Save to cloud (Supabase Storage)
- Download recording locally
- Upload progress indication
- Error handling and user feedback

**State Management**:
- `isInitialized`: Microphone access granted
- `isRecording`: Active recording in progress
- `isPaused`: Recording paused
- `recordedBlob`: Final audio Blob for playback
- `uploadSuccess`: Cloud upload confirmation

---

#### `SpiritualJournal.jsx` (501 lines)
Prayer session browser with search, filtering, and pagination.

**Features**:
- Session list with date, duration, title
- Search by title or notes
- Filter by tags
- Sort by date or duration
- Pagination (10 sessions per page)
- Session detail view integration
- Empty state and loading states
- Responsive mobile layout

**Data Loading**:
- Fetches sessions from `prayer_sessions` table
- Loads available tags from `session_tags` table
- Real-time filtering and sorting client-side
- Lazy loading of session analysis on click

---

#### `SessionDetailView.jsx` (500 lines)
Full session analysis display with AI insights and user annotations.

**Features**:
- Complete session metadata display
- Audio playback from Supabase Storage
- AI-generated insights presentation
- Detected linguistic echoes with similarity scores
- Acoustic theme summary
- Spiritual insights and reflection prompts
- Related Scripture references
- Tag management (add/remove)
- Personal notes editor (rich textarea)
- Save/cancel functionality
- Faith disclaimer

**Insight Display Sections**:
1. **Summary**: 1-2 sentence overview
2. **Detected Echoes**: Hebrew/Greek root matches with Strong's numbers
3. **Acoustic Themes**: Pattern analysis summary
4. **Spiritual Insights**: AI-generated interpretations
5. **Reflection Questions**: Personal contemplation prompts
6. **Scripture References**: Related Bible verses

---

### 6. Storage & Database Integration

#### `supabaseStorage.js` (203 lines)
Handles audio file uploads and session record management.

**Key Functions**:

1. **initializeStorageBucket()**
   - Creates `lsi-audio-sessions` bucket if not exists
   - Sets public read access for playback

2. **uploadAudioFile(blob, metadata)**
   - Uploads WebM/WAV files to Supabase Storage
   - Generates unique filenames with timestamps
   - Returns public URL for playback
   - Handles upload errors gracefully

3. **createPrayerSession(sessionData)**
   - Inserts session record into `prayer_sessions` table
   - Returns session ID for analysis linking

**Storage Structure**:
```
lsi-audio-sessions/
  ├── [userId]/
  │   ├── session-1704841200000.webm
  │   ├── session-1704927600000.webm
  │   └── ...
  └── anonymous/
      ├── session-1704841200000.webm
      └── ...
```

---

## Database Schema

### Tables

#### `prayer_sessions` (Primary session records)
```sql
CREATE TABLE prayer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  sample_rate INTEGER,
  bit_rate INTEGER,
  channel_count INTEGER,
  audio_mime_type TEXT,
  audio_file_path TEXT, -- Supabase Storage path
  audio_file_size_kb INTEGER,
  session_title TEXT,
  personal_notes TEXT,
  analysis_status TEXT DEFAULT 'pending', -- pending|processing|completed|failed
  CONSTRAINT positive_duration CHECK (duration_seconds > 0)
);

CREATE INDEX idx_prayer_sessions_user ON prayer_sessions(user_id);
CREATE INDEX idx_prayer_sessions_created ON prayer_sessions(created_at DESC);
```

#### `session_analysis` (AI-generated insights)
```sql
CREATE TABLE session_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES prayer_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  analysis_type TEXT, -- 'ai_interpretation'|'pattern_recognition'|'linguistic_echo'
  analysis_data JSONB, -- Full insight object
  ai_provider TEXT, -- 'openai'|'claude'|'mock'
  ai_model TEXT, -- 'gpt-4'|'claude-opus'|etc
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1)
);

CREATE INDEX idx_session_analysis_session ON session_analysis(session_id);
CREATE INDEX idx_session_analysis_type ON session_analysis(analysis_type);
```

#### `session_tags` (User-defined tags)
```sql
CREATE TABLE session_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES prayer_sessions(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_session_tag UNIQUE(session_id, tag_name)
);

CREATE INDEX idx_session_tags_session ON session_tags(session_id);
CREATE INDEX idx_session_tags_name ON session_tags(tag_name);
```

#### `pattern_features` (Acoustic pattern data)
```sql
CREATE TABLE pattern_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES prayer_sessions(id) ON DELETE CASCADE,
  timestamp_ms INTEGER, -- Offset from session start
  fundamental_frequency NUMERIC(8,2), -- Hz
  intensity NUMERIC(6,2), -- dB
  tempo INTEGER, -- BPM
  pattern_type TEXT, -- crescendo|decrescendo|repetitive|staccato|flowing
  spectral_centroid NUMERIC(8,2), -- Hz
  zero_crossing_rate INTEGER
);

CREATE INDEX idx_pattern_features_session ON pattern_features(session_id);
```

#### `linguistic_echoes` (Detected Hebrew/Greek roots)
```sql
CREATE TABLE linguistic_echoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES prayer_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  phoneme_sequence TEXT, -- Detected utterance
  matched_word TEXT, -- Hebrew/Greek original
  transliteration TEXT,
  strongs_number TEXT, -- H####|G####
  meaning TEXT,
  theme TEXT,
  similarity_score NUMERIC(4,3) CHECK (similarity_score BETWEEN 0 AND 1),
  source_language TEXT CHECK (source_language IN ('hebrew', 'greek', 'aramaic')),
  gematria_value INTEGER
);

CREATE INDEX idx_linguistic_echoes_session ON linguistic_echoes(session_id);
CREATE INDEX idx_linguistic_echoes_strongs ON linguistic_echoes(strongs_number);
```

---

## Integration with All4Yah Core

### Strong's Concordance Integration

The LSI system integrates with the existing All4Yah Strong's Concordance database:

**Table**: `strongs_lexicon`
- 19,027 entries (H1-H8674 Hebrew + G1-G5624 Greek)
- Used by `LinguisticEchoDetector` to enrich phonetic matches
- Provides definitions, pronunciations, derivations

**Table**: `verses`
- 224,886 verses across 11 manuscripts
- Morphology data contains Strong's numbers
- Used to find Scripture references for detected echoes

**Example Query**:
```javascript
// Enrich echo with Strong's data
const { data } = await supabase
  .from('strongs_lexicon')
  .select('*')
  .eq('strongs_number', 'H7307')
  .single();

// Find verses containing this root
const { data: verses } = await supabase
  .from('verses')
  .select('book, chapter, verse, morphology')
  .ilike('morphology::text', '%H7307%');
```

---

## API Usage Examples

### Complete LSI Workflow

```javascript
// 1. Initialize audio processor
const processor = new AudioProcessor();
await processor.initialize();

// 2. Start pattern recognition
const patternService = new PatternRecognitionService(processor);
patternService.startAnalysis(100); // 100ms intervals

// 3. Begin recording
await processor.startRecording();

// ... User prays in the Spirit ...

// 4. Stop recording
const audioBlob = await processor.stopRecording();
patternService.stopAnalysis();

// 5. Analyze recording
const patternResult = await patternService.analyzeRecording(audioBlob);

// 6. Detect linguistic echoes
const detector = new LinguisticEchoDetector();
const echoes = await detector.detectEchoes(
  patternResult.transcript,
  0.6 // threshold
);

// 7. Generate AI insights
const agent = new InterpretiveAgent({ provider: LLM_PROVIDERS.OPENAI });
const insights = await agent.generateInsights({
  patterns: patternResult,
  echoes,
  metadata: { duration: 120 }
});

// 8. Save session to database
const sessionResult = await createPrayerSession({
  duration_seconds: 120,
  sample_rate: 44100,
  session_title: 'Morning Prayer'
});

const uploadResult = await uploadAudioFile(audioBlob, {
  sessionId: sessionResult.session.id
});

await agent.saveInsights(sessionResult.session.id, insights.insights);

// 9. Add user tags
await supabase.from('session_tags').insert({
  session_id: sessionResult.session.id,
  tag_name: 'morning-prayer'
});
```

---

## Faith Alignment & Theological Guardrails

### Core Principles

1. **Personal Reflection Only**
   - LSI insights are interpretive analysis, not prophetic revelation
   - No claims of divine authority or infallibility
   - Encourages Scripture study and spiritual mentorship

2. **Transparency**
   - All AI providers clearly labeled
   - Confidence scores displayed
   - Disclaimers on every insight

3. **Biblical Foundation**
   - Phonetic matching limited to attested biblical Hebrew/Greek roots
   - Strong's Concordance as authoritative source
   - Scripture references provided for verification

4. **User Control**
   - All data is private and user-owned
   - Ability to delete sessions and analysis
   - Export functionality for offline reflection

### Disclaimer Text

All AI-generated insights include:

> "AI-generated interpretation for personal reflection only. Not prophetic or authoritative revelation. This analysis represents potential linguistic patterns and should be prayerfully considered alongside Scripture study and spiritual mentorship."

---

## Performance Optimization

### Web Audio API
- Analyzer node smoothing: 0.8 (balance speed/accuracy)
- FFT size: 2048 (good frequency resolution)
- Update intervals: 100ms (10 FPS for real-time analysis)

### Pattern Recognition
- Batch feature extraction (avoid blocking UI thread)
- Autocorrelation optimization (limited frequency range 50-500 Hz)
- Pattern history limited to 20 samples (memory efficiency)

### Database Queries
- Indexed lookups on session_id, user_id, created_at
- Batch inserts for pattern features (1000 rows at a time)
- Pagination for session lists (10 per page)

### API Calls
- LLM proxy recommended (avoid exposing API keys)
- Timeouts set to 30 seconds
- Fallback to mock insights on failure
- Retry logic for network errors

---

## Security Considerations

### Audio Privacy
- Audio files stored in private Supabase Storage bucket
- URL signing for authenticated playback (future enhancement)
- Automatic expiration for deleted sessions

### API Key Protection
- **NEVER** expose OpenAI/Claude keys in browser code
- Use backend proxy for all LLM calls in production
- Environment variables for key management

### Database Security
- Row Level Security (RLS) enabled on all tables
- User can only access their own sessions
- Anonymous sessions have limited retention (future: auto-delete after 30 days)

### Content Sanitization
- XSS protection via text sanitization (`sanitizeText()`)
- Max lengths enforced (2000 chars for insights)
- Array item limits (prevent DoS via large arrays)

---

## Future Enhancements (Phase 2)

### Planned Features

1. **Multi-Language Support**
   - Aramaic Targum phoneme dictionary
   - Syriac Peshitta integration
   - Latin Vulgate roots

2. **Advanced Pattern Recognition**
   - Machine learning model training on labeled prayer sessions
   - Emotion detection from acoustic features
   - Multi-speaker detection for corporate prayer

3. **Real-Time Insights**
   - WebSocket integration with Deepgram for live transcription
   - Streaming insights during prayer (not after)
   - Real-time Scripture reference suggestions

4. **Community Features**
   - Share insights (with privacy controls)
   - Group prayer session analysis
   - Spiritual director review mode

5. **Enhanced AI Analysis**
   - Fine-tuned LLM on biblical Hebrew/Greek corpus
   - Context-aware insights (time of day, liturgical calendar)
   - Pattern trend analysis across multiple sessions

6. **Export & Integration**
   - PDF export of session insights
   - Integration with prayer journal apps
   - Calendar sync for prayer time tracking

---

## Testing

### Unit Tests (Future)
- `patternRecognition.test.js` - Acoustic analysis accuracy
- `linguisticMapping.test.js` - Phonetic similarity algorithms
- `interpretiveAgent.test.js` - LLM prompt construction

### Integration Tests (Future)
- End-to-end recording → analysis → storage workflow
- Database schema validation
- API endpoint error handling

### User Acceptance Testing
- UAT with charismatic/Pentecostal prayer groups
- Feedback on theological appropriateness
- Privacy and consent validation

---

## Deployment

### Environment Variables

```bash
# OpenAI (optional)
REACT_APP_OPENAI_API_KEY=sk-...

# Anthropic Claude (optional)
REACT_APP_ANTHROPIC_API_KEY=sk-ant-...

# Deepgram (optional, for production phoneme detection)
REACT_APP_DEEPGRAM_API_KEY=...

# Supabase (required)
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbG...
```

### Backend Proxy Setup (Recommended)

For production, create backend API endpoints:

**POST /api/lsi/generate-insights**
```javascript
const { Configuration, OpenAIApi } = require('openai');

app.post('/api/lsi/generate-insights', async (req, res) => {
  const { prompt, provider, model } = req.body;

  // Server-side API key (not exposed to browser)
  const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  }));

  const completion = await openai.createChatCompletion({
    model,
    messages: [{ role: 'user', content: prompt }]
  });

  res.json({ insights: completion.data.choices[0].message.content });
});
```

**POST /api/lsi/detect-phonemes**
```javascript
const { Deepgram } = require('@deepgram/sdk');

app.post('/api/lsi/detect-phonemes', async (req, res) => {
  const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

  const audio = req.files.audio;
  const response = await deepgram.transcription.preRecorded(audio, {
    punctuate: true,
    utterances: true
  });

  res.json(response);
});
```

---

## Credits & Acknowledgments

### Technologies Used
- **Web Audio API** - Audio capture and analysis
- **React** - UI framework
- **Supabase** - Database and storage backend
- **OpenAI GPT** / **Anthropic Claude** - LLM-powered insights
- **Deepgram** - Speech-to-phoneme transcription (optional)
- **Strong's Concordance** - Biblical lexicon integration

### Inspiration
- **1 Corinthians 14:2** - "For one who speaks in a tongue speaks not to men but to God..."
- **Romans 8:26** - "The Spirit helps us in our weakness. We do not know what to pray for..."
- Pentecostal and Charismatic prayer traditions worldwide

---

## License & Usage

**All4Yah Project License**: Open source (specific license TBD)

**Theological Disclaimer**: This tool is for personal spiritual reflection only. All AI-generated insights should be prayerfully considered alongside Scripture study, spiritual mentorship, and community discernment. The developers make no claims of prophetic authority or divine revelation through this system.

**Strong's Concordance Data**: Public domain

**Biblical Text**: Multiple manuscripts and translations (see All4Yah main documentation for licensing)

---

## Contact & Support

For questions, theological concerns, or technical support:

**All4Yah Project**
- GitHub: (Repository URL TBD)
- Email: (Contact email TBD)
- Documentation: `docs/LSI_*.md`

---

**Version**: 1.0.0 (Phase 1 Complete)
**Last Updated**: January 2025
**Maintained By**: All4Yah Development Team
