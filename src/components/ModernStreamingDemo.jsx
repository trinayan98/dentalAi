import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Mic, Pause, Play, Square, Save, Loader2 } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import {
  streamingTranscriptionAPI,
  audioValidation,
} from "../../api/streamingTranscription";

const ModernStreamingDemo = () => {
  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  // Use the modern audio recorder hook
  const {
    isRecording,
    audioBuffer,
    audioStats,
    startRecording,
    stopRecording,
    clearBuffer,
    getAudioBuffer,
  } = useAudioRecorder();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startSession = async () => {
    try {
      const response = await streamingTranscriptionAPI.startSession(token, {
        title: "Modern Streaming Session",
        language: "en",
        tags: "modern, react-hooks",
        notes: "Using modern React audio hooks",
      });

      if (response.success) {
        setSessionId(response.data.sessionId);
        setIsActive(true);
        setIsPaused(false);
        setTranscription("");
        clearBuffer();

        addToast({
          type: "success",
          title: "Session Started",
          description: "Modern streaming transcription is now active",
        });

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
    }
  };

  const processAudio = async (action = "pause") => {
    if (!sessionId) return;

    const currentBuffer = getAudioBuffer();

    // Validate audio buffer before processing
    const validation = audioValidation.validateAudioBuffer(
      currentBuffer,
      1,
      60
    );

    if (!validation.valid) {
      addToast({
        type: "warning",
        title: "Audio validation failed",
        description: validation.error,
      });

      if (validation.error === "Audio appears to be silent") {
        clearBuffer();
      }
      return;
    }

    setIsProcessing(true);
    try {
      const response = await streamingTranscriptionAPI.processAudio(
        token,
        sessionId,
        currentBuffer,
        action
      );

      if (response.success) {
        const {
          transcription: newTranscription,
          newText,
          turns,
        } = response.data;
        setTranscription(newTranscription);
        clearBuffer();

        addToast({
          type: "success",
          title: action === "pause" ? "Paused" : "Processed",
          description: newText ? `New text: "${newText}"` : "Audio processed",
        });
      } else {
        throw new Error(response.error || "Failed to process audio");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      addToast({
        type: "error",
        title: "Processing Failed",
        description: "Failed to process audio buffer",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pauseSession = async () => {
    if (!isActive || isPaused) return;

    await processAudio("pause");
    setIsPaused(true);
    stopRecording();
  };

  const resumeSession = async () => {
    if (!isActive || !isPaused) return;

    try {
      const response = await streamingTranscriptionAPI.resumeSession(
        token,
        sessionId
      );

      if (response.success) {
        setIsPaused(false);
        await startRecording();

        addToast({
          type: "success",
          title: "Resumed",
          description: "Streaming has resumed",
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
    }
  };

  const stopSession = async () => {
    if (!isActive) return;

    await processAudio("stop");
    stopRecording();

    setIsActive(false);
    setIsPaused(false);
    setSessionId(null);

    addToast({
      type: "success",
      title: "Session Stopped",
      description: "Streaming session has ended",
    });
  };

  const saveTranscription = async () => {
    if (!sessionId || !transcription) {
      addToast({
        type: "error",
        title: "Nothing to Save",
        description: "No transcription data available",
      });
      return;
    }

    try {
      const response = await streamingTranscriptionAPI.saveTranscription(
        token,
        sessionId,
        {
          title: "Modern Transcription",
          transcription,
          language: "en",
          tags: ["modern", "react-hooks"],
          notes: "Modern React audio hook transcription",
        }
      );

      if (response.success) {
        addToast({
          type: "success",
          title: "Saved",
          description: "Transcription saved successfully",
        });

        setSessionId(null);
        setTranscription("");
      } else {
        throw new Error(response.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving:", error);
      addToast({
        type: "error",
        title: "Save Failed",
        description: "Failed to save transcription",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Modern Streaming Transcription Demo
        </h1>

        {/* Status Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
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
              <span className="text-sm font-medium text-gray-600">Time: </span>
              <span className="text-sm font-mono text-gray-800">
                {formatTime(audioStats.duration)}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">
                Buffer:{" "}
              </span>
              <span className="text-sm font-mono text-gray-800">
                {audioBuffer.length.toLocaleString()} samples
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Audio: </span>
              <span
                className={`text-sm font-semibold flex items-center gap-1 ${
                  audioStats.hasAudio ? "text-green-600" : "text-yellow-600"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    audioStats.hasAudio
                      ? "bg-green-500 animate-pulse"
                      : "bg-yellow-500"
                  }`}
                ></div>
                {audioStats.hasAudio ? "Detected" : "Waiting"}
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
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
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
                Stop
              </Button>
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
              Live Transcription
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
          <h4 className="font-semibold mb-2">Modern Features:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ Uses modern AudioWorkletNode (no deprecation warnings)</li>
            <li>✅ React hooks for clean state management</li>
            <li>✅ Better separation of concerns</li>
            <li>✅ More maintainable and testable code</li>
            <li>✅ Follows React best practices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModernStreamingDemo;
