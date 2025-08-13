import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/Button";
import { Mic, Pause, Play, Square, Loader2, Volume2, Send } from "lucide-react";
import useAuthStore from "../stores/authStore";
import { useToastStore } from "../stores/toastStore";
import { API_BASE_URL } from "../config/constants";
import axios from "axios";

const AudioRecorder = ({
  onTranscriptionReceived,
  onAudioProcessed,
  onRecordingStatusChange,
}) => {
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Audio processing states
  const [audioBuffer, setAudioBuffer] = useState([]);
  const [audioStats, setAudioStats] = useState({
    totalSamples: 0,
    duration: 0,
    chunksProcessed: 0,
  });

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const sessionIdRef = useRef(null);

  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  // Update sessionId ref whenever sessionId state changes
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Timer effect for recording duration
  useEffect(() => {
    if (isRecording && !isPaused) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // Helper: Convert WebM blob to array for backend processing
  const convertBlobToArray = async (blob) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        try {
          const arrayBuffer = event.target.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          const array = Array.from(uint8Array);
          resolve(array);
        } catch (error) {
          reject(error);
        }
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(blob);
    });
  };

  // Helper: Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start recording session
  const startRecording = async () => {
    try {
      setIsProcessing(true);

      // Create session first
      const sessionResponse = await axios.post(
        `${API_BASE_URL}/transcription/stream/start`,
        {
          title: "Audio Recording Session",
          language: "en",
          tags: "recording, pause-resume",
          notes: "Audio recording with pause functionality",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!sessionResponse.data.success) {
        throw new Error("Failed to create session");
      }

      const newSessionId = sessionResponse.data.data.sessionId;
      setSessionId(newSessionId);
      sessionIdRef.current = newSessionId;

      // Start audio recording
      await startAudioCapture();

      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setAudioBuffer([]);
      setAudioStats({
        totalSamples: 0,
        duration: 0,
        chunksProcessed: 0,
      });

      // Clear any existing audio
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setHasAudio(false);
      }

      // Notify parent component of status change
      if (onRecordingStatusChange) {
        onRecordingStatusChange("recording");
      }

      addToast({
        type: "success",
        title: "Recording Started",
        description: "Audio recording is now active",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      addToast({
        type: "error",
        title: "Recording Failed",
        description: "Failed to start audio recording",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Start audio capture
  const startAudioCapture = async () => {
    try {
      // Stop existing recorder if any
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder is not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // Process audio chunk if not paused
          if (!isPaused) {
            const audioArray = await convertBlobToArray(event.data);
            if (audioArray.length > 0) {
              setAudioBuffer((prev) => [...prev, ...audioArray]);
              setAudioStats((prev) => ({
                ...prev,
                totalSamples: prev.totalSamples + audioArray.length,
                chunksProcessed: prev.chunksProcessed + 1,
              }));
            }
          }
        }
      };

      mediaRecorderRef.current.onstart = () => {
        console.log("Audio recording started");
      };

      mediaRecorderRef.current.onstop = () => {
        console.log("Audio recording stopped");
        setIsRecording(false);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        addToast({
          type: "error",
          title: "Recording Error",
          description: `Recording error: ${event.error.message || event.error}`,
        });
      };

      // Start recording with 1-second chunks
      mediaRecorderRef.current.start(1000);
    } catch (error) {
      console.error("Error starting audio capture:", error);
      throw error;
    }
  };

  // Pause recording and send audio data
  const pauseRecording = async () => {
    if (!isRecording || isPaused) return;

    try {
      setIsProcessing(true);

      // Send current audio buffer to backend first
      if (audioBuffer.length > 0) {
        await sendAudioData(audioBuffer, "pause");
      }

      // Pause the session on backend
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

        // Pause the MediaRecorder
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          mediaRecorderRef.current.pause();
        }

        // Notify parent component of status change
        if (onRecordingStatusChange) {
          onRecordingStatusChange("paused");
        }

        addToast({
          type: "success",
          title: "Recording Paused",
          description: "Audio recording paused and data sent for processing",
        });

        // Notify parent component
        if (onAudioProcessed) {
          onAudioProcessed({
            action: "pause",
            audioBuffer: audioBuffer,
            sessionId: sessionId,
            duration: recordingTime,
          });
        }
      } else {
        throw new Error(result.error || "Failed to pause session");
      }
    } catch (error) {
      console.error("Error pausing recording:", error);
      addToast({
        type: "error",
        title: "Pause Failed",
        description: "Failed to pause recording",
      });
      // Resume recording if pause failed
      setIsPaused(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Resume recording
  const resumeRecording = async () => {
    if (!isRecording || !isPaused) return;

    try {
      setIsProcessing(true);

      // Resume the session on backend
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

        // Resume the MediaRecorder
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "paused"
        ) {
          mediaRecorderRef.current.resume();
        }

        // Notify parent component of status change
        if (onRecordingStatusChange) {
          onRecordingStatusChange("recording");
        }

        addToast({
          type: "success",
          title: "Recording Resumed",
          description: "Audio recording resumed",
        });
      } else {
        throw new Error(result.error || "Failed to resume session");
      }
    } catch (error) {
      console.error("Error resuming recording:", error);
      addToast({
        type: "error",
        title: "Resume Failed",
        description: "Failed to resume recording",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Stop recording and process final audio
  const stopRecording = async () => {
    if (!isRecording) return;

    try {
      setIsProcessing(true);

      // Stop the MediaRecorder first
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      setIsRecording(false);
      setIsPaused(false);

      // Send final audio data
      if (audioBuffer.length > 0) {
        await sendAudioData(audioBuffer, "stop");
      }

      // Create audio blob for playback
      if (audioChunksRef.current.length > 0) {
        createAudioBlob();
      }

      // Stop the session on backend
      if (sessionId) {
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
          // Notify parent component of status change
          if (onRecordingStatusChange) {
            onRecordingStatusChange("stopped");
          }

          addToast({
            type: "success",
            title: "Recording Stopped",
            description: "Audio recording completed and processed",
          });

          // Notify parent component
          if (onAudioProcessed) {
            onAudioProcessed({
              action: "stop",
              audioBuffer: audioBuffer,
              sessionId: sessionId,
              duration: recordingTime,
              transcription: result.data.transcription,
            });
          }
        } else {
          throw new Error(result.error || "Failed to stop session");
        }
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      addToast({
        type: "error",
        title: "Stop Failed",
        description: "Failed to stop recording",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Send audio data to backend
  const sendAudioData = async (audioData, action) => {
    if (!sessionIdRef.current) {
      console.warn("No session ID available for audio streaming");
      return;
    }

    try {
      const requestBody = {
        sessionId: sessionIdRef.current,
        audioData: audioData,
        audioFormat: "webm-opus",
        chunkSize: audioData.length,
        action: "stream", // Always use "stream" action like StreamingDemo
      };

      console.log("📤 Sending audio data to backend:", {
        url: `${API_BASE_URL}/transcription/stream/audio`,
        method: "POST",
        bodySize: JSON.stringify(requestBody).length,
        audioDataSize: audioData.length,
        sessionId: sessionIdRef.current,
        audioFormat: "webm-opus",
        originalAction: action,
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
        console.log("✅ Audio data sent successfully:", {
          action: action,
          sessionId: result.data.sessionId,
          totalSamples: result.data.totalAudioSamples,
          audioFileSize: result.data.audioFileSize,
        });

        // Clear buffer after successful send
        setAudioBuffer([]);
        setAudioStats((prev) => ({
          ...prev,
          totalSamples: 0,
        }));
      } else {
        console.error("❌ Audio streaming failed:", {
          error: result.error,
          success: result.success,
          data: result.data,
        });
        throw new Error(result.error || "Failed to send audio data");
      }
    } catch (error) {
      console.error("❌ Error sending audio data:", error);
      throw error;
    }
  };

  // Create audio blob for playback
  const createAudioBlob = () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm;codecs=opus",
      });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setHasAudio(true);
    } catch (error) {
      console.error("Error creating audio blob:", error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Mic className="h-5 w-5 text-blue-600" />
          Audio Recorder
        </h3>
        <div className="text-sm text-gray-500">{formatTime(recordingTime)}</div>
      </div>

      {/* Status Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Status: </span>
            <span
              className={`font-semibold ${
                isRecording
                  ? isPaused
                    ? "text-yellow-600"
                    : "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {isRecording ? (isPaused ? "Paused" : "Recording") : "Stopped"}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Samples: </span>
            <span className="font-mono text-gray-800">
              {audioStats.totalSamples.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Mic className="h-4 w-4 mr-2" />
            )}
            Start Recording
          </Button>
        ) : (
          <>
            {!isPaused ? (
              <Button
                onClick={pauseRecording}
                disabled={isProcessing}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Pause className="h-4 w-4 mr-2" />
                )}
                Pause & Send
              </Button>
            ) : (
              <Button
                onClick={resumeRecording}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Resume
              </Button>
            )}
            <Button
              onClick={stopRecording}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Audio Playback */}
      {hasAudio && audioUrl && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Recorded Audio
          </h4>
          <audio
            src={audioUrl}
            controls
            className="w-full"
            preload="metadata"
          />
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              {isPaused ? "Sending audio data..." : "Processing..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
