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
  Podcast,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import useAuthStore from "../../stores/authStore";
import { useToastStore } from "../../stores/toastStore";
import { API_BASE_URL } from "../../config/constants";
import axios from "axios";

const UploadTranscript = () => {
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
    const savedUtterances = localStorage.getItem("uploadTranscriptUtterances");
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
        "uploadTranscriptUtterances",
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
    setSelectedFile(null);
    setUtterances([]);
    localStorage.removeItem("uploadTranscriptUtterances");
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
      <div className="w-full  border border-1 border-gray-200  rounded-md bg-white">
        <div className="w-full border-0 border-b-2 border-gray-200 py-5 px-5 flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300 font-semibold flex justify-between items-center">
            <Podcast size={18} className="mr-3" /> Upload Audio
          </span>
          <div className="font-bold text-sm flex items-center justify-between">
            {utterances.length > 0 && !isTranscribing && (
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
                    className="rounded-full  bg-green-100 p-2"
                  >
                    <Edit size={14} color="green" />
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={handleAddUtterance}
                    size="sm"
                    className="rounded-full bg-gray-100 p-2 "
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="h-[63vh] rounded-md bg-white p-4 overflow-y-auto shadow-sm">
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
                    Upload an audio file to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center mt-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />

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
            <>
              <Button
                onClick={clearTranscript}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle size={16} className="mr-2" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadTranscript;
