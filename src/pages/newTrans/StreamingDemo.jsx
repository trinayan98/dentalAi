import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/Button";
import {
  Mic,
  Pause,
  Play,
  Square,
  Save,
  Loader2,
  FileText,
  Volume2,
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { API_BASE_URL } from "../../config/constants";

const StreamingDemo = () => {
  const [sessionId, setSessionId] = useState(() => {
    // Initialize sessionId from localStorage if available
    const savedSessionId = localStorage.getItem("streamingSessionId");
    return savedSessionId || null;
  });
  const [isActive, setIsActive] = useState(() => {
    // Initialize isActive from localStorage if available
    const savedIsActive = localStorage.getItem("streamingIsActive");
    return savedIsActive === "true" || false;
  });
  const [isPaused, setIsPaused] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);

  // Audio recording state - Updated for raw PCM capture
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const processorNodeRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioWorkletNodeRef = useRef(null);
  const sessionIdRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState(0);
  const audioBufferRef = useRef([]);

  // Audio playback state
  const [audioUrl, setAudioUrl] = useState(null);
  const [hasAudio, setHasAudio] = useState(false);

  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  // Update sessionId ref whenever sessionId state changes
  useEffect(() => {
    sessionIdRef.current = sessionId;
    console.log("🔄 SessionId ref updated:", sessionId);
  }, [sessionId]);

  // Update recording and paused refs whenever state changes
  useEffect(() => {
    isRecordingRef.current = isRecording;
    console.log("🔄 Recording ref updated:", isRecording);
  }, [isRecording]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    console.log("🔄 Paused ref updated:", isPaused);
  }, [isPaused]);

  // Helper: Save session state to localStorage
  const saveSessionState = (newSessionId, newIsActive) => {
    if (newSessionId) {
      localStorage.setItem("streamingSessionId", newSessionId);
      console.log("💾 Session ID saved to localStorage:", newSessionId);
    } else {
      localStorage.removeItem("streamingSessionId");
      console.log("🗑️ Session ID removed from localStorage");
    }

    if (newIsActive !== undefined) {
      localStorage.setItem("streamingIsActive", newIsActive.toString());
      console.log("💾 Session active state saved:", newIsActive);
    }
  };

  // Helper: Clear session state from localStorage
  const clearSessionState = () => {
    localStorage.removeItem("streamingSessionId");
    localStorage.removeItem("streamingIsActive");
    console.log("🗑️ Session state cleared from localStorage");
  };

  // Timer for recording duration
  useEffect(() => {
    let interval = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // Audio Worklet processor code as a string
  const audioWorkletCode = `
    class AudioProcessor extends AudioWorkletProcessor {
      constructor() {
        super();
        this.bufferSize = 4096;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
      }

      process(inputs, outputs, parameters) {
        const input = inputs[0];
        const inputChannel = input[0];

        if (inputChannel) {
          for (let i = 0; i < inputChannel.length; i++) {
            this.buffer[this.bufferIndex] = inputChannel[i];
            this.bufferIndex++;

            if (this.bufferIndex >= this.bufferSize) {
              // Send buffer to main thread
              this.port.postMessage({
                type: 'audioData',
                data: new Float32Array(this.buffer)
              });

              this.bufferIndex = 0;
            }
          }
        }

        return true;
      }
    }

    registerProcessor('audio-processor', AudioProcessor);
  `;

  // Convert Float32Array to Int16Array for backend
  const convertFloat32ToInt16 = (float32Array) => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // Clamp to [-1, 1] and convert to 16-bit signed integer
      const clamped = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = Math.round(clamped * 32767);
    }
    return Array.from(int16Array);
  };

  const startSession = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/transcription/stream/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "Streaming Transcription Session",
            language: "en",
            tags: "streaming, real-time",
            notes: "Real-time streaming transcription session",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        const newSessionId = result.data.sessionId;
        console.log("🎯 Session created with ID:", newSessionId);

        // Update both state and ref immediately
        setSessionId(newSessionId);
        sessionIdRef.current = newSessionId;
        setIsActive(true);
        setIsPaused(false);
        setTranscription("");
        setRecordingTime(0);
        setAudioChunks(0);
        setSessionStats(result.data);

        // Clear any existing audio
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
          setHasAudio(false);
        }

        // Clear audio buffer
        audioBufferRef.current = [];

        // Save session state to localStorage
        saveSessionState(newSessionId, true);

        addToast({
          type: "success",
          title: "Session Started",
          description: "Streaming transcription session is now active",
        });

        // Start recording AFTER sessionId is set
        console.log("🎵 Starting recording for session:", newSessionId);
        await startRecording();
      } else {
        throw new Error(result.error || "Failed to start session");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      addToast({
        type: "error",
        title: "Start Failed",
        description: "Failed to start streaming session",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      console.log("🎵 Starting raw PCM recording process...");

      // Stop existing recording if any
      await stopRecording();

      console.log("🎙️ Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      console.log("🎙️ Audio stream obtained:", {
        sampleRate: stream.getAudioTracks()[0]?.getSettings()?.sampleRate,
        channelCount: stream.getAudioTracks()[0]?.getSettings()?.channelCount,
        trackEnabled: stream.getAudioTracks()[0]?.enabled,
        trackReadyState: stream.getAudioTracks()[0]?.readyState,
      });

      // Create AudioContext
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({
        sampleRate: 16000,
      });

      console.log("🎤 AudioContext created:", {
        sampleRate: audioContextRef.current.sampleRate,
        state: audioContextRef.current.state,
      });

      // Create source node
      sourceNodeRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      // Try using AudioWorklet if available, fallback to ScriptProcessorNode
      try {
        // Create AudioWorklet
        const blob = new Blob([audioWorkletCode], {
          type: "application/javascript",
        });
        const workletUrl = URL.createObjectURL(blob);

        await audioContextRef.current.audioWorklet.addModule(workletUrl);

        audioWorkletNodeRef.current = new AudioWorkletNode(
          audioContextRef.current,
          "audio-processor"
        );

        audioWorkletNodeRef.current.port.onmessage = (event) => {
          if (event.data.type === "audioData" && !isPausedRef.current) {
            const float32Data = event.data.data;
            const int16Data = convertFloat32ToInt16(float32Data);

            console.log("🎵 AudioWorklet data received:", {
              float32Length: float32Data.length,
              int16Length: int16Data.length,
              maxValue: Math.max(...int16Data),
              minValue: Math.min(...int16Data),
            });

            // Store in buffer for playback
            audioBufferRef.current.push(...int16Data);

            // Stream to backend
            streamAudioData(int16Data);
            setAudioChunks((prev) => prev + 1);
          }
        };

        // Connect nodes
        sourceNodeRef.current.connect(audioWorkletNodeRef.current);

        console.log("✅ AudioWorklet setup complete");
        URL.revokeObjectURL(workletUrl);
      } catch (workletError) {
        console.warn(
          "⚠️ AudioWorklet failed, falling back to ScriptProcessorNode:",
          workletError
        );

        // Fallback to ScriptProcessorNode
        processorNodeRef.current =
          audioContextRef.current.createScriptProcessor(4096, 1, 1);

        processorNodeRef.current.onaudioprocess = (event) => {
          if (isPausedRef.current) return;

          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0); // Float32Array

          // Convert to 16-bit integers for backend
          const int16Data = convertFloat32ToInt16(inputData);

          console.log("🎵 ScriptProcessor data received:", {
            float32Length: inputData.length,
            int16Length: int16Data.length,
            maxValue: Math.max(...int16Data),
            minValue: Math.min(...int16Data),
          });

          // Store in buffer for playback
          audioBufferRef.current.push(...int16Data);

          // Stream to backend
          streamAudioData(int16Data);
          setAudioChunks((prev) => prev + 1);
        };

        // Connect nodes
        sourceNodeRef.current.connect(processorNodeRef.current);
        processorNodeRef.current.connect(audioContextRef.current.destination);

        console.log("✅ ScriptProcessorNode setup complete");
      }

      // Resume AudioContext if needed
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      setIsRecording(true);
      console.log("✅ Raw PCM recording started successfully");
    } catch (error) {
      console.error("❌ Error starting recording:", error);
      addToast({
        type: "error",
        title: "Recording Failed",
        description: `Failed to start recording: ${error.message}`,
      });

      // Cleanup on error
      await stopRecording();
    }
  };

  const streamAudioData = async (audioArray) => {
    // Get current sessionId from ref (always up-to-date)
    const currentSessionId = sessionIdRef.current;

    if (!currentSessionId) {
      console.warn(
        "⚠️ No session ID available for audio streaming - skipping chunk"
      );
      return;
    }

    console.log("🎵 Streaming raw PCM audio chunk:", {
      sessionId: currentSessionId,
      audioArrayLength: audioArray.length,
      maxValue: Math.max(...audioArray),
      minValue: Math.min(...audioArray),
      avgValue: audioArray.reduce((a, b) => a + b, 0) / audioArray.length,
      isPaused: isPausedRef.current,
      isRecording: isRecordingRef.current,
      timestamp: new Date().toISOString(),
    });

    try {
      const requestBody = {
        sessionId: currentSessionId,
        audioData: audioArray, // Raw PCM data as Int16 array
      };

      console.log("📤 Sending PCM request to backend:", {
        url: `${API_BASE_URL}/transcription/stream/audio`,
        method: "POST",
        bodySize: JSON.stringify(requestBody).length,
        audioDataSize: audioArray.length,
        sessionId: currentSessionId,
        dataType: "raw-pcm-int16",
      });

      const response = await fetch(
        `${API_BASE_URL}/transcription/stream/audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("📥 Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const result = await response.json();

      if (result.success && result.data) {
        console.log("✅ PCM audio chunk streamed successfully:", {
          sessionId: result.data.sessionId,
          totalAudioSamples: result.data.totalAudioSamples,
          audioFileSize: result.data.audioFileSize,
          isRecording: result.data.isRecording,
          isPaused: result.data.isPaused,
        });
        setSessionStats(result.data);
      } else {
        console.error("❌ Audio streaming failed:", {
          error: result.error,
          success: result.success,
          data: result.data,
        });
        if (result.data?.validationReason) {
          console.error("🔍 Validation details:", result.data);
        }
      }
    } catch (error) {
      console.error("❌ Error streaming audio:", {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const stopRecording = async () => {
    console.log("🛑 Stopping recording...");

    try {
      // Stop AudioWorklet
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current = null;
      }

      // Stop ScriptProcessor
      if (processorNodeRef.current) {
        processorNodeRef.current.disconnect();
        processorNodeRef.current = null;
      }

      // Stop source node
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }

      // Close AudioContext
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Stop media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      setIsRecording(false);
      console.log("🛑 Recording stopped successfully");

      // Create audio blob from collected chunks for playback
      if (audioBufferRef.current.length > 0) {
        createAudioBlob();
      }
    } catch (error) {
      console.error("❌ Error stopping recording:", error);
      setIsRecording(false);
    }
  };

  // Create audio blob from collected PCM chunks for playback
  const createAudioBlob = () => {
    try {
      if (audioBufferRef.current.length === 0) {
        console.warn("⚠️ No audio data to create blob");
        return;
      }

      // Convert Int16 array to WAV blob for playback
      const sampleRate = 16000;
      const numChannels = 1;
      const bitsPerSample = 16;
      const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
      const blockAlign = (numChannels * bitsPerSample) / 8;
      const dataSize = audioBufferRef.current.length * 2; // 2 bytes per sample
      const fileSize = 44 + dataSize;

      const buffer = new ArrayBuffer(fileSize);
      const view = new DataView(buffer);

      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, fileSize - 8, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      writeString(36, "data");
      view.setUint32(40, dataSize, true);

      // PCM data
      let offset = 44;
      for (let i = 0; i < audioBufferRef.current.length; i++) {
        view.setInt16(offset, audioBufferRef.current[i], true);
        offset += 2;
      }

      const audioBlob = new Blob([buffer], { type: "audio/wav" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setHasAudio(true);

      console.log("🎵 WAV audio blob created from PCM data:", {
        size: audioBlob.size,
        type: audioBlob.type,
        sampleCount: audioBufferRef.current.length,
        durationSeconds: audioBufferRef.current.length / sampleRate,
        url: url,
      });

      addToast({
        type: "success",
        title: "Audio Ready",
        description: "You can now play back your recording",
      });
    } catch (error) {
      console.error("Error creating audio blob:", error);
      addToast({
        type: "error",
        title: "Audio Error",
        description: "Failed to create audio playback",
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const pauseSession = async () => {
    if (!isActive || isPaused) return;

    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/transcription/stream/pause`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId: sessionId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setIsPaused(true);
        setSessionStats(result.data);
        console.log("⏸️ Session paused");
        addToast({
          type: "success",
          title: "Paused",
          description: "Session has been paused",
        });
      } else {
        throw new Error(result.error || "Failed to pause session");
      }
    } catch (error) {
      console.error("Error pausing session:", error);
      addToast({
        type: "error",
        title: "Pause Failed",
        description: "Failed to pause session",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resumeSession = async () => {
    if (!isActive || !isPaused) return;

    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/transcription/stream/resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId: sessionId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setIsPaused(false);
        setSessionStats(result.data);

        console.log("▶️ Session resumed");
        addToast({
          type: "success",
          title: "Resumed",
          description: "Session has resumed",
        });
      } else {
        throw new Error(result.error || "Failed to resume session");
      }
    } catch (error) {
      console.error("Error resuming session:", error);
      addToast({
        type: "error",
        title: "Resume Failed",
        description: "Failed to resume session",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const stopSession = async () => {
    if (!isActive) return;

    try {
      setIsProcessing(true);
      await stopRecording();

      const response = await fetch(
        `${API_BASE_URL}/transcription/stream/stop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId: sessionId,
            transcribeNow: true,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setIsActive(false);
        setIsPaused(false);
        setIsRecording(false);
        setSessionStats(result.data);

        // Clear session state from localStorage
        clearSessionState();

        if (result.data.transcription) {
          setTranscription(result.data.transcription);
        }

        console.log("🛑 Session stopped and transcribed:", result.data);
        addToast({
          type: "success",
          title: "Session Stopped",
          description: "Session ended and transcription completed",
        });
      } else {
        throw new Error(result.error || "Failed to stop session");
      }
    } catch (error) {
      console.error("Error stopping session:", error);
      addToast({
        type: "error",
        title: "Stop Failed",
        description: "Failed to stop session",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeSession = async () => {
    if (!sessionId) {
      addToast({
        type: "error",
        title: "No Session",
        description: "No active session to transcribe",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/transcription/stream/transcribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId: sessionId,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setTranscription(result.data.transcript);
        console.log("📝 Session transcribed:", result.data);
        addToast({
          type: "success",
          title: "Transcription Complete",
          description: "Session has been transcribed successfully",
        });
      } else {
        throw new Error(result.error || "Failed to transcribe");
      }
    } catch (error) {
      console.error("Error transcribing:", error);
      addToast({
        type: "error",
        title: "Transcription Failed",
        description: "Failed to transcribe session",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveTranscription = async () => {
    if (!transcription) {
      addToast({
        type: "error",
        title: "Nothing to Save",
        description: "No transcription data available",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const response = await fetch(
        `${API_BASE_URL}/transcription/stream/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId: sessionId,
            title: "Streaming Transcription",
            transcription: transcription,
            language: "en",
            tags: ["streaming", "real-time"],
            notes: "Real-time streaming transcription",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log("💾 Transcription saved:", result.data);
        addToast({
          type: "success",
          title: "Saved",
          description: "Transcription saved successfully",
        });
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving:", error);
      addToast({
        type: "error",
        title: "Save Failed",
        description: "Failed to save transcription",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      // Cleanup audio URL to prevent memory leaks
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, isRecording]);

  // Check for existing session on component mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem("streamingSessionId");
    const savedIsActive = localStorage.getItem("streamingIsActive");

    if (savedSessionId && savedIsActive === "true") {
      console.log("🔄 Found existing session in localStorage:", savedSessionId);
      console.log(
        "💡 Session was active before page reload - you may need to restart recording"
      );
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Streaming Transcription Demo - Raw PCM Audio
        </h1>

        {/* Status Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">
                Status:{" "}
              </span>
              <span
                className={`text-sm font-semibold ${
                  isActive
                    ? isPaused
                      ? "text-yellow-600"
                      : "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {isActive ? (isPaused ? "Paused" : "Active") : "Inactive"}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Recording:{" "}
              </span>
              <span
                className={`text-sm font-semibold ${
                  isRecording ? "text-green-600" : "text-gray-600"
                }`}
              >
                {isRecording ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Duration:{" "}
              </span>
              <span className="text-sm font-mono text-gray-800">
                {formatTime(recordingTime)}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Chunks:{" "}
              </span>
              <span className="text-sm font-mono text-gray-800">
                {audioChunks}
              </span>
            </div>
          </div>
          {sessionId && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                Session ID: {sessionId}
              </span>
            </div>
          )}
          {sessionStats && (
            <div className="mt-2 text-xs text-gray-500">
              <span>
                Audio Samples: {sessionStats.totalAudioSamples || 0} |{" "}
              </span>
              <span>
                File Size:{" "}
                {sessionStats.audioFileInfo?.fileSize ||
                  sessionStats.audioFileSize ||
                  0}{" "}
                bytes |{" "}
              </span>
              <span>PCM Buffer: {audioBufferRef.current.length} samples</span>
            </div>
          )}
        </div>

        {/* Debug Panel */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              🔍 Debug Information - Raw PCM Audio Capture
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-yellow-700">Session Active:</span>
                <span className="ml-1 font-mono">
                  {isActive ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-yellow-700">Recording:</span>
                <span className="ml-1 font-mono">
                  {isRecording ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-yellow-700">Paused:</span>
                <span className="ml-1 font-mono">
                  {isPaused ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-yellow-700">Processing:</span>
                <span className="ml-1 font-mono">
                  {isProcessing ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-yellow-700">Audio Context:</span>
                <span className="ml-1 font-mono">
                  {audioContextRef.current?.state || "None"}
                </span>
              </div>
              <div>
                <span className="text-yellow-700">PCM Chunks:</span>
                <span className="ml-1 font-mono">{audioChunks}</span>
              </div>
              <div>
                <span className="text-yellow-700">PCM Samples:</span>
                <span className="ml-1 font-mono">
                  {audioBufferRef.current.length}
                </span>
              </div>
              <div>
                <span className="text-yellow-700">Backend Samples:</span>
                <span className="ml-1 font-mono">
                  {sessionStats?.totalAudioSamples || 0}
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-700">
              <span>
                ✅ Sending raw PCM Int16 audio data to backend | Sample Rate:
                16kHz | Channels: 1
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          {!isActive ? (
            <Button
              onClick={startSession}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isProcessing}
            >
              <Mic size={16} className="mr-2" />
              Start Session
            </Button>
          ) : (
            <>
              {!isPaused ? (
                <Button
                  onClick={pauseSession}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={isProcessing}
                >
                  <Pause size={16} className="mr-2" />
                  Pause
                </Button>
              ) : (
                <Button
                  onClick={resumeSession}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isProcessing}
                >
                  <Play size={16} className="mr-2" />
                  Resume
                </Button>
              )}
              <Button
                onClick={stopSession}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isProcessing}
              >
                <Square size={16} className="mr-2" />
                Stop & Transcribe
              </Button>
              {sessionId && !isActive && (
                <Button
                  onClick={transcribeSession}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isProcessing}
                >
                  <FileText size={16} className="mr-2" />
                  Transcribe
                </Button>
              )}
              {transcription && (
                <Button
                  onClick={saveTranscription}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isProcessing}
                >
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              )}
            </>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>

        {/* Transcription Display */}
        {transcription && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Transcription Result
            </h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {transcription}
              </div>
            </div>
          </div>
        )}

        {/* Audio Playback */}
        {hasAudio && audioUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Volume2 size={20} className="text-green-600" />
              Recorded Audio (Converted from PCM)
            </h3>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <audio
                src={audioUrl}
                controls
                className="w-full"
                preload="metadata"
              />
              <div className="mt-3 text-sm text-gray-600">
                <span>Duration: {formatTime(recordingTime)}</span>
                <span className="mx-2">•</span>
                <span>PCM Chunks: {audioChunks}</span>
                <span className="mx-2">•</span>
                <span>Samples: {audioBufferRef.current.length}</span>
                <span className="mx-2">•</span>
                <span>Format: 16kHz, 16-bit, Mono</span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            📋 How This Works (Raw PCM Audio)
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>✅ Raw PCM Audio Capture:</strong> This version captures
              raw PCM audio data using Web Audio API instead of MediaRecorder.
            </p>
            <p>
              <strong>🎵 Audio Processing:</strong> Uses AudioWorklet
              (preferred) or ScriptProcessorNode (fallback) to capture Float32
              audio samples, then converts to Int16 for backend compatibility.
            </p>
            <p>
              <strong>📡 Data Format:</strong> Sends audio data as array of
              16-bit signed integers (what your backend expects).
            </p>
            <p>
              <strong>🔄 Real-time Streaming:</strong> Audio chunks are sent to
              your backend every ~256ms for real-time processing.
            </p>
            <p>
              <strong>💾 Playback:</strong> Converts captured PCM data to WAV
              format for local audio playback.
            </p>
            <div className="mt-3 p-3 bg-blue-100 rounded border">
              <p className="font-semibold text-blue-800">Key Improvements:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Sends raw PCM data instead of encoded WebM</li>
                <li>Proper Int16 sample format (-32768 to 32767 range)</li>
                <li>16kHz sample rate matching backend expectations</li>
                <li>Audio validation will now pass backend checks</li>
                <li>Better browser compatibility with fallback support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingDemo;
