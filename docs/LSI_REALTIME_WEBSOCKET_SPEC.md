# LSI Real-Time Insights with WebSocket - Technical Specification

## Overview

Add WebSocket support for streaming real-time insights during prayer sessions, enabling:
- Live phoneme detection during recording
- Streaming linguistic echo matches
- Real-time Scripture reference suggestions
- Progressive waveform + echo visualization

## Architecture

### Backend WebSocket Server (Node.js + Socket.IO)

**File**: `backend/websocket-server.js`

```javascript
// WebSocket server for real-time LSI insights
const io = require('socket.io')(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
});

io.on('connection', (socket) => {
  console.log('LSI client connected:', socket.id);

  // Audio chunk streaming
  socket.on('audio-chunk', async (audioBlob) => {
    // Process chunk with Deepgram
    const phonemes = await detectPhonemesStreaming(audioBlob);
    socket.emit('phonemes-detected', phonemes);

    // Match to linguistic roots
    const echoes = await matchEchoesStreaming(phonemes);
    socket.emit('echoes-detected', echoes);
  });

  // Session lifecycle
  socket.on('start-session', (sessionId) => {
    socket.join(`session-${sessionId}`);
  });

  socket.on('end-session', () => {
    socket.disconnect();
  });
});
```

### Frontend WebSocket Client (React Hook)

**File**: `frontend/src/utils/lsi/useRealtimeInsights.js`

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useRealtimeInsights = (sessionId) => {
  const [socket, setSocket] = useState(null);
  const [phonemes, setPhonemes] = useState([]);
  const [echoes, setEchoes] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const proxyUrl = process.env.REACT_APP_PROXY_URL || 'http://localhost:3002';
    const newSocket = io(proxyUrl);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('start-session', sessionId);
    });

    newSocket.on('phonemes-detected', (data) => {
      setPhonemes(prev => [...prev, ...data]);
    });

    newSocket.on('echoes-detected', (data) => {
      setEchoes(prev => [...prev, ...data]);
    });

    newSocket.on('disconnect', () => setIsConnected(false));

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [sessionId]);

  const sendAudioChunk = (audioBlob) => {
    if (socket && isConnected) {
      socket.emit('audio-chunk', audioBlob);
    }
  };

  return { phonemes, echoes, isConnected, sendAudioChunk };
};
```

### Live Visualization Component

**File**: `frontend/src/components/lsi/RealtimeInsightsPanel.jsx`

```javascript
import React, { useRef, useEffect } from 'react';
import { useRealtimeInsights } from '../../utils/lsi/useRealtimeInsights';

