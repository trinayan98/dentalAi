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
import {
  streamingTranscriptionAPI,
  audioValidation,
} from "../../api/streamingTranscription";

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

  // Audio recording state
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const sessionIdRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState(0);

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

  // Helper: Convert WebM blob to array for backend processing
  const convertBlobToArray = async (blob) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = (event) => {
        try {
          const arrayBuffer = event.target.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          const array = Array.from(uint8Array);

          console.log("🎵 WebM blob converted to array:", {
            originalSize: blob.size,
            arrayLength: array.length,
            type: blob.type,
          });

          resolve(array);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(blob);
    });
  };

  // Helper: Convert blob to array for backend processing
  const blobToArray = async (blob) => {
    try {
      const arrayData = await convertBlobToArray(blob);
      console.log("🎵 WebM converted to array:", {
        originalSize: blob.size,
        arrayLength: arrayData.length,
        type: blob.type,
      });
      return arrayData;
    } catch (error) {
      console.error("❌ Error converting WebM to array:", error);
      throw error;
    }
  };

  const startSession = async () => {
    try {
      setIsProcessing(true);
      const response = await streamingTranscriptionAPI.startSession(token, {
        title: "Streaming Transcription Session",
        language: "en",
        tags: "streaming, real-time",
        notes: "Real-time streaming transcription session",
      });

      if (response.success) {
        const newSessionId = response.data.sessionId;
        console.log("🎯 Session created with ID:", newSessionId);

        // Update both state and ref immediately
        setSessionId(newSessionId);
        sessionIdRef.current = newSessionId;
        setIsActive(true);
        setIsPaused(false);
        setTranscription("");
        setRecordingTime(0);
        setAudioChunks(0);
        setSessionStats(response.data);

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
        throw new Error(response.error || "Failed to start session");
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
      console.log("🎵 Starting recording process...");

      // Stop existing recorder if any
      if (mediaRecorderRef.current) {
        console.log("🛑 Stopping existing recorder...");
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder is not supported in this browser");
      }

      console.log("🎙️ Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      console.log("🎙️ Audio stream obtained:", {
        sampleRate: stream.getAudioTracks()[0]?.getSettings()?.sampleRate,
        channelCount: stream.getAudioTracks()[0]?.getSettings()?.channelCount,
        trackEnabled: stream.getAudioTracks()[0]?.enabled,
        trackReadyState: stream.getAudioTracks()[0]?.readyState,
      });

      // Check if the stream has audio tracks
      if (!stream.getAudioTracks().length) {
        throw new Error("No audio tracks available in the stream");
      }

      // Check if the audio track is enabled
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack.enabled) {
        throw new Error("Audio track is not enabled");
      }

      console.log("🎤 Creating MediaRecorder...");
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      console.log("🎤 MediaRecorder created:", {
        state: mediaRecorderRef.current.state,
        mimeType: mediaRecorderRef.current.mimeType,
        audioBitsPerSecond: mediaRecorderRef.current.audioBitsPerSecond,
      });

      // Check if the MediaRecorder state is valid
      if (mediaRecorderRef.current.state !== "inactive") {
        throw new Error(
          `MediaRecorder is in invalid state: ${mediaRecorderRef.current.state}`
        );
      }

      mediaRecorderRef.current.ondataavailable = async (event) => {
        console.log("📦 Audio chunk received:", {
          size: event.data.size,
          type: event.data.type,
          isRecording: isRecordingRef.current,
          isPaused: isPausedRef.current,
          timestamp: new Date().toISOString(),
        });

        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // Process the audio chunk - send as array buffer
          if (!isPausedRef.current) {
            console.log("🔄 Processing audio chunk...");
            const audioArray = await blobToArray(event.data);
            console.log("📊 Audio array created:", {
              length: audioArray.length,
              firstFewValues: audioArray.slice(0, 5),
              maxValue: Math.max(...audioArray),
              minValue: Math.min(...audioArray),
            });

            if (audioArray.length > 0) {
              await streamAudioData(audioArray, event.data.size);
              setAudioChunks((prev) => prev + 1);
            } else {
              console.warn("⚠️ Failed to convert audio to array buffer");
            }
          } else {
            console.log("⏸️ Audio chunk skipped (paused)");
          }
        } else {
          console.warn("⚠️ Empty audio chunk received");
        }
      };

      mediaRecorderRef.current.onstart = () => {
        console.log("🎵 MediaRecorder started successfully");
        setIsRecording(true);
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("🛑 MediaRecorder stopped");
        setIsRecording(false);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("❌ MediaRecorder error:", event.error);
        addToast({
          type: "error",
          title: "Recording Error",
          description: `MediaRecorder error: ${
            event.error.message || event.error
          }`,
        });
      };

      console.log("🎵 Starting MediaRecorder with 1-second chunks...");
      mediaRecorderRef.current.start(1000);

      console.log("🎵 Recording started with session:", sessionIdRef.current);

      // Verify the recorder started
      setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          console.log("✅ MediaRecorder is recording successfully");
        } else {
          console.error("❌ MediaRecorder failed to start recording");
          console.log("MediaRecorder state:", mediaRecorderRef.current?.state);
        }
      }, 100);
    } catch (error) {
      console.error("❌ Error starting recording:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      addToast({
        type: "error",
        title: "Recording Failed",
        description: `Failed to start recording: ${error.message}`,
      });

      // Reset recording state
      setIsRecording(false);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current = null;
      }
    }
  };

  const streamAudioData = async (audioArray, chunkSize) => {
    // Get current sessionId from ref (always up-to-date)
    const currentSessionId = sessionIdRef.current;

    if (!currentSessionId) {
      console.warn(
        "⚠️ No session ID available for audio streaming - skipping chunk"
      );
      return;
    }

    console.log("🎵 Streaming audio chunk:", {
      sessionId: currentSessionId,
      chunkSize,
      audioArrayLength: audioArray.length,
      isPaused: isPausedRef.current,
      isRecording: isRecordingRef.current,
      timestamp: new Date().toISOString(),
    });

    try {
      const requestBody = {
        sessionId: currentSessionId,
        audioData: audioArray,
        audioFormat: "webm-opus", // Back to WebM format since we're sending WebM data
        chunkSize,
        action: "stream",
      };

      console.log("📤 Sending request to backend:", {
        url: "http://localhost:5001/api/transcription/stream/audio",
        method: "POST",
        bodySize: JSON.stringify(requestBody).length,
        audioDataSize: audioArray.length,
        sessionId: currentSessionId,
        audioFormat: "webm-opus",
      });

      const response = await fetch(
        "http://localhost:5001/api/transcription/stream/audio",
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
        console.log("✅ Audio chunk streamed successfully:", {
          sessionId: result.data.sessionId,
          transcription: result.data.transcription,
          newText: result.data.newText,
        });

        // Update transcription if new text is available
        if (result.data.transcription) {
          setTranscription(result.data.transcription);
        }

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

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
    console.log("🛑 Recording stopped");

    // Create audio blob from collected chunks
    if (audioChunksRef.current.length > 0) {
      createAudioBlob();
    }
  };

  // Create audio blob from collected chunks
  const createAudioBlob = () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm;codecs=opus",
      });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setAudioBlob(audioBlob);
      setHasAudio(true);
      console.log("🎵 Audio blob created:", {
        size: audioBlob.size,
        type: audioBlob.type,
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
          await streamingTranscriptionAPI.endSession(token, sessionId);
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

      // Clear audio chunks
      audioChunksRef.current = [];

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
        .replace(/:/g, "-")}.webm`;
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
      const response = await streamingTranscriptionAPI.processAudio(
        token,
        sessionId,
        [], // Empty audio data for pause
        "pause"
      );

      if (response.success) {
        setIsPaused(true);
        setSessionStats(response.data);
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
        throw new Error(response.error || "Failed to pause session");
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
      const response = await streamingTranscriptionAPI.resumeSession(
        token,
        sessionId
      );

      if (response.success) {
        setIsPaused(false);
        setSessionStats(response.data);

        // Don't create new MediaRecorder, just resume existing one
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "paused"
        ) {
          mediaRecorderRef.current.resume();
        } else if (!mediaRecorderRef.current) {
          // If no recorder exists, start a new one
          await startRecording();
        }

        // Notify parent component
        if (onSessionUpdate) {
          onSessionUpdate({
            sessionId,
            isActive: true,
            isPaused: false,
          });
        }

        console.log("▶️ Session resumed");
        addToast({
          type: "success",
          title: "Resumed",
          description: "Session has resumed",
        });
      } else {
        throw new Error(response.error || "Failed to resume session");
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
        "http://localhost:5001/api/transcription/stream/stop",
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

        if (result.data.utterances && result.data.utterances.length > 0) {
          // Use the utterances directly from the API response
          newUtterances = result.data.utterances;
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
  }, [audioUrl]);

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
        className={`w-full p-8 mt-3 rounded-2xl transition-all duration-500 backdrop-blur-sm ${
          isRecording
            ? "bg-gradient-to-br from-red-500/10 via-red-400/5 to-red-600/10 shadow-2xl border border-red-400/30"
            : "bg-white/80 shadow-lg border border-gray-200/50"
        }`}
      >
        {/* Status Display */}

        {/* Controls */}
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4">
            {!isActive ? (
              <>
                <Button
                  size="md"
                  onClick={startSession}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isProcessing}
                >
                  <Mic size={20} className="mr-2" />
                  Start
                </Button>
                {(sessionId || localStorage.getItem("streamingSessionId")) && (
                  <Button
                    size="md"
                    onClick={cancelSession}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isProcessing}
                  >
                    <X size={20} className="mr-2" />
                    Clear
                  </Button>
                )}
              </>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    size="xs"
                    onClick={pauseSession}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isProcessing}
                  >
                    <Pause size={14} className="mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    onClick={resumeSession}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isProcessing}
                  >
                    <Play size={14} className="mr-2" />
                    <span className="hidden md-block">Resume</span>
                  </Button>
                )}
                <Button
                  size="xs"
                  onClick={stopSession}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isProcessing}
                >
                  <Square size={14} className="mr-2" />
                  Stop
                </Button>
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
                className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-2  rounded-xl "
                // style={{
                //   boxShadow:
                //     "rgba(50, 50, 93, 0.07) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
                // }}
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
                  <span className="text-s font-medium text-gray-700">
                    {isActive ? (isPaused ? "Paused" : "Active") : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Recording Status */}
              <div
                className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4  rounded-xl "
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
                  <span className="text-sm font-medium text-gray-700 hidden md-block">
                    Recording
                  </span>
                  <span
                    className={`text-sm font-semibold ${
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
