import axios from "axios";
import { API_BASE_URL } from "../config/constants";

// Helper function to get auth header
const getAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

// Audio validation utilities
export const audioValidation = {
  // Check if audio buffer contains meaningful audio (not just silence)
  hasMeaningfulAudio: (audioBuffer, threshold = 100) => {
    if (!audioBuffer || audioBuffer.length === 0) return false;

    // Count how many samples are above the threshold
    const meaningfulSamples = audioBuffer.filter(
      (sample) => Math.abs(sample) > threshold
    ).length;
    const totalSamples = audioBuffer.length;

    // Require at least 10% of samples to be meaningful
    const meaningfulPercentage = (meaningfulSamples / totalSamples) * 100;

    console.log(
      `Audio validation: ${meaningfulSamples}/${totalSamples} samples above threshold (${meaningfulPercentage.toFixed(
        1
      )}%)`
    );

    return meaningfulPercentage >= 10; // At least 10% meaningful audio
  },

  // Calculate audio duration in seconds
  getAudioDuration: (audioBuffer, sampleRate = 16000) => {
    return audioBuffer.length / sampleRate;
  },

  // Validate audio buffer before sending to server
  validateAudioBuffer: (audioBuffer, minDuration = 1, maxDuration = 60) => {
    const duration = audioValidation.getAudioDuration(audioBuffer);

    if (audioBuffer.length === 0) {
      return { valid: false, error: "No audio data" };
    }

    if (!audioValidation.hasMeaningfulAudio(audioBuffer)) {
      return { valid: false, error: "Audio appears to be silent" };
    }

    if (duration < minDuration) {
      return {
        valid: false,
        error: `Audio too short (${duration.toFixed(
          1
        )}s). Minimum ${minDuration}s required.`,
      };
    }

    if (duration > maxDuration) {
      return {
        valid: false,
        error: `Audio too long (${duration.toFixed(
          1
        )}s). Maximum ${maxDuration}s allowed.`,
      };
    }

    return { valid: true };
  },
};

export const streamingTranscriptionAPI = {
  // Start a new streaming transcription session
  startSession: async (token, sessionData) => {
    const response = await axios.post(
      `${API_BASE_URL}/transcription/stream/start`,
      {
        title: sessionData.title || "Live Transcription Session",
        language: sessionData.language || "en",
        tags: sessionData.tags || "live, real-time",
        notes: sessionData.notes || "Ongoing transcription session",
      },
      {
        headers: getAuthHeader(token),
      }
    );
    return response.data;
  },

  // Process audio buffer (pause/stop)
  processAudio: async (token, sessionId, audioData, action) => {
    const response = await axios.post(
      `${API_BASE_URL}/transcription/stream/audio`,
      {
        sessionId,
        audioData,
        action, // "pause" or "stop"
      },
      {
        headers: getAuthHeader(token),
      }
    );
    return response.data;
  },

  // Resume a paused session
  resumeSession: async (token, sessionId) => {
    const response = await axios.post(
      `${API_BASE_URL}/transcription/resume`,
      { sessionId },
      {
        headers: getAuthHeader(token),
      }
    );
    return response.data;
  },

  // Save the final transcription
  saveTranscription: async (token, sessionId, transcriptionData) => {
    const response = await axios.post(
      `${API_BASE_URL}/transcription/stream/save`,
      {
        sessionId,
        title: transcriptionData.title || "Live Transcription",
        transcription: transcriptionData.transcription,
        language: transcriptionData.language || "en",
        tags: transcriptionData.tags || ["live", "real-time"],
        notes: transcriptionData.notes || "Streaming transcription session",
      },
      {
        headers: getAuthHeader(token),
      }
    );
    return response.data;
  },

  // Get active sessions
  getActiveSessions: async (token) => {
    const response = await axios.get(
      `${API_BASE_URL}/transcription/stream/sessions`,
      {
        headers: getAuthHeader(token),
      }
    );
    return response.data;
  },

  // Get processing status
  getStatus: async (token, sessionId) => {
    const response = await axios.get(
      `${API_BASE_URL}/transcription/stream/status?sessionId=${sessionId}`,
      {
        headers: getAuthHeader(token),
      }
    );
    return response.data;
  },

  // Upload audio file (legacy endpoint)
  uploadAudio: async (token, audioFile) => {
    const formData = new FormData();
    formData.append("audio", audioFile);

    const response = await axios.post(
      `${API_BASE_URL}/transcription/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};

export default streamingTranscriptionAPI;