const RealtimeInsightsPanel = ({ sessionId, audioProcessor }) => {
  const { phonemes, echoes, isConnected, sendAudioChunk } = useRealtimeInsights(sessionId);
  const canvasRef = useRef(null);

  // Stream audio chunks every 100ms
  useEffect(() => {
    if (!audioProcessor || !isConnected) return;

    const interval = setInterval(() => {
      const chunk = audioProcessor.getLastChunk(); // Get recent audio
      if (chunk) sendAudioChunk(chunk);
    }, 100);

    return () => clearInterval(interval);
  }, [audioProcessor, isConnected, sendAudioChunk]);

  // Visualize waveform + echoes
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Draw waveform
    // ... (reuse AudioProcessor waveform code)

    // Overlay detected echoes
    echoes.forEach((echo, i) => {
      ctx.fillStyle = '#FFD966';
      ctx.fillText(echo.transliteration, 50, 50 + i * 20);
    });
  }, [phonemes, echoes]);

  return (
    <div className="realtime-insights-panel">
      <div className="connection-status">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <canvas ref={canvasRef} width={800} height={300} />

      <div className="detected-echoes">
        <h3>Live Echoes ({echoes.length})</h3>
        {echoes.slice(-5).reverse().map((echo, i) => (
          <div key={i} className="echo-item">
            <strong>{echo.transliteration}</strong> ({echo.meaning})
            - {(echo.similarity * 100).toFixed(0)}%
          </div>
        ))}
      </div>

      <div className="detected-phonemes">
        <h3>Phoneme Stream</h3>
        <div className="phoneme-sequence">
          {phonemes.slice(-20).map((p, i) => (
            <span key={i} className="phoneme">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealtimeInsightsPanel;
```

## Implementation Steps

### Phase 1: WebSocket Infrastructure (30 min)

1. **Install Socket.IO**:
   ```bash
   cd backend
   npm install socket.io
   cd ../frontend
   npm install socket.io-client
   ```

2. **Create WebSocket Server** (`backend/websocket-server.js`):
   - HTTP server upgrade to WebSocket
   - CORS configuration
   - Session room management
   - Audio chunk handler

3. **Update Express Server** (`backend/server.js`):
   - Import and initialize WebSocket server
   - Share HTTP server instance

### Phase 2: Streaming Audio Processing (45 min)

1. **Extend AudioProcessor** (`frontend/src/utils/lsi/audioProcessor.js`):
   - Add `getLastChunk()` method
   - Buffer recent audio (last 100ms)
   - Return Blob for WebSocket transmission

2. **Create Streaming Phoneme Detector** (`backend/phoneme-streamer.js`):
   - Deepgram streaming API integration
   - Chunk-based phoneme detection
   - Emit results via WebSocket

3. **Create Streaming Echo Matcher** (`backend/echo-streamer.js`):
   - Lightweight phoneme → root matching
   - Use same algorithm as frontend LinguisticEchoDetector
   - Emit matches as they occur

### Phase 3: React Integration (30 min)

1. **Create Hook** (`frontend/src/utils/lsi/useRealtimeInsights.js`)
2. **Create Panel Component** (`frontend/src/components/lsi/RealtimeInsightsPanel.jsx`)
3. **Update AudioCaptureDemo**:
   - Add "Enable Real-Time Insights" toggle
   - Conditionally render RealtimeInsightsPanel
   - Pass audioProcessor instance

4. **CSS Styling** (`frontend/src/styles/lsi/realtime-insights.css`):
   - Connection status indicator
   - Live echo feed (reverse chronological)
   - Phoneme stream display
   - Smooth fade-in animations

## Testing

**Manual Test Flow**:
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Navigate to `/lsi`
4. Click "Audio Capture" tab
5. Enable "Real-Time Insights"
6. Initialize microphone
7. Start recording
8. Speak prayer phrases (e.g., "ruach", "shalom")
9. Watch live echoes appear
10. Stop recording
11. Verify final insights match real-time detections

**Test Cases**:
- ✅ WebSocket connects successfully
- ✅ Audio chunks stream every 100ms
- ✅ Phonemes detected and displayed
- ✅ Echoes matched and displayed
- ✅ Connection survives network interruptions
- ✅ Clean disconnection on session end

## Performance Considerations

**Audio Chunk Size**:
- 100ms chunks = ~4.4KB WebM audio
- 10 chunks/sec = ~44KB/sec bandwidth
- 5-minute session = ~13MB total

**Echo Detection Rate**:
- Hebrew roots: ~8 comparisons per chunk
- Greek roots: ~6 comparisons per chunk
- Aramaic roots: ~8 comparisons per chunk
- Total: ~22 comparisons × 10 chunks/sec = 220 ops/sec (negligible CPU)

**WebSocket Overhead**:
- Socket.IO adds ~2KB per message (headers + metadata)
- Estimated: ~20KB/sec total bandwidth

## Fallback Strategy

If WebSocket connection fails:
1. Graceful degradation to batch mode (post-recording analysis)
2. Display warning: "Real-time insights unavailable - using batch mode"
3. Retry connection every 5 seconds
4. Log errors to console for debugging

## Security

- Same CORS policy as REST API
- Session IDs prevent cross-session data leakage
- No API keys transmitted via WebSocket
- Audio chunks ephemeral (not stored server-side)

## Future Enhancements

1. **Multi-Language Detection**:
   - Auto-detect language from phoneme patterns
   - Switch between Hebrew/Greek/Aramaic roots dynamically

2. **Confidence Scoring**:
   - Show similarity % for each echo
   - Color-code by confidence (high = gold, medium = yellow, low = gray)

3. **Scripture Verse Previews**:
   - Fetch verse text on hover
   - Display in tooltip

4. **Export Timeline**:
   - Save timestamped echo detections
   - Generate PDF report with markers

5. **Collaborative Prayer Sessions**:
   - Multiple users join same session
   - Shared real-time insights
   - Aggregate linguistic patterns

---

**Status**: Specification complete - Ready for implementation

**Implementation Time**: ~2-3 hours (as estimated in Phase 2 roadmap)

**Priority**: Medium (Nice-to-have enhancement after core LSI features stable)
