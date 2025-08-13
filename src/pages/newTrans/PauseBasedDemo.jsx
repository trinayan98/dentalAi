import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/Button";
import { Mic, Pause, Play, Square, Save, Loader2 } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import pauseBasedTranscriptionAPI from "../../api/pauseBasedTranscription";

const PauseBasedDemo = () => {
  // Session state
  const [sessionId, setSessionId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState([]);
  const [totalSamples, setTotalSamples] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // Transcription state
  const [transcription, setTranscription] = useState("");
  const [turns, setTurns] = useState([]);
  const [turnsCount, setTurnsCount] = useState(0);

  // Refs
  const mediaRecorderRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Hooks
  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  // Configuration
  const SAMPLE_RATE = 16000;

  // React Query mutations
  const startSessionMutation = useMutation({
    mutationFn: (sessionData) =>
      pauseBasedTranscriptionAPI.startSession(token, sessionData),
    onSuccess: (data) => {
      if (data.success) {
        const newSessionId = data.data.sessionId;
        setSessionId(newSessionId);
        setIsActive(true);
        setIsPaused(false);
        setTranscription("");
        setTurns([]);
        setTurnsCount(0);
        setRecordingTime(0);
        setTotalSamples(0);
        setAudioBuffer([]);

        // Start recording
        startRecording();

        addToast({
          type: "success",
          title: "Session Started",
          description: "Recording started. Click Pause to process audio.",
        });
      } else {
        throw new Error(data.error || "Failed to start session");
      }
    },
    onError: (error) => {
      console.error("Error starting session:", error);
      addToast({
        type: "error",
        title: "Start Failed",
        description: `Failed to start session: ${error.message}`,
      });
    },
  });

  const processAudioMutation = useMutation({
    mutationFn: ({ sessionId, audioData, action }) =>
      pauseBasedTranscriptionAPI.processAudio(
        token,
        sessionId,
        audioData,
        action
      ),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Update transcription
        setTranscription(data.data.transcription);

        // Update turns
        if (data.data.turns) {
          setTurns(data.data.turns);
          setTurnsCount(data.data.turns.length);
        }

        // Clear audio buffer
        setAudioBuffer([]);

        if (variables.action === "pause") {
          // Update UI state for pause
          setIsPaused(true);
          setIsRecording(false);

          addToast({
            type: "success",
            title: "Audio Processed",
            description: "Click Resume to continue recording",
          });
        } else if (variables.action === "stop") {
          // Update UI state for stop
          setIsActive(false);
          setIsPaused(false);

          addToast({
            type: "success",
            title: "Session Completed",
            description: "Transcription completed successfully",
          });
        }
      } else {
        throw new Error(data.error || "Failed to process audio");
      }
    },
    onError: (error) => {
      console.error("Error processing audio:", error);
      addToast({
        type: "error",
        title: "Processing Failed",
        description: `Failed to process audio: ${error.message}`,
      });
    },
  });

  const resumeSessionMutation = useMutation({
    mutationFn: (sessionId) =>
      pauseBasedTranscriptionAPI.resumeSession(token, sessionId),
    onSuccess: (data) => {
      if (data.success) {
        // Update transcription
        setTranscription(data.data.transcription);

        // Update turns
        if (data.data.turns) {
          setTurns(data.data.turns);
          setTurnsCount(data.data.turns.length);
        }

        // Resume recording
        startRecording();

        // Update UI state
        setIsPaused(false);

        addToast({
          type: "success",
          title: "Session Resumed",
          description: "Recording resumed successfully",
        });
      } else {
        throw new Error(data.error || "Failed to resume session");
      }
    },
    onError: (error) => {
      console.error("Error resuming session:", error);
      addToast({
        type: "error",
        title: "Resume Failed",
        description: `Failed to resume session: ${error.message}`,
      });
    },
  });

  const saveTranscriptionMutation = useMutation({
    mutationFn: ({ sessionId, transcriptionData }) =>
      pauseBasedTranscriptionAPI.saveTranscription(
        token,
        sessionId,
        transcriptionData
      ),
    onSuccess: (data) => {
      if (data.success) {
        addToast({
          type: "success",
          title: "Saved Successfully",
          description: "Transcription saved to database",
        });
      } else {
        throw new Error(data.error || "Failed to save transcription");
      }
    },
    onError: (error) => {
      console.error("Error saving transcription:", error);
      addToast({
        type: "error",
        title: "Save Failed",
        description: `Failed to save transcription: ${error.message}`,
      });
    },
  });

  // Timer effect - updated to match HTML version
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        if (startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setRecordingTime(elapsed);
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording, isPaused, startTime]);

  // Helper: Convert audio blob to array (send WebM data directly) - matches HTML version
  const convertAudioToArray = async (audioBlob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log("🎵 Audio blob converted to array:", {
        originalSize: audioBlob.size,
        arrayLength: uint8Array.length,
        type: audioBlob.type,
        firstFewValues: Array.from(uint8Array.slice(0, 10)),
      });

      return Array.from(uint8Array);
    } catch (error) {
      console.error("Error converting audio to array:", error);
      throw error;
    }
  };

  // Helper: Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start session
  const startSession = async () => {
    addToast({
      type: "info",
      title: "Starting Session",
      description: "Initializing pause-based transcription...",
    });

    startSessionMutation.mutate({
      title: "Pause-Based Demo Session",
      language: "en",
      tags: "demo, pause-based",
      notes: "Testing pause-based transcription",
    });
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Stop existing recorder if any
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
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
          try {
            // Convert to array and add to buffer - matches HTML version
            const audioData = await convertAudioToArray(event.data);
            setAudioBuffer((prev) => [...prev, ...audioData]);
            setTotalSamples((prev) => prev + audioData.length);
          } catch (error) {
            console.error("Error processing audio chunk:", error);
            // Don't throw - just log the error and continue
            // This prevents the entire recording from failing due to one bad chunk
          }
        }
      };

      mediaRecorderRef.current.onstart = () => {
        setIsRecording(true);
        setStartTime(Date.now());
      };

      mediaRecorderRef.current.onstop = () => {
        setIsRecording(false);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        addToast({
          type: "error",
          title: "Recording Error",
          description: `MediaRecorder error: ${
            event.error.message || event.error
          }`,
        });
      };

      mediaRecorderRef.current.start(1000); // 1-second chunks
    } catch (error) {
      console.error("Error starting recording:", error);
      addToast({
        type: "error",
        title: "Recording Failed",
        description: `Failed to start recording: ${error.message}`,
      });
    }
  };

  // Pause session
  const pauseSession = async () => {
    if (!sessionId || audioBuffer.length === 0) {
      addToast({
        type: "warning",
        title: "No Audio",
        description: "No audio to process",
      });
      return;
    }

    addToast({
      type: "info",
      title: "Processing Audio",
      description: "Processing accumulated audio...",
    });

    processAudioMutation.mutate({
      sessionId: sessionId,
      audioData: audioBuffer,
      action: "pause",
    });
  };

  // Resume session
  const resumeSession = async () => {
    addToast({
      type: "info",
      title: "Resuming Session",
      description: "Resuming recording...",
    });

    resumeSessionMutation.mutate(sessionId);
  };

  // Stop session
  const stopSession = async () => {
    if (!sessionId) {
      addToast({
        type: "warning",
        title: "No Session",
        description: "No active session to stop",
      });
      return;
    }

    addToast({
      type: "info",
      title: "Stopping Session",
      description: "Processing final audio...",
    });

    // Stop recording
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    // Process any remaining audio
    if (audioBuffer.length > 0) {
      processAudioMutation.mutate({
        sessionId: sessionId,
        audioData: audioBuffer,
        action: "stop",
      });
    } else {
      // If no audio buffer, just stop the session
      setIsActive(false);
      setIsPaused(false);
      addToast({
        type: "success",
        title: "Session Completed",
        description: "Session ended successfully",
      });
    }
  };

  // Save transcription
  const saveTranscription = async () => {
    if (!transcription) {
      addToast({
        type: "error",
        title: "Nothing to Save",
        description: "No transcription data available",
      });
      return;
    }

    addToast({
      type: "info",
      title: "Saving Transcription",
      description: "Saving to database...",
    });

    saveTranscriptionMutation.mutate({
      sessionId: sessionId,
      transcriptionData: {
        title: "Pause-Based Demo Transcription",
        transcription: transcription,
        language: "en",
        tags: ["demo", "pause-based"],
        notes: "Demo transcription using pause-based approach",
      },
    });
  };

  // Check if any mutation is loading
  const isProcessing =
    startSessionMutation.isPending ||
    processAudioMutation.isPending ||
    resumeSessionMutation.isPending ||
    saveTranscriptionMutation.isPending;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🎤 Pause-Based Transcription Demo
        </h1>

        {/* Status Display - matches HTML version */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <div className="text-sm text-gray-700">
            {!isActive
              ? "Ready to start transcription session"
              : isPaused
              ? "Audio processed. Click Resume to continue recording"
              : "Recording... Click Pause to process audio"}
          </div>
        </div>

        {/* Stats Grid - matches HTML version */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">
              {formatTime(recordingTime)}
            </div>
            <div className="text-xs text-gray-600 uppercase">Duration</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">
              {audioBuffer.length.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 uppercase">Audio Samples</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">{turnsCount}</div>
            <div className="text-xs text-gray-600 uppercase">Turns</div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-800">
              {isRecording ? "🔴" : isPaused ? "⏸️" : "⏹️"}
            </div>
            <div className="text-xs text-gray-600 uppercase">Status</div>
          </div>
        </div>

        {/* Controls - matches HTML version */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Button
            onClick={startSession}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isProcessing || isActive}
          >
            <Mic size={16} className="mr-2" />
            Start Session
          </Button>
          <Button
            onClick={pauseSession}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            disabled={
              isProcessing || !isActive || isPaused || audioBuffer.length === 0
            }
          >
            <Pause size={16} className="mr-2" />
            Pause
          </Button>
          <Button
            onClick={resumeSession}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isProcessing || !isActive || !isPaused}
          >
            <Play size={16} className="mr-2" />
            Resume
          </Button>
          <Button
            onClick={stopSession}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isProcessing || !isActive}
          >
            <Square size={16} className="mr-2" />
            Stop
          </Button>
          <Button
            onClick={saveTranscription}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isProcessing || !transcription}
          >
            <Save size={16} className="mr-2" />
            Save
          </Button>

          {isProcessing && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>

        {/* Transcription Display - matches HTML version */}
        <div className="mb-6">
          <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {transcription || "Transcription will appear here..."}
            </div>
          </div>
        </div>

        {/* Speaker Turns - matches HTML version */}
        <div className="mb-6">
          <div className="space-y-3">
            {turns && turns.length > 0 ? (
              turns.map((turn, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 bg-white ${
                    turn.speaker === "A"
                      ? "border-green-500"
                      : "border-orange-500"
                  }`}
                >
                  <div className="font-semibold text-gray-600 mb-1">
                    Speaker {turn.speaker}
                  </div>
                  <div className="text-gray-800">{turn.text}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                Speaker turns will appear here...
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">📋 How to Use</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              • Click <strong>Start Session</strong> to begin recording
            </li>
            <li>
              • Click <strong>Pause</strong> to process accumulated audio
            </li>
            <li>
              • Click <strong>Resume</strong> to continue recording
            </li>
            <li>
              • Click <strong>Stop</strong> to end session and process final
              audio
            </li>
            <li>
              • Click <strong>Save</strong> to save transcription to database
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PauseBasedDemo;
