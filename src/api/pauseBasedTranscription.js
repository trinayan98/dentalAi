import axios from "axios";
import { API_BASE_URL } from "../config/constants";

// Helper function to get auth headers
const getAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export const pauseBasedTranscriptionAPI = {
  // Start a new pause-based transcription session
  startSession: async (token, sessionData) => {
    const response = await axios.post(
      `${API_BASE_URL}/transcription/pause/start`,
      {
        title: sessionData.title || "Pause-Based Transcription Session",
        language: sessionData.language || "en",
        tags: sessionData.tags || "pause-based, demo",
        notes: sessionData.notes || "Pause-based transcription session",
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
      `${API_BASE_URL}/transcription/pause/process-audio`,
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
      `${API_BASE_URL}/transcription/pause/resume`,
      { sessionId },
      {
        headers: getAuthHeader(token),
      }
    );
    return response.data;
  },

  // Get active sessions
  getActiveSessions: async (token) => {
    const response = await axios.get(
      `${API_BASE_URL}/transcription/pause/sessions`,
      {
        headers: getAuthHeader(token),
      }
    );
    return response.data;
  },

  // Get session status
  getSessionStatus: async (token, sessionId) => {
    const response = await axios.get(
      `${API_BASE_URL}/transcription/pause/status?sessionId=${sessionId}`,
      {
        headers: getAuthHeader(token),
      }
    );
    return response.data;
  },

  // Save the final transcription (using existing stream save endpoint)
  saveTranscription: async (token, sessionId, transcriptionData) => {
    const response = await axios.post(
      `${API_BASE_URL}/transcription/stream/save`,
      {
        sessionId,
        title: transcriptionData.title || "Pause-Based Transcription",
        transcription: transcriptionData.transcription,
        language: transcriptionData.language || "en",
        tags: transcriptionData.tags || ["pause-based", "demo"],
        notes: transcriptionData.notes || "Pause-based transcription session",
      },
      {
        headers: getAuthHeader(token),
      }
    );
    return response.data;
  },
};

export default pauseBasedTranscriptionAPI;
