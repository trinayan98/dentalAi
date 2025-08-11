import { Button } from "../../components/ui/Button";
import {
  Upload,
  Loader2,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { API_BASE_URL } from "../../config/constants";
import axios from "axios";

const LiveTranscript = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [utterances, setUtterances] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUtterances, setEditingUtterances] = useState([]);
  const fileInputRef = useRef(null);

  const { token } = useAuthStore();
  const { addToast } = useToastStore();

  // Load utterances from localStorage on component mount
  useEffect(() => {
    const savedUtterances = localStorage.getItem("liveTranscriptUtterances");
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
      localStorage.setItem(
        "liveTranscriptUtterances",
        JSON.stringify(utterances)
      );
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
      const formData = new FormData();
      formData.append("audio", selectedFile);

      const response = await axios.post(
        `${API_BASE_URL}/transcription/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.utterances
      ) {
        setUtterances(response.data.data.utterances);
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

      // Handle axios error response
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
    setSelectedFile("");
    setUtterances([]);
    localStorage.removeItem("liveTranscriptUtterances");
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
            {/* <input
              type="text"
              value={formatTimestamp(utterance.start)}
              onChange={(e) =>
                handleUtteranceChange(index, "start", e.target.value)
              }
              className="w-20 px-2 py-1 text-sm border rounded"
              placeholder="[MM:SS]"
            /> */}
            <span className="ms-2 text-primary-400 text-xxs">
              {formatTimestamp(utterance.end)}
            </span>
            <span className="text-gray-500">to</span>
            {/* <input
              type="text"
              value={formatTimestamp(utterance.end)}
              onChange={(e) =>
                handleUtteranceChange(index, "end", e.target.value)
              }
              className="w-20 px-2 py-1 text-sm border rounded"
              placeholder="[MM:SS]"
            /> */}
            <span className=" text-primary-400 text-xxs">
              {formatTimestamp(utterance.end)}
            </span>
            <button
              onClick={() => handleDeleteUtterance(index)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <textarea
            value={utterance.text}
            onChange={(e) =>
              handleUtteranceChange(index, "text", e.target.value)
            }
            className="w-full px-2 py-1 text-sm border rounded resize-none text-s"
            rows={2}
            placeholder="Enter text..."
          />
        </div>
      ));
    } else {
      return utterances.map((utterance, index) => (
        <div key={index} className="mb-2">
          <span className="text-gray-600 font-mono text-sm">
            {formatTimestamp(utterance.start)}
          </span>
          <span className="ml-2 text-gray-800 text-s">{utterance.text}</span>
        </div>
      ));
    }
  };

  return (
    <div className="rounded-md col-span-3 ">
      <div className="mb-5 ">
        <div className="mb-2 font-bold text-sm flex items-center justify-between ">
          <span className="text-gray-700 dark:text-gray-300">Transcript</span>
          {utterances.length > 0 && !isTranscribing && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveEdit} size="sm">
                    <Save size={16} className="mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                  >
                    <X size={16} className="mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEditClick} size="sm">
                  <Edit size={16} />
                </Button>
              )}
              {isEditing && (
                <Button onClick={handleAddUtterance} size="sm">
                  <Plus size={16} className="mr-1" />
                  Add
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="h-[66vh] rounded-md bg-white p-4 overflow-y-auto shadow-sm">
          {isTranscribing ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                <span className="text-gray-600">Transcribing audio...</span>
              </div>
            </div>
          ) : utterances.length > 0 ? (
            <div className="text-gray-800 leading-relaxed">
              {renderUtterances()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center ">
                <div className="flex items-center justify-center mb-4">
                  {!selectedFile && utterances.length === 0 && (
                    <button
                      onClick={triggerFileInput}
                      disabled={isUploading}
                      className="w-12 h-12 bg-gray-800 rounded-full p-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    >
                      {isUploading ? (
                        <Loader2
                          className="text-white animate-spin"
                          size={18}
                        />
                      ) : (
                        <Upload color="white" size={18} />
                      )}
                    </button>
                  )}
                  {selectedFile && utterances.length === 0 && (
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        fileInputRef.current.value = "";
                      }}
                      className="w-12 h-12  bg-red-100 rounded-full p-1 flex items-center justify-center hover:bg-gray-200 transition-colors"
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
                  Start Recording or Upload an audio file to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center ">
        <div className="flex">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* {!selectedFile && utterances.length === 0 && (
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="w-12 h-12 bg-gray-800 rounded-full p-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              {isUploading ? (
                <Loader2 className="text-white animate-spin" size={18} />
              ) : (
                <Upload color="white" size={18} />
              )}
            </button>
          )} */}
          <div className="flex ms-2">
            {selectedFile && utterances.length === 0 && (
              <>
                <Button onClick={handleUpload} className="me-2">
                  Upload
                </Button>
                {/* <button
                  onClick={() => {
                    setSelectedFile(null);
                    fileInputRef.current.value = "";
                  }}
                  className="w-12 h-12 bg-gray-100 rounded-full p-1 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={18} color="gray" />
                </button> */}
              </>
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
        </div>
        {/* {!selectedFile && (
          <div className="flex items-center bg-gray-800 rounded-full p-1 w-fit">
            <div className="flex items-center gap-2 px-4 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 19L5 5M15 9.34V7a3 3 0 10-6 0v2m0 4a3 3 0 006 0v-1.34M12 19v2m-4-2a4 4 0 008 0"
                />
              </svg>
              <span className="text-white font-medium text-sm">
                {selectedFile ? selectedFile.name : "Ready to record"}
              </span>
            </div>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-white text-gray-900 font-semibold px-6 py-2 rounded-full ml-2 transition hover:bg-gray-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Start"}
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default LiveTranscript;
