import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/Button";
import {
  Mic,
  Pause,
  Play,
  Square,
  Loader2,
  FileText,
  Volume2,
  Download,
  X,
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { API_BASE_URL } from "../../config/constants";

const StreamingRecorder = ({ onTranscriptionComplete, onSessionUpdate }) => {
  const [sessionId, setSessionId] = useState(() => {
    const savedSessionId = localStorage.getItem("streamingSessionId");
    return savedSessionId || null;
  });
  const [isActive, setIsActive] = useState(() => {
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
  const [audioBlob, setAudioBlob] = useState(null);

  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  // Update refs when state changes
  useEffect(() => {
    sessionIdRef.current = sessionId;
    console.log("🔄 SessionId ref updated:", sessionId);
  }, [sessionId]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
    console.log("🔄 Recording ref updated:", isRecording);
  }, [isRecording]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    console.log("🔄 Paused ref updated:", isPaused);
  }, [isPaused]);

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

        // Save session state to localStorage
        saveSessionState(newSessionId, true);

        // Notify parent component
        if (onSessionUpdate) {
          onSessionUpdate({
            sessionId: newSessionId,
            isActive: true,
            isPaused: false,
          });
        }

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
        audioData: audioArray, // Raw PCM Int16 data as array
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
      // Handle network errors gracefully
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
      setAudioBlob(audioBlob);
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

  // Cancel session function
  const cancelSession = async () => {
    try {
      setIsProcessing(true);

      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }

      // End session on backend if active
      if (isActive && sessionId) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/transcription/stream/end`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ sessionId }),
            }
          );
          console.log("🗑️ Session ended on backend");
        } catch (error) {
          console.warn("Could not end session on backend:", error);
        }
      }

      // Clear all state
      setIsActive(false);
      setIsPaused(false);
      setIsRecording(false);
      setSessionId(null);
      setTranscription("");
      setSessionStats(null);
      setRecordingTime(0);
      setAudioChunks(0);
      setAudioUrl(null);
      setHasAudio(false);
      setAudioBlob(null);

      // Clear localStorage
      clearSessionState();
      localStorage.removeItem("transcriptUtterances");
      localStorage.removeItem("savedSummaryData");

      // Clear audio buffer (PCM data)
      audioBufferRef.current = [];

      // Cleanup audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      addToast({
        type: "success",
        title: "Session Cancelled",
        description: "All session data has been cleared",
      });

      // Notify parent component
      if (onSessionUpdate) {
        onSessionUpdate({
          sessionId: null,
          isActive: false,
          isPaused: false,
        });
      }
    } catch (error) {
      console.error("Error cancelling session:", error);
      addToast({
        type: "error",
        title: "Cancel Failed",
        description: "Failed to cancel session. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Download audio function
  const downloadAudio = () => {
    if (!audioBlob) {
      addToast({
        type: "error",
        title: "Download Failed",
        description: "No audio available to download",
      });
      return;
    }

    try {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording_${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast({
        type: "success",
        title: "Download Started",
        description: "Audio file download has begun",
      });
    } catch (error) {
      console.error("Error downloading audio:", error);
      addToast({
        type: "error",
        title: "Download Failed",
        description: "Failed to download audio file",
      });
    }
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

        // Notify parent component
        if (onSessionUpdate) {
          onSessionUpdate({
            sessionId,
            isActive: true,
            isPaused: true,
          });
        }

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

        // ✅ CORRECT: Web Audio API continues automatically when isPaused becomes false
        // No need to manually resume anything - the audio processing handlers
        // check isPausedRef.current and will start processing again

        // Notify parent component
        if (onSessionUpdate) {
          onSessionUpdate({
            sessionId,
            isActive: true,
            isPaused: false,
          });
        }

        console.log("▶️ Session resumed - audio processing will continue");
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
      stopRecording();

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

        // Save transcription to localStorage in utterances format
        // Prepare utterances for parent component
        let newUtterances = [];

        if (result.data.turns && result.data.turns.length > 0) {
          // Use the utterances directly from the API response
          newUtterances = result.data.turns;
        } else if (result.data.turns && result.data.turns.length > 0) {
          // Fallback: convert turns to utterances format
          newUtterances = result.data.turns.map((turn) => ({
            speaker: turn.speaker || "A",
            text: turn.transcript,
            confidence: turn.confidence || 0.9,
            start: new Date(turn.timestamp).getTime(),
            end: new Date(turn.timestamp).getTime() + 1000,
          }));
        } else if (result.data.transcription) {
          // Fallback: create single utterance
          newUtterances = [
            {
              speaker: "A",
              text: result.data.transcription,
              confidence: 0.9,
              start: Date.now() - recordingTime * 1000,
              end: Date.now(),
            },
          ];
        }

        console.log("💾 Utterances prepared for parent:", {
          newUtterances: newUtterances.length,
          sessionId: sessionId,
        });

        // Notify parent component with utterances
        if (onTranscriptionComplete) {
          onTranscriptionComplete(result.data.transcription, newUtterances);
        }

        console.log("🛑 Session stopped and transcribed:", result.data);
        addToast({
          type: "success",
          title: "Session Stopped",
          description: "Transcription saved to localStorage",
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
    <div>
      <div
        className={`w-full p-6 py-4 mt-3 rounded-full transition-all duration-500 backdrop-blur-sm ${
          isRecording
            ? "bg-gradient-to-br from-red-500/10 via-red-400/5 to-red-600/10 shadow-2xl border border-red-400/30"
            : "bg-white/80 shadow-sm border border-gray-200/50"
        }`}
      >
        {/* Status Display */}

        {/* Controls */}
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4">
            {!isActive ? (
              <>
                <button
                  size="md"
                  onClick={startSession}
                  className="flex text-xs items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isProcessing}
                >
                  <Mic size={18} className="mr-2" />
                  Start
                </button>
                {(sessionId || localStorage.getItem("streamingSessionId")) && (
                  <button
                    size="md"
                    onClick={cancelSession}
                    className="flex text-xs items-center bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isProcessing}
                  >
                    <X size={20} className="mr-2" />
                    Clear
                  </button>
                )}
              </>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    size="xs"
                    onClick={pauseSession}
                    className="flex text-xs items-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isProcessing}
                  >
                    <Pause size={14} className="mr-2" />
                    Pause
                  </button>
                ) : (
                  <button
                    size="xs"
                    onClick={resumeSession}
                    className="flex text-xs items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isProcessing}
                  >
                    <Play size={14} className="mr-2" />
                    Resume
                  </button>
                )}
                <button
                  size="xs"
                  onClick={stopSession}
                  className="flex text-xs items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isProcessing}
                >
                  <Square size={14} className="mr-2" />
                  Stop
                </button>
                <button
                  size="xs"
                  onClick={cancelSession}
                  className="h-8 w-8 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium  rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex justify-center items-center"
                  disabled={isProcessing}
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </>
            )}

            {isProcessing && (
              <div className="flex items-center gap-3 bg-blue-50/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-200/50">
                <Loader2 size={18} className="animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Processing
                </span>
              </div>
            )}
          </div>
          {!isProcessing && (
            <div className="flex items-center gap-1">
              {/* Status Indicator */}
              <div
                className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-3 py-2  rounded-full "
                style={{
                  boxShadow:
                    "rgba(50, 50, 93, 0.07) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      isActive
                        ? isPaused
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                        : "bg-gray-400"
                    } ${isRecording ? "animate-ping" : ""}`}
                  ></span>
                  <span className="text-xs font-medium text-gray-700">
                    {isActive ? (isPaused ? "Paused" : "Active") : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Recording Status */}
              <div
                className="flex items-center gap-3 bg-transparent  px-4  rounded-xl "
                // style={{
                //   boxShadow:
                //     "rgba(50, 50, 93, 0.07) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
                // }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      isRecording ? "bg-red-500" : "bg-gray-400"
                    } ${isRecording ? "animate-pulse" : ""}`}
                  ></span>
                  <span className="text-xxs font-medium text-gray-700 hidden md-block">
                    Recording
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isRecording ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    {isRecording ? "ON" : "OFF"}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4  rounded-xl ">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 hidden md-block">
                    Duration
                  </span>
                  <span className="text-sm font-mono font-bold text-gray-800">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Playback */}
      </div>
      {hasAudio && audioUrl && (
        <div className="mt-6 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <Volume2 size={20} className="text-emerald-600" />
            Recorded Audio
          </h3>
          <div className="space-y-4">
            <audio
              src={audioUrl}
              controls
              className="w-full rounded-xl"
              preload="metadata"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="font-medium">Duration:</span>
                  <span className="font-mono">{formatTime(recordingTime)}</span>
                </span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span className="flex items-center gap-2">
                  <span className="font-medium">Chunks:</span>
                  <span className="font-mono">{audioChunks}</span>
                </span>
              </div>
              <Button
                size="md"
                variant="outline"
                onClick={downloadAudio}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                disabled={!audioBlob}
              >
                <Download size={16} className="mr-2" />
                Download Audio
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingRecorder;
