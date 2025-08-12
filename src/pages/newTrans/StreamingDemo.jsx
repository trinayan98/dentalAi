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
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";

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

  // Audio recording state
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const sessionIdRef = useRef(null); // Ref to store current sessionId
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState(0);

  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  // Update sessionId ref whenever sessionId state changes
  useEffect(() => {
    sessionIdRef.current = sessionId;
    console.log("🔄 SessionId ref updated:", sessionId);
  }, [sessionId]);

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

  // Helper: Convert blob to base64 for direct transmission
  const blobToBase64 = async (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  };

  // Helper: Convert blob to ArrayBuffer for backend processing
  const blobToArrayBuffer = async (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(Array.from(uint8Array));
      };
      reader.readAsArrayBuffer(blob);
    });
  };

  const startSession = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch(
        "http://localhost:5001/api/transcription/stream/start",
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
        sessionIdRef.current = newSessionId; // Set ref immediately
        setIsActive(true);
        setIsPaused(false);
        setTranscription("");
        setRecordingTime(0);
        setAudioChunks(0);
        setSessionStats(result.data);

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
      // Stop existing recorder if any
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

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

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      console.log("🎤 MediaRecorder created:", {
        state: mediaRecorderRef.current.state,
        mimeType: mediaRecorderRef.current.mimeType,
        audioBitsPerSecond: mediaRecorderRef.current.audioBitsPerSecond,
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        console.log("📦 Audio chunk received:", {
          size: event.data.size,
          type: event.data.type,
          isRecording,
          isPaused,
          timestamp: new Date().toISOString(),
        });

        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // Process the audio chunk - send as array buffer
          if (!isPaused) {
            console.log("🔄 Processing audio chunk...");
            const audioArray = await blobToArrayBuffer(event.data);
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
        console.log("🎵 MediaRecorder started");
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("🛑 MediaRecorder stopped");
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("❌ MediaRecorder error:", event.error);
      };

      // Start recording with 1-second chunks
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);

      console.log("🎵 Recording started with session:", sessionIdRef.current);
    } catch (error) {
      console.error("Error starting recording:", error);
      addToast({
        type: "error",
        title: "Recording Failed",
        description: "Failed to access microphone",
      });
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
      isPaused,
      isRecording,
      timestamp: new Date().toISOString(),
    });

    try {
      const requestBody = {
        sessionId: currentSessionId,
        audioData: audioArray,
        audioFormat: "webm-opus",
        chunkSize,
        action: "stream",
      };

      console.log("📤 Sending request to backend:", {
        url: "http://localhost:5001/api/transcription/stream/audio",
        method: "POST",
        bodySize: JSON.stringify(requestBody).length,
        audioDataSize: audioArray.length,
        sessionId: currentSessionId,
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
        // Don't update sessionStats with invalid data
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
        "http://localhost:5001/api/transcription/stream/pause",
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
        "http://localhost:5001/api/transcription/stream/resume",
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
        // Keep sessionId for potential transcription after stopping
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
        "http://localhost:5001/api/transcription/stream/transcribe",
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
        "http://localhost:5001/api/transcription/stream/save",
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
    };
  }, []);

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
          Streaming Transcription Demo
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
                bytes
              </span>
            </div>
          )}
        </div>

        {/* Debug Panel */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              🔍 Debug Information
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
                <span className="text-yellow-700">Audio Chunks:</span>
                <span className="ml-1 font-mono">{audioChunks}</span>
              </div>
              <div>
                <span className="text-yellow-700">Recording Time:</span>
                <span className="ml-1 font-mono">{recordingTime}s</span>
              </div>
              <div>
                <span className="text-yellow-700">Total Samples:</span>
                <span className="ml-1 font-mono">
                  {sessionStats?.totalAudioSamples || 0}
                </span>
              </div>
              <div>
                <span className="text-yellow-700">File Size:</span>
                <span className="ml-1 font-mono">
                  {sessionStats?.audioFileInfo?.fileSize ||
                    sessionStats?.audioFileSize ||
                    0}{" "}
                  bytes
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-700">
              <span>
                Check browser console for detailed audio streaming logs
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

        {/* Instructions */}
        <div className="text-sm text-gray-600">
          <h4 className="font-semibold mb-2">Streaming Features:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ Real-time audio streaming with MediaRecorder API</li>
            <li>✅ Audio chunk processing and Int16Array conversion</li>
            <li>✅ File-based session management with persistent storage</li>
            <li>✅ True pause/resume functionality with no data loss</li>
            <li>✅ Live session statistics and audio metrics</li>
            <li>✅ Flexible transcription (during or after recording)</li>
            <li>✅ AssemblyAI integration for high-quality transcription</li>
            <li>✅ Speaker detection and confidence scoring</li>
            <li>✅ Session state management with proper cleanup</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StreamingDemo;
