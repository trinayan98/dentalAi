import { Button } from "../../components/ui/Button";
import {
  Loader2,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  XCircle,
  Podcast,
  Mic,
  Square,
  Upload,
  Pause,
  Play,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import {
  streamingTranscriptionAPI,
  audioValidation,
} from "../../api/streamingTranscription";
import AudioDebugger from "../../components/AudioDebugger";

const LiveTranscript = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("record"); // "record" or "upload"

  // Shared states
  const [utterances, setUtterances] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUtterances, setEditingUtterances] = useState([]);

  // Recording states
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Streaming transcription states
  const [sessionId, setSessionId] = useState(null);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState("");
  const [audioBuffer, setAudioBuffer] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [bufferStats, setBufferStats] = useState({
    totalSamples: 0,
    lastUpdate: null,
    updateCount: 0,
  });

  // Refs
  const recordingIntervalRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);

  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  // Use react-media-recorder hook for legacy recording
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      mediaRecorderOptions: {
        mimeType: "audio/webm;codecs=opus",
      },
      onStop: (blobUrl, blob) => {
        console.log("Recording completed:", blobUrl);
        addToast({
          type: "success",
          title: "Recording complete",
          description: "Your audio has been recorded successfully",
        });
      },
    });

  // Timer effect
  useEffect(() => {
    if (status === "recording" || isStreamingActive) {
      // Start timer when recording starts
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          console.log("Timer tick:", newTime);
          return newTime;
        });
      }, 1000);
    } else {
      // Stop timer when recording stops
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [status, isStreamingActive]);

  // Monitor audioBuffer changes
  useEffect(() => {
    console.log("AudioBuffer state changed:", {
      length: audioBuffer.length,
      hasData: audioBuffer.length > 0,
      sampleRange:
        audioBuffer.length > 0
          ? `${Math.min(...audioBuffer)} to ${Math.max(...audioBuffer)}`
          : "N/A",
    });
  }, [audioBuffer]);

  // Load utterances from localStorage on component mount
  useEffect(() => {
    const savedUtterances = localStorage.getItem("transcriptUtterances");
    if (savedUtterances) {
      try {
        const parsedUtterances = JSON.parse(savedUtterances);
        setUtterances(parsedUtterances);
      } catch (error) {
        console.error("Error loading utterances from localStorage:", error);
      }
    }
  }, []);

  // Save utterances to localStorage whenever they change
  useEffect(() => {
    if (utterances.length > 0) {
      localStorage.setItem("transcriptUtterances", JSON.stringify(utterances));
    }
  }, [utterances]);

  // Convert milliseconds to [MM:SS] format
  const formatTimestamp = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `[${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}]`;
  };

  // Convert [MM:SS] format back to milliseconds
  const parseTimestamp = (timestampStr) => {
    const match = timestampStr.match(/\[(\d{2}):(\d{2})\]/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      return (minutes * 60 + seconds) * 1000;
    }
    return 0;
  };

  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ===== STREAMING TRANSCRIPTION FUNCTIONS =====
  const startStreamingSession = async () => {
    try {
      const response = await streamingTranscriptionAPI.startSession(token, {
        title: sessionTitle || "Live Transcription Session",
        language: "en",
        tags: "live, real-time",
        notes: "Ongoing transcription session",
      });

      if (response.success) {
        setSessionId(response.data.sessionId);
        setSessionTitle(response.data.title);
        setIsStreamingActive(true);
        setIsPaused(false);
        setCurrentTranscription("");
        setAudioBuffer([]);

        addToast({
          type: "success",
          title: "Session started",
          description: "Streaming transcription session is now active",
        });

        // Start audio capture
        await startAudioCapture();
      } else {
        throw new Error(response.error || "Failed to start session");
      }
    } catch (error) {
      console.error("Error starting streaming session:", error);
      addToast({
        type: "error",
        title: "Session failed",
        description: "Failed to start streaming transcription session",
      });
    }
  };

  const startAudioCapture = async () => {
    try {
      // First, check if we can access the microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // 16kHz for better compatibility
          channelCount: 1, // Mono audio
        },
      });

      // Verify we have an active audio track
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack || !audioTrack.enabled) {
        throw new Error("No active audio track available");
      }

      console.log("Audio track settings:", audioTrack.getSettings());
      console.log("Audio track enabled:", audioTrack.enabled);

      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create script processor for audio processing
      const processor = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );
      processorRef.current = processor;

      let consecutiveSilentChunks = 0;
      const maxSilentChunks = 10; // Allow some silent chunks before filtering

      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);

        // Calculate RMS (Root Mean Square) for better audio detection
        let rms = 0;
        for (let i = 0; i < inputData.length; i++) {
          rms += inputData[i] * inputData[i];
        }
        rms = Math.sqrt(rms / inputData.length);

        // More robust audio detection with multiple checks
        const hasAudio = rms > 0.005; // Higher threshold for meaningful audio

        // Additional check: ensure we have actual non-zero samples after conversion
        const int16Array = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Array[i] = Math.max(
            -32768,
            Math.min(32767, inputData[i] * 32768)
          );
        }

        // Check if the converted audio has meaningful values
        const hasMeaningfulSamples = int16Array.some(
          (sample) => Math.abs(sample) > 50
        );

        if (hasAudio && hasMeaningfulSamples) {
          consecutiveSilentChunks = 0;

          // Add to buffer
          setAudioBuffer((prev) => {
            const newBuffer = [...prev, ...Array.from(int16Array)];

            // Limit buffer size to prevent memory issues (max 10 seconds at 16kHz)
            const maxSamples = 16000 * 10; // 10 seconds max
            if (newBuffer.length > maxSamples) {
              return newBuffer.slice(-maxSamples);
            }

            // Debug logging with actual new buffer size
            console.log(
              "Audio captured - RMS:",
              rms,
              "Buffer size:",
              newBuffer.length,
              "Added samples:",
              int16Array.length,
              "Sample range:",
              `${Math.min(...int16Array)} to ${Math.max(...int16Array)}`
            );

            // Update buffer stats
            setBufferStats((prev) => ({
              totalSamples: newBuffer.length,
              lastUpdate: new Date().toISOString(),
              updateCount: prev.updateCount + 1,
            }));

            return newBuffer;
          });
        } else {
          consecutiveSilentChunks++;
          console.log(
            "Silent/quiet audio detected - RMS:",
            rms,
            "Has meaningful samples:",
            hasMeaningfulSamples,
            "Skipping chunk"
          );

          // Don't add silent chunks to buffer - this was the problem!
          // We were adding zeros to the buffer, which accumulated into 65,536 zeros
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      console.log("Audio capture started successfully");
      addToast({
        type: "success",
        title: "Audio capture active",
        description: "Microphone is now recording audio",
      });
    } catch (error) {
      console.error("Error starting audio capture:", error);
      addToast({
        type: "error",
        title: "Audio capture failed",
        description:
          error.message || "Please allow microphone access to start streaming",
      });
    }
  };

  const processAudioBuffer = async (action = "pause") => {
    if (!sessionId) return;

    // Validate audio buffer before processing
    const validation = audioValidation.validateAudioBuffer(audioBuffer, 1, 60);

    if (!validation.valid) {
      addToast({
        type: "warning",
        title: "Audio validation failed",
        description: validation.error,
      });

      // Clear buffer if it's silent
      if (validation.error === "Audio appears to be silent") {
        setAudioBuffer([]);
      }
      return;
    }

    setIsProcessing(true);
    try {
      const response = await streamingTranscriptionAPI.processAudio(
        token,
        sessionId,
        audioBuffer,
        action
      );

      if (response.success) {
        const { transcription, newText, turns } = response.data;
        setCurrentTranscription(transcription);

        // Convert turns to utterances format
        if (turns && turns.length > 0) {
          const newUtterances = turns.map((turn) => ({
            speaker: turn.speaker || "A",
            text: turn.transcript,
            confidence: turn.confidence || 0.9,
            start: new Date(turn.timestamp).getTime(),
            end: new Date(turn.timestamp).getTime() + 1000,
          }));

          setUtterances((prev) => [...prev, ...newUtterances]);
        }

        // Clear buffer after processing
        setAudioBuffer([]);

        addToast({
          type: "success",
          title: action === "pause" ? "Audio paused" : "Audio processed",
          description: newText
            ? `New text: "${newText}"`
            : "Audio processed successfully",
        });
      } else {
        throw new Error(response.error || "Failed to process audio");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      addToast({
        type: "error",
        title: "Processing failed",
        description: "Failed to process audio buffer",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pauseStreaming = async () => {
    if (!isStreamingActive || isPaused) return;

    await processAudioBuffer("pause");
    setIsPaused(true);

    // Stop audio capture
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  };

  const resumeStreaming = async () => {
    if (!isStreamingActive || !isPaused) return;

    try {
      const response = await streamingTranscriptionAPI.resumeSession(
        token,
        sessionId
      );

      if (response.success) {
        setIsPaused(false);
        await startAudioCapture();

        addToast({
          type: "success",
          title: "Session resumed",
          description: "Streaming transcription has resumed",
        });
      } else {
        throw new Error(response.error || "Failed to resume session");
      }
    } catch (error) {
      console.error("Error resuming streaming:", error);
      addToast({
        type: "error",
        title: "Resume failed",
        description: "Failed to resume streaming session",
      });
    }
  };

  const stopStreaming = async () => {
    if (!isStreamingActive) return;

    // Process final audio buffer
    await processAudioBuffer("stop");

    // Stop audio capture
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsStreamingActive(false);
    setIsPaused(false);
    setSessionId(null);
    setRecordingTime(0);

    addToast({
      type: "success",
      title: "Session stopped",
      description: "Streaming transcription session has ended",
    });
  };

  const saveStreamingTranscription = async () => {
    if (!sessionId || !currentTranscription) {
      addToast({
        type: "error",
        title: "Nothing to save",
        description: "No transcription data available to save",
      });
      return;
    }

    try {
      const response = await streamingTranscriptionAPI.saveTranscription(
        token,
        sessionId,
        {
          title: sessionTitle || "Live Transcription",
          transcription: currentTranscription,
          language: "en",
          tags: ["live", "real-time"],
          notes: "Streaming transcription session",
        }
      );

      if (response.success) {
        addToast({
          type: "success",
          title: "Transcription saved",
          description:
            "Your streaming transcription has been saved successfully",
        });

        // Clear session
        setSessionId(null);
        setCurrentTranscription("");
        setSessionTitle("");
      } else {
        throw new Error(response.error || "Failed to save transcription");
      }
    } catch (error) {
      console.error("Error saving transcription:", error);
      addToast({
        type: "error",
        title: "Save failed",
        description: "Failed to save transcription",
      });
    }
  };

  // ===== RECORDING FUNCTIONS =====
  const handleStartRecording = () => {
    try {
      startRecording();
      setRecordingTime(0);
      console.log("Recording started with react-media-recorder");
      addToast({
        type: "success",
        title: "Recording started",
        description: "Your microphone is now active",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      addToast({
        type: "error",
        title: "Recording failed",
        description: "Please allow microphone access to record audio",
      });
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    console.log("Recording stopped");
  };

  const handleClearRecording = () => {
    clearBlobUrl();
    setRecordingTime(0);
    setIsPlaying(false);
    console.log("Recording cleared");
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // ===== UPLOAD FUNCTIONS =====
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type (audio files only)
    const audioTypes = [
      "audio/mp3",
      "audio/wav",
      "audio/m4a",
      "audio/aac",
      "audio/ogg",
      "audio/webm",
    ];
    if (!audioTypes.includes(file.type)) {
      addToast({
        type: "error",
        title: "Invalid file type",
        description:
          "Please select an audio file (MP3, WAV, M4A, AAC, OGG, or WebM)",
      });
      return;
    }

    // Check file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      addToast({
        type: "error",
        title: "File too large",
        description: "Please select a file smaller than 20MB",
      });
      return;
    }

    setSelectedFile(file);
    addToast({
      type: "success",
      title: "File selected",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addToast({
        type: "error",
        title: "No file selected",
        description: "Please select an audio file to upload",
      });
      return;
    }

    setIsUploading(true);
    setIsTranscribing(true);

    try {
      const response = await streamingTranscriptionAPI.uploadAudio(
        token,
        selectedFile
      );

      if (response.success && response.data && response.data.utterances) {
        setUtterances(response.data.utterances);
        addToast({
          type: "success",
          title: "Transcription complete",
          description: "Your audio has been transcribed successfully",
        });
      } else {
        throw new Error("No utterances data received");
      }
    } catch (error) {
      console.error("Upload error:", error);

      // Handle error response
      let errorMessage = "Failed to upload and transcribe file";
      if (error.response) {
        // Server responded with error status
        errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          errorMessage;
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Other error
        errorMessage = error.message || errorMessage;
      }

      addToast({
        type: "error",
        title: "Upload failed",
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
      setIsTranscribing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ===== SHARED FUNCTIONS =====
  const handleEditClick = () => {
    setEditingUtterances([...utterances]);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setUtterances(editingUtterances);
    setIsEditing(false);
    addToast({
      type: "success",
      title: "Changes saved",
      description: "Your edits have been saved locally",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingUtterances([]);
  };

  const handleUtteranceChange = (index, field, value) => {
    const updatedUtterances = [...editingUtterances];
    if (field === "start" || field === "end") {
      updatedUtterances[index][field] = parseTimestamp(value);
    } else {
      updatedUtterances[index][field] = value;
    }
    setEditingUtterances(updatedUtterances);
  };

  const handleAddUtterance = () => {
    const newUtterance = {
      speaker: "A",
      text: "",
      confidence: 0.9,
      start: 0,
      end: 1000,
    };
    setEditingUtterances([...editingUtterances, newUtterance]);
  };

  const handleDeleteUtterance = (index) => {
    const updatedUtterances = editingUtterances.filter((_, i) => i !== index);
    setEditingUtterances(updatedUtterances);
  };

  const clearTranscript = () => {
    setSelectedFile(null);
    setUtterances([]);
    setCurrentTranscription("");
    setSessionId(null);
    setIsStreamingActive(false);
    setIsPaused(false);
    setAudioBuffer([]);
    handleClearRecording();
    localStorage.removeItem("transcriptUtterances");
    addToast({
      type: "success",
      title: "Transcript cleared",
      description: "All transcript data has been cleared",
    });
  };

  const renderUtterances = () => {
    if (isEditing) {
      return editingUtterances.map((utterance, index) => (
        <div key={index} className="mb-2  rounded">
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="ms-2 text-primary-400 text-xxs">
              {formatTimestamp(utterance.end)}
            </span>
            <span className="text-gray-500">to</span>
            <span className=" text-primary-400 text-xxs">
              {formatTimestamp(utterance.end)}
            </span>
            <button
              onClick={() => handleDeleteUtterance(index)}
              className="ml-auto text-red-500 hover:text-red-700 rounded-full bg-red-100 p-1"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <textarea
            value={utterance.text}
            onChange={(e) =>
              handleUtteranceChange(index, "text", e.target.value)
            }
            className="w-full px-2 py-1 text-s border rounded resize-none text-s"
            rows={2}
            placeholder="Enter text..."
          />
        </div>
      ));
    } else {
      return utterances.map((utterance, index) => (
        <div
          key={index}
          className="flex w-full mb-3 border border-gray-100 bg-green-100/30 rounded-lg shadow-sm relative"
        >
          {/* Green left border for chat bubble effect */}
          <div className="flex flex-col justify-stretch">
            <div
              className="h-full w-2 bg-green-600 rounded-l-lg mr-0"
              style={{ minHeight: "100%" }}
            />
          </div>
          <div
            className="px-4 py-3 w-full flex flex-col -ml-1 rounded-md bg-gray-50 "
            style={{ left: "-4px" }}
          >
            <div className="flex items-baseline gap-1 ">
              <span className="text-gray-600 text-xxs font-mono mb-1">
                {formatTimestamp(utterance.start)}
              </span>
            </div>
            <div className="text-gray-800 text-s">{utterance.text}</div>
          </div>
        </div>
      ));
    }
  };

  return (
    <div className="col-span-4">
      <div className="w-full border border-1 border-gray-200 rounded-md bg-white">
        {/* Header with Tabs */}
        <div className="w-full border-0 border-b-2 border-gray-200 py-5 px-5">
          <div className="flex items-center justify-between ">
            <div className="flex">
              <span className="text-gray-700 dark:text-gray-300 font-semibold flex items-center">
                <Podcast size={18} className="mr-3" /> Audio Transcription
              </span>
              {/* Tab Navigation */}
              <div
                className="flex space-x-1 bg-gray-100 p-1 rounded-lg ms-2"
                // style={{
                //   boxShadow:
                //     "rgba(50, 50, 93, 0.25) 0px 30px 60px -8px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
                // }}
              >
                <button
                  onClick={() => setActiveTab("record")}
                  className={`text-xxs flex items-center gap-2 px-4 py-1 rounded-md font-medium transition-all duration-200 ${
                    activeTab === "record"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Mic size={14} />
                  Record Audio
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`text-xxs flex items-center gap-2 px-4 py-1 rounded-md font-medium transition-all duration-200 ${
                    activeTab === "upload"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Upload size={14} />
                  Upload Audio
                </button>
              </div>
            </div>
            <div className="font-bold text-sm flex items-center gap-2">
              {(utterances.length > 0 ||
                mediaBlobUrl ||
                currentTranscription) &&
                !isTranscribing && (
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="rounded-full bg-primary-100 p-2"
                        >
                          <Save size={16} color="blue" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="rounded-full bg-red-100 p-2"
                        >
                          <X size={16} color="red" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEditClick}
                        size="sm"
                        className="rounded-full bg-green-100 p-2"
                      >
                        <Edit size={14} color="green" />
                      </button>
                    )}
                    {isEditing && (
                      <button
                        onClick={handleAddUtterance}
                        size="sm"
                        className="rounded-full bg-gray-100 p-2"
                      >
                        <Plus size={16} />
                      </button>
                    )}
                    {sessionId && (
                      <button
                        onClick={saveStreamingTranscription}
                        size="sm"
                        className="rounded-full bg-blue-100 p-2"
                        disabled={isProcessing}
                      >
                        <Save size={14} color="blue" />
                      </button>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div>
          <div className="h-[63vh] rounded-md bg-white p-4 overflow-y-auto shadow-sm">
            {isTranscribing || isProcessing ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                  <span className="text-gray-600">
                    {isProcessing
                      ? "Processing audio..."
                      : "Transcribing audio..."}
                  </span>
                </div>
              </div>
            ) : utterances.length > 0 ||
              mediaBlobUrl ||
              currentTranscription ? (
              <div className="text-gray-800 leading-relaxed">
                {/* Streaming transcription display */}
                {currentTranscription && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">
                      Live Transcription
                    </h3>
                    <div className="text-gray-800 text-sm leading-relaxed">
                      {currentTranscription}
                    </div>
                    {sessionId && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                        <span>Session: {sessionId}</span>
                        <span>•</span>
                        <span>Status: {isPaused ? "Paused" : "Active"}</span>
                        <span>•</span>
                        <span>Buffer: {audioBuffer.length} samples</span>
                        <span>•</span>
                        <span
                          className={`flex items-center gap-1 ${
                            audioBuffer.length > 0 &&
                            audioBuffer.some((sample) => Math.abs(sample) > 100)
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              audioValidation.hasMeaningfulAudio(audioBuffer)
                                ? "bg-green-500 animate-pulse"
                                : "bg-yellow-500"
                            }`}
                          ></div>
                          {audioValidation.hasMeaningfulAudio(audioBuffer)
                            ? "Audio detected"
                            : "Waiting for speech"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {mediaBlobUrl && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">
                      Recorded Audio
                    </h3>
                    <audio
                      ref={audioRef}
                      src={mediaBlobUrl}
                      onEnded={handleAudioEnded}
                      className="w-full"
                      controls
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Duration: {formatRecordingTime(recordingTime)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Status: {status}
                      </span>
                    </div>
                  </div>
                )}
                {renderUtterances()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  {/* Record Tab Content */}
                  {activeTab === "record" && (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        {!isStreamingActive &&
                          status !== "recording" &&
                          !mediaBlobUrl && (
                            <button
                              onClick={startStreamingSession}
                              className="w-16 h-16 bg-green-600 rounded-full p-1 flex items-center justify-center hover:bg-green-700 transition-colors shadow-lg"
                            >
                              <Mic color="white" size={24} />
                            </button>
                          )}
                        {isStreamingActive && !isPaused && (
                          <button
                            onClick={pauseStreaming}
                            className="w-16 h-16 bg-yellow-600 rounded-full p-1 flex items-center justify-center hover:bg-yellow-700 transition-colors shadow-lg"
                          >
                            <Pause color="white" size={24} />
                          </button>
                        )}
                        {isStreamingActive && isPaused && (
                          <button
                            onClick={resumeStreaming}
                            className="w-16 h-16 bg-green-600 rounded-full p-1 flex items-center justify-center hover:bg-green-700 transition-colors shadow-lg"
                          >
                            <Play color="white" size={24} />
                          </button>
                        )}
                        {(utterances.length > 0 ||
                          mediaBlobUrl ||
                          currentTranscription) && (
                          <button
                            onClick={clearTranscript}
                            className="w-12 h-12 bg-red-100 rounded-full p-1 flex items-center justify-center hover:bg-red-200 transition-colors ml-4"
                          >
                            <XCircle size={18} color="red" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {isStreamingActive
                          ? isPaused
                            ? "Click play to resume streaming transcription"
                            : "Click pause to process current audio"
                          : "Click the microphone to start streaming transcription"}
                      </p>
                    </>
                  )}

                  {/* Upload Tab Content */}
                  {activeTab === "upload" && (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        {!selectedFile && utterances.length === 0 && (
                          <button
                            onClick={triggerFileInput}
                            disabled={isUploading}
                            className="w-16 h-16 bg-blue-600 rounded-full p-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-lg"
                          >
                            {isUploading ? (
                              <Loader2
                                className="text-white animate-spin"
                                size={24}
                              />
                            ) : (
                              <Upload color="white" size={24} />
                            )}
                          </button>
                        )}
                        {selectedFile && utterances.length === 0 && (
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              fileInputRef.current.value = "";
                            }}
                            className="w-12 h-12 bg-red-100 rounded-full p-1 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <X size={20} color="red" />
                          </button>
                        )}
                        {utterances.length > 0 && (
                          <button
                            onClick={clearTranscript}
                            className="w-12 h-12 bg-red-100 rounded-full p-1 flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <XCircle size={18} color="red" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Click the upload button to select an audio file
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center mt-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Record Tab Controls */}
        {activeTab === "record" && (
          <>
            {isStreamingActive ? (
              // Streaming control bar
              <div
                className="flex items-center bg-green-500 p-1 w-full max-w-md border-4 border-green-200/60 pe-5"
                style={{ borderRadius: "40px" }}
              >
                <div className="flex items-center gap-3 px-4 py-2 flex-1">
                  <div className="bg-green-300 rounded-full p-3">
                    <Mic className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">
                      {isPaused ? "Paused" : "Streaming..."}
                    </span>
                    <span className="text-white text-xs opacity-90">
                      {isPaused
                        ? "Click resume to continue"
                        : "Click pause to process"}
                    </span>
                  </div>
                  <span className="text-white font-mono text-sm ml-auto">
                    {formatRecordingTime(recordingTime)} ({recordingTime}s)
                  </span>
                </div>
                {isPaused ? (
                  <button
                    onClick={resumeStreaming}
                    className="bg-green-500 text-white font-semibold px-2 py-2 rounded-full ml-2 transition hover:bg-green-600 focus:outline-none"
                  >
                    <Play size={16} color="white" />
                  </button>
                ) : (
                  <button
                    onClick={pauseStreaming}
                    className="bg-yellow-500 text-white font-semibold px-2 py-2 rounded-full ml-2 transition hover:bg-yellow-600 focus:outline-none"
                  >
                    <Pause size={16} color="white" />
                  </button>
                )}
              </div>
            ) : status === "recording" ? (
              // Legacy recording control bar
              <div
                className="flex items-center bg-green-500 p-1 w-full max-w-md border-4 border-green-200/60 pe-5"
                style={{ borderRadius: "40px" }}
              >
                <div className="flex items-center gap-3 px-4 py-2 flex-1">
                  <div className="bg-green-300 rounded-full p-3">
                    <Mic className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">
                      Recording...
                    </span>
                    <span className="text-white text-xs opacity-90">
                      Click stop when done
                    </span>
                  </div>
                  <span className="text-white font-mono text-sm ml-auto">
                    {formatRecordingTime(recordingTime)} ({recordingTime}s)
                  </span>
                </div>
                <button
                  onClick={handleStopRecording}
                  className="bg-red-500 text-white font-semibold px-2 py-2 rounded-full ml-2 transition hover:bg-red-600 focus:outline-none"
                >
                  <Square size={16} color="white" />
                </button>
              </div>
            ) : (
              // Normal recording controls
              <div className="flex items-center gap-3">
                {!mediaBlobUrl && !isStreamingActive && (
                  <Button
                    onClick={handleStartRecording}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Mic size={16} className="mr-2" />
                    Record
                  </Button>
                )}
                {(utterances.length > 0 ||
                  mediaBlobUrl ||
                  currentTranscription) && (
                  <Button
                    onClick={clearTranscript}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle size={16} className="mr-2" />
                    Clear
                  </Button>
                )}
                {isStreamingActive && (
                  <Button
                    onClick={stopStreaming}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Square size={16} className="mr-2" />
                    Stop Session
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Upload Tab Controls */}
        {activeTab === "upload" && (
          <div className="flex items-center gap-3">
            {!selectedFile && utterances.length === 0 && (
              <Button
                onClick={triggerFileInput}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <Upload size={16} className="mr-2" />
                Upload Audio
              </Button>
            )}
            {selectedFile && utterances.length === 0 && (
              <>
                <button
                  onClick={handleUpload}
                  className="flex items-center text-s gap-2 border-2 border-gray-400 text-gray-500 bg-transparent rounded-full px-6 py-2 font-medium transition hover:bg-primary-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Upload
                </button>

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    fileInputRef.current.value = "";
                  }}
                  className="flex items-center justify-center border-2 border-red-300 text-red-600 bg-red-500/20 rounded-full p-2.5 transition hover:bg-gray-100 focus:outline-none"
                  type="button"
                >
                  <X size={14} />
                </button>
              </>
            )}
            {utterances.length > 0 && (
              <Button
                onClick={clearTranscript}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle size={16} className="mr-2" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Audio Debugger */}
      <AudioDebugger audioBuffer={audioBuffer} isActive={isStreamingActive} />
    </div>
  );
};

export default LiveTranscript;
