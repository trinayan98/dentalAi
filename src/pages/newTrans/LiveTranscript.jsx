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
  Upload,
  Mic,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { streamingTranscriptionAPI } from "../../api/streamingTranscription";
import StreamingRecorder from "./StreamingRecorder";

const LiveTranscript = () => {
  // Tab state - load from localStorage or default to "record"
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("activeTranscriptionTab");
    return savedTab || "record";
  });
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState(null);
  const [showClearWarning, setShowClearWarning] = useState(false);

  // Shared states
  const [utterances, setUtterances] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUtterances, setEditingUtterances] = useState([]);

  // Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Streaming states
  const [streamingSessionId, setStreamingSessionId] = useState(null);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [isStreamingPaused, setIsStreamingPaused] = useState(false);

  // Refs
  const fileInputRef = useRef(null);

  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  // Tab switching logic
  const handleTabSwitch = (newTab) => {
    if (activeTab === newTab) return; // Already on this tab

    // Check if there's existing transcription data
    const existingUtterances = localStorage.getItem("transcriptUtterances");
    if (existingUtterances) {
      try {
        const parsedUtterances = JSON.parse(existingUtterances);
        if (parsedUtterances && parsedUtterances.length > 0) {
          // Show warning modal
          setPendingTabSwitch(newTab);
          setShowTabSwitchWarning(true);
          return;
        }
      } catch (error) {
        console.error("Error parsing existing utterances:", error);
      }
    }

    // No existing data, switch directly
    setActiveTab(newTab);
  };

  const confirmTabSwitch = () => {
    // Clear existing data
    localStorage.removeItem("transcriptUtterances");
    setUtterances([]);
    setSelectedFile(null);
    setStreamingSessionId(null);
    setIsStreamingActive(false);
    setIsStreamingPaused(false);

    // Switch to pending tab and save preference
    setActiveTab(pendingTabSwitch);
    localStorage.setItem("activeTranscriptionTab", pendingTabSwitch);
    setShowTabSwitchWarning(false);
    setPendingTabSwitch(null);

    addToast({
      type: "info",
      title: "Tab switched",
      description: "Previous transcription data has been cleared",
    });
  };

  const cancelTabSwitch = () => {
    setShowTabSwitchWarning(false);
    setPendingTabSwitch(null);
  };

  // Handle streaming session updates
  const handleStreamingSessionUpdate = (sessionInfo) => {
    setStreamingSessionId(sessionInfo.sessionId);
    setIsStreamingActive(sessionInfo.isActive);
    setIsStreamingPaused(sessionInfo.isPaused);
  };

  // Handle streaming transcription completion
  const handleStreamingTranscriptionComplete = (
    transcription,
    newUtterances
  ) => {
    // Get existing utterances from localStorage
    const existingUtterances = localStorage.getItem("transcriptUtterances");
    let allUtterances = [];

    if (existingUtterances) {
      try {
        allUtterances = JSON.parse(existingUtterances);
      } catch (error) {
        console.error("Error parsing existing utterances:", error);
      }
    }

    // Combine existing and new utterances
    const combinedUtterances = [...allUtterances, ...newUtterances];

    // Update state - this will trigger the useEffect to save to localStorage
    setUtterances(combinedUtterances);
  };

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

  // Save active tab preference to localStorage
  useEffect(() => {
    localStorage.setItem("activeTranscriptionTab", activeTab);
  }, [activeTab]);

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

  // Helper function to filter valid utterances
  const getValidUtterances = () => {
    return utterances.filter(
      (utterance) =>
        utterance.text &&
        utterance.text.trim() !== "" &&
        utterance.start !== null &&
        utterance.end !== null
    );
  };

  // ===== STREAMING TRANSCRIPTION FUNCTIONS =====
  // These functions are now handled by the StreamingRecorder component

  // ===== RECORDING FUNCTIONS =====
  // These functions are now handled by the StreamingRecorder component

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
    setStreamingSessionId(null);
    setIsStreamingActive(false);
    setIsStreamingPaused(false);
    localStorage.removeItem("transcriptUtterances");
    addToast({
      type: "success",
      title: "Transcript cleared",
      description: "All transcript data has been cleared",
    });
  };

  const handleClearTranscript = () => {
    setShowClearWarning(true);
  };

  const confirmClearTranscript = () => {
    clearTranscript();
    setShowClearWarning(false);
  };

  const cancelClearTranscript = () => {
    setShowClearWarning(false);
  };

  const renderUtterances = () => {
    // Filter out empty utterances
    const validUtterances = getValidUtterances();

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
      return validUtterances.map((utterance, index) => (
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
                  onClick={() => handleTabSwitch("record")}
                  className={`text-xxs flex items-center gap-2 px-4 py-1 rounded-md font-medium transition-all duration-200 ${
                    activeTab === "record"
                      ? "bg-white text-teal-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Mic size={14} />
                  Record Audio
                </button>
                <button
                  onClick={() => handleTabSwitch("upload")}
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
              {getValidUtterances().length > 0 && !isTranscribing && (
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div>
          <div className="h-[63vh] rounded-md bg-white p-4 overflow-y-auto shadow-sm">
            {isTranscribing ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                  <span className="text-gray-600">Transcribing audio...</span>
                </div>
              </div>
            ) : getValidUtterances().length > 0 ? (
              <div className="text-gray-800 leading-relaxed">
                {renderUtterances()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  {/* Record Tab Content */}

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
                            onClick={handleClearTranscript}
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

      {activeTab === "record" && (
        <div className="w-full ">
          <StreamingRecorder
            onTranscriptionComplete={handleStreamingTranscriptionComplete}
            onSessionUpdate={handleStreamingSessionUpdate}
          />
        </div>
      )}
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
          <div className="flex items-center gap-3">
            {getValidUtterances().length > 0 && (
              <Button
                onClick={handleClearTranscript}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle size={16} className="mr-2" />
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Upload Tab Controls */}
        {activeTab === "upload" && (
          <div className="flex items-center gap-3">
            {/* {!selectedFile && utterances.length === 0 && (
              <Button
                onClick={triggerFileInput}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <Upload size={16} className="mr-2" />
                Upload Audio
              </Button>
            )} */}
            {selectedFile && !isTranscribing && utterances.length === 0 && (
              <>
                <button
                  onClick={handleUpload}
                  className="flex items-center text-s gap-2 border-2 border-primary-400 text-primary-500 bg-transparent rounded-full px-6 py-2 font-medium transition hover:bg-primary-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Upload
                </button>

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    fileInputRef.current.value = "";
                  }}
                  className="flex items-center text-s justify-center border-2 border-red-300 text-red-600 bg-red-500/20 rounded-full px-3 py-2 transition hover:bg-gray-100 focus:outline-none"
                  type="button"
                >
                  <X size={14} className="me-1" /> Clear file
                </button>
              </>
            )}
            {getValidUtterances().length > 0 && (
              <button
                onClick={handleClearTranscript}
                className="flex items-center text-s gap-2 border-2 border-red-500 text-white bg-red-500 rounded-full px-4 py-2 font-medium transition hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <X size={14} />
                Clear Transcript
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab Switch Warning Modal */}
      {showTabSwitchWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Switch Tab Warning
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have existing transcription data. Switching tabs will clear
              your current progress. Are you sure you want to continue?
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={cancelTabSwitch}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmTabSwitch}
                className="bg-red-600 hover:bg-red-700"
              >
                Switch & Clear Data
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Clear Transcript Warning Modal */}
      {showClearWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Clear Transcript Warning
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to clear the transcript? This action cannot
              be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelClearTranscript}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmClearTranscript}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, Clear
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LiveTranscript;
