# 🎙️ Streaming Transcription Implementation

This document describes the implementation of the ongoing/streaming transcription feature for the Transcribe frontend application.

## 📋 Overview

The streaming transcription feature allows users to:

- Start a live transcription session
- Record audio continuously with local buffering
- Pause/resume recording to process audio chunks
- Get real-time transcription results
- Save the final transcription to their account

## 🏗️ Architecture

### Frontend Components

1. **LiveTranscript.jsx** - Main component with streaming functionality
2. **StreamingDemo.jsx** - Simplified demo component for testing
3. **streamingTranscription.js** - API service layer

### Key Features

- **Session Management**: Create, pause, resume, and stop transcription sessions
- **Audio Capture**: Real-time microphone input with Web Audio API
- **Local Buffering**: Audio data buffered locally before processing
- **Chunked Processing**: Process audio in chunks when paused/stopped
- **Real-time Display**: Show transcription results as they're processed

## 🔧 Implementation Details

### 1. Audio Capture

```javascript
const startAudioCapture = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  audioContextRef.current = new (window.AudioContext ||
    window.webkitAudioContext)();
  const source = audioContextRef.current.createMediaStreamSource(stream);

  const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

  processor.onaudioprocess = (event) => {
    const inputData = event.inputBuffer.getChannelData(0);

    // Convert float32 to int16
    const int16Array = new Int16Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      int16Array[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
    }

    setAudioBuffer((prev) => [...prev, ...Array.from(int16Array)]);
  };
};
```

### 2. API Integration

The implementation uses the following API endpoints:

- `POST /api/transcription/stream/start` - Start new session
- `POST /api/transcription/process-audio` - Process audio buffer
- `POST /api/transcription/resume` - Resume paused session
- `POST /api/transcription/stream/save` - Save final transcription

### 3. State Management

Key state variables:

- `sessionId` - Current session identifier
- `isStreamingActive` - Session status
- `isPaused` - Pause state
- `audioBuffer` - Local audio data buffer
- `currentTranscription` - Live transcription text
- `isProcessing` - Processing status

## 🚀 Usage Flow

### 1. Start Session

```javascript
const response = await streamingTranscriptionAPI.startSession(token, {
  title: "Meeting Transcription",
  language: "en",
  tags: "meeting, important",
  notes: "Weekly team meeting",
});
```

### 2. Record Audio

- Audio is captured continuously and buffered locally
- No network calls during recording
- Real-time timer shows recording duration

### 3. Pause Processing

```javascript
await streamingTranscriptionAPI.processAudio(
  token,
  sessionId,
  audioBuffer,
  "pause"
);
```

- Sends current audio buffer to server
- Receives transcription for the chunk
- Clears local buffer
- Updates display with new text

### 4. Resume Recording

```javascript
await streamingTranscriptionAPI.resumeSession(token, sessionId);
```

- Resumes audio capture
- Continues buffering new audio data

### 5. Stop Session

```javascript
await streamingTranscriptionAPI.processAudio(
  token,
  sessionId,
  audioBuffer,
  "stop"
);
```

- Processes final audio chunk
- Ends session
- Cleans up audio resources

### 6. Save Transcription

```javascript
await streamingTranscriptionAPI.saveTranscription(token, sessionId, {
  title: "Final Meeting Transcription",
  transcription: finalText,
  language: "en",
  tags: ["meeting", "important"],
});
```

## 📊 Data Flow

```
Microphone → Web Audio API → Local Buffer → Process (Pause/Stop) → API → Transcription → Display
```

1. **Audio Input**: Microphone captures audio via `getUserMedia()`
2. **Processing**: Web Audio API processes audio in real-time
3. **Buffering**: Audio samples stored in local buffer as Int16Array
4. **Chunking**: When paused/stopped, buffer sent to server
5. **Transcription**: Server processes audio and returns text
6. **Display**: Frontend updates with new transcription text

## 🎯 Key Benefits

### For Users

- **Real-time Experience**: See transcription as you speak
- **Control**: Pause/resume at any time
- **Efficiency**: No need to wait for full recording
- **Flexibility**: Process audio in manageable chunks

### For System

- **Reduced Latency**: Process smaller audio chunks
- **Better UX**: Immediate feedback
- **Resource Management**: Controlled processing load
- **Error Recovery**: Can resume from interruptions

## 🔒 Security & Privacy

- **Local Buffering**: Audio stored locally until processing
- **Secure Transmission**: All API calls use Bearer token authentication
- **Session Isolation**: Each session has unique identifier
- **Data Cleanup**: Audio buffers cleared after processing

## 🧪 Testing

### Demo Component

Use `StreamingDemo.jsx` for testing:

- Simplified interface
- Clear status indicators
- Step-by-step instructions
- Error handling examples

### Test Scenarios

1. **Basic Flow**: Start → Speak → Pause → Resume → Stop → Save
2. **Error Handling**: Network issues, audio permission denied
3. **Long Sessions**: Extended recording with multiple pauses
4. **Edge Cases**: Very short audio, rapid pause/resume cycles

## 🐛 Troubleshooting

### Common Issues

1. **Microphone Access Denied**

   - Check browser permissions
   - Ensure HTTPS (required for getUserMedia)

2. **Audio Not Capturing**

   - Verify audio input device selection
   - Check browser console for errors

3. **Processing Failures**

   - Verify API endpoint availability
   - Check authentication token
   - Ensure audio buffer contains data

4. **Memory Issues**
   - Large audio buffers can cause performance problems
   - Implement buffer size limits
   - Clear buffers after processing

### Debug Information

- Session ID displayed in UI
- Buffer size shown in real-time
- Processing status indicators
- Console logging for API calls

## 📈 Performance Considerations

### Optimization Strategies

- **Buffer Management**: Limit buffer size to prevent memory issues
- **Chunking**: Process audio in reasonable chunks (5-10 seconds)
- **Debouncing**: Avoid rapid pause/resume cycles
- **Cleanup**: Properly dispose of audio resources

### Monitoring

- Track buffer sizes
- Monitor processing times
- Log API response times
- Watch for memory leaks

## 🔮 Future Enhancements

### Potential Improvements

1. **Real-time Streaming**: WebSocket-based live transcription
2. **Speaker Detection**: Identify different speakers
3. **Language Detection**: Automatic language switching
4. **Noise Reduction**: Audio preprocessing
5. **Offline Support**: Local transcription when offline

### Advanced Features

- **Multi-language Support**: Switch languages mid-session
- **Custom Models**: User-specific transcription models
- **Collaboration**: Shared transcription sessions
- **Analytics**: Usage statistics and insights

## 📚 API Reference

### Request Formats

#### Start Session

```json
{
  "title": "Meeting Transcription",
  "language": "en",
  "tags": "meeting, important",
  "notes": "Weekly team meeting"
}
```

#### Process Audio

```json
{
  "sessionId": "session_123_456789",
  "audioData": [1234, 5678, 9012, ...],
  "action": "pause"
}
```

#### Save Transcription

```json
{
  "sessionId": "session_123_456789",
  "title": "Final Meeting Transcription",
  "transcription": "Complete transcription text...",
  "language": "en",
  "tags": ["meeting", "important"],
  "notes": "Weekly team meeting notes"
}
```

### Response Formats

All endpoints return consistent response structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## 🎉 Conclusion

The streaming transcription feature provides a modern, user-friendly approach to audio transcription with real-time feedback and flexible control. The implementation balances performance, user experience, and system reliability while maintaining security and privacy standards.

For questions or issues, refer to the troubleshooting section or contact the development team.
